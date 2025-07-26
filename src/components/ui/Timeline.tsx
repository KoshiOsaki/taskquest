'use client';

import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { Quest } from '@/app/page';
import { QuestItem } from './QuestItem';
import { QuestInputForm } from './QuestInputForm';

interface TimelineProps {
  groupedQuests: Record<number, Quest[]>;
  editingQuest: { term: number; title: string } | null;
  onTermClick: (termIndex: number) => void;
  onSave: (newTitle: string, term: number) => void;
  onCancel: () => void;
  onSaveAndNew: (newTitle: string, term: number) => void;
}

export const Timeline = ({
  groupedQuests,
  editingQuest,
  onTermClick,
  onSave,
  onCancel,
  onSaveAndNew,
}: TimelineProps) => {
  const terms = [
    { name: '9-12', startHour: 9 },
    { name: '12-15', startHour: 12 },
    { name: '15-18', startHour: 15 },
    { name: '18-21', startHour: 18 },
    { name: '21-24', startHour: 21 },
  ];

  return (
    <VStack align="stretch" gap={0} p={4}>
      {terms.map((term, index) => (
        <Flex
          key={term.name}
          minH={`${3 * 60}px`} // 3時間分の高さ
          borderTop="1px"
          borderColor="gray.200"
          align="flex-start"
        >
          <Box w="50px" textAlign="right" pr={2} pt={1}>
            <Text fontSize="sm" color="gray.500">{`${term.startHour}:00`}</Text>
          </Box>
          <Box
            flex={1}
            borderLeft="1px"
            borderColor="gray.200"
            p={1}
            h="100%"
            cursor="pointer"
            onClick={() => onTermClick(index)}
            _hover={{ bg: 'gray.50' }}
          >
            <VStack align="stretch" gap={1}>
              {groupedQuests[index]?.map((quest) => (
                <QuestItem key={quest.id} quest={quest} />
              ))}
              {editingQuest && editingQuest.term === index && (
                <QuestInputForm
                  title={editingQuest.title}
                  onSave={(newTitle) => onSave(newTitle, index)}
                  onCancel={onCancel}
                  onSaveAndNew={(newTitle) => onSaveAndNew(newTitle, index)}
                />
              )}
            </VStack>
          </Box>
        </Flex>
      ))}
    </VStack>
  );
};
