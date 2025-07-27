"use client";

import { Box, Text, HStack } from "@chakra-ui/react";

export function Footer() {
  // ハードコーディングでバージョン情報を設定
  const version = "0.1.0";
  const lastUpdated = "2025-07-27"; // 最終更新日

  return (
    <Box
      as="footer"
      py={4}
      px={4}
      mt={8}
      borderTop="1px solid"
      borderColor="gray.200"
      bg="gray.50"
    >
      <HStack justify="center" gap={4} fontSize="xs" color="gray.600">
        <Text>TaskQuest v{version}</Text>
        <Text>•</Text>
        <Text>Updated: {lastUpdated}</Text>
      </HStack>
    </Box>
  );
}
