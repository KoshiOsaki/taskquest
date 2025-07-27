"use client";

import { Box, Text, VStack, HStack, Button } from "@chakra-ui/react";
import { Quest } from "../../app/page";
import { QuestItem } from "./QuestItem";
import { QuestInputForm } from "./QuestInputForm";
import { QuestReorderList } from "./QuestReorderList";
import { FiPlus } from "react-icons/fi";
import UserProfile from "./UserProfile";
import { Reorder, useDragControls } from "framer-motion";

interface TimelineProps {
  groupedQuests: Record<number, Quest[]>;
  editingQuest: { term: number; title: string } | null;
  onTermClick: (termIndex: number) => void;
  onSave: (newTitle: string, term: number) => void;
  onCancel: () => void;
  onSaveAndNew: (newTitle: string, term: number) => void;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDeleteQuest?: (id: string) => void;
  onSkipQuest?: (id: string) => void;
  onUpdateQuest?: (id: string, newTitle: string) => void;
  onReorder?: (termIndex: number, newQuests: Quest[]) => void; // 並べ替えコールバック
  currentTerm?: number; // 現在のタームを受け取るプロパティ
}

export const Timeline = ({
  groupedQuests,
  editingQuest,
  onTermClick,
  onSave,
  onCancel,
  onSaveAndNew,
  onToggleComplete,
  onDeleteQuest,
  onSkipQuest,
  onUpdateQuest,
  onReorder,
  currentTerm,
}: TimelineProps) => {
  const terms = [
    { name: "9-12", startHour: 9, endHour: 12 },
    { name: "12-15", startHour: 12, endHour: 15 },
    { name: "15-18", startHour: 15, endHour: 18 },
    { name: "18-21", startHour: 18, endHour: 21 },
    { name: "21-24", startHour: 21, endHour: 24 },
  ];

  // 今日と明日の日付を生成
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${
      date.getMonth() + 1
    }月${date.getDate()}日 (${
      ["日", "月", "火", "水", "木", "金", "土"][date.getDay()]
    })`;
  };

  // 現在のタームが一番上に表示されるように並び替え
  const sortedTerms = [...terms];

  // 現在のタームが指定されている場合、そのタームを一番上に表示
  if (currentTerm !== undefined) {
    // 現在のタームを配列から取り出し、先頭に挿入
    const currentTermData = sortedTerms[currentTerm];
    if (currentTermData) {
      // 現在のタームを配列から削除
      sortedTerms.splice(currentTerm, 1);
      // 先頭に挿入
      sortedTerms.unshift(currentTermData);
    }
  }

  // 現在時刻がターム内の何割の場所に当たるか計算する関数
  const calculateTimePosition = (
    termStartHour: number,
    termEndHour: number
  ): number => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 現在時刻を小数点以下の時間として表現（例: 14時30分 = 14.5）
    const currentTimeDecimal = currentHour + currentMinute / 60;

    // タームの開始時刻から終了時刻までの間で、現在時刻が何割の位置にあるか計算
    if (
      currentTimeDecimal >= termStartHour &&
      currentTimeDecimal < termEndHour
    ) {
      return (
        (currentTimeDecimal - termStartHour) / (termEndHour - termStartHour)
      );
    }

    // 現在時刻がタームの範囲外の場合は-1を返す
    return -1;
  };

  // カスタムレンダリング関数を作成
  const renderCustomDaySection = (date: Date, dayOffset: number) => {
    return (
      <Box key={dayOffset} mb={8}>
        {/* 日付ヘッダー */}
        <Box py={3} borderBottom="2px solid" borderColor="pop.pink" mb={4}>
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
            <HStack gap={2} mb={1}>
              <Box w="12px" display="flex" justifyContent="center"></Box>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                {sortedTerms[0].startHour}:00
              </Text>
            </HStack>

            {sortedTerms.map((term, sortedIndex) => {
              // 元のインデックスを特定
              const originalIndex = terms.findIndex(
                (t) =>
                  t.startHour === term.startHour && t.endHour === term.endHour
              );

              return (
                <Box key={`${dayOffset}-${term.name}`} position="relative">
                  {/* クエストエリア */}
                  <HStack align="stretch" gap={0} position="relative">
                    {/* 現在時刻を示す赤い横線とプロフィールアイコン */}
                    {originalIndex === currentTerm && (
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
                        T{originalIndex + 1}
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
                      onClick={() => onTermClick(originalIndex + dayOffset * 5)}
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
                          quests={groupedQuests[originalIndex + dayOffset * 5] || []}
                          termIndex={originalIndex + dayOffset * 5}
                          onToggleComplete={onToggleComplete}
                          onDelete={onDeleteQuest}
                          onSkip={onSkipQuest}
                          onUpdate={onUpdateQuest}
                          onReorder={onReorder}
                        />

                        {/* 編集フォーム */}
                        {editingQuest &&
                          editingQuest.term ===
                            originalIndex + dayOffset * 5 && (
                            <QuestInputForm
                              title={editingQuest.title}
                              onSave={(newTitle) =>
                                onSave(newTitle, originalIndex + dayOffset * 5)
                              }
                              onCancel={onCancel}
                              onSaveAndNew={(newTitle) =>
                                onSaveAndNew(
                                  newTitle,
                                  originalIndex + dayOffset * 5
                                )
                              }
                            />
                          )}

                        {/* 追加ボタン */}
                        {(!editingQuest ||
                          editingQuest.term !==
                            originalIndex + dayOffset * 5) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            w="full"
                            h="8"
                            opacity={0.4}
                            _hover={{ opacity: 0.8 }}
                            onClick={() =>
                              onTermClick(originalIndex + dayOffset * 5)
                            }
                          >
                            <FiPlus size={16} />
                          </Button>
                        )}
                      </VStack>
                    </Box>
                  </HStack>

                  {/* 終了時刻表示 */}
                  <HStack
                    gap={2}
                    mt={1}
                    mb={sortedIndex < sortedTerms.length - 1 ? 2 : 0}
                  >
                    <Box w="12px" display="flex" justifyContent="center"></Box>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      {term.endHour}:00
                    </Text>
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
      {renderCustomDaySection(today, 0)}
      {renderCustomDaySection(tomorrow, 1)}
    </Box>
  );
};
