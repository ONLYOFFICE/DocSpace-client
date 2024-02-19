import React, { useEffect } from "react";
import Editor from "./components/Editor.js";
import { useSSR } from "react-i18next";
import useMfScripts from "./helpers/useMfScripts";
import { isRetina, frameCallCommand } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { getCookie, setCookie } from "@docspace/shared/utils/cookie";

import initDesktop from "./helpers/initDesktop";
import ErrorBoundary from "./components/ErrorBoundary";
import store from "client/store";
import i18n from "./i18n";
import { I18nextProvider } from "react-i18next";
import GlobalStyle from "./components/GlobalStyle.js";
import { inject, observer, Provider as MobxProvider } from "mobx-react";
import { ThemeProvider } from "@docspace/shared/components/theme-provider";

const isDesktopEditor = window["AscDesktopEditor"] !== undefined;

const App = ({
  initialLanguage,
  initialI18nStoreASC,
  setTheme,
  getAppearanceTheme,
  currentColorScheme,
  ...rest
}) => {
  const [isInitialized, isErrorLoading] = useMfScripts();
  useSSR(initialI18nStoreASC, initialLanguage);

  //console.log(rest);

  return (
    <ErrorBoundary onError={onError}>
      <GlobalStyle />
      <Editor
        mfReady={isInitialized}
        mfFailed={isErrorLoading}
        isDesktopEditor={isDesktopEditor}
        initDesktop={initDesktop}
        currentColorScheme={currentColorScheme}
        {...rest}
      />
    </ErrorBoundary>
  );
};

const AppWrapper = inject(({ settingsStore }) => {
  const { setTheme, getAppearanceTheme, currentColorScheme } = settingsStore;
  return {
    setTheme,
    getAppearanceTheme,
    currentColorScheme,
  };
})(observer(App));

const ThemeProviderWrapper = inject(({ settingsStore }) => {
  let currentColorScheme = false;
  currentColorScheme = settingsStore.currentColorScheme || false;

  return { theme: settingsStore.theme, currentColorScheme };
})(observer(ThemeProvider));

export default (props) => (
  <MobxProvider {...store}>
    <I18nextProvider i18n={i18n}>
      <ThemeProviderWrapper>
        <AppWrapper {...props} />
      </ThemeProviderWrapper>
    </I18nextProvider>
  </MobxProvider>
);
