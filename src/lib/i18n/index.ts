import { notFound } from "next/navigation";

// 支持的语言列表
export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

// 默认语言
export const defaultLocale = "en" as const;

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};

// 获取消息函数
export async function getMessages(locale: string) {
  // 验证语言是否支持
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return (await import(`../../messages/${locale}.json`)).default;
}
