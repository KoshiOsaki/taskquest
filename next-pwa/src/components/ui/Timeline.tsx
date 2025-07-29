"use client";

import { Box, Text, VStack, HStack, Button } from "@chakra-ui/react";
import { Quest } from "../../repository/quest";
import { QuestInputForm } from "./QuestInputForm";
import { QuestReorderList } from "./QuestReorderList";
import { FiPlus } from "react-icons/fi";
import UserProfile from "./UserProfile";
import { RefObject } from "react";

interface TimelineProps {
  groupedQuests: Record<string, Quest[]>; // 日付_タームをキーとするレコード
  editingQuest: { term: number; title: string } | null;
  onTermClick: (dateTermKey: string) => void;
  onSave: (newTitle: string, dateTermKey: string) => void;
  onCancel: () => void;
  onSaveAndNew: (newTitle: string, term: number) => void;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDeleteQuest?: (id: string) => void;
  onSkipQuest?: (id: string) => void;
  onUpdateQuest?: (id: string, newTitle: string) => void;
  onReorder?: (termIndex: number, newQuests: Quest[]) => void; // 並べ替えコールバック
  currentTerm?: number; // 現在のタームを受け取るプロパティ
  currentDate?: string; // 現在の日付（YYYY-MM-DD形式）
  termRef?: RefObject<HTMLDivElement | null>; // 現在のタームへのスクロール用ref
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
  currentDate,
  termRef,
}: TimelineProps) => {
  const terms = [
    { name: "6-9", startHour: 6, endHour: 9, termNumber: 1 },
    { name: "9-12", startHour: 9, endHour: 12, termNumber: 2 },
    { name: "12-15", startHour: 12, endHour: 15, termNumber: 3 },
    { name: "15-18", startHour: 15, endHour: 18, termNumber: 4 },
    { name: "18-21", startHour: 18, endHour: 21, termNumber: 5 },
    { name: "21-24", startHour: 21, endHour: 24, termNumber: 6 },
  ];

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

  // 現在の日付を文字列で取得
  const todayDateString = today.toISOString().split("T")[0];

  // 現在は使用していないのでコメントアウト
  // const displayCurrentDate = currentDate || todayDateString;

  // 日付文字列からDateオブジェクトを作成
  // 現在は使用していないのでコメントアウト
  // const parseDate = (dateString: string): Date => {
  //   const [year, month, day] = dateString.split('-').map(Number);
  //   return new Date(year, month - 1, day); // 月は0始まりなので-1する
  // };

  // 日付が同じかどうかを判定する関数は使用しなくなったのでコメントアウト
  // const isSameDate = (date1: Date, date2: Date): boolean => {
  //   return (
  //     date1.getFullYear() === date2.getFullYear() &&
  //     date1.getMonth() === date2.getMonth() &&
  //     date1.getDate() === date2.getDate()
  //   );
  // };

  // 日付文字列が今日かどうかを判定
  // const isToday = (dateString: string): boolean => {
  //   const date = parseDate(dateString);
  //   return isSameDate(date, today);
  // };

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
                            ref={
                              term.termNumber - 1 === currentTerm
                                ? termRef
                                : undefined
                            }
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
                      onClick={() => {
                        // 日付とタームを結合した文字列キーを作成
                        const dateTermKey = `${
                          date.toISOString().split("T")[0]
                        }_${term.termNumber - 1}`;
                        onTermClick(dateTermKey);
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
                          editingQuest.term === term.termNumber - 1 && (
                            <QuestInputForm
                              title={editingQuest.title}
                              onSave={(newTitle) => {
                                const dateTermKey = `${
                                  date.toISOString().split("T")[0]
                                }_${term.termNumber - 1}`;
                                onSave(newTitle, dateTermKey);
                              }}
                              onCancel={onCancel}
                              onSaveAndNew={(newTitle) => {
                                onSaveAndNew(newTitle, term.termNumber - 1);
                              }}
                            />
                          )}

                        {/* 追加ボタン */}
                        {(!editingQuest ||
                          editingQuest.term !== term.termNumber - 1) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            w="full"
                            h="8"
                            opacity={0.4}
                            _hover={{ opacity: 0.8 }}
                            onClick={() => {
                              // 日付とタームを結合した文字列キーを作成
                              const dateTermKey = `${
                                date.toISOString().split("T")[0]
                              }_${term.termNumber - 1}`;
                              onTermClick(dateTermKey);
                            }}
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
      {displayDates.map((date, index) => (
        <Box key={date.toISOString()}>
          {renderCustomDaySection(date, index)}
        </Box>
      ))}
    </Box>
  );
};
