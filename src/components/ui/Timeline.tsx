"use client";

import { Box, Flex, Text, VStack, Button } from "@chakra-ui/react";
import { Quest } from "@/app/page";
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
    { name: "9-12", startHour: 9 },
    { name: "12-15", startHour: 12 },
    { name: "15-18", startHour: 15 },
    { name: "18-21", startHour: 18 },
    { name: "21-24", startHour: 21 },
  ];

  return (
    <VStack align="stretch" gap={0} p={4}>
      {terms.map((term, index) => (
        <Flex
          key={term.name}
          minH={`${3 * 60}px`} // 3時間分の高さ
          borderTop="1px solid"
          borderColor="gray.100"
          align="flex-start"
          mb={3}
        >
          <Box w="70px" textAlign="right" pr={4} pt={3}>
            <Text 
              fontSize="sm" 
              fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
              fontWeight="600"
              color="pop.blue"
              bg="soft.blue"
              px={2}
              py={1}
              borderRadius="button"
            >
              {`${term.startHour}:00`}
            </Text>
          </Box>
          <Box
            flex={1}
            borderLeft="3px solid"
            borderColor="pop.blue"
            borderRadius="0 8px 8px 0"
            p={3}
            h="100%"
            cursor="pointer"
            transition="all 0.3s ease"
            onClick={() => onTermClick(index)}
            _hover={{ 
              bg: "soft.blue",
              transform: "translateY(-2px)",
              boxShadow: "soft",
            }}
          >
            <VStack align="stretch" gap={0.5}>
              {groupedQuests[index]?.map((quest) => (
                <QuestItem 
                  key={quest.id} 
                  quest={quest}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDeleteQuest}
                  onSkip={onSkipQuest}
                  onUpdate={onUpdateQuest}
                />
              ))}
              {editingQuest && editingQuest.term === index && (
                <QuestInputForm
                  title={editingQuest.title}
                  onSave={(newTitle) => onSave(newTitle, index)}
                  onCancel={onCancel}
                  onSaveAndNew={(newTitle) => onSaveAndNew(newTitle, index)}
                />
              )}
              {(!editingQuest || editingQuest.term !== index) && (
                <Button
                  variant="ghost"
                  size="sm"
                  w="full"
                  h="6"
                  opacity={0.4}
                  _hover={{ opacity: 0.8 }}
                  onClick={() => onTermClick(index)}
                  mt={1}
                >
                  <FiPlus size={14} />
                </Button>
              )}
            </VStack>
          </Box>
        </Flex>
      ))}
    </VStack>
  );
};
