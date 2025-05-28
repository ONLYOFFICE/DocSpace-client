// (c) Copyright Ascensio System SIA 2009-2025
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

import { Navigate } from "react-router";

import componentLoader from "@docspace/shared/utils/component-loader";

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
            to="javascript-sdk"
            state={window.DocSpace?.location?.state}
            replace
          />
        ),
      },
      {
        path: "api",
        lazy: () =>
          componentLoader(
            () =>
              import("SRC_DIR/pages/PortalSettings/categories/developer-tools"),
          ),
      },
      {
        path: "api-keys",
        lazy: () =>
          componentLoader(
            () =>
              import("SRC_DIR/pages/PortalSettings/categories/developer-tools"),
          ),
      },
      {
        path: "javascript-sdk",
        lazy: () =>
          componentLoader(
            () =>
              import("SRC_DIR/pages/PortalSettings/categories/developer-tools"),
          ),
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
        path: "plugin-sdk",
        lazy: () =>
          componentLoader(
            () =>
              import("SRC_DIR/pages/PortalSettings/categories/developer-tools"),
          ),
      },
      {
        path: "webhooks",
        lazy: () =>
          componentLoader(
            () =>
              import("SRC_DIR/pages/PortalSettings/categories/developer-tools"),
          ),
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
          componentLoader(
            () =>
              import("SRC_DIR/pages/PortalSettings/categories/developer-tools"),
          ),
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

export { generalRoutes };
