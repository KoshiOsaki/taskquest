'use client';

import { Box, Flex, Text, VStack } from '@chakra-ui/react';

export const Timeline = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <VStack align="stretch" gap={0} p={4}>
      {hours.map((hour) => (
        <Flex key={hour} minH="60px" borderTop="1px" borderColor="gray.200">
          <Box w="50px" textAlign="right" pr={2} pt={1}>
            <Text fontSize="sm" color="gray.500">{`${hour}:00`}</Text>
          </Box>
          <Box flex={1} borderLeft="1px" borderColor="gray.200" />
        </Flex>
      ))}
    </VStack>
  );
};
