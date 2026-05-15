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

import { Toast } from "@docspace/ui-kit/components/toast";
import type { TUser } from "@docspace/shared/api/people/types";
import type {
  TGetColorTheme,
  TSettings,
} from "@docspace/shared/api/settings/types";
import type { ThemeKeys } from "@docspace/shared/enums";
import { ThemeKeys as ThemeKeysEnum } from "@docspace/shared/enums";
import { TranslationProvider } from "@docspace/ui-kit/providers/translation";
import type {
  TTranslations,
  TTranslationProvider,
} from "@docspace/ui-kit/providers/translation";
import { ThemeProvider } from "@docspace/ui-kit/providers/theme";
import type { TThemeProvider } from "@docspace/ui-kit/providers/theme";
import { ApiProvider } from "@docspace/ui-kit/providers/api";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { getSystemTheme } from "@docspace/ui-kit/utils/get-system-theme";

import {
  createInitialTranslations,
  loadLocale,
} from "@/utils/translationLoaders";

import ErrorProvider from "./ErrorProvider";
import { SDKConfigProvider } from "./SDKConfigProvider";

export const ThemeChangeContext = React.createContext<
  ((theme: ThemeKeys) => void) | null
>(null);

export type TContextData = {
  user: TUser | undefined;
  settings: TSettings | undefined;
  initialTheme: ThemeKeys | undefined;
  systemTheme: ThemeKeys | undefined;
  colorTheme: TGetColorTheme | undefined;
  locale?: string;
  portalCultures: string[];
  authToken?: string;
  initialLocaleResources?: Record<string, string>;
};

export type TProviders = {
  children: React.ReactNode;
  contextData: TContextData;
};

const getApiUrl = () => {
  if (typeof window === "undefined") {
    return "";
  }
  const origin = window.ClientConfig?.api?.origin || window.location.origin;
  const proxy = window.ClientConfig?.proxy?.url || "";

  return combineUrl(origin, proxy);
};

const Providers = ({ children, contextData }: TProviders) => {
  const { user, settings, systemTheme, colorTheme, locale } = contextData;

  const requestedLng =
    locale || user?.cultureName || settings?.culture || "en";

  const [translations, setTranslations] = React.useState(() => {
    const base = createInitialTranslations();
    const preloaded = contextData.initialLocaleResources;
    if (preloaded && requestedLng !== "en") {
      const next = new Map(base);
      next.set(requestedLng, new Map([["Common", preloaded]]));
      return next;
    }
    return base;
  });

  React.useEffect(() => {
    if (requestedLng === "en" || translations.has(requestedLng)) return;
    let cancelled = false;
    loadLocale(requestedLng).then((nsMap) => {
      if (cancelled || !nsMap) return;
      setTranslations((prev) => {
        const next = new Map(prev);
        next.set(requestedLng, nsMap);
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [requestedLng, translations]);

  const effectiveLocale = translations.has(requestedLng) ? requestedLng : "en";

  const [currentTheme, setCurrentTheme] = React.useState<
    ThemeKeys | undefined
  >(contextData.initialTheme);

  const changeTheme = React.useCallback((theme: ThemeKeys) => {
    setCurrentTheme(theme);

    const effectiveTheme =
      theme === ThemeKeysEnum.SystemStr ? getSystemTheme() : theme;
    const themeClass =
      effectiveTheme === ThemeKeysEnum.DarkStr ? "dark" : "light";

    document.body.classList.remove("dark", "light");
    document.body.classList.add(themeClass);
  }, []);

  const apiUrl = getApiUrl();
  const apiKey = getCookie("asc_auth_key") || contextData.authToken || "";

  return (
    <ApiProvider url={apiUrl} apiKey={apiKey} initSocket={false}>
      <TranslationProvider
        settings={settings as TTranslationProvider["settings"]}
        user={user as TTranslationProvider["user"]}
        locale={effectiveLocale}
        translations={translations as TTranslations}
      >
        <ThemeChangeContext.Provider value={changeTheme}>
          <ThemeProvider
            initialTheme={currentTheme}
            systemTheme={systemTheme}
            colorTheme={colorTheme as TThemeProvider["colorTheme"]}
            locale={locale}
          >
            <ErrorProvider {...contextData}>
              <SDKConfigProvider>
                {children}
                <Toast isSSR />
              </SDKConfigProvider>
            </ErrorProvider>
          </ThemeProvider>
        </ThemeChangeContext.Provider>
      </TranslationProvider>
    </ApiProvider>
  );
};

export default Providers;
