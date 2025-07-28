import { supabase } from '@/lib/supabase/client';

export interface Memo {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

/**
 * メモを保存する（新規作成または更新）
 */
export const saveMemo = async (content: string, memoId?: string) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: userError || new Error('User not authenticated'), data: null };
  }

  if (memoId) {
    // 既存のメモを更新
    const { error } = await supabase
      .from('memos')
      .update({ content })
      .eq('id', memoId);

    return { error, data: null };
  } else {
    // 新しいメモを作成
    const { data, error } = await supabase
      .from('memos')
      .insert({ user_id: user.id, content })
      .select()
      .single();

    return { data: data as Memo, error };
  }
};

/**
 * ユーザーの最新のメモを取得する
 */
export const fetchLatestMemo = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: userError || new Error('User not authenticated'), data: null };
  }

  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // PGRST116はデータが見つからない場合のエラーコード
  if (error && error.code !== 'PGRST116') {
    return { error, data: null };
  }

  return { data: data as Memo, error: null };
};
