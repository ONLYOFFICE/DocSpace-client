// (c) Copyright Ascensio System SIA 2009-2024
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
import { headers, cookies } from "next/headers";
import type { Metadata } from "next";

import { ThemeKeys } from "@docspace/shared/enums";
import { SYSTEM_THEME_KEY } from "@docspace/shared/constants";
import { getDirectionByLanguage } from "@docspace/shared/utils/common";
import { getFontFamilyDependingOnLanguage } from "@docspace/shared/utils/rtlUtils";

import "@docspace/shared/styles/theme.scss";

import "@/styles/globals.scss";
import { getColorTheme, getPortalCultures, getSettings } from "@/api/settings";
import { LOCALE_HEADER, THEME_HEADER } from "@/utils/constants";
import StyledComponentsRegistry from "@/utils/registry";
import Providers from "@/providers";
import { getSelf } from "@/api/people";
import Scripts from "@/components/Scripts";
import { logger } from "@/../logger.mjs";

export const metadata: Metadata = {
  title: "ONLYOFFICE",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  logger.info("SDK layout");

  const hdrs = await headers();

  if (hdrs.get("x-health-check") || hdrs.get("referer")?.includes("/health")) {
    logger.info("get health check and return empty layout");
    return null;
  }

  const cookieStore = await cookies();

  const [self, portalSettings, colorTheme, portalCultures] = await Promise.all([
    getSelf(),
    getSettings(),
    getColorTheme(),
    getPortalCultures(),
  ]);

  const theme =
    (hdrs.get(THEME_HEADER) as ThemeKeys | null) ||
    self?.theme ||
    ThemeKeys.SystemStr;
  const locale =
    (hdrs.get(LOCALE_HEADER) as string | null) ||
    self?.cultureName ||
    (typeof portalSettings === "object" && portalSettings.culture) ||
    "en";

  const systemTheme = cookieStore.get(SYSTEM_THEME_KEY)?.value as
    | ThemeKeys
    | undefined;

  const currentColorScheme = colorTheme?.themes.find(
    (t) => t.id === colorTheme.selected,
  );

  const dirClass = getDirectionByLanguage(locale || "en");
  const themeClass =
    (theme !== ThemeKeys.SystemStr ? theme : systemTheme) === ThemeKeys.DarkStr
      ? "dark"
      : "light";

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
        <link id="favicon" rel="shortcut icon" type="image/x-icon" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        <meta name="google" content="notranslate" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body style={styles} className={`${dirClass} ${themeClass}`}>
        <StyledComponentsRegistry>
          <Providers
            contextData={{
              initialTheme: theme,
              user: self,
              settings:
                typeof portalSettings === "string" ? undefined : portalSettings,
              systemTheme,
              colorTheme,
              locale,
              portalCultures,
            }}
          >
            {children}
          </Providers>
        </StyledComponentsRegistry>

        <Scripts />
      </body>
    </html>
  );
}
