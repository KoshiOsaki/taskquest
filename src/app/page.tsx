import { Box } from "@chakra-ui/react";
import { Header } from "@/components/ui/Header";
import { QuestInputForm } from "@/components/ui/QuestInputForm";
import { QuestItem } from "@/components/ui/QuestItem";
import { Timeline } from "@/components/ui/Timeline";

export default function Home() {
  // 仮のクエストデータ
  const quests = [
    { id: 1, name: "朝の散歩", isCompleted: true, time: "9:00" },
    { id: 2, name: "デザインカンプ作成", isCompleted: false, time: "11:00" },
    { id: 3, name: "チームミーティング", isCompleted: false, time: "14:30" },
    { id: 4, name: "コードレビュー", isCompleted: true, time: "16:00" },
  ];

  // 時間文字列を分に変換するヘルパー関数
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  return (
    <Box maxW="sm" mx="auto" bg="white">
      <Header />
      <QuestInputForm />
      <Box position="relative" mt={4} h={`calc(24 * 60px)`}>
        <Timeline />
        <Box position="absolute" top={0} left="60px" right={0} bottom={0}>
          {quests.map((quest) => (
            <Box
              key={quest.id}
              position="absolute"
              w="calc(100% - 16px)" // padding分を考慮
              top={`${timeToMinutes(quest.time)}px`}
              p={1}
            >
              <QuestItem name={quest.name} isCompleted={quest.isCompleted} />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
