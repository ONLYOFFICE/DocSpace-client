// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { cookies, headers } from "next/headers";

import { Toast } from "@docspace/shared/components/toast";
import { TenantStatus, ThemeKeys } from "@docspace/shared/enums";
import { LANGUAGE, SYSTEM_THEME_KEY } from "@docspace/shared/constants";
import { getDirectionByLanguage } from "@docspace/shared/utils/common";
import { getFontFamilyDependingOnLanguage } from "@docspace/shared/utils/rtlUtils";

import StyledComponentsRegistry from "@/utils/registry";
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
    !settings?.socketUrl
  ) {
    redirectUrl = "login?emailChange=true";
  }

  if (
    type === "GuestShareLink" &&
    typeof settings !== "string" &&
    !settings?.socketUrl
  ) {
    redirectUrl = "login";
  }

  if (settings === "access-restricted") redirectUrl = `/${settings}`;

  if (settings === "portal-not-found") {
    const config = await getConfig();

    const host = hdrs.get("host");

    const url = new URL(
      config.wrongPortalNameUrl ??
        "https://www.onlyoffice.com/wrongportalname.aspx",
    );

    url.searchParams.append("url", host ?? "");

    redirectUrl = url.toString();
  }

  if (typeof settings !== "string" && settings?.wizardToken) {
    redirectUrl = `wizard`;
  }

  if (
    typeof settings !== "string" &&
    settings?.tenantStatus === TenantStatus.PortalRestore
  ) {
    redirectUrl = `preparation-portal`;
  }

  if (
    typeof settings !== "string" &&
    settings?.tenantStatus === TenantStatus.PortalDeactivate
  ) {
    redirectUrl = `unavailable`;
  }

  if (cookieLng && settings && typeof settings !== "string") {
    settings.culture = cookieLng.value;
  }

  const locale =
    queryParams?.culture ||
    (settings && typeof settings !== "string" ? settings.culture : "en");

  const dirClass = getDirectionByLanguage(locale || "en");
  const themeClass =
    systemTheme?.value === ThemeKeys.DarkStr ? "dark" : "light";

  const currentColorScheme = colorTheme?.themes.find(
    (theme) => theme.id === colorTheme.selected,
  );

  const styles = {
    "--color-scheme-main-accent": currentColorScheme?.main.accent,
    "--color-scheme-text-accent": currentColorScheme?.text.accent,
    "--color-scheme-main-buttons": currentColorScheme?.main.buttons,
    "--color-scheme-text-buttons": currentColorScheme?.text.buttons,

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
      <body style={styles} className={`${dirClass} ${themeClass}`}>
        <StyledComponentsRegistry>
          <Providers
            value={{
              settings: typeof settings === "string" ? undefined : settings,
              colorTheme,
              systemTheme: systemTheme?.value as ThemeKeys,
            }}
            redirectURL={redirectUrl}
            user={user}
            locale={locale}
          >
            <Toast isSSR />
            {children}
          </Providers>
        </StyledComponentsRegistry>
        <Scripts />
      </body>
    </html>
  );
}
