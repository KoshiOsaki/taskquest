import { supabase } from '@/lib/supabase/client';

/**
 * 購読情報をSupabaseに保存する
 * user_idの一意制約に基づいてupsertを行う
 */
export async function saveSubscription(subscription: PushSubscription, userId: string) {
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: userId,
        subscription,        // そのまま JSON 化される
        updated_at: new Date(),
      },
      {
        onConflict: 'user_id', // user_idの一意制約に基づいて競合を解決
      }
    );
    
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
