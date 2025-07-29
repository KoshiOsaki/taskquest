"use client";

import { Box, Text, VStack, HStack, Button } from "@chakra-ui/react";
import { Quest } from "../../repository/quest";
import { QuestInputForm } from "./QuestInputForm";
import { QuestReorderList } from "./QuestReorderList";
import { FiPlus } from "react-icons/fi";
import UserProfile from "./UserProfile";
import { RefObject } from "react";
import { calculateTimePosition } from "@/lib/term";

interface TimelineProps {
  groupedQuests: Record<string, Quest[]>; // 日付_タームをキーとするレコード
  editingQuest: { term: number; title: string; date: string } | null;
  onAddQuest: (term: number, date: string) => void;
  onSave: (newTitle: string, term: number, date: string) => void;
  onCancel: () => void;
  onSaveAndNew: (newTitle: string, term: number, date: string) => void;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDeleteQuest?: (id: string) => void;
  onSkipQuest?: (id: string) => void;
  onUpdateQuest?: (id: string, newTitle: string) => void;
  onReorder?: (termIndex: number, newQuests: Quest[]) => void; // 並べ替えコールバック
  currentTerm?: number; // 現在のタームを受け取るプロパティ
  currentDate?: string; // 現在の日付（YYYY-MM-DD形式）
  termRef?: RefObject<HTMLDivElement | null>; // 現在のタームへのスクロール用ref
}

const TERMS = [
  {
    name: "9-12",
    displayName: "①",
    startHour: 9,
    endHour: 12,
    termNumber: 1,
  }, // 1: 9-12
  {
    name: "12-15",
    displayName: "②",
    startHour: 12,
    endHour: 15,
    termNumber: 2,
  }, // 2: 12-15
  {
    name: "15-18",
    displayName: "③",
    startHour: 15,
    endHour: 18,
    termNumber: 3,
  }, // 3: 15-18
  {
    name: "18-21",
    displayName: "④",
    startHour: 18,
    endHour: 21,
    termNumber: 4,
  }, // 4: 18-21
  {
    name: "21-24",
    displayName: "⑤",
    startHour: 21,
    endHour: 24,
    termNumber: 5,
  }, // 5: 21-24
  {
    name: "0-3",
    displayName: "⭐️",
    startHour: 0,
    endHour: 3,
    termNumber: 6,
  }, // 6: 0-3
];

