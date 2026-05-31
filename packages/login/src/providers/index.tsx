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

"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { RootTooltip } from "@docspace/ui-kit/components/tooltip";
import { TFirebaseSettings } from "@docspace/shared/api/settings/types";
import FirebaseHelper from "@docspace/shared/utils/firebase";
import { TUser } from "@docspace/shared/api/people/types";
import { TranslationProvider } from "@docspace/ui-kit/providers/translation";
import type {
  TTranslations,
  TTranslationProvider,
} from "@docspace/ui-kit/providers/translation";
import { ThemeProvider } from "@docspace/ui-kit/providers/theme";
import type { TThemeProvider } from "@docspace/ui-kit/providers/theme";

import { TDataContext } from "@/types";

import pkgFile from "../../package.json";

import ErrorBoundaryWrapper from "./ErrorBoundary";

export const Providers = ({
  children,
  value,
  redirectURL,
  user,
  locale,
  translations,
}: {
  children: React.ReactNode;
  value: TDataContext;
  redirectURL: string;
  user?: TUser;
  locale?: string;
  translations: TTranslations;
}) => {
  const firebaseHelper = new FirebaseHelper(
    value.settings?.firebase ?? ({} as TFirebaseSettings),
  );
  const searchParams = useSearchParams();
  const confirmType = searchParams?.get("type");

  let shouldRedirect = true;
  if (redirectURL === "/unavailable" && confirmType === "PortalContinue") {
    shouldRedirect = false;
  }

  const pathName = usePathname();

  React.useEffect(() => {
    if (
      redirectURL &&
      (confirmType === "GuestShareLink" || confirmType === "EmailChange")
    ) {
      sessionStorage.setItem(
        "referenceUrl",
        `/confirm/${confirmType}?${searchParams?.toString()}`,
      );
    }
  }, [redirectURL, searchParams, confirmType]);

  React.useEffect(() => {
    // On the first navigation from an email link, the auth cookie is not sent
    // because it has SameSite=Strict. To access the cookie,
    // we perform a client-side redirect and set a special flag.
    if (confirmType === "EmailChange" && !searchParams.get("redirected")) {
      window.location.replace(
        `/confirm/${confirmType}?${searchParams?.toString()}&redirected=true`,
      );
    }
  }, [searchParams, confirmType]);

  React.useEffect(() => {
    if (shouldRedirect && redirectURL && pathName !== redirectURL)
      window.location.replace(redirectURL);
  }, [redirectURL, pathName, shouldRedirect]);

  return (
    <TranslationProvider
      settings={value.settings as TTranslationProvider["settings"]}
      locale={locale}
      translations={translations}
    >
      <ThemeProvider
        initialTheme={user?.theme as TThemeProvider["initialTheme"]}
        systemTheme={value.systemTheme as TThemeProvider["systemTheme"]}
        colorTheme={value.colorTheme as TThemeProvider["colorTheme"]}
        locale={locale}
      >
        <ErrorBoundaryWrapper
          user={{} as TUser}
          version={pkgFile.version}
          firebaseHelper={firebaseHelper}
        >
          <RootTooltip />
          {shouldRedirect && redirectURL && pathName !== redirectURL
            ? null
            : children}
        </ErrorBoundaryWrapper>
      </ThemeProvider>
    </TranslationProvider>
  );
};
