'use client';

import { Checkbox, Flex, Text } from '@chakra-ui/react';

interface QuestItemProps {
  name: string;
  is_done: boolean;
}

export const QuestItem = ({ name, is_done }: QuestItemProps) => {
  return (
    <Flex align="center" p={2} bg={is_done ? 'gray.100' : 'white'}>
      <Checkbox.Root defaultChecked={is_done} mr={3}>
        <Checkbox.Indicator />
      </Checkbox.Root>
      <Text textDecoration={is_done ? 'line-through' : 'none'} color={is_done ? 'gray.500' : 'black'}>
        {name}
      </Text>
    </Flex>
  );
};
