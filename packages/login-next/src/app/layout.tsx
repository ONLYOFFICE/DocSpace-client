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

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { COOKIE_EXPIRATION_YEAR, LANGUAGE } from "@docspace/shared/constants";
import { getLanguage } from "@docspace/shared/utils/banner";

import StyledComponentsRegistry from "@/utils/registry";
import { DataContextProvider } from "@/providers/DataProvider";
import { checkIsAuthenticated, getData, updateCookie } from "@/utils/actions";
import SimpleNav from "@/components/SimpleNav";

import "../styles/globals.scss";
import { Toast } from "@docspace/shared/components/toast";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();

  const isAuth = await checkIsAuthenticated();

  if (isAuth) redirect("/");

  const [
    settings,
    versionBuild,
    colorTheme,
    whiteLabel,
    thirdPartyProvider,
    capabilities,
    ssoSettings,
  ] = await getData();

  const ssoUrl = capabilities ? capabilities.ssoUrl : "";
  const hideAuthPage = ssoSettings ? ssoSettings.hideAuthPage : false;

  if (ssoUrl && hideAuthPage) {
    redirect(ssoUrl);
  }

  if (settings.wizardToken) {
    redirect("/wizard");
  }

  let currentLanguage: string = settings.culture ?? "en";
  let standalone: boolean = settings.standalone ? true : false;

  const cookieLang = cookieStore.get(LANGUAGE) as string | undefined;

  if (cookieLang) {
    currentLanguage = cookieLang;
  } else {
    // updateCookie(LANGUAGE, currentLanguage, {
    //   maxAge: COOKIE_EXPIRATION_YEAR,
    // });
  }

  currentLanguage = getLanguage(currentLanguage);

  return (
    <html lang="en">
      <head>
        <link id="favicon" rel="shortcut icon" type="image/x-icon" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <DataContextProvider
            value={{
              settings,
              versionBuild,
              colorTheme,
              whiteLabel,
              thirdPartyProvider,
              capabilities,
              ssoSettings,
              currentLanguage,
              standalone,
            }}
          >
            <SimpleNav logoUrls={whiteLabel} />
            <Toast isSSR />
            {children}
          </DataContextProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
