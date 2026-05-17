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

import { Navigate } from "react-router";

import componentLoader from "@docspace/shared/utils/component-loader";
import { ViewComponent } from "SRC_DIR/pages/Home/View";
import PrivateRouteWrapper from "SRC_DIR/components/PrivateRouteWrapper";

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
        <ViewComponent />
      </PrivateRouteWrapper>
    ),
  },
  {
    path: "profile/notifications",
    element: (
      <PrivateRouteWrapper>
        <ViewComponent />
      </PrivateRouteWrapper>
    ),
  },
  {
    path: "profile/file-management",
    element: (
      <PrivateRouteWrapper>
        <ViewComponent />
      </PrivateRouteWrapper>
    ),
  },
  {
    path: "profile/interface-theme",
    element: (
      <PrivateRouteWrapper>
        <ViewComponent />
      </PrivateRouteWrapper>
    ),
  },
  {
    path: "profile/authorized-apps",
    element: (
      <PrivateRouteWrapper>
        <ViewComponent />
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
];

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
        lazy: () => componentLoader(() => import("SRC_DIR/pages/Profile")),
      },
      {
        path: "notifications",
        lazy: () => componentLoader(() => import("SRC_DIR/pages/Profile")),
      },
      {
        path: "file-management",
        lazy: () => componentLoader(() => import("SRC_DIR/pages/Profile")),
      },
      {
        path: "interface-theme",
        lazy: () => componentLoader(() => import("SRC_DIR/pages/Profile")),
      },
      {
        path: "authorized-apps",
        lazy: () => componentLoader(() => import("SRC_DIR/pages/Profile")),
      },
    ],
  },
];

export { generalRoutes };
