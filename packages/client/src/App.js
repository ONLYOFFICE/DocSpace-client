// import "@docspace/shared/utils/wdyr";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { RouterProvider } from "react-router-dom";
import { Provider as MobxProvider } from "mobx-react";

import ThemeProvider from "./components/ThemeProviderWrapper";
import ErrorBoundary from "./components/ErrorBoundaryWrapper";

import store from "client/store";
import i18n from "./i18n";

import "@docspace/common/custom.scss";

import router from "./router";

const App = () => {
  return (
    <MobxProvider {...store}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </ThemeProvider>
      </I18nextProvider>
    </MobxProvider>
  );
};

export default App;
