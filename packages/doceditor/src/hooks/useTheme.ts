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

import React from "react";
import { i18n as i18nType } from "i18next";
import { match, P } from "ts-pattern";

import { Base, Dark, TColorScheme, TTheme } from "@docspace/shared/themes";
import { getSystemTheme } from "@docspace/shared/utils";
import { setCookie } from "@docspace/shared/utils/cookie";
import { ThemeKeys } from "@docspace/shared/enums";
import { getAppearanceTheme } from "@docspace/shared/api/settings";
import { getFontFamilyDependingOnLanguage } from "@docspace/shared/utils/rtlUtils";
import { SYSTEM_THEME_KEY } from "@docspace/shared/constants";

import type { TGetColorTheme } from "@docspace/shared/api/settings/types";

type MatchType = [ThemeKeys | undefined, ThemeKeys | undefined];

export interface UseThemeProps {
  initialTheme?: ThemeKeys;
  i18n?: i18nType;
  systemTheme?: ThemeKeys;
  colorTheme?: TGetColorTheme;
  lang?: string;
}

const useTheme = ({
  initialTheme,
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

    const newTheme = match<MatchType>([initialTheme, systemTheme])
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
    if (isRequestRunning.current || colorTheme) return;
    isRequestRunning.current = true;
    const colorThemes = await getAppearanceTheme();

    const curColorTheme = colorThemes.themes.find(
      (t) => t.id === colorThemes.selected,
    );

    isRequestRunning.current = false;
    if (curColorTheme) setCurrentColorTheme(curColorTheme);
  }, [colorTheme]);

  const getUserTheme = React.useCallback(() => {
    const SYSTEM_THEME = getSystemTheme();

    let themeNew = initialTheme ?? SYSTEM_THEME;
    const interfaceDirection = i18n?.dir ? i18n.dir(lang) : "ltr";

    if (initialTheme === ThemeKeys.SystemStr) themeNew = SYSTEM_THEME;

    const fontFamily = getFontFamilyDependingOnLanguage(i18n?.language ?? "en");

    const isBaseTheme = themeNew === ThemeKeys.BaseStr;
    const themeCookie = isBaseTheme ? ThemeKeys.BaseStr : ThemeKeys.DarkStr;

    setTheme({
      ...(isBaseTheme ? Base : Dark),
      currentColorScheme: currentColorTheme,
      interfaceDirection,
      fontFamily,
    });

    setCookie(SYSTEM_THEME_KEY, themeCookie);
  }, [initialTheme, i18n, currentColorTheme, lang]);

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
