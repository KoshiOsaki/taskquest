import withPWA from "next-pwa";
import type { NextConfig } from "next";

export default withPWA<NextConfig>({
  output: "export", // 既存設定そのまま
  pwa: {
    dest: "public", // `next export` 後に sw/manifest を public 直下へ生成
    register: true, // _app.tsx に何も書かなくても SW 自動登録
    skipWaiting: true, // 新SWを即時アクティブ化
    runtimeCaching: [
      // 画像・フォントなどを Cache First にする例
      {
        urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
    ],
  },
});
