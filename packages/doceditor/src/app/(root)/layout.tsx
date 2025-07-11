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
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";

import { ThemeKeys } from "@docspace/shared/enums";
import { getBaseUrl } from "@docspace/shared/utils/next-ssr-helper";
import { SYSTEM_THEME_KEY } from "@docspace/shared/constants";

import "@docspace/shared/styles/theme.scss";

import Providers from "@/providers";
import Scripts from "@/components/Scripts";
import StyledComponentsRegistry from "@/utils/registry";
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
      </head>
      <body className={themeClass}>
        <StyledComponentsRegistry>
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
        </StyledComponentsRegistry>

        <Scripts />
      </body>
    </html>
  );
}
