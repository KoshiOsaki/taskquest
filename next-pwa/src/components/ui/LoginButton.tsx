"use client";

import { supabase } from "../../lib/supabase/client";
import { Button } from "@chakra-ui/react";

export default function LoginButton() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Button
      aria-label="ログイン"
      onClick={handleLogin}
      colorScheme="blue"
      borderRadius="full"
      size="md"
      boxShadow="md"
    >
      ログイン
    </Button>
  );
}
