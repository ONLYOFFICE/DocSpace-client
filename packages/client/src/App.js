/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// import "@docspace/shared/utils/wdyr";
import React, { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { RouterProvider } from "react-router";
import { Provider as MobxProvider } from "mobx-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@docspace/ui-kit/components/theme-provider/ThemeProvider.scss";
import { ApiProvider } from "@docspace/ui-kit/providers/api";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import store from "SRC_DIR/store";

import "@docspace/shared/polyfills/broadcastchannel";

import "./custom.scss";

import ThemeProvider from "./components/ThemeProviderWrapper";
import ErrorBoundary from "./components/ErrorBoundaryWrapper";

import router from "./router";

import i18n from "./i18n";

const getApiUrl = () => {
  const origin = window.ClientConfig?.api?.origin || window.location.origin;
  const proxy = window.ClientConfig?.proxy?.url || "";

  return combineUrl(origin, proxy);
};

const App = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
          },
        },
      }),
  );

  React.useEffect(() => {
    const regex = /(\/){2,}/g;
    const replaceRegex = /(\/)+/g;
    const pathname = window.location.pathname;

    if (regex.test(pathname))
      window.location.replace(pathname.replace(replaceRegex, "$1"));
  }, []);

  const apiUrl = getApiUrl();
  const apiKey = getCookie("asc_auth_key") || "";

  return (
    <QueryClientProvider client={queryClient}>
      <MobxProvider {...store}>
        <ApiProvider url={apiUrl} apiKey={apiKey} initSocket={false}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider>
              <ErrorBoundary>
                <RouterProvider router={router} />
              </ErrorBoundary>
            </ThemeProvider>
          </I18nextProvider>
        </ApiProvider>
      </MobxProvider>
    </QueryClientProvider>
  );
};

export default App;
