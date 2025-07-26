"use client";

import { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { Header } from "@/components/ui/Header";

import { Timeline } from "@/components/ui/Timeline";
import { supabase } from "@/lib/supabase/client";

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

  useEffect(() => {
    fetchQuests();
  }, []);

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
    const { error } = await supabase
      .from("quests")
      .delete()
      .eq("id", id);

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
      .find(quest => quest.id === id);
    
    if (!currentQuest) return;

    // 次のタームを計算（0-4の範囲で循環）
    const nextTerm = currentQuest.term !== undefined ? (currentQuest.term + 1) % 5 : 0;

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

  return (
    <Box maxW="sm" mx="auto" bg="gradient.primary" minH="100vh" p={4}>
      <Box 
        mb={6}
        borderRadius="card"
        boxShadow="soft"
        bg="white"
        p={4}
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: "medium",
        }}
        transition="all 0.3s ease"
      >
        <Header />
      </Box>
      <Box 
        position="relative" 
        mt={4} 
        h={`calc(24 * 60px)`}
        borderRadius="card"
        boxShadow="soft"
        bg="white"
        p={4}
        overflow="hidden"
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
        />
      </Box>
    </Box>
  );
}
