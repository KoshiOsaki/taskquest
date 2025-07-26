'use client';

import { Flex, Heading, IconButton } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export const Header = () => {
  // 仮の日付データ
  const today = new Date();
  const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      p={4}
      borderBottom="1px"
      borderColor="gray.200"
      w="100%"
    >
      <IconButton aria-label="Previous day" variant="ghost">
        <FaChevronLeft />
      </IconButton>
      <Heading as="h1" size="md">
        {dateString}
      </Heading>
      <IconButton aria-label="Next day" variant="ghost">
        <FaChevronRight />
      </IconButton>
    </Flex>
  );
};
