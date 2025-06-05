"use client";

import { Globe } from "lucide-react";

import { localeNames } from "~/lib/i18n";
import { useLocaleContext } from "~/lib/i18n/locale-provider";
import { Button } from "~/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";

function CNFlag() {
  return (
    <svg
      aria-labelledby="cn-flag-title"
      className="mr-2 h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="cn-flag-title">China Flag</title>
      <rect fill="#DE2910" height="24" rx="4" width="24" />
      {/* 大星 */}
      <path d="M5 4L6 6.5L3.5 5H6.5L4 6.5L5 4Z" fill="#FFDE00" />
      {/* 小星 - 右上 */}
      <path d="M9 2L9.4 3L8.2 2.5H9.8L8.6 3L9 2Z" fill="#FFDE00" />
      {/* 小星 - 右中 */}
      <path d="M10 4L10.4 5L9.2 4.5H10.8L9.6 5L10 4Z" fill="#FFDE00" />
      {/* 小星 - 右下 */}
      <path d="M9 6L9.4 7L8.2 6.5H9.8L8.6 7L9 6Z" fill="#FFDE00" />
      {/* 小星 - 左中 */}
      <path d="M7 4L7.4 5L6.2 4.5H7.8L6.6 5L7 4Z" fill="#FFDE00" />
    </svg>
  );
}

// 自定义国旗图标组件
function UKFlag() {
  return (
    <svg
      aria-labelledby="uk-flag-title"
      className="mr-2 h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="uk-flag-title">UK Flag</title>
      <rect fill="#FFFFFF" height="24" rx="4" width="24" />
      <path d="M0 0L24 24M24 0L0 24" stroke="#CF142B" strokeWidth="2" />
      <path d="M0 12H24M12 0V24" stroke="#CF142B" strokeWidth="6" />
      <path d="M0 12H24M12 0V24" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M0 0L24 24M24 0L0 24" stroke="#CF142B" strokeWidth="2" />
    </svg>
  );
}

// 语言图标映射
const localeIcons = {
  en: () => <UKFlag />,
  zh: () => <CNFlag />,
};

export function LanguageSwitcher() {
  const { changeLocale, locale, locales } = useLocaleContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-9 w-9" size="icon" variant="ghost">
          <Globe className="h-4 w-4" />
          <span className="sr-only">切换语言</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => {
          const Icon = localeIcons[l];
          return (
            <DropdownMenuItem
              className={l === locale ? "bg-muted" : ""}
              key={l}
              onClick={() => changeLocale(l)}
            >
              <Icon />
              {localeNames[l]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
