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

  return <Button onClick={handleLogin}>Googleでログイン</Button>;
}