export const Timeline = ({
  groupedQuests,
  editingQuest,
  onAddQuest,
  onSave,
  onCancel,
  onSaveAndNew,
  onToggleComplete,
  onDeleteQuest,
  onSkipQuest,
  onUpdateQuest,
  onReorder,
  currentTerm,
  currentDate,
  termRef,
}: TimelineProps) => {
  // 前日から3日後までの日付を生成
  const today = new Date();

  // 前日
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // 明日
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // 明後日
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  // 3日後
  const threeDaysLater = new Date(today);
  threeDaysLater.setDate(today.getDate() + 3);

  // 表示する日付の配列
  const displayDates = [
    yesterday,
    today,
    tomorrow,
    dayAfterTomorrow,
    threeDaysLater,
  ];

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${
      date.getMonth() + 1
    }月${date.getDate()}日 (${
      ["日", "月", "火", "水", "木", "金", "土"][date.getDay()]
    })`;
  };

  // 現在の日付を文字列で取得
  const todayDateString = today.toISOString().split("T")[0];

  // カスタムレンダリング関数を作成
  const renderCustomDaySection = (date: Date, dayOffset: number) => {
    return (
      <Box key={dayOffset} mb={8}>
        {/* 日付ヘッダー */}
        <Box
          py={3}
          mx="-16px"
          borderBottom="2px solid"
          borderColor="pop.pink"
          mb={4}
          position="sticky"
          top={0}
          bg="white"
          zIndex={10}
          boxShadow="sm"
        >
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="pop.pink"
            textAlign="center"
          >
            {formatDate(date)}
          </Text>
        </Box>

        {/* タイムライン */}
        <Box position="relative">
          {/* 連続した縦線 */}
          <Box
            position="absolute"
            left="6px"
            top="0"
            bottom="0"
            w="2px"
            bg="gray.400"
            zIndex={0}
          />

          <VStack align="stretch" gap={0}>
            {/* 最初の時刻表示 */}
            <HStack
              gap={2}
              mb={1}
              ref={
                date.toISOString().split("T")[0] ===
                (currentDate || todayDateString)
                  ? termRef
                  : undefined
              }
            >
              <Box w="12px" display="flex" justifyContent="center"></Box>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                {TERMS[0].startHour}:00
              </Text>
            </HStack>

            {TERMS.map((term, sortedIndex) => {
              // 元のインデックスを特定
              const originalIndex = TERMS.findIndex(
                (t) =>
                  t.startHour === term.startHour && t.endHour === term.endHour
              );

              return (
                <Box key={`${dayOffset}-${term.name}`} position="relative">
                  {/* クエストエリア */}
                  <HStack align="stretch" gap={0} position="relative">
                    {/* 現在時刻を示す赤い横線とプロフィールアイコン */}
                    {/* 現在の日付と一致する場合のみ表示 */}
                    {originalIndex === currentTerm &&
                      date.toISOString().split("T")[0] ===
                        (currentDate || todayDateString) && (
                        <>
                          <Box
                            position="absolute"
                            left="0"
                            right="0"
                            height="2px"
                            bg="red.500"
                            zIndex={2}
                            top={`${
                              calculateTimePosition(
                                term.startHour,
                                term.endHour
                              ) * 100
                            }%`}
                          />
                          {/* プロフィールアイコンを赤線の左に表示 */}
                          <Box
                            position="absolute"
                            left="-16px"
                            zIndex={3}
                            top={`${
                              calculateTimePosition(
                                term.startHour,
                                term.endHour
                              ) * 100
                            }%`}
                            transform="translateY(-50%)"
                            animation="pulse 2s infinite ease-in-out"
                            width="32px"
                            height="32px"
                          >
                            <Box transform="scale(0.7)">
                              <UserProfile />
                            </Box>
                          </Box>
                        </>
                      )}
                    {/* 左側のタイムラインバー */}
                    <Box
                      w="12px"
                      position="relative"
                      display="flex"
                      justifyContent="center"
                      minH="100px"
                    >
                      {/* ターム名（縦真ん中に配置） */}
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        fontWeight="normal"
                        bg="white"
                        px={1}
                        py={0.5}
                        borderRadius="sm"
                        position="absolute"
                        top="50%"
                        transform="translateY(-50%)"
                        zIndex={1}
                        textAlign="center"
                        lineHeight={1}
                        minW="fit-content"
                        whiteSpace="nowrap"
                      >
                        {term.displayName}
                      </Text>
                    </Box>

                    {/* クエストボックス */}
                    <Box
                      flex={1}
                      bg="white"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      p={2}
                      cursor="pointer"
                      transition="all 0.2s ease"
                      onClick={() => {
                        onAddQuest(
                          term.termNumber - 1,
                          date.toISOString().split("T")[0]
                        );
                      }}
                      _hover={{
                        bg: "soft.blue",
                        borderColor: "pop.blue",
                        transform: "translateY(-1px)",
                        boxShadow: "sm",
                      }}
                    >
                      <VStack align="stretch" gap={1}>
                        {/* クエスト一覧 */}
                        <QuestReorderList
                          quests={
                            groupedQuests[
                              `${date.toISOString().split("T")[0]}_${
                                term.termNumber - 1
                              }`
                            ] || []
                          }
                          termIndex={term.termNumber - 1}
                          onToggleComplete={onToggleComplete}
                          onDelete={onDeleteQuest}
                          onSkip={onSkipQuest}
                          onUpdate={onUpdateQuest}
                          onReorder={onReorder}
                        />

                        {/* 編集フォーム */}
                        {editingQuest &&
                          editingQuest.term === term.termNumber - 1 &&
                          editingQuest.date ===
                            date.toISOString().split("T")[0] && (
                            <QuestInputForm
                              title={editingQuest.title}
                              onSave={(newTitle) => {
                                onSave(
                                  newTitle,
                                  term.termNumber - 1,
                                  date.toISOString().split("T")[0]
                                );
                              }}
                              onCancel={onCancel}
                              onSaveAndNew={(newTitle) => {
                                onSaveAndNew(
                                  newTitle,
                                  term.termNumber - 1,
                                  date.toISOString().split("T")[0]
                                );
                              }}
                            />
                          )}

                        {/* 追加ボタン */}
                        {!editingQuest && (
                          <Button
                            variant="ghost"
                            size="sm"
                            w="full"
                            h="8"
                            opacity={0.4}
                            _hover={{ opacity: 0.8 }}
                            onClick={() => {
                              onAddQuest(
                                term.termNumber - 1,
                                date.toISOString().split("T")[0]
                              );
                            }}
                          >
                            <FiPlus size={16} />
                          </Button>
                        )}
                      </VStack>
                    </Box>
                  </HStack>

                  {/* 終了時刻表示 - 3:00の場合は非表示 */}

                  <HStack
                    gap={2}
                    mt={1}
                    mb={sortedIndex < TERMS.length - 1 ? 2 : 0}
                  >
                    <Box w="12px" display="flex" justifyContent="center"></Box>
                    {term.endHour !== 3 && (
                      <Text fontSize="xs" color="gray.500" fontWeight="medium">
                        {term.endHour}:00
                      </Text>
                    )}
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      {displayDates.map((date, index) => (
        <Box key={date.toISOString()}>
          {renderCustomDaySection(date, index)}
        </Box>
      ))}
    </Box>
  );
};
