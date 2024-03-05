import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { isMobileOnly } from "react-device-detect";

import { ThemeKeys } from "@docspace/shared/enums";
import { Toast } from "@docspace/shared/components/toast";
import { Portal } from "@docspace/shared/components/portal";
import AppLoader from "@docspace/shared/components/app-loader";
import tryRedirectTo from "@docspace/shared/utils/tryRedirectTo";
import Error403 from "@docspace/shared/components/errors/Error403";

import "@docspace/shared/styles/custom.scss";

import { useStore } from "./store";
import SimpleHeader from "./SimpleHeader";

import Main from "client/Main";
import Layout from "client/Layout";
import NavMenu from "client/NavMenu";
import MainLayout from "SRC_DIR/Layout";

declare global {
  interface Window {
    timezone: string;
  }
}

const App = observer(() => {
  const { authStore, userStore, settingsStore } = useStore();

  const { init } = authStore;
  const { setTheme, limitedAccessSpace, timezone } = settingsStore;

  window.timezone = timezone;

  const userTheme = userStore?.user?.theme
    ? userStore?.user?.theme
    : ThemeKeys.BaseStr;

  useEffect(() => {
    const initData = async () => {
      await init();
    };

    initData();
  }, []);

  useEffect(() => {
    if (userTheme) setTheme(userTheme);
  }, [userTheme]);

  const rootElement = document.getElementById("root") as HTMLElement;

  const toast = isMobileOnly ? (
    <Portal element={<Toast />} appendTo={rootElement} visible={true} />
  ) : (
    <Toast />
  );

  if (!settingsStore?.isLoaded) return <AppLoader />;

  if ((userStore?.user && !userStore?.user?.isAdmin) || limitedAccessSpace)
    return <Error403 />;
  if (userStore?.isLoaded && !userStore?.user)
    return tryRedirectTo(window.location.origin);

  return (
    <Layout>
      {toast}
      <NavMenu hideProfileMenu customHeader={<SimpleHeader />} />
      <Main isDesktop={false}>
        <div className="main-container">
          <MainLayout>
            <Outlet />
          </MainLayout>
        </div>
      </Main>
    </Layout>
  );
});

export default App;
