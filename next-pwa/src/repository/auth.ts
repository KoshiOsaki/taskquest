import { supabase } from '@/lib/supabase/client';
import type { User, Provider } from '@supabase/supabase-js';

/**
 * 現在のユーザー情報を取得する
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

/**
 * OAuth認証でサインインする
 */
export const signInWithOAuth = async (provider: Provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  return { data, error };
};

/**
 * サインアウトする
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * 認証状態の変更を監視する
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
  
  return data;
};
