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

import path from "path";

import { cookies, headers } from "next/headers";

import { Toast } from "@docspace/ui-kit/components/toast";
import { TenantStatus } from "@docspace/shared/enums";
import { ThemeKeys } from "@docspace/ui-kit/enums";
import { LANGUAGE } from "@docspace/shared/constants";
import { SYSTEM_THEME_KEY } from "@docspace/ui-kit/providers/theme/themes/constants";
import {
  getDirectionByLanguage,
  getFontFamilyDependingOnLanguage,
} from "@docspace/ui-kit/providers/theme/rtl-utils";
import { loadTranslationsForLocale } from "@docspace/shared/utils/ssr-translation-loader";

import { Providers } from "@/providers";
import {
  getColorTheme,
  getConfig,
  getSettings,
  getUser,
} from "@/utils/actions";
import "../styles/globals.scss";
import "@docspace/shared/styles/theme.scss";
import Scripts from "@/components/Scripts";
import { TConfirmLinkParams } from "@/types";
import { logger } from "@/../logger.mjs";

const LOGIN_NAMESPACES = [
  "Login",
  "Confirm",
  "Consent",
  "Errors",
  "TenantList",
  "Wizard",
] as const;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const type = hdrs.get("x-confirm-type") ?? "";
  const searchParams = hdrs.get("x-confirm-query") ?? "";

  if (hdrs.get("x-health-check") || hdrs.get("referer")?.includes("/health")) {
    logger.info("get health check and return empty layout");
    return null;
  }

  const queryParams = Object.fromEntries(
    new URLSearchParams(searchParams.toString()),
  ) as TConfirmLinkParams;

  const cookieStore = await cookies();

  const systemTheme = cookieStore.get(SYSTEM_THEME_KEY);
  const cookieLng = cookieStore.get(LANGUAGE);

  let redirectUrl = "";

  const [settings, colorTheme, user] = await Promise.all([
    getSettings(),
    getColorTheme(),
    getUser(),
  ]);

  if (
    type === "EmailChange" &&
    typeof settings !== "string" &&
    queryParams?.redirected &&
    !settings?.socketUrl
  ) {
    redirectUrl = "/login?emailChange=true";
  }

  if (
    type === "GuestShareLink" &&
    typeof settings !== "string" &&
    !settings?.socketUrl
  ) {
    redirectUrl = "/login";
  }

  if (settings === "access-restricted") redirectUrl = `/${settings}`;

  if (settings === "portal-not-found") {
    const config = await getConfig();

    const host = hdrs.get("host");

    const url = new URL(
      config.wrongPortalNameUrl ||
        "https://www.onlyoffice.com/wrongportalname.aspx",
    );

    url.searchParams.append("url", host ?? "");

    redirectUrl = url.toString();
  }

  if (typeof settings !== "string" && settings?.wizardToken) {
    redirectUrl = `/wizard`;
  }

  if (
    typeof settings !== "string" &&
    settings?.tenantStatus === TenantStatus.PortalRestore
  ) {
    redirectUrl = `/preparation-portal`;
  }

  if (
    typeof settings !== "string" &&
    settings?.tenantStatus === TenantStatus.PortalDeactivate
  ) {
    redirectUrl = `/unavailable`;
  }

  if (cookieLng && settings && typeof settings !== "string") {
    settings.culture = cookieLng.value;
  }

  const locale =
    queryParams?.culture ||
    (settings && typeof settings !== "string" ? settings.culture : "en");

  const translations = await loadTranslationsForLocale(locale || "en", {
    namespaces: LOGIN_NAMESPACES,
    appLocalesDir: process.env.NEXT_APP_LOCALES_DIR ?? path.join(process.cwd(), "public/locales"),
    sharedLocalesDir: process.env.NEXT_SHARED_LOCALES_DIR ?? path.join(process.cwd(), "../../public/locales"),
  });

  const dirClass = getDirectionByLanguage(locale || "en");
  const themeClass =
    systemTheme?.value === ThemeKeys.DarkStr ? "dark" : "light";

  const currentColorScheme = colorTheme?.themes.find(
    (theme) => theme.id === colorTheme.selected,
  );

  const styles = {
    "--color-scheme-main-accent": currentColorScheme?.main?.accent,
    "--color-scheme-text-accent": currentColorScheme?.text?.accent,
    "--color-scheme-main-buttons": currentColorScheme?.main?.buttons,
    "--color-scheme-text-buttons": currentColorScheme?.text?.buttons,

    "--interface-direction": dirClass,

    "--font-family": getFontFamilyDependingOnLanguage(locale),
  } as React.CSSProperties;

  return (
    <html lang="en" translate="no">
      <head>
        <link rel="icon" type="image/x-icon" href="/logo.ashx?logotype=3" />
        <link rel="mask-icon" href="/logo.ashx?logotype=3" />
        <link
          rel="apple-touch-icon"
          sizes="32x32"
          href="/logo.ashx?logotype=3"
        />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        <meta name="google" content="notranslate" />
      </head>
      <body
        style={styles}
        className={`${dirClass} ${themeClass}`}
        suppressHydrationWarning
      >
        <Providers
          value={{
            settings: typeof settings === "string" ? undefined : settings,
            colorTheme,
            systemTheme: systemTheme?.value as ThemeKeys,
          }}
          redirectURL={redirectUrl}
          user={user}
          locale={locale}
          translations={translations}
        >
          <Toast isSSR />
          {children}
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
