import { supabase } from '@/lib/supabase/client';

// Questの型定義
export interface Quest {
  id: string; // uuid
  user_id: string;
  recurring_quest_id?: string;
  title: string;
  due_date: string; // date
  term?: number;
  category?: string;
  is_done: boolean;
  quest_order: number; // 並び順
  created_at: string; // timestamptz
}

/**
 * クエスト一覧を取得する
 * @param fromDate 取得開始日（YYYY-MM-DD形式）
 * @param toDate 取得終了日（YYYY-MM-DD形式）
 */
export const fetchQuests = async (fromDate?: string, toDate?: string) => {
  let query = supabase
    .from('quests')
    .select('*')
    .order('due_date', { ascending: true })
    .order('term', { ascending: true })
    .order('quest_order', { ascending: true });

  // 日付範囲が指定されている場合、フィルタリングを適用
  if (fromDate) {
    query = query.gte('due_date', fromDate);
  }
  if (toDate) {
    query = query.lte('due_date', toDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching quests:', error);
    return { data: null, error };
  }

  return { data: data as Quest[], error: null };
};

/**
 * クエストを追加する
 */
export const addQuest = async (
  title: string,
  term: number,
  userId: string,
  date: string // 日付パラメータを追加
) => {
  // 同じtermの最大quest_orderを取得
  const { data: maxOrderData } = await supabase
    .from('quests')
    .select('quest_order')
    .eq('term', term)
    .eq('user_id', userId)
    .order('quest_order', { ascending: false })
    .limit(1);

  // 最大quest_orderに+1した値を使用（存在しない場合は0から開始）
  const newOrder =
    maxOrderData && maxOrderData.length > 0
      ? maxOrderData[0].quest_order + 1
      : 0;

  const { error } = await supabase.from('quests').insert([
    {
      title,
      user_id: userId,
      due_date: date, // 引数で受け取った日付を使用
      term,
      is_done: false,
      quest_order: newOrder,
    },
  ]);

  return { error };
};

/**
 * クエストの完了状態を切り替える
 */
export const toggleQuestComplete = async (id: string, completed: boolean) => {
  const { error } = await supabase
    .from('quests')
    .update({ is_done: completed })
    .eq('id', id);

  return { error };
};

/**
 * クエストを削除する
 */
export const deleteQuest = async (id: string) => {
  // 削除するクエストの情報を取得
  const { data: questToDelete, error: fetchQuestError } = await supabase
    .from('quests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchQuestError || !questToDelete) {
    console.error('Quest not found or error fetching quest:', fetchQuestError);
    return { error: fetchQuestError };
  }

  // クエストを削除
  const { error } = await supabase.from('quests').delete().eq('id', id);

  if (error) {
    return { error, questToDelete: null };
  }

  return { error: null, questToDelete };
};

/**
 * 削除後の並び順を更新する
 */
export const updateQuestOrdersAfterDelete = async (term: number, deletedQuestOrder: number) => {
  // 同じtermの、削除したクエストより大きいquest_orderを持つクエストを取得
  const { data: questsToUpdate, error: fetchError } = await supabase
    .from('quests')
    .select('*')
    .eq('term', term)
    .gt('quest_order', deletedQuestOrder);

  if (fetchError) {
    return { error: fetchError };
  }

  // questsToUpdateがnullまたは空配列の場合は、更新するクエストがない
  if (!questsToUpdate || questsToUpdate.length === 0) {
    return { error: null };
  }

  // 各クエストのquest_orderを1つ減らす
  const updatePromises = questsToUpdate.map((quest) => {
    return supabase
      .from('quests')
      .update({ quest_order: quest.quest_order - 1 })
      .eq('id', quest.id);
  });

  // すべての更新を並行して実行
  const updateResults = await Promise.all(updatePromises);
  const updateError = updateResults.find((result) => result.error);

  return { error: updateError?.error || null };
};

/**
 * クエスト並び順を更新する
 */
export const reorderQuests = async (quests: Quest[]) => {
  // 新しい順序でquest_orderを更新
  const updatePromises = quests.map((quest, index) => {
    return supabase
      .from('quests')
      .update({ quest_order: index })
      .eq('id', quest.id);
  });

  const updateResults = await Promise.all(updatePromises);
  const updateError = updateResults.find((result) => result.error);

  return { error: updateError?.error || null };
};

/**
 * クエストをスキップする（次のタームまたは次の日に移動）
 */
export const skipQuest = async (id: string, currentTerm: number, currentDate: string) => {
  // 次のタームと日付を計算
  let nextTerm = 1; // デフォルトは1（タームは1〜5を使用）

  // 日付文字列を正しくパースする
  const [year, month, day] = currentDate.split('-').map(Number);
  // 月は0ベースなので-1する
  const nextDate = new Date(year, month - 1, day);

  // 現在のタームが5（最終ターム）の場合、次の日の1タームに移動
  if (currentTerm === 5) {
    nextTerm = 1; // 次の日の最初のターム（1）
    nextDate.setDate(nextDate.getDate() + 1); // 日付を1日進める
  } else {
    // それ以外の場合は同じ日の次のタームに移動
    nextTerm = currentTerm !== undefined ? currentTerm + 1 : 1;
  }

  // YYYY-MM-DD形式の日付文字列を生成
  const formattedDate = `${nextDate.getFullYear()}-${String(
    nextDate.getMonth() + 1
  ).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;

  const { error } = await supabase
    .from('quests')
    .update({
      term: nextTerm,
      due_date: formattedDate, // 正しくフォーマットされた日付
    })
    .eq('id', id);

  return { error };
};

/**
 * クエストのタイトルを更新する
 */
export const updateQuestTitle = async (id: string, newTitle: string) => {
  const { error } = await supabase
    .from('quests')
    .update({ title: newTitle })
    .eq('id', id);

  return { error };
};