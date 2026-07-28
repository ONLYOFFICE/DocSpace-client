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

import {
	Base,
	Dark,
	type TColorScheme,
	type TTheme,
} from "@docspace/ui-kit/providers/theme/themes";
import { getEditorTheme } from "@docspace/shared/utils/common";
import { getSystemTheme } from "@docspace/ui-kit/utils/get-system-theme";
import { ThemeKeys } from "@docspace/ui-kit/enums";
import { getAppearanceTheme } from "@docspace/shared/api/settings";
import type { TGetColorTheme } from "@docspace/shared/api/settings/types";
import { setCookie } from "@docspace/ui-kit/utils/cookie";
import { SYSTEM_THEME_KEY } from "@docspace/ui-kit/providers/theme/themes/constants";
import type { TUser } from "@docspace/shared/api/people/types";
import {
	getDirectionByLanguage,
	getFontFamilyDependingOnLanguage,
} from "@docspace/ui-kit/providers/theme/rtl-utils";

export interface UseThemeProps {
  user?: TUser;
  colorTheme?: TGetColorTheme;
  systemTheme?: ThemeKeys;
  lang?: string;
}

const useTheme = ({ user, colorTheme, systemTheme, lang }: UseThemeProps) => {
  const [currentColorTheme, setCurrentColorTheme] =
    React.useState<TColorScheme>(() => {
      if (!colorTheme) return {} as TColorScheme;

      return (
        colorTheme.themes.find((theme) => theme.id === colorTheme.selected) ??
        ({} as TColorScheme)
      );
    });

  const [theme, setTheme] = React.useState<TTheme>(() => {
    const interfaceDirection = getDirectionByLanguage(lang || "en");

    const currColorTheme = colorTheme
      ? (colorTheme.themes.find((t) => t.id === colorTheme.selected) ??
        ({} as TColorScheme))
      : ({} as TColorScheme);

    let newTheme;

    if (user?.theme === ThemeKeys.DarkStr) {
      newTheme = Dark;
    }
    if (user?.theme === ThemeKeys.BaseStr) {
      newTheme = Base;
    }
    if (
      user?.theme === ThemeKeys.SystemStr &&
      systemTheme === ThemeKeys.BaseStr
    ) {
      newTheme = Base;
    }
    if (
      user?.theme === ThemeKeys.SystemStr &&
      systemTheme === ThemeKeys.DarkStr
    ) {
      newTheme = Dark;
    }
    if (!user?.theme && systemTheme === ThemeKeys.DarkStr) {
      newTheme = Dark;
    }
    if (!user?.theme && systemTheme === ThemeKeys.BaseStr) {
      newTheme = Base;
    }

    return {
      ...(newTheme ?? Base),
      currentColorScheme: currColorTheme,
      interfaceDirection,
      fontFamily: getFontFamilyDependingOnLanguage(lang ?? "en"),
    };
  });

  const isRequestRunning = React.useRef(false);

  const getCurrentColorTheme = React.useCallback(async () => {
    if (isRequestRunning.current) return;
    isRequestRunning.current = true;
    const colorThemes = colorTheme || (await getAppearanceTheme());

    const currColorTheme = colorThemes.themes.find(
      (t) => t.id === colorThemes.selected,
    );

    isRequestRunning.current = false;
    if (currColorTheme) setCurrentColorTheme(currColorTheme);
  }, [colorTheme]);

  const getUserTheme = React.useCallback(() => {
    const SYSTEM_THEME = getSystemTheme();

    let curTheme = user?.theme ?? SYSTEM_THEME;
    const interfaceDirection = getDirectionByLanguage(lang || "en");

    if (user?.theme === ThemeKeys.SystemStr) curTheme = SYSTEM_THEME;

    const isBaseTheme = curTheme === ThemeKeys.BaseStr;

    setTheme({
      ...(isBaseTheme ? Base : Dark),
      currentColorScheme: currentColorTheme,
      interfaceDirection,
      fontFamily: getFontFamilyDependingOnLanguage(lang ?? "en"),
    });
    setCookie(SYSTEM_THEME_KEY, SYSTEM_THEME);

    if (window?.AscDesktopEditor !== undefined) {
      const editorTheme = getEditorTheme(
        isBaseTheme ? ThemeKeys.Base : ThemeKeys.Dark,
      );

      window.AscDesktopEditor.execCommand("portal:uitheme", editorTheme);
    }
  }, [user?.theme, currentColorTheme, lang]);

  React.useEffect(() => {
    getCurrentColorTheme();
  }, [getCurrentColorTheme]);

  React.useEffect(() => {
    getUserTheme();
  }, [getUserTheme]);

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
