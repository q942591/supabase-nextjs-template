"use client";

import { useLocaleContext } from "~/lib/i18n/locale-provider";
import { T, useMessages } from "~/lib/i18n/messages-provider";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/primitives/card";

export function I18nExample() {
  const { t } = useMessages();
  const { locale } = useLocaleContext();

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <T id="app.title" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          <T id="app.description" />
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="font-semibold">当前语言:</div>
          <div>{locale === "en" ? "English" : "中文"}</div>

          <div className="font-semibold">导航项目:</div>
          <div>
            <ul className="list-inside list-disc">
              <li>{t("nav.home")}</li>
              <li>{t("nav.products")}</li>
              <li>{t("nav.dashboard")}</li>
            </ul>
          </div>

          <div className="font-semibold">常用按钮:</div>
          <div>
            <ul className="list-inside list-disc">
              <li>{t("common.save")}</li>
              <li>{t("common.cancel")}</li>
              <li>{t("common.delete")}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
