"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { FiEdit3 } from "react-icons/fi";

interface MemoTabProps {
  onClick: () => void;
  isExpanded: boolean;
}

export const MemoTab: React.FC<MemoTabProps> = ({ onClick, isExpanded }) => {
  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      mx="4px"
      zIndex={997}
      cursor="pointer"
      onClick={onClick}
      transition="all 0.3s ease-in-out"
    >
      {/* メモタブ */}
      <Box
        bg="white"
        borderTopRadius="xl"
        boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
        border="1px solid"
        borderColor="gray.200"
        borderBottom="none"
        px={6}
        py={3}
        transform={isExpanded ? "translateY(0)" : "translateY(0)"}
        _hover={{
          transform: isExpanded ? "translateY(0)" : "translateY(-2px)",
          boxShadow: "0 -4px 15px rgba(0,0,0,0.15)",
        }}
      >
        <Flex alignItems="center" justifyContent="center" gap={2}>
          <FiEdit3 size={16} color="#666" />
          <Text fontSize="sm" fontWeight="medium" color="gray.600">
            メモ
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};
