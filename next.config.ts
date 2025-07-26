import type { NextConfig } from "next";
import createPWA from "next-pwa";
import runtimeCaching from "next-pwa/cache";

const withPWA = createPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching,
});

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
};

// Next.js v15 と next-pwa の型定義の競合を避けるため any にキャストします
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withPWA(nextConfig as any);
