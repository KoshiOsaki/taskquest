"use client";

import { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";
import { Timeline } from "../components/ui/Timeline";
import { MemoDrawer } from "../components/ui/MemoDrawer";
import { MemoTab } from "../components/ui/MemoTab";
import { supabase } from "../lib/supabase/client";

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
  created_at: string; // timestamptz
}

export default function Home() {
  const [groupedQuests, setGroupedQuests] = useState<Record<number, Quest[]>>(
    {}
  );
  const [editingQuest, setEditingQuest] = useState<{
    term: number;
    title: string;
  } | null>(null);
  const [isMemoOpen, setIsMemoOpen] = useState(false);

  useEffect(() => {
    fetchQuests();
  }, []);

  // 現在の時刻から現在のタームを算出する関数
  const getCurrentTerm = (): number => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 9 && hour < 12) return 0;  // T1: 9-12時
    if (hour >= 12 && hour < 15) return 1; // T2: 12-15時
    if (hour >= 15 && hour < 18) return 2; // T3: 15-18時
    if (hour >= 18 && hour < 21) return 3; // T4: 18-21時
    if (hour >= 21 && hour < 24) return 4; // T5: 21-24時
    
    // 深夜・早朝は最初のターム（9-12時）を返す
    return 0;
  };

  const fetchQuests = async () => {
    const { data, error } = await supabase
      .from("quests")
      .select("*")
      // .eq('due_date', new Date().toISOString().split('T')[0]) // 今日のクエストのみ取得する場合
      .order("term", { ascending: true });
    if (error) {
      console.error("Error fetching quests:", error);
    } else if (data) {
      const questsData = data as Quest[];

      // クエストをtermごとにグループ化
      const grouped = questsData.reduce((acc, quest) => {
        const term = quest.term ?? -1;
        if (!acc[term]) {
          acc[term] = [];
        }
        acc[term].push(quest);
        return acc;
      }, {} as Record<number, Quest[]>);
      setGroupedQuests(grouped);
    }
  };

  const handleSave = (title: string, term: number) => {
    addQuest(title, term);
  };

  const handleSaveAndNew = (title: string, term: number) => {
    addQuest(title, term, () => {
      // 同じタームで新しい入力を続ける
      setEditingQuest({ term: term, title: "" });
    });
  };

  const addQuest = async (
    title: string,
    term: number,
    onSuccess?: () => void
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not logged in");
      return;
    }

    const { error } = await supabase.from("quests").insert([
      {
        title,
        user_id: user.id,
        due_date: new Date().toISOString().split("T")[0], // 今日の日付
        term,
        is_done: false,
      },
    ]);

    if (error) {
      console.error("Error adding quest:", error);
    } else {
      fetchQuests(); // データを再取得してリストを更新
      if (onSuccess) {
        onSuccess();
      } else {
        setEditingQuest(null); // 入力フォームを閉じる
      }
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from("quests")
      .update({ is_done: completed })
      .eq("id", id);

    if (error) {
      console.error("Error updating quest:", error);
    } else {
      fetchQuests();
    }
  };

  const handleDeleteQuest = async (id: string) => {
    const { error } = await supabase.from("quests").delete().eq("id", id);

    if (error) {
      console.error("Error deleting quest:", error);
    } else {
      fetchQuests();
    }
  };

  const handleSkipQuest = async (id: string) => {
    // 現在のクエストを取得
    const currentQuest = Object.values(groupedQuests)
      .flat()
      .find((quest) => quest.id === id);

    if (!currentQuest) return;

    // 次のタームを計算（0-4の範囲で循環）
    const nextTerm =
      currentQuest.term !== undefined ? (currentQuest.term + 1) % 5 : 0;

    const { error } = await supabase
      .from("quests")
      .update({ term: nextTerm })
      .eq("id", id);

    if (error) {
      console.error("Error skipping quest:", error);
    } else {
      fetchQuests();
    }
  };

  const handleUpdateQuest = async (id: string, newTitle: string) => {
    const { error } = await supabase
      .from("quests")
      .update({ title: newTitle })
      .eq("id", id);

    if (error) {
      console.error("Error updating quest:", error);
    } else {
      fetchQuests();
    }
  };

  // アプリ起動時に現在のタームを取得
  const currentTerm = getCurrentTerm();

  return (
    <Box maxW="sm" mx="auto" bg="gradient.primary" minH="100vh" p={4}>
      <Header />
      <Box
        position="relative"
        mt="60px"
        borderRadius="card"
        boxShadow="soft"
        bg="white"
        p={4}
        minH="calc(100vh - 120px)"
      >
        <Timeline
          groupedQuests={groupedQuests}
          editingQuest={editingQuest}
          onTermClick={(term) => setEditingQuest({ term, title: "" })}
          onSave={handleSave}
          onCancel={() => setEditingQuest(null)}
          onSaveAndNew={handleSaveAndNew}
          onToggleComplete={handleToggleComplete}
          onDeleteQuest={handleDeleteQuest}
          onSkipQuest={handleSkipQuest}
          onUpdateQuest={handleUpdateQuest}
          currentTerm={currentTerm} // 現在のタームを渡す
        />
        <Footer />
      </Box>
      {/* メモ機能 */}
      <MemoTab 
        onClick={() => setIsMemoOpen(true)} 
        isExpanded={isMemoOpen}
      />
      <MemoDrawer 
        isOpen={isMemoOpen} 
        onClose={() => setIsMemoOpen(false)} 
      />
    </Box>
  );
}
