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

import React from "react";
import { i18n as i18nType } from "i18next";
import { match, P } from "ts-pattern";

import {
	Base,
	Dark,
	type TColorScheme,
	type TTheme,
} from "@docspace/ui-kit/providers/theme/themes";
import { getSystemTheme } from "@docspace/ui-kit/utils/get-system-theme";
import { setCookie } from "@docspace/ui-kit/utils/cookie";
import { ThemeKeys } from "@docspace/ui-kit/enums";
import { getAppearanceTheme } from "@docspace/shared/api/settings";
import { getFontFamilyDependingOnLanguage } from "@docspace/ui-kit/providers/theme/rtl-utils";
import { SYSTEM_THEME_KEY } from "@docspace/ui-kit/providers/theme/themes/constants";

import type { TUser } from "@docspace/shared/api/people/types";
import type { TGetColorTheme } from "@docspace/shared/api/settings/types";

type MatchType = [ThemeKeys | undefined, ThemeKeys | undefined];

export interface UseThemeProps {
  user?: TUser;
  i18n?: i18nType;
  systemTheme?: ThemeKeys;
  colorTheme?: TGetColorTheme;
  lang?: string;
}

const useTheme = ({
  user,
  i18n,
  systemTheme,
  colorTheme,
  lang,
}: UseThemeProps) => {
  const [currentColorTheme, setCurrentColorTheme] =
    React.useState<TColorScheme>(() => {
      if (!colorTheme) return {} as TColorScheme;

      return (
        colorTheme.themes.find((theme) => theme.id === colorTheme.selected) ??
        ({} as TColorScheme)
      );
    });

  const [theme, setTheme] = React.useState<TTheme>(() => {
    const interfaceDirection = i18n?.dir ? i18n.dir(lang) : "ltr";

    const newTheme = match<MatchType>([user?.theme, systemTheme])
      .returnType<TTheme>()
      .with([ThemeKeys.DarkStr, P._], () => Dark)
      .with([ThemeKeys.BaseStr, P._], () => Base)
      .with([ThemeKeys.SystemStr, ThemeKeys.BaseStr], () => Base)
      .with([ThemeKeys.SystemStr, ThemeKeys.DarkStr], () => Dark)
      .with([undefined, ThemeKeys.DarkStr], () => Dark)
      .with([undefined, ThemeKeys.BaseStr], () => Base)
      .otherwise(() => Base);

    return {
      ...newTheme,
      currentColorScheme: currentColorTheme,
      interfaceDirection,
      fontFamily: getFontFamilyDependingOnLanguage(i18n?.language ?? "en"),
    };
  });

  const isRequestRunning = React.useRef(false);

  const getCurrentColorTheme = React.useCallback(async () => {
    if (isRequestRunning.current) return;
    isRequestRunning.current = true;
    const colorThemes = await getAppearanceTheme();

    const newColorTheme = colorThemes.themes.find(
      (t) => t.id === colorThemes.selected,
    );

    isRequestRunning.current = false;
    if (newColorTheme) setCurrentColorTheme(newColorTheme);
  }, []);

  const getUserTheme = React.useCallback(() => {
    const SYSTEM_THEME = getSystemTheme();

    let newTheme = user?.theme ?? SYSTEM_THEME;
    const interfaceDirection = i18n?.dir ? i18n.dir(lang) : "ltr";

    if (user?.theme === ThemeKeys.SystemStr) newTheme = SYSTEM_THEME;

    const fontFamily = getFontFamilyDependingOnLanguage(i18n?.language ?? "en");

    const isBaseTheme = newTheme === ThemeKeys.BaseStr;
    const themeCookie = isBaseTheme ? ThemeKeys.BaseStr : ThemeKeys.DarkStr;

    setTheme({
      ...(isBaseTheme ? Base : Dark),
      currentColorScheme: currentColorTheme,
      interfaceDirection,
      fontFamily,
    });

    setCookie(SYSTEM_THEME_KEY, themeCookie);
  }, [user?.theme, i18n, currentColorTheme, lang]);

  React.useEffect(() => {
    getCurrentColorTheme();
  }, [getCurrentColorTheme]);

  React.useEffect(() => {
    getUserTheme();
  }, [currentColorTheme, getUserTheme]);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQuery.addEventListener("change", getUserTheme);

    return () => {
      mediaQuery.removeEventListener("change", getUserTheme);
    };
  }, [getUserTheme]);

  return { theme, currentColorTheme };
};

export default useTheme;
