import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'diogoramos@me.com';

// Capture URL at module load before Supabase potentially clears it.
// PKCE invite links arrive as ?code=xxx (no type in URL).
// Implicit invite links arrive as #access_token=...&type=invite.
// In this app, a ?code= on initial load can only come from an email invite.
const initialSearch = typeof window !== 'undefined' ? window.location.search : '';
const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
const isInviteOrRecovery =
  new URLSearchParams(initialSearch).has('code') ||
  initialHash.includes('type=invite') ||
  initialHash.includes('type=recovery');

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
  const [needsPasswordSet, setNeedsPasswordSet] = useState(isInviteOrRecovery);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // onAuthStateChange is the single source of truth. For PKCE invite links
    // Supabase automatically exchanges the ?code= for a session before firing.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Fallback: stop the spinner if no auth event arrives (no token, no stored session).
    const timeout = setTimeout(() => setIsLoading(false), 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.';
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
    setNeedsPasswordSet(false);
    // Clean up the invite URL so a page refresh doesn't re-trigger this flow.
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
