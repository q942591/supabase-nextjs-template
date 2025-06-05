import type { NextConfig } from "next";

import { defaultLocale, locales } from "~/lib/i18n";

export default {
  eslint: { ignoreDuringBuilds: true },
  // 国际化配置
  i18n: {
    defaultLocale,
    // 不在URL中添加前缀
    localeDetection: false,
    locales,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { hostname: "**.githubassets.com", protocol: "https" },
      { hostname: "**.githubusercontent.com", protocol: "https" },
      { hostname: "**.googleusercontent.com", protocol: "https" },
      { hostname: "**.ufs.sh", protocol: "https" },
      { hostname: "**.unsplash.com", protocol: "https" },
      { hostname: "api.github.com", protocol: "https" },
      { hostname: "utfs.io", protocol: "https" },
    ],
  },
} satisfies NextConfig;
