import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'diogoramos@me.com';

// Capture URL before Supabase clears it. With flowType:'implicit', invite links
// arrive as #access_token=...&type=invite in the hash.
const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
const isInviteOrRecovery =
  initialHash.includes('type=invite') || initialHash.includes('type=recovery');

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
  // Stay loading until we've heard from onAuthStateChange when an invite is in flight,
  // so the app never briefly flashes the login page before the session arrives.
  const [isLoading, setIsLoading] = useState(true);
  const [needsPasswordSet, setNeedsPasswordSet] = useState(isInviteOrRecovery);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // onAuthStateChange fires as soon as the session is resolved (including
    // after Supabase processes a hash token), so we rely on it as the single
    // source of truth rather than getSession() + a separate listener.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Fallback: if no auth event arrives within 3s (e.g. no token in URL and
    // nothing in storage), stop showing the spinner and go to the login page.
    const timeout = setTimeout(() => setIsLoading(false), 3000);

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
