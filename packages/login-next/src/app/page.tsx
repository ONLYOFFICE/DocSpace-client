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

"use server";
import { redirect } from "next/navigation";

import { TenantStatus } from "@docspace/shared/enums";
import { getBaseUrl } from "@docspace/shared/utils/next-ssr-helper";

import Login from "@/components/Login";
import {
  getSettings,
  getVersionBuild,
  getColorTheme,
  getThirdPartyProviders,
  getCapabilities,
  getSSO,
  checkIsAuthenticated,
} from "@/utils/actions";
import {
  TCapabilities,
  TGetSsoSettings,
  TThirdPartyProvider,
} from "@docspace/shared/api/settings/types";
import { headers } from "next/headers";

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  const isAuth = await checkIsAuthenticated();

  const settings = await getSettings();

  if (settings === "access-restricted") redirect(`${getBaseUrl()}/${settings}`);

  if (settings === "portal-not-found") {
    const config = await (
      await fetch(`${getBaseUrl()}/static/scripts/config.json`)
    ).json();
    const hdrs = headers();
    const host = hdrs.get("host");

    const url = new URL(
      config.wrongPortalNameUrl ??
        "https://www.onlyoffice.com/wrongportalname.aspx",
    );

    url.searchParams.append("url", host ?? "");

    redirect(url.toString());
  }

  let thirdParty: TThirdPartyProvider[] | undefined;
  let capabilities: TCapabilities | undefined;
  let ssoSettings: TGetSsoSettings | undefined;

  if (settings?.tenantStatus !== TenantStatus.PortalRestore) {
    [thirdParty, capabilities, ssoSettings] = await Promise.all([
      getThirdPartyProviders(),
      getCapabilities(),
      getSSO(),
    ]);
  }

  const ssoUrl = capabilities ? capabilities.ssoUrl : "";
  const hideAuthPage = ssoSettings ? ssoSettings.hideAuthPage : false;

  if (ssoUrl && hideAuthPage && searchParams.skipssoredirect !== "true") {
    redirect(ssoUrl);
  }

  if (settings?.wizardToken) {
    redirect(`${getBaseUrl()}/wizard`);
  }

  return (
    <Login
      searchParams={searchParams}
      capabilities={capabilities}
      settings={settings}
      thirdPartyProvider={thirdParty}
      ssoSettings={ssoSettings}
      isAuthenticated={isAuth}
    />
  );
}

export default Page;
