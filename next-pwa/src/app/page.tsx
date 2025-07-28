"use client";

import { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";
import { Timeline } from "../components/ui/Timeline";
import { MemoDrawer } from "../components/ui/MemoDrawer";
import { MemoTab } from "../components/ui/MemoTab";
import { Quest, fetchQuests as fetchQuestsRepo, addQuest as addQuestRepo, toggleQuestComplete, deleteQuest, updateQuestOrdersAfterDelete, reorderQuests, skipQuest, updateQuestTitle } from "../repository/quest";
import { getCurrentUser } from "../repository/auth";

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

    if (hour >= 9 && hour < 12) return 0; // T1: 9-12時
    if (hour >= 12 && hour < 15) return 1; // T2: 12-15時
    if (hour >= 15 && hour < 18) return 2; // T3: 15-18時
    if (hour >= 18 && hour < 21) return 3; // T4: 18-21時
    if (hour >= 21 && hour < 24) return 4; // T5: 21-24時

    // 深夜・早朝は最初のターム（9-12時）を返す
    return 0;
  };

  const fetchQuests = async () => {
    const { data, error } = await fetchQuestsRepo();
    if (error) {
      console.error("Error fetching quests:", error);
    } else if (data) {
      // クエストをtermごとにグループ化
      const grouped = data.reduce((acc, quest) => {
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
    const { user, error: userError } = await getCurrentUser();
    if (userError || !user) {
      console.error("User not logged in");
      return;
    }

    const { error } = await addQuestRepo(title, term, user.id);

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
    const { error } = await toggleQuestComplete(id, completed);

    if (error) {
      console.error("Error updating quest:", error);
    } else {
      fetchQuests();
    }
  };

  const handleDeleteQuest = async (id: string) => {
    // クエストを削除
    const { error, questToDelete } = await deleteQuest(id);

    if (error) {
      console.error("Error deleting quest:", error);
      return;
    }

    if (!questToDelete) {
      console.error("Quest not found");
      return;
    }

    // 削除後の並び順を更新
    const { error: updateError } = await updateQuestOrdersAfterDelete(
      questToDelete.term || 0,
      questToDelete.quest_order
    );

    if (updateError) {
      console.error("Error updating quest orders:", updateError);
    }

    fetchQuests();
  };

  const handleReorder = async (termIndex: number, newQuests: Quest[]) => {
    // 新しい順序でquest_orderを更新
    const { error } = await reorderQuests(newQuests);

    if (error) {
      console.error("Error updating quest_order:", error);
    } else {
      // 成功した場合、クエストを再取得
      fetchQuests();
    }
  };

  const handleSkipQuest = async (id: string) => {
    // 現在のクエストを取得
    const currentQuest = Object.values(groupedQuests)
      .flat()
      .find((quest) => quest.id === id);

    if (!currentQuest) return;

    const { error } = await skipQuest(id, currentQuest.term || 0, currentQuest.due_date);

    if (error) {
      console.error("Error skipping quest:", error);
    } else {
      fetchQuests();
    }
  };

  const handleUpdateQuest = async (id: string, newTitle: string) => {
    const { error } = await updateQuestTitle(id, newTitle);

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
          onReorder={handleReorder}
          currentTerm={currentTerm} // 現在のタームを渡す
        />
        <Footer />
      </Box>
      {/* メモ機能 */}
      <MemoTab onClick={() => setIsMemoOpen(true)} isExpanded={isMemoOpen} />
      <MemoDrawer isOpen={isMemoOpen} onClose={() => setIsMemoOpen(false)} />
    </Box>
  );
}
