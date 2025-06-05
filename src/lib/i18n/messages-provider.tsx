"use client";

import { createContext, type ReactNode, use, useEffect, useState } from "react";

import { getMessages } from "./index";
import { useLocaleContext } from "./locale-provider";

// 消息上下文类型
interface MessagesContextType {
  isLoading: boolean;
  messages: Record<string, any>;
  t: (key: string, defaultMessage?: string) => string;
}

// 创建上下文
const MessagesContext = createContext<MessagesContextType | null>(null);

// 上下文提供者组件
export function MessagesProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocaleContext();
  const [messages, setMessages] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 加载消息
  useEffect(() => {
    async function loadMessages() {
      setIsLoading(true);
      try {
        const messagesData = await getMessages(locale);
        setMessages(messagesData);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [locale]);

  // 翻译函数
  const t = (key: string, defaultMessage = "") => {
    if (isLoading) return defaultMessage || key;

    // 处理嵌套键，如 'nav.home'
    const parts = key.split(".");
    let value: any = messages;

    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) {
        return defaultMessage || key;
      }
    }

    return value || defaultMessage || key;
  };

  return (
    <MessagesContext value={{ isLoading, messages, t }}>
      {children}
    </MessagesContext>
  );
}

// 翻译组件
export function T({
  children,
  defaultMessage = "",
  id,
}: {
  children?: ReactNode;
  defaultMessage?: string;
  id: string;
}) {
  const { t } = useMessages();
  return <>{t(id, defaultMessage || (children as string)) || children}</>;
}

// 使用上下文的钩子
export function useMessages() {
  const context = use(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
}
