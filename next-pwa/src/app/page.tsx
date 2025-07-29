"use client";

import { useState, useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import { Header } from "../components/ui/Header";
import { Footer } from "../components/ui/Footer";
import { Timeline } from "../components/ui/Timeline";
import { MemoDrawer } from "../components/ui/MemoDrawer";
import { MemoTab } from "../components/ui/MemoTab";
import {
  Quest,
  fetchQuests as fetchQuestsRepo,
  addQuest as addQuestRepo,
  toggleQuestComplete,
  deleteQuest,
  updateQuestOrdersAfterDelete,
  reorderQuests,
  skipQuest,
  updateQuestTitle,
} from "../repository/quest";
import { getCurrentUser } from "../repository/auth";
import { getCurrentTerm, getDateRange } from "@/lib/term";
import dayjs from "dayjs";

export default function Home() {
  const [groupedQuests, setGroupedQuests] = useState<Record<number, Quest[]>>(
    {}
  );
  const [editingQuest, setEditingQuest] = useState<{
    term: number;
    title: string;
  } | null>(null);
  const [isMemoOpen, setIsMemoOpen] = useState(false);

  // 現在の日付とタームの両方にスクロールするために使用
  const currentTermRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初期データ取得
    const dateRange = getDateRange();
    fetchQuests(dateRange.from, dateRange.to);
  }, []);

  // 現在の日付とタームにスクロールする
  useEffect(() => {
    // データ取得後、少し遅延させてスクロール
    const timer = setTimeout(() => {
      if (currentTermRef.current) {
        // 要素の位置を取得
        const rect = currentTermRef.current.getBoundingClientRect();
        // ページのスクロール位置 + 要素の位置 - 64pxの余白
        const scrollTop = window.pageYOffset + rect.top - 96;

        window.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [groupedQuests]);

  const fetchQuests = async (fromDate?: string, toDate?: string) => {
    const { data, error } = await fetchQuestsRepo(fromDate, toDate);
    if (error) {
      console.error("Error fetching quests:", error);
    } else if (data) {
      // クエストを日付とタームでグループ化
      const grouped = data.reduce((acc, quest) => {
        // 日付とタームを組み合わせたキーを作成
        // 例: "2023-07-28_1" (2023-07-28の第1ターム)
        const dateTermKey = `${quest.due_date}_${quest.term ?? -1}`;

        if (!acc[dateTermKey]) {
          acc[dateTermKey] = [];
        }
        acc[dateTermKey].push(quest);
        return acc;
      }, {} as Record<string, Quest[]>);

      setGroupedQuests(grouped);
    }
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

    const { error } = await skipQuest(
      id,
      currentQuest.term || 0,
      currentQuest.due_date
    );

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

  // アプリ起動時に現在の日付とタームを取得
  const currentTerm = getCurrentTerm();
  const today = dayjs().format("YYYY-MM-DD");

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
          onTermClick={(dateTermKey: string) => {
            // dateTermKey から term 部分を抽出
            const termPart = dateTermKey.split("_")[1];
            const term = parseInt(termPart);
            setEditingQuest({ term: term, title: "" });
          }}
          onSave={(title: string, dateTermKey: string) => {
            // dateTermKey から term 部分を抽出
            const termPart = dateTermKey.split("_")[1];
            const term = parseInt(termPart);
            addQuest(title, term);
          }}
          onCancel={() => setEditingQuest(null)}
          onSaveAndNew={handleSaveAndNew}
          onToggleComplete={handleToggleComplete}
          onDeleteQuest={handleDeleteQuest}
          onSkipQuest={handleSkipQuest}
          onUpdateQuest={handleUpdateQuest}
          onReorder={handleReorder}
          currentTerm={currentTerm} // 現在のタームを渡す
          currentDate={today} // 現在の日付を渡す
          termRef={currentTermRef} // 現在のタームにスクロールするためのref
        />
        <Footer />
      </Box>
      {/* メモ機能 */}
      <MemoTab onClick={() => setIsMemoOpen(true)} isExpanded={isMemoOpen} />
      <MemoDrawer isOpen={isMemoOpen} onClose={() => setIsMemoOpen(false)} />
    </Box>
  );
}
