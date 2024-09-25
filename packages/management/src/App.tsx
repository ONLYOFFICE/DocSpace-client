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

import { observer } from "mobx-react";
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { isMobileOnly } from "react-device-detect";

import { ThemeKeys } from "@docspace/shared/enums";
import { Toast } from "@docspace/shared/components/toast";
import { Portal } from "@docspace/shared/components/portal";
import AppLoader from "@docspace/shared/components/app-loader";

import tryRedirectTo from "@docspace/shared/utils/tryRedirectTo";

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

let isPaymentPageUnavailable = true;
let isBonusPageUnavailable = true;

const App = observer(() => {
  const { authStore, userStore, settingsStore, currentTariffStatusStore } =
    useStore();
  const location = useLocation();

  const { init, isLoaded } = authStore;
  const { isCommunity } = currentTariffStatusStore;
  const { setTheme, timezone } = settingsStore;

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

  isPaymentPageUnavailable = location.pathname === "/payments" && isCommunity;
  isBonusPageUnavailable = location.pathname === "/bonus" && !isCommunity;

  useEffect(() => {
    if (!isLoaded) return;

    if (isPaymentPageUnavailable) {
      window.location.replace("/management/bonus");
    }

    if (isBonusPageUnavailable) {
      window.location.replace("/management/payments");
    }
  }, [isLoaded]);

  const rootElement = document.getElementById("root") as HTMLElement;

  const toast = isMobileOnly ? (
    <Portal element={<Toast />} appendTo={rootElement} visible={true} />
  ) : (
    <Toast />
  );

  if (!isLoaded || isPaymentPageUnavailable || isBonusPageUnavailable)
    return <AppLoader />;

  if (userStore?.isLoaded && !userStore?.user)
    return tryRedirectTo(window.location.origin);

  return (
    <Layout>
      {toast}
      <NavMenu hideProfileMenu customHeader={<SimpleHeader />} />
      <Main isDesktop={false}>
        <div className="main-container">
          <MainLayout isPortalRestoring={settingsStore?.isPortalRestoring}>
            <Outlet />
          </MainLayout>
        </div>
      </Main>
    </Layout>
  );
});

export default App;
