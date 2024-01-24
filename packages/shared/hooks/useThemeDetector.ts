import { useEffect, useState } from "react";
import { getSystemTheme } from "@docspace/shared/utils";
import { ThemeKeys } from "../enums";

export const useThemeDetector = () => {
  const isDesktopClient = window.AscDesktopEditor !== undefined;
  const [systemTheme, setSystemTheme] = useState(getSystemTheme());

  const systemThemeListener = (e: MediaQueryListEvent) => {
    setSystemTheme(e.matches ? ThemeKeys.DarkStr : ThemeKeys.BaseStr);
  };

  useEffect(() => {
    if (isDesktopClient) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", systemThemeListener);

    return () => {
      if (isDesktopClient) return;

      mediaQuery.removeEventListener("change", systemThemeListener);
    };
  }, [isDesktopClient]);

  return systemTheme;
};
