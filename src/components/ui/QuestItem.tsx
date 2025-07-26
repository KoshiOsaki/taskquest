"use client";

import { Checkbox, Flex, Text } from "@chakra-ui/react";
import { Quest } from "@/app/page";

interface QuestItemProps {
  quest: Quest;
}

export const QuestItem = ({ quest }: QuestItemProps) => {
  const { title, is_done } = quest;
  return (
    <Flex
      align="center"
      p={3}
      borderRadius="card"
      boxShadow="soft"
      bg={is_done ? "soft.green" : "white"}
      borderLeft="4px solid"
      borderColor={is_done ? "pop.green" : "pop.blue"}
      transition="all 0.3s ease"
      cursor="pointer"
      opacity={is_done ? 0.8 : 1}
      _hover={{
        transform: is_done ? "none" : "translateY(-2px)",
        boxShadow: is_done ? "soft" : "medium",
      }}
    >
      <Checkbox.Root defaultChecked={is_done} mr={3}>
        <Checkbox.Indicator />
      </Checkbox.Root>
      <Text
        fontSize="md"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="500"
        textDecoration={is_done ? "line-through" : "none"}
        color={is_done ? "gray.400" : "gray.700"}
        lineHeight="1.5"
      >
        {title}
      </Text>
    </Flex>
  );
};
