"use client";

import { Avatar, Menu, Portal, Text } from "@chakra-ui/react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!user) {
    return null;
  }

  return (
    <Menu.Root>
      <Menu.Trigger>
        <Avatar.Root size="sm">
          <Avatar.Image
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.full_name}
          />
          <Avatar.Fallback name={user.user_metadata.full_name} />
        </Avatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="email" disabled>
              <Text>{user.email}</Text>
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item value="logout" onClick={handleLogout}>
              ログアウト
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
