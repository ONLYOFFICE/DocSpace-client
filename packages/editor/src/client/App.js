import React, { useEffect } from "react";
import Editor from "./components/Editor.js";
import { useSSR } from "react-i18next";
import useMfScripts from "./helpers/useMfScripts";
import { isRetina } from "@docspace/shared/utils/common";
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

import PresentationIcoUrl from "PUBLIC_DIR/images/presentation.ico";
import SpreadSheetIcoUrl from "PUBLIC_DIR/images/spreadsheet.ico";
import TextIcoUrl from "PUBLIC_DIR/images/text.ico";

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

  useEffect(() => {
    let icon = "";

    switch (rest?.config?.documentType) {
      case "word":
        icon = TextIcoUrl;
        break;
      case "slide":
        icon = PresentationIcoUrl;
        break;
      case "cell":
        icon = SpreadSheetIcoUrl;
        break;
      default:
        icon = TextIcoUrl;
        break;
    }

    if (icon) {
      const el = document.getElementById("favicon");

      el.href = icon;
    }
  }, [rest?.config?.documentType]);

  useEffect(() => {
    if (rest?.error?.errorStatus === 402) {
      const portalUrl = window.location.origin;

      history.pushState({}, null, portalUrl);
      document.location.reload();
    } else {
      const tempElm = document.getElementById("loader");
      const userTheme = rest.user?.theme;
      if (userTheme) setTheme(userTheme);

      const isLoadingDocumentError = rest.error !== null;
      const isLoadedDocument = !rest.error && rest?.config?.editorUrl;

      if (
        tempElm &&
        !rest.props?.needLoader &&
        (isLoadingDocumentError || isLoadedDocument)
      )
        tempElm.outerHTML = "";
    }

    if (isRetina() && getCookie("is_retina") == null) {
      setCookie("is_retina", true, { path: "/" });
    }

    getAppearanceTheme();
  }, []);

  const onError = () => {
    window.open(
      combineUrl(
        window.DocSpaceConfig?.proxy?.url,
        rest.personal ? "sign-in" : "/login"
      ),
      "_self"
    );
  };

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

const AppWrapper = inject(({ auth }) => {
  const { settingsStore } = auth;
  const { setTheme, getAppearanceTheme, currentColorScheme } = settingsStore;
  return {
    setTheme,
    getAppearanceTheme,
    currentColorScheme,
  };
})(observer(App));

const ThemeProviderWrapper = inject(({ auth }) => {
  const { settingsStore } = auth;
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
