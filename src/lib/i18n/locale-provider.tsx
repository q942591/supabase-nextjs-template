"use client";

import { createContext, type ReactNode, use } from "react";

import type { Locale } from "./index";

import { useLocale } from "./use-locale";

// 语言上下文类型
interface LocaleContextType {
  changeLocale: (locale: Locale) => void;
  isCurrentLocale: (locale: Locale) => boolean;
  locale: Locale;
  locales: readonly Locale[];
}

// 创建上下文
const LocaleContext = createContext<LocaleContextType | null>(null);

// 上下文提供者组件
export function LocaleProvider({ children }: { children: ReactNode }) {
  const localeData = useLocale();

  return <LocaleContext value={localeData}>{children}</LocaleContext>;
}

// 使用上下文的钩子
export function useLocaleContext(): LocaleContextType {
  const context = use(LocaleContext);
  if (!context) {
    throw new Error("useLocaleContext must be used within a LocaleProvider");
  }
  return context;
}
