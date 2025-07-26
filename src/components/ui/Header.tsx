"use client";

import { Flex, Heading, IconButton } from "@chakra-ui/react";
import { FaChevronLeft } from "react-icons/fa";
import LoginButton from "./LoginButton";
import UserProfile from "./UserProfile";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user } = useAuth();
  // 仮の日付データ
  const today = new Date();
  const dateString = `${today.getFullYear()}/${
    today.getMonth() + 1
  }/${today.getDate()}`;

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      p={4}
      w="100%"
    >
      <IconButton 
        aria-label="Previous day" 
        bg="soft.blue"
        color="pop.blue"
        borderRadius="button"
        border="2px solid"
        borderColor="pop.blue"
        transition="all 0.2s ease"
        _hover={{
          bg: "pop.blue",
          color: "white",
          transform: "translateY(-1px)",
          boxShadow: "medium",
        }}
      >
        <FaChevronLeft />
      </IconButton>
      <Heading 
        as="h1" 
        size="lg"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="xl"
        fontWeight="700"
        color="pop.pink"
        textShadow="0 2px 4px rgba(255, 107, 157, 0.3)"
      >
        {dateString}
      </Heading>
      {user ? <UserProfile /> : <LoginButton />}
    </Flex>
  );
};
