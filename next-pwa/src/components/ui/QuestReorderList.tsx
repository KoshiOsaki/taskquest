"use client";

import { Reorder, useDragControls } from "framer-motion";
import { Quest } from "@/repository/quest";
import { QuestItem } from "./QuestItem";

interface QuestReorderItemProps {
  quest: Quest;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  onSkip?: (id: string) => void;
  onUpdate?: (id: string, newTitle: string) => void;
}

// 個別のクエストアイテムコンポーネント（Hooksルール違反を回避）
const QuestReorderItem = ({
  quest,
  onToggleComplete,
  onDelete,
  onSkip,
  onUpdate,
}: QuestReorderItemProps) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      key={quest.id}
      value={quest}
      dragControls={dragControls}
      style={{ marginBottom: "4px" }}
    >
      <QuestItem
        quest={quest}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onSkip={onSkip}
        onUpdate={onUpdate}
        dragControls={dragControls}
      />
    </Reorder.Item>
  );
};

interface QuestReorderListProps {
  quests: Quest[];
  termIndex: number;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  onSkip?: (id: string) => void;
  onUpdate?: (id: string, newTitle: string) => void;
  onReorder?: (termIndex: number, newQuests: Quest[]) => void;
}

export const QuestReorderList = ({
  quests,
  termIndex,
  onToggleComplete,
  onDelete,
  onSkip,
  onUpdate,
  onReorder,
}: QuestReorderListProps) => {
  const handleReorder = (newQuests: Quest[]) => {
    onReorder?.(termIndex, newQuests);
  };

  if (!quests || quests.length === 0) {
    return null;
  }

  return (
    <Reorder.Group
      axis="y"
      values={quests}
      onReorder={handleReorder}
      style={{ listStyle: "none", padding: 0, margin: 0 }}
    >
      {quests.map((quest) => (
        <QuestReorderItem
          key={quest.id}
          quest={quest}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onSkip={onSkip}
          onUpdate={onUpdate}
        />
      ))}
    </Reorder.Group>
  );
};
