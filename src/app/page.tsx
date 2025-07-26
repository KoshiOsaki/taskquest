'use client';

import { useState, useEffect } from 'react';
import { Box } from "@chakra-ui/react";
import { Header } from "@/components/ui/Header";
import { QuestInputForm } from "@/components/ui/QuestInputForm";
import { QuestItem } from "@/components/ui/QuestItem";
import { Timeline } from "@/components/ui/Timeline";
import { supabase } from '@/lib/supabase/client';

// Questの型定義
interface Quest {
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
  const [quests, setQuests] = useState<Quest[]>([]);

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      // .eq('due_date', new Date().toISOString().split('T')[0]) // 今日のクエストのみ取得する場合
      .order('term', { ascending: true });
    if (error) {
      console.error('Error fetching quests:', error);
    } else if (data) {
      setQuests(data as Quest[]);
    }
  };

  const addQuest = async (title: string, time: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("User not logged in");
      return;
    }

    const [hours] = time.split(':').map(Number);
    const term = Math.floor((hours * 60) / (3 * 60)); // 3時間区切りでtermを計算

    const { error } = await supabase
      .from('quests')
      .insert([{
        title,
        user_id: user.id,
        due_date: new Date().toISOString().split('T')[0], // 今日の日付
        term,
        is_done: false
      }]);

    if (error) {
      console.error('Error adding quest:', error);
    } else {
      fetchQuests(); // データを再取得してリストを更新
    }
  };


  // termを分に変換するヘルパー関数
  // 0: 6-9, 1: 9-12, 2: 12-15, 3: 15-18, 4: 18-21, 5: 21-24, 6: 0-3, 7: 3-6
  const termToMinutes = (term: number | null | undefined) => {
    if (term == null) return 0;
    // 各termの開始時間（分）を返す
    const termStartHours = [6, 9, 12, 15, 18, 21, 0, 3];
    if (term >= 0 && term < termStartHours.length) {
        return termStartHours[term] * 60;
    }
    return 0;
  };

  return (
    <Box maxW="sm" mx="auto" bg="white">
      <Header />
      <QuestInputForm onAddQuest={addQuest} />
      <Box position="relative" mt={4} h={`calc(24 * 60px)`}>
        <Timeline />
        <Box position="absolute" top={0} left="60px" right={0} bottom={0}>
          {quests.map((quest) => (
            <Box
              key={quest.id}
              position="absolute"
              w="calc(100% - 16px)" // padding分を考慮
              top={`${termToMinutes(quest.term)}px`}
              p={1}
            >
              <QuestItem name={quest.title} is_done={quest.is_done} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
