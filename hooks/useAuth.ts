import { useState, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'diogoramos@me.com';

// Capture URL params at module load before Supabase (or navigation) clears them.
// Supabase uses three different formats depending on project age / auth settings:
//   1. ?code=xxx            — PKCE code exchange (newer projects, OAuth-style)
//   2. #access_token=...&type=invite — implicit hash tokens (older / explicit implicit flow)
//   3. ?token_hash=xxx&type=invite  — OTP token_hash (newest default email templates)
const _params = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search)
  : new URLSearchParams();
const _hash = typeof window !== 'undefined' ? window.location.hash : '';

const pkceCode = _params.get('code');
const tokenHash = _params.get('token_hash');
const tokenHashType = _params.get('type'); // 'invite' | 'recovery' | etc.
const hashInvite = _hash.includes('type=invite') || _hash.includes('type=recovery');

const inviteInFlight = !!(pkceCode || tokenHash || hashInvite);

// Log so we can see exactly what Supabase sent (remove after debugging)
if (typeof window !== 'undefined') {
  console.log('[auth] URL on load:', window.location.href);
  console.log('[auth] inviteInFlight:', inviteInFlight, { pkceCode, tokenHash, tokenHashType, hashInvite });
}

export interface AuthHook {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  needsPasswordSet: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  setPassword: (password: string) => Promise<string | null>;
}

export function useAuth(): AuthHook {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsPasswordSet, setNeedsPasswordSet] = useState(false);
  // Prevent re-triggering the set-password flow after it's been completed
  const inviteHandled = useRef(false);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[auth] event:', event, 'user:', session?.user?.email ?? null);
      const currentUser = session?.user ?? null;

      // While waiting for an invite code exchange, ignore the initial null session.
      if (event === 'INITIAL_SESSION' && !currentUser && inviteInFlight) {
        return; // Stay loading — token_hash/code exchange is in progress.
      }

      setUser(currentUser);

      if (inviteInFlight && !inviteHandled.current && currentUser) {
        setNeedsPasswordSet(true);
      }

      setIsLoading(false);
    });

    // Explicit session bootstrap — don't rely on _initialize() timing.
    if (hashInvite) {
      // Hash tokens: parse access_token + refresh_token and set session directly.
      const hp = new URLSearchParams(_hash.slice(1));
      const at = hp.get('access_token');
      const rt = hp.get('refresh_token');
      if (at && rt) {
        supabase.auth.setSession({ access_token: at, refresh_token: rt })
          .then(({ error }) => {
            if (error) {
              console.error('[auth] setSession error:', error.message);
              setIsLoading(false);
            }
          });
      } else {
        console.error('[auth] hash invite detected but tokens missing');
        setIsLoading(false);
      }
    } else if (tokenHash && tokenHashType) {
      // OTP token_hash format — exchange via verifyOtp.
      supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: tokenHashType as Parameters<typeof supabase.auth.verifyOtp>[0]['type'],
      }).then(({ error }) => {
        if (error) {
          console.error('[auth] verifyOtp error:', error.message);
          setIsLoading(false);
        }
      });
    } else {
      // No invite in URL — restore existing session from storage (or return null).
      supabase.auth.getSession();
    }

    // Safety valve: fall back to login page if nothing resolves within 10s.
    const timeout = setTimeout(() => setIsLoading(false), 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase is not configured.';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  const setPassword = async (password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase not configured';
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return error.message;
    inviteHandled.current = true;
    setNeedsPasswordSet(false);
    // Strip invite params from the URL so a page refresh doesn't re-trigger the flow.
    window.history.replaceState({}, '', window.location.pathname);
    return null;
  };

  return {
    user,
    isAdmin: user?.email === ADMIN_EMAIL,
    isLoading,
    needsPasswordSet,
    signIn,
    signOut,
    setPassword,
  };
}
