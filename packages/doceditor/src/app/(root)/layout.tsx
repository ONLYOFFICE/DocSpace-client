/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";

import { ThemeKeys } from "@docspace/ui-kit/enums";
import { getBaseUrl } from "@docspace/shared/utils/next-ssr-helper";
import { sanitizeStylesUrl } from "@docspace/shared/utils/customStyles";
import { SYSTEM_THEME_KEY } from "@docspace/ui-kit/providers/theme/themes/constants";

import "@docspace/shared/styles/theme.scss";

import Providers from "@/providers";
import Scripts from "@/components/Scripts";
import { getColorTheme, getSettings, getUser } from "@/utils/actions";
import { logger } from "@/../logger.mjs";

import "@/styles/globals.scss";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const cookieStore = await cookies();

  if (hdrs.get("x-health-check") || hdrs.get("referer")?.includes("/health")) {
    logger.info("get health check and return empty layout");
    return null;
  }

  const [user, settings, colorTheme] = await Promise.all([
    getUser(),
    getSettings(),
    getColorTheme(),
  ]);

  const systemTheme = cookieStore.get(SYSTEM_THEME_KEY)?.value as
    | ThemeKeys
    | undefined;

  const theme =
    (hdrs.get("x-sdk-config-theme") as ThemeKeys | null) ||
    user?.theme ||
    systemTheme ||
    ThemeKeys.BaseStr;

  const themeClass =
    (theme !== ThemeKeys.SystemStr ? theme : systemTheme) === ThemeKeys.DarkStr
      ? "dark"
      : "light";

  const locale =
    (hdrs.get("x-sdk-config-locale") as string | null) ||
    user?.cultureName ||
    (typeof settings === "object" && settings.culture) ||
    "en";

  const stylesUrl = sanitizeStylesUrl(hdrs.get("x-sdk-config-styles-url"));

  const baseURL = await getBaseUrl();

  if (settings === "access-restricted") {
    logger.info("Root layout access-restricted");
    redirect(`${baseURL}/${settings}`);
  }

  return (
    <html lang="en" translate="no">
      <head>
        <link id="favicon" rel="shortcut icon" type="image/x-icon" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        <meta name="google" content="notranslate" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {stylesUrl ? (
          <link
            id="sdk-custom-styles"
            rel="stylesheet"
            href={stylesUrl}
            referrerPolicy="no-referrer"
          />
        ) : null}
      </head>
      <body className={themeClass}>
        <Providers
          contextData={{
            initialTheme: theme,
            user,
            settings,
            systemTheme,
            colorTheme,
            locale,
          }}
        >
          {children}
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
