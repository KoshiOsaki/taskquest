"use client";

import { Flex } from "@chakra-ui/react";
import LoginButton from "./LoginButton";
import UserProfile from "./UserProfile";
import { useAuth } from "../../hooks/useAuth";

export const Header = () => {
  const { user } = useAuth();

  return (
    <Flex
      as="header"
      align="center"
      justify="flex-end"
      p={2}
      w="100%"
      position="fixed"
      top={0}
      left={0}
      right={0}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      zIndex={1000}
      height="60px"
    >
      {user ? <UserProfile /> : <LoginButton />}
    </Flex>
  );
};
