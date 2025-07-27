"use client";
import { useEffect, useState } from "react";
import { Box, Text, Button } from "@chakra-ui/react";

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export default function AddToHomeIos() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandalone = (window.navigator as NavigatorWithStandalone)
      .standalone;
    if (isIos && !isInStandalone) setShow(true);
  }, []);

  if (!show) return null;
  return (
    <Box
      position="fixed"
      bottom={4}
      left={4}
      right={4}
      p={4}
      borderRadius="xl"
      bg="whiteAlpha.900"
      boxShadow="lg"
      backdropFilter="blur(8px)"
    >
      <Text fontSize="sm">
        ホーム画面に追加するには
        <Text as="span" fontWeight="bold">
          共有ボタン→「ホーム画面に追加」
        </Text>
        をタップしてください
      </Text>
      <Button
        variant="ghost"
        colorScheme="blue"
        onClick={() => setShow(false)}
        size="sm"
        mt={2}
      >
        閉じる
      </Button>
    </Box>
  );
}
