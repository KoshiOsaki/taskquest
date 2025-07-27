import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as webPush from "https://esm.sh/web-push@3";

// 型定義
interface PushSubscription {
  id: string;
  user_id: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  created_at: string;
}

interface NotificationPayload {
  title: string;
  options: {
    tag: string;
    renotify: boolean;
    vibrate: number[];
  };
}

interface NotificationResult {
  success: boolean;
  subscriptionId: string;
  error?: Error | string;
}

// 環境変数の安全な取得
function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

try {
  // Supabaseクライアントの初期化
  const supabase = createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_ANON_KEY")
  );

  // VAPID設定
  webPush.setVapidDetails(
    "mailto:admin@example.com",
    getRequiredEnv("VAPID_PUBLIC"),
    getRequiredEnv("VAPID_PRIVATE")
  );

  Deno.serve(async (req: Request) => {
    try {
      // CORSヘッダーの設定
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      };

      // OPTIONSリクエストの処理
      if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
      }

      // POSTメソッドのみ許可
      if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // タームの決定
      const term = Deno.env.get("TERM_NAME") ?? "ターム3";
      console.log(`Sending notifications for ${term}`);

      // プッシュ通知購読者の取得
      const { data: subs, error: fetchError } = await supabase
        .from("push_subscriptions")
        .select("*");

      if (fetchError) {
        console.error("Error fetching subscriptions:", fetchError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch subscriptions" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!subs || subs.length === 0) {
        console.log("No subscriptions found");
        return new Response(
          JSON.stringify({ message: "No subscriptions found" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(`Found ${subs.length} subscriptions`);

      // 通知ペイロードの作成
      const payload: NotificationPayload = {
        title: `${term} 終了です！！！`,
        options: {
          tag: `term-end-${term}`,
          renotify: true,
          vibrate: [200, 100, 200],
        },
      };

      let successCount = 0;
      let errorCount = 0;

      // 7回連続送信
      for (let i = 0; i < 7; i++) {
        console.log(`Sending notification batch ${i + 1}/7`);

        const results = await Promise.allSettled(
          subs.map(
            async (sub: PushSubscription): Promise<NotificationResult> => {
              try {
                await webPush.sendNotification(
                  sub.subscription,
                  JSON.stringify(payload)
                );
                return { success: true, subscriptionId: sub.id };
              } catch (error) {
                console.error(
                  `Failed to send to subscription ${sub.id}:`,
                  error
                );
                return {
                  success: false,
                  subscriptionId: sub.id,
                  error: error instanceof Error ? error.message : String(error),
                };
              }
            }
          )
        );

        // 結果の集計
        results.forEach((result: PromiseSettledResult<NotificationResult>) => {
          if (result.status === "fulfilled" && result.value.success) {
            successCount++;
          } else {
            errorCount++;
          }
        });

        // バッチ間の待機時間（1秒）
        if (i < 6) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      console.log(
        `Notification sending completed. Success: ${successCount}, Errors: ${errorCount}`
      );

      return new Response(
        JSON.stringify({
          message: "Notifications sent",
          term,
          batches: 7,
          totalAttempts: subs.length * 7,
          successCount,
          errorCount,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error in request handler:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  });
} catch (error) {
  console.error("Failed to initialize function:", error);
  throw error;
}
