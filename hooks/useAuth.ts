import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'diogoramos@me.com';

// Capture the URL hash before Supabase clears it on mount
const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
const startsWithInviteOrRecovery = initialHash.includes('type=invite') || initialHash.includes('type=recovery');

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
  const [needsPasswordSet, setNeedsPasswordSet] = useState(startsWithInviteOrRecovery);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
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
