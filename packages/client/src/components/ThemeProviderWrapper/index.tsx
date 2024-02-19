import React, { PropsWithChildren } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "@docspace/shared/components/theme-provider";
import type { ThemeProviderProps } from "@docspace/shared/components/theme-provider/ThemeProvider.types";

const ThemeProviderWrapper = ({
  children,
  theme,
  currentColorScheme,
}: PropsWithChildren<Partial<Omit<ThemeProviderProps, "children">>>) => {
  const { i18n } = useTranslation();

  return (
    <ThemeProvider
      theme={{ ...theme!, interfaceDirection: i18n.dir() }}
      currentColorScheme={currentColorScheme}
    >
      {children}
    </ThemeProvider>
  );
};

const ThemeProviderInjectWrapper = inject<TStore>(({ settingsStore }) => {
  const { theme, timezone, currentColorScheme } = settingsStore;

  window.theme = theme;
  window.timezone = timezone;

  return {
    theme,
    currentColorScheme,
    timezone,
  };
})(observer(ThemeProviderWrapper));

export default ThemeProviderInjectWrapper;
