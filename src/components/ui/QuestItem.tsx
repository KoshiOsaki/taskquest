'use client';

import { Checkbox, Flex, Text } from '@chakra-ui/react';

interface QuestItemProps {
  name: string;
  isCompleted: boolean;
}

export const QuestItem = ({ name, isCompleted }: QuestItemProps) => {
  return (
    <Flex align="center" p={2} bg={isCompleted ? 'gray.100' : 'white'}>
      <Checkbox.Root defaultChecked={isCompleted} mr={3}>
        <Checkbox.Indicator />
      </Checkbox.Root>
      <Text textDecoration={isCompleted ? 'line-through' : 'none'} color={isCompleted ? 'gray.500' : 'black'}>
        {name}
      </Text>
    </Flex>
  );
};
