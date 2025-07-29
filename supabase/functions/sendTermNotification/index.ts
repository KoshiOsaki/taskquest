// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  ApplicationServer,
  Urgency,
} from "jsr:@negrel/webpush@0.5";

// -------- ユーティリティ --------
const env = (k: string) => Deno.env.get(k) ??
  (() => { throw new Error(`${k} not set`); })();

const b64urlToUint8 = (b64url: string): Uint8Array => {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/")
    .padEnd(Math.ceil(b64url.length / 4) * 4, "=");
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
};

const rawKeysToCryptoKeyPair = async (
  publicKeyB64: string,
  privateKeyB64: string,
): Promise<CryptoKeyPair> => {
  // --- public ---
  const pubBytes = b64urlToUint8(publicKeyB64);          // 65byte (0x04 | X | Y)
  const x = pubBytes.slice(1, 33);
  const y = pubBytes.slice(33, 65);
  const pubJwk = {
    kty: "EC",
    crv: "P-256",
    x: btoa(String.fromCharCode(...x))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
    y: btoa(String.fromCharCode(...y))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
    ext: true,
  };

  // --- private ---
  const dBytes = b64urlToUint8(privateKeyB64);           // 32byte
  const privJwk = {
    ...pubJwk,
    d: btoa(String.fromCharCode(...dBytes))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
  };

  const algo = { name: "ECDSA", namedCurve: "P-256" };
  const crypto = globalThis.crypto.subtle;

  return {
    publicKey: await crypto.importKey("jwk", pubJwk, algo, true, ["verify"]),
    privateKey: await crypto.importKey("jwk", privJwk, algo, false, ["sign"]),
  };
};

// -------- 初期化 --------
const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

// Node 形式の VAPID 鍵を CryptoKeyPair へ変換
const vapidKeys = await rawKeysToCryptoKeyPair(
  env("VAPID_PUBLIC_KEY"),
  env("VAPID_PRIVATE_KEY"),
);

const appServer = await ApplicationServer.new({
  contactInformation: "mailto:admin@example.com",
  vapidKeys,
});

// -------- 送信ヘルパ --------
async function sendWebPush(
  sub: any,
  payload: string,
): Promise<void> {
  await appServer.subscribe(sub).pushTextMessage(payload, {
    urgency: Urgency.Normal,
  });
}

// -------- Edge Function --------
Deno.serve(async req => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const term = Deno.env.get("TERM_NAME") ?? "ターム3";
    const { data: subs, error } = await supabase.from("push_subscriptions").select("*");
    if (error) throw error;
    if (!subs?.length) {
      return new Response(JSON.stringify({ message: "No subscriptions found" }),
        { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // オブジェクトとして定義
    const payloadObj = JSON.stringify({
      title: `${term} 終了です！！！`,
      body: "お疲れさまでした。次のタームを始めましょう。",
      options: {
        tag: `term-end-${term}`,
        vibrate: [200, 100, 200],
      },
    });
    
    let ok = 0, ng = 0;
    for (let i = 0; i < 7; i++) {
      const results = await Promise.allSettled(
        subs.map(async (s: any) => {
          try { await sendWebPush(s.subscription, payload); ok++; }
          catch (e) { console.error(`send error (${s.id})`, e); ng++; }
        }),
      );
      if (i < 6) await new Promise(r => setTimeout(r, 1_000));
    }

    return new Response(JSON.stringify({
      term, batches: 7, totalAttempts: subs.length * 7, success: ok, fail: ng,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
