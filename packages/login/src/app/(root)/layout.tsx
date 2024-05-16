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

import { permanentRedirect, redirect } from "next/navigation";
import { cookies, headers } from "next/headers";

import { Toast } from "@docspace/shared/components/toast";
import { getBaseUrl } from "@docspace/shared/utils/next-ssr-helper";
import { TenantStatus, ThemeKeys } from "@docspace/shared/enums";
import { SYSTEM_THEME_KEY } from "@docspace/shared/constants";

import { Providers } from "@/providers";
import StyledComponentsRegistry from "@/utils/registry";
import {
  checkIsAuthenticated,
  getColorTheme,
  getSettings,
} from "@/utils/actions";
import SimpleNav from "@/components/SimpleNav";

import "../../styles/globals.scss";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = getBaseUrl();

  const timers = { isAuth: 0, otherOperations: 0 };

  const cookieStore = cookies();

  const systemTheme = cookieStore.get(SYSTEM_THEME_KEY);

  let redirectUrl = "";

  const api_host = process.env.API_HOST?.trim();

  const startOtherOperationsDate = new Date();

  const [settings, colorTheme] = await Promise.all([
    getSettings(),
    getColorTheme(),
  ]);

  timers.otherOperations =
    new Date().getTime() - startOtherOperationsDate.getTime();

  if (settings === "access-restricted") redirectUrl = `/${settings}`;

  if (settings === "portal-not-found") {
    const config = await (
      await fetch(`${baseUrl}/static/scripts/config.json`)
    ).json();
    const hdrs = headers();
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

  const internalRequest = await fetch(
    `${api_host}/api/2.0/settings?withPassword=true`,
  );

  let internalRequestJson = "";

  if (internalRequest.ok) internalRequestJson = await internalRequest.json();

  return (
    <html lang="en" translate="no">
      <head>
        <link rel="icon" type="image/x-icon" href="/logo.ashx?logotype=3" />
        <link rel="mask-icon" href="/logo.ashx?logotype=3" />
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        <meta name="google" content="notranslate" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <Providers
            value={{
              settings: typeof settings !== "string" ? settings : undefined,
              colorTheme,
              systemTheme: systemTheme?.value as ThemeKeys,
            }}
            timers={timers}
            api_host={api_host}
            internalRequest={internalRequest}
            internalRequestJson={internalRequestJson}
            redirectURL={redirectUrl}
          >
            <SimpleNav systemTheme={systemTheme?.value as ThemeKeys} />
            <Toast isSSR />
            {children}
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
