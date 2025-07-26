'use client';

import { Flex, Input, IconButton } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';

export const QuestInputForm = () => {
  return (
    <Flex as="form" p={2}>
      <Input placeholder="新しいクエストを追加" mr={2} />
      <IconButton aria-label="Add quest" type="submit">
        <FaPlus />
      </IconButton>
    </Flex>
  );
};
