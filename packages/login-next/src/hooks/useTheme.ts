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

import { Base, Dark, TColorScheme, TTheme } from "@docspace/shared/themes";
import { getEditorTheme, getSystemTheme } from "@docspace/shared/utils";
import { ThemeKeys } from "@docspace/shared/enums";
import { getAppearanceTheme } from "@docspace/shared/api/settings";
import { TGetColorTheme, TSettings } from "@docspace/shared/api/settings/types";

import useI18N from "./useI18N";

export interface UseThemeProps {
  colorTheme?: TGetColorTheme;
  settings?: TSettings;
}

const useTheme = ({ colorTheme, settings }: UseThemeProps) => {
  const { i18n } = useI18N({ settings });

  const [currentColorTheme, setCurrentColorTheme] =
    React.useState<TColorScheme>({} as TColorScheme);

  const [theme, setTheme] = React.useState<TTheme>({
    ...Base,
    currentColorScheme: currentColorTheme,
  });

  const isRequestRunning = React.useRef(false);

  const getCurrentColorTheme = React.useCallback(async () => {
    if (isRequestRunning.current) return;
    isRequestRunning.current = true;
    const colorThemes = colorTheme ? colorTheme : await getAppearanceTheme();

    const currColorTheme = colorThemes.themes.find(
      (t) => t.id === colorThemes.selected,
    );

    isRequestRunning.current = false;
    if (currColorTheme) setCurrentColorTheme(currColorTheme);
  }, [colorTheme]);

  const getUserTheme = React.useCallback(() => {
    const SYSTEM_THEME = getSystemTheme();
    const interfaceDirection = i18n?.dir ? i18n.dir() : "ltr";
    if (SYSTEM_THEME === ThemeKeys.BaseStr) {
      setTheme({
        ...Base,
        currentColorScheme: currentColorTheme,
        interfaceDirection,
      });

      if (window?.AscDesktopEditor !== undefined) {
        const editorTheme = getEditorTheme(ThemeKeys.Base);

        window.AscDesktopEditor.execCommand("portal:uitheme", editorTheme);
      }

      return;
    }

    setTheme({
      ...Dark,
      currentColorScheme: currentColorTheme,
      interfaceDirection,
    });

    if (window?.AscDesktopEditor !== undefined) {
      const editorTheme = getEditorTheme(ThemeKeys.Dark);

      window.AscDesktopEditor.execCommand("portal:uitheme", editorTheme);
    }
  }, [currentColorTheme, i18n]);

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
