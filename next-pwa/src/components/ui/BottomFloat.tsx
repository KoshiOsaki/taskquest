"use client";

import { Box } from "@chakra-ui/react";
import LoginButton from "./LoginButton";
import UserProfile from "./UserProfile";
import { useAuth } from "../../hooks/useAuth";

export const BottomFloat = () => {
  const { user } = useAuth();

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      zIndex={1000}
      boxShadow="md"
      borderRadius="full"
    >
      {user ? <UserProfile /> : <LoginButton />}
    </Box>
  );
};
