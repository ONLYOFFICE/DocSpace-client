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

import React from "react";
import { i18n } from "i18next";

import { Base, Dark, TColorScheme, TTheme } from "@docspace/shared/themes";
import { getSystemTheme } from "@docspace/shared/utils";
import { ThemeKeys } from "@docspace/shared/enums";
import { getAppearanceTheme } from "@docspace/shared/api/settings";
import { TUser } from "@docspace/shared/api/people/types";
import { getFontFamilyDependingOnLanguage } from "@docspace/shared/utils/rtlUtils";

const SYSTEM_THEME = getSystemTheme();

export interface UseThemeProps {
  user?: TUser;
  i18n?: i18n;
}

const useTheme = ({ user, i18n }: UseThemeProps) => {
  const [currentColorTheme, setCurrentColorTheme] =
    React.useState<TColorScheme>({} as TColorScheme);

  const [theme, setTheme] = React.useState<TTheme>(() => {
    if (user?.theme === ThemeKeys.DarkStr)
      return {
        ...Dark,
        currentColorScheme: currentColorTheme,
      };
    return {
      ...Base,
      currentColorScheme: currentColorTheme,
    };
  });

  const isRequestRunning = React.useRef(false);

  const getCurrentColorTheme = React.useCallback(async () => {
    if (isRequestRunning.current) return;
    isRequestRunning.current = true;
    const colorThemes = await getAppearanceTheme();

    const colorTheme = colorThemes.themes.find(
      (t) => t.id === colorThemes.selected,
    );

    isRequestRunning.current = false;
    if (colorTheme) setCurrentColorTheme(colorTheme);
  }, []);

  const getUserTheme = React.useCallback(() => {
    if (!user?.theme) return;
    let theme = user.theme;
    const interfaceDirection = i18n?.dir ? i18n.dir() : "ltr";

    if (user.theme === ThemeKeys.SystemStr) theme = SYSTEM_THEME;

    if (theme === ThemeKeys.BaseStr) {
      setTheme({
        ...Base,
        currentColorScheme: currentColorTheme,
        interfaceDirection,
        fontFamily: getFontFamilyDependingOnLanguage(i18n?.language),
      });

      return;
    }

    setTheme({
      ...Dark,
      currentColorScheme: currentColorTheme,
      interfaceDirection,
    });
  }, [user?.theme, i18n, currentColorTheme]);

  React.useEffect(() => {
    getCurrentColorTheme();
  }, [getCurrentColorTheme]);

  React.useEffect(() => {
    getUserTheme();
  }, [currentColorTheme, getUserTheme]);

  return { theme, currentColorTheme };
};

export default useTheme;
