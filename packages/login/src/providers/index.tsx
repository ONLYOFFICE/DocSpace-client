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

"use client";

import React from "react";
import { I18nextProvider } from "react-i18next";

import { ThemeProvider } from "@docspace/shared/components/theme-provider";
import { TFirebaseSettings } from "@docspace/shared/api/settings/types";
import FirebaseHelper from "@docspace/shared/utils/firebase";
import { TUser } from "@docspace/shared/api/people/types";

import { TDataContext } from "@/types";
import useI18N from "@/hooks/useI18N";
import useTheme from "@/hooks/useTheme";

import pkgFile from "../../package.json";

import ErrorBoundaryWrapper from "./ErrorBoundary";
import { usePathname, useSearchParams } from "next/navigation";

export const Providers = ({
  children,
  value,
  redirectURL,
  user,
}: {
  children: React.ReactNode;
  value: TDataContext;
  redirectURL: string;
  user?: TUser;
}) => {
  const firebaseHelper = new FirebaseHelper(
    value.settings?.firebase ?? ({} as TFirebaseSettings),
  );
  const confirmType = useSearchParams().get("type");

  let shouldRedirect = true;
  if (redirectURL === "unavailable" && confirmType === "PortalContinue") {
    shouldRedirect = false;
  }

  const pathName = usePathname();
  const expectedPathName = `/${redirectURL}`;

  React.useEffect(() => {
    if (shouldRedirect && redirectURL && pathName !== expectedPathName)
      window.location.replace(expectedPathName);
  }, [redirectURL, pathName, expectedPathName, shouldRedirect]);

  const { i18n } = useI18N({
    settings: value.settings,
  });

  const { theme, currentColorTheme } = useTheme({
    user,
    colorTheme: value.colorTheme,
    systemTheme: value.systemTheme,
    i18n,
  });

  return (
    <ThemeProvider theme={theme} currentColorScheme={currentColorTheme}>
      <I18nextProvider i18n={i18n}>
        <ErrorBoundaryWrapper
          user={{} as TUser}
          version={pkgFile.version}
          firebaseHelper={firebaseHelper}
        >
          {shouldRedirect && redirectURL && expectedPathName !== pathName ? (
            <></>
          ) : (
            children
          )}
        </ErrorBoundaryWrapper>
      </I18nextProvider>
    </ThemeProvider>
  );
};
