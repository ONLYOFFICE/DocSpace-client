import React from "react";

import { Base, Dark, TColorScheme, TTheme } from "@docspace/shared/themes";
import { getSystemTheme } from "@docspace/shared/utils";
import { ThemeKeys } from "@docspace/shared/enums";
import { getAppearanceTheme } from "@docspace/shared/api/settings";

import { UseThemeProps } from "@/types";

const SYSTEM_THEME = getSystemTheme();

const useTheme = ({ user }: UseThemeProps) => {
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
    const colorThemes = await getAppearanceTheme();

    const colorTheme = colorThemes.themes.find(
      (t) => t.id === colorThemes.selected,
    );

    isRequestRunning.current = false;
    if (colorTheme) setCurrentColorTheme(colorTheme);
  }, []);

  const getUserTheme = React.useCallback(() => {
    if (!currentColorTheme) return;
    let theme = user.theme;
    if (user.theme === ThemeKeys.SystemStr) theme = SYSTEM_THEME;

    if (theme === ThemeKeys.BaseStr)
      setTheme({
        ...Base,
        currentColorScheme: currentColorTheme,
        interfaceDirection: "ltr",
      });

    setTheme({
      ...Dark,
      currentColorScheme: currentColorTheme,
      interfaceDirection: "ltr",
    });
  }, [currentColorTheme, user.theme]);

  React.useEffect(() => {
    getCurrentColorTheme();
  }, [getCurrentColorTheme]);

  React.useEffect(() => {
    getUserTheme();
  }, [currentColorTheme, getUserTheme]);

  return { theme };
};

export default useTheme;
