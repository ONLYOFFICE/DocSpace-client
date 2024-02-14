import React, { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { ThemeProvider } from "@docspace/shared/components/theme-provider";

import { useStore } from "../../store";

const ThemeProviderWrapper = ({ children }: PropsWithChildren) => {
  const { settingsStore } = useStore();
  const { i18n } = useTranslation();

  const { theme, currentColorScheme } = settingsStore;

  return (
    <ThemeProvider
      theme={{ ...theme, interfaceDirection: i18n.dir() }}
      currentColorScheme={currentColorScheme ?? undefined}
    >
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderWrapper;
