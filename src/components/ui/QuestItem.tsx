'use client';

import { Checkbox, Flex, Text } from '@chakra-ui/react';
import { Quest } from '@/app/page';

interface QuestItemProps {
  quest: Quest;
}

export const QuestItem = ({ quest }: QuestItemProps) => {
  const { title, is_done } = quest;
  return (
    <Flex align="center" p={2} bg={is_done ? 'gray.100' : 'white'}
      borderWidth="1px"
      borderRadius="md">
            <Checkbox.Root defaultChecked={is_done} mr={3}>
        <Checkbox.Indicator />
      </Checkbox.Root>
            <Text fontSize="sm" textDecoration={is_done ? 'line-through' : 'none'} color={is_done ? 'gray.500' : 'black'}>
        {title}
      </Text>
    </Flex>
  );
};
