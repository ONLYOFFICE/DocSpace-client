import React from "react";
import { I18nextProvider } from "react-i18next";
import { RouterProvider } from "react-router-dom";
import { Provider as MobxProvider } from "mobx-react";

import store from "client/store";

import i18n from "./i18n";
import router from "./router";

import { RootStoreContext, RootStore } from "./store";

import ErrorBoundary from "./components/ErrorBoundaryWrapper";
import ThemeProvider from "./components/ThemeProviderWrapper";

const Client = () => {
  return (
    <MobxProvider {...store}>
      <I18nextProvider i18n={i18n}>
        <RootStoreContext.Provider value={new RootStore()}>
          <ThemeProvider>
            <ErrorBoundary>
              <RouterProvider router={router} />
            </ErrorBoundary>
          </ThemeProvider>
        </RootStoreContext.Provider>
      </I18nextProvider>
    </MobxProvider>
  );
};

export default Client;
