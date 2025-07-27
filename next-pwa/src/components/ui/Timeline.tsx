"use client";

import { Box, Text, VStack, HStack, Button } from "@chakra-ui/react";
import { Quest } from "../../app/page";
import { QuestItem } from "./QuestItem";
import { QuestInputForm } from "./QuestInputForm";
import { FiPlus } from "react-icons/fi";

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

  const renderDaySection = (date: Date, dayOffset: number) => (
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
              {terms[0].startHour}:00
            </Text>
          </HStack>

          {terms.map((term, index) => (
            <Box key={`${dayOffset}-${term.name}`}>
              {/* クエストエリア */}
              <HStack align="stretch" gap={0}>
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
                    T{index + 1}
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
                  onClick={() => onTermClick(index + dayOffset * 5)}
                  _hover={{
                    bg: "soft.blue",
                    borderColor: "pop.blue",
                    transform: "translateY(-1px)",
                    boxShadow: "sm",
                  }}
                >
                  <VStack align="stretch" gap={1}>
                    {/* クエスト一覧 */}
                    {groupedQuests[index + dayOffset * 5]?.map((quest) => (
                      <QuestItem
                        key={quest.id}
                        quest={quest}
                        onToggleComplete={onToggleComplete}
                        onDelete={onDeleteQuest}
                        onSkip={onSkipQuest}
                        onUpdate={onUpdateQuest}
                      />
                    ))}

                    {/* 編集フォーム */}
                    {editingQuest &&
                      editingQuest.term === index + dayOffset * 5 && (
                        <QuestInputForm
                          title={editingQuest.title}
                          onSave={(newTitle) =>
                            onSave(newTitle, index + dayOffset * 5)
                          }
                          onCancel={onCancel}
                          onSaveAndNew={(newTitle) =>
                            onSaveAndNew(newTitle, index + dayOffset * 5)
                          }
                        />
                      )}

                    {/* 追加ボタン */}
                    {(!editingQuest ||
                      editingQuest.term !== index + dayOffset * 5) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        w="full"
                        h="8"
                        opacity={0.4}
                        _hover={{ opacity: 0.8 }}
                        onClick={() => onTermClick(index + dayOffset * 5)}
                      >
                        <FiPlus size={16} />
                      </Button>
                    )}
                  </VStack>
                </Box>
              </HStack>

              {/* 終了時刻表示 */}
              <HStack gap={2} mt={1} mb={index < terms.length - 1 ? 2 : 0}>
                <Box w="12px" display="flex" justifyContent="center"></Box>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  {term.endHour}:00
                </Text>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );

  return (
    <Box>
      {renderDaySection(today, 0)}
      {renderDaySection(tomorrow, 1)}
    </Box>
  );
};
