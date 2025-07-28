import { supabase } from '@/lib/supabase/client';

/**
 * 購読情報をSupabaseに保存する
 */
export async function saveSubscription(subscription: PushSubscription, userId: string) {
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: userId,
      subscription,        // そのまま JSON 化される
      created_at: new Date(),
    });
    
  return { error };
}

/**
 * Supabaseから購読情報を削除する
 */
export async function deleteSubscription(userId: string) {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId);
    
  return { error };
}

/**
 * ユーザーの購読情報を取得する
 */
export async function getSubscription(userId: string) {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  return { data, error };
}
