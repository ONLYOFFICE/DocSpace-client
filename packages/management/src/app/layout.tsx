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

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@docspace/shared/utils/next-ssr-helper";
import { ThemeKeys } from "@docspace/ui-kit/enums";
import { SYSTEM_THEME_KEY } from "@docspace/ui-kit/providers/theme/themes/constants";
import { LANGUAGE } from "@docspace/shared/constants";

import { Toast } from "@docspace/ui-kit/components/toast";

import {
  getSettings,
  getUser,
  getColorTheme,
  getAllPortals,
  getPortalTariff,
} from "@/lib/actions";
import Providers from "@/providers";

import { LayoutWrapper } from "@/components/layout";
import { Scripts } from "@/components/Scripts";
import { ManagementDialogs } from "@/dialogs";

import "@/styles/globals.scss";
import "@docspace/shared/styles/theme.scss";
import { logger } from "../../logger.mjs";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, settings, colorTheme, portals, portalTariff] = await Promise.all(
    [
      getUser(),
      getSettings(),
      getColorTheme(),
      getAllPortals(),
      getPortalTariff(),
    ],
  );

  const baseURL = await getBaseUrl();

  if (settings === "access-restricted") {
    logger.info("Management layout access-restricted");

    redirect(`${baseURL}/${settings}`);
  }

  if (
    (user && !user.isAdmin && !user.isOwner) ||
    (settings && settings.limitedAccessSpace) ||
    !portalTariff
  ) {
    logger.info("Management layout error/403");

    redirect(`${baseURL}/error/403`);
  }

  const cookieStore = await cookies();

  const systemTheme = cookieStore.get(SYSTEM_THEME_KEY);
  const cookieLng = cookieStore.get(LANGUAGE);

  if (cookieLng && settings && typeof settings !== "string") {
    settings.culture = cookieLng.value;
  }

  const { openSource } = portalTariff;

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
        className={`${systemTheme?.value === ThemeKeys.DarkStr ? "dark" : "light"}`}
      >
        <Providers
          contextData={{
            user,
            settings,
            systemTheme: systemTheme?.value as ThemeKeys,
            colorTheme,
          }}
        >
          <Toast isSSR />
          <ManagementDialogs settings={settings!} user={user!} />
          <LayoutWrapper portals={portals!} isCommunity={openSource}>
            {children}
          </LayoutWrapper>
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
