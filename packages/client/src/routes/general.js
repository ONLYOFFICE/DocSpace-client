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

import { Navigate, useLocation } from "react-router";

import componentLoader from "@docspace/shared/utils/component-loader";
import { ViewComponent } from "SRC_DIR/pages/Home/View";
import PrivateRouteWrapper from "SRC_DIR/components/PrivateRouteWrapper";
import KeysManagementRoute from "SRC_DIR/components/KeysManagementRoute";

// Every profile tab renders the same element tree, the keys-management guard
// included (unguarded for the other tabs): with one tab wrapped differently,
// moving to it would mount the whole profile page again.
export const profileClientRoutes = [
  {
    path: "profile",
    element: (
      <PrivateRouteWrapper>
        <Navigate to="login" state={window.DocSpace?.location?.state} replace />
      </PrivateRouteWrapper>
    ),
  },
  {
    path: "profile/login",
    element: (
      <PrivateRouteWrapper>
        <KeysManagementRoute guarded={false}>
          <ViewComponent />
        </KeysManagementRoute>
      </PrivateRouteWrapper>
    ),
  },
  {
    path: "profile/notifications",
    element: (
      <PrivateRouteWrapper>
        <KeysManagementRoute guarded={false}>
          <ViewComponent />
        </KeysManagementRoute>
      </PrivateRouteWrapper>
    ),
  },
  {
    path: "profile/file-management",
    element: (
      <PrivateRouteWrapper>
        <KeysManagementRoute guarded={false}>
          <ViewComponent />
        </KeysManagementRoute>
      </PrivateRouteWrapper>
    ),
  },
  {
    path: "profile/keys-management",
    element: (
      <PrivateRouteWrapper>
        <KeysManagementRoute>
          <ViewComponent />
        </KeysManagementRoute>
      </PrivateRouteWrapper>
    ),
  },
  {
    path: "profile/interface-theme",
    element: (
      <PrivateRouteWrapper>
        <KeysManagementRoute guarded={false}>
          <ViewComponent />
        </KeysManagementRoute>
      </PrivateRouteWrapper>
    ),
  },
  {
    path: "profile/authorized-apps",
    element: (
      <PrivateRouteWrapper>
        <KeysManagementRoute guarded={false}>
          <ViewComponent />
        </KeysManagementRoute>
      </PrivateRouteWrapper>
    ),
  },
];

export const generalClientRoutes = [
  {
    path: "developer-tools/",
    lazy: () =>
      componentLoader(
        () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/developer-tools/Wrapper"
          ),
      ),
    children: [
      {
        index: true,
        Component: () => (
          <Navigate
            to="overview"
            state={window.DocSpace?.location?.state}
            replace
          />
        ),
      },
      {
        path: "overview",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/developer-tools/Main"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "docs-connect/:tab?",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/developer-tools/DocsConnect"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "api-keys",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/developer-tools/ApiKeys"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "javascript-sdk",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "javascript-sdk/docspace",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/DocSpace"
              ),
          ),
      },
      {
        path: "javascript-sdk/public-room",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/SimpleRoom"
              ),
          ),
      },
      {
        path: "javascript-sdk/custom",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Manager"
              ),
          ),
      },
      {
        path: "javascript-sdk/room-selector",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/RoomSelector"
              ),
          ),
      },
      {
        path: "javascript-sdk/file-selector",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/FileSelector"
              ),
          ),
      },
      {
        path: "javascript-sdk/editor",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Editor"
              ),
          ),
      },
      {
        path: "javascript-sdk/viewer",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Viewer"
              ),
          ),
      },
      {
        path: "javascript-sdk/uploader",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Uploader"
              ),
          ),
      },
      {
        path: "javascript-sdk/media-viewer",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/MediaViewer"
              ),
          ),
      },
      {
        path: "plugin-sdk",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/developer-tools/PluginSDK"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "webhooks",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/developer-tools/Webhooks"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "webhooks/:id",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/Webhooks/WebhookHistory"
              ),
          ),
      },
      {
        path: "webhooks/:id/:eventId",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/Webhooks/WebhookEventDetails"
              ),
          ),
      },
      {
        path: "oauth",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/developer-tools/OAuth"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "oauth/create",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/OAuth/OAuthCreatePage"
              ),
          ),
      },
      {
        path: "oauth/:id",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/developer-tools/OAuth/OAuthEditPage"
              ),
          ),
      },
    ],
  },
  {
    path: "billing/",
    lazy: () =>
      componentLoader(
        () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/payments/Billing/Wrapper"
          ),
      ),
    children: [
      {
        index: true,
        Component: () => (
          <Navigate
            to="overview"
            state={window.DocSpace?.location?.state}
            replace
          />
        ),
      },
      {
        path: "overview",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/OverviewPage"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "wallet",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/WalletPage"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "tariff-plan",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/MainTariffPage"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "addons",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/AddonsPage"
              ),
          ),
      },
      {
        path: "addons/ai-services",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/ServicePage"
              ),
          ),
      },
      {
        path: "addons/ai-search",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/ServicePage"
              ),
          ),
      },
      {
        path: "addons/backup",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/ServicePage"
              ),
          ),
      },
      {
        path: "addons/disk-storage",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/ServicePage"
              ),
          ),
      },
      {
        path: "addons/docs-connect",
        lazy: () =>
          componentLoader(
            () =>
              import(
                "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/ServicePage"
              ),
          ),
      },
      {
        path: "payment-method",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/PaymentMethodPage"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "invoice-history",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/InvoiceHistoryPage"
          ).then((m) => ({ Component: m.default })),
      },
      {
        path: "usage",
        lazy: () =>
          import(
            "SRC_DIR/pages/PortalSettings/categories/payments/Billing/pages/UsagePage"
          ).then((m) => ({ Component: m.default })),
      },
    ],
  },
];

// The profile page as one route component for every tab: the same type on
// each tab keeps the page mounted while the user moves between them.
let ProfilePage = null;

const ProfileTab = () => {
  const { pathname } = useLocation();
  const Page = ProfilePage;

  return (
    <KeysManagementRoute guarded={pathname.includes("/keys-management")}>
      <Page />
    </KeysManagementRoute>
  );
};

const loadProfileTab = async () => {
  const loaded = await componentLoader(() => import("SRC_DIR/pages/Profile"));
  ProfilePage = loaded.Component;

  return { ...loaded, Component: ProfileTab };
};

const generalRoutes = [
  {
    path: "profile/",
    children: [
      {
        index: true,
        Component: () => (
          <Navigate
            to="login"
            state={window.DocSpace?.location?.state}
            replace
          />
        ),
      },
      {
        path: "login",
        lazy: loadProfileTab,
      },
      {
        path: "notifications",
        lazy: loadProfileTab,
      },
      {
        path: "file-management",
        lazy: loadProfileTab,
      },
      {
        path: "keys-management",
        lazy: loadProfileTab,
      },
      {
        path: "interface-theme",
        lazy: loadProfileTab,
      },
      {
        path: "authorized-apps",
        lazy: loadProfileTab,
      },
    ],
  },
];

export { generalRoutes };
