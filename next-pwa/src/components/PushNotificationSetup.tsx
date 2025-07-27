"use client";

import { useState, useEffect } from "react";
import { Button, Box, Text } from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import {
  askPermission,
  subscribe,
  saveSubscription,
  getNotificationPermission,
} from "../lib/push-utils";

export default function PushNotificationSetup() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!user) return;

    // 初期状態をチェック
    const checkInitialState = async () => {
      const currentPermission = getNotificationPermission();
      setPermission(currentPermission);

      // Service Workerの登録状況をチェック
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.register(
            "/service-worker.js"
          );

          // 既存の購読状況をチェック
          const existingSubscription =
            await registration.pushManager.getSubscription();
          setIsSubscribed(!!existingSubscription);

          if (existingSubscription) {
            setStatus("プッシュ通知が有効です");
          } else if (currentPermission === "granted") {
            setStatus("通知は許可されていますが、購読が必要です");
          } else if (currentPermission === "denied") {
            setStatus(
              "通知が拒否されています。ブラウザ設定から許可してください"
            );
          } else {
            setStatus(
              "プッシュ通知を有効にするには下のボタンをクリックしてください"
            );
          }
        } catch (err) {
          console.error("SW registration failed:", err);
          setStatus(`エラー: ${err}`);
        }
      } else {
        setStatus("このブラウザはService Workerをサポートしていません");
      }
    };

    checkInitialState();
  }, [user]);

  const handleEnableNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    setStatus("設定中...");

    try {
      // 通知許可を求める
      await askPermission();
      setPermission("granted");
      setStatus("通知が許可されました。購読中...");

      // プッシュ通知を購読
      const subscription = await subscribe();

      // Supabaseに保存
      await saveSubscription(subscription, user.id);

      setIsSubscribed(true);
      setStatus("プッシュ通知が有効になりました！");

      // iOS PWAの場合の追加メッセージ
      if (
        /iPhone|iPad|iPod/.test(navigator.userAgent) &&
        (window as any).navigator.standalone
      ) {
        setStatus("プッシュ通知が有効になりました！（PWAモード）");
      } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        setStatus(
          "プッシュ通知が有効になりました！\n※iOSでは「ホーム画面に追加」してからご利用ください"
        );
      }
    } catch (err) {
      console.error("Push setup failed:", err);
      setStatus(`エラー: ${err}`);
      setPermission(getNotificationPermission());
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        プッシュ通知設定
      </Text>

      <Text mb={2}>現在の状態: {permission}</Text>

      {status && (
        <Box
          p={3}
          mb={3}
          borderRadius="md"
          bg={
            isSubscribed
              ? "green.100"
              : permission === "denied"
              ? "red.100"
              : "blue.100"
          }
          borderLeft="4px solid"
          borderColor={
            isSubscribed
              ? "green.500"
              : permission === "denied"
              ? "red.500"
              : "blue.500"
          }
        >
          <Text
            whiteSpace="pre-line"
            color={
              isSubscribed
                ? "green.800"
                : permission === "denied"
                ? "red.800"
                : "blue.800"
            }
          >
            {status}
          </Text>
        </Box>
      )}

      {!isSubscribed && permission !== "denied" && (
        <Button
          onClick={handleEnableNotifications}
          loading={isLoading}
          colorScheme="blue"
          size="sm"
        >
          プッシュ通知を有効にする
        </Button>
      )}

      {permission === "denied" && (
        <Text fontSize="sm" color="red.500">
          ブラウザの設定から通知を許可してページを再読み込みしてください
        </Text>
      )}

      {/* 使用方法の説明 */}
      <Box mt={4} p={3} bg="blue.50" borderRadius="md" fontSize="sm">
        <Text fontWeight="bold" mb={2}>
          📱 使用方法:
        </Text>
        <Text mb={1}>
          • <strong>デスクトップ</strong>: そのまま通知が届きます
        </Text>
        <Text mb={1}>
          • <strong>iPhone/iPad</strong>:
          「ホーム画面に追加」してからご利用ください
        </Text>
        <Text fontSize="xs" color="gray.600">
          ※ iOS 16.4以降でサポート
        </Text>
      </Box>
    </Box>
  );
}
