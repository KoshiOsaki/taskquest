"use client";

import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { askPermission, subscribe, saveSubscription } from "../lib/push-utils";

export default function PushNotificationSetup() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const setupPushNotifications = async () => {
      if ("serviceWorker" in navigator) {
        try {
          // サービスワーカーの登録
          const registration = await navigator.serviceWorker.register(
            "/service-worker.js"
          );
          console.log("SW registered:", registration);

          // 登録後に通知許可・購読処理を呼び出し
          await askPermission();
          const sub = await subscribe();
          await saveSubscription(sub, user.id);
          console.log("Push subscribed:", sub);
        } catch (err) {
          console.error("SW registration or push setup failed:", err);
        }
      }
    };

    // ページロード後に実行
    setupPushNotifications();
  }, [user]);

  return null; // UIは表示しない
}
