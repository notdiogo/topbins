import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'diogoramos@me.com';

// Capture at module load — before Supabase potentially clears the URL.
// In this app a ?code= can only arrive from an email invite (no OAuth/magic links).
const inviteInFlight =
  typeof window !== 'undefined' &&
  (new URLSearchParams(window.location.search).has('code') ||
    window.location.hash.includes('type=invite') ||
    window.location.hash.includes('type=recovery'));

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

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session) {
          // Returning user with a stored session — go straight to the app.
          setUser(session.user);
          setIsLoading(false);
        } else if (!inviteInFlight) {
          // No session and no invite code — show the login page.
          setIsLoading(false);
        }
        // else: invite code exchange is pending; stay loading until SIGNED_IN fires.
      } else if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        // Only prompt for a password if this SIGNED_IN came from the invite URL.
        if (inviteInFlight && session) {
          setNeedsPasswordSet(true);
        }
        setIsLoading(false);
      } else {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    // Safety valve: if code exchange never fires SIGNED_IN (expired/invalid token),
    // stop loading and fall back to the login page after 8 seconds.
    const timeout = setTimeout(() => setIsLoading(false), 8000);

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
    setNeedsPasswordSet(false);
    // Strip ?code= from the URL so a refresh doesn't re-trigger invite detection.
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
