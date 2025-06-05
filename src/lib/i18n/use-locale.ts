"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { defaultLocale, type Locale, locales } from "./index";

const LOCALE_STORAGE_KEY = "locale";

export function useLocale() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  // 在组件挂载时从本地存储中获取语言设置
  useEffect(() => {
    const savedLocale = localStorage.getItem(
      LOCALE_STORAGE_KEY,
    ) as Locale | null;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  // 改变语言设置
  const changeLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

    // 保存到本地存储
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    setLocale(newLocale);

    // 刷新当前页面以应用新语言
    router.refresh();
  };

  return {
    changeLocale,
    isCurrentLocale: (l: Locale) => l === locale,
    locale,
    locales,
  };
}
