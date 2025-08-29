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

import Error404 from "@docspace/shared/components/errors/Error404";
import componentLoader from "@docspace/shared/utils/component-loader";
import { generalRoutes } from "./general";

import { ViewComponent } from "../pages/PortalSettings/View";

const PortalSettingsRoutes = {
  path: "portal-settings/",
  lazy: () => componentLoader(() => import("SRC_DIR/pages/PortalSettings")),
  errorElement: <Error404 />,
  children: [
    {
      index: true,
      element: <Navigate to="customization/general" replace />,
    },
    {
      path: "customization",
      element: <Navigate to="customization/general" replace />,
    },
    {
      path: "customization/general",
      element: <ViewComponent />,
    },
    {
      path: "customization/branding",
      element: <ViewComponent />,
    },
    {
      path: "customization/appearance",
      element: <ViewComponent />,
    },
    {
      path: "customization/branding/brand-name",
      element: <ViewComponent />,
    },
    {
      path: "customization/branding/white-label",
      element: <ViewComponent />,
    },
    {
      path: "customization/branding/company-info",
      element: <ViewComponent />,
    },
    {
      path: "customization/branding/additional-resources",
      element: <ViewComponent />,
    },
    {
      path: "customization/general/language-and-time-zone",
      element: <ViewComponent />,
    },
    {
      path: "customization/general/welcome-page-settings",
      element: <ViewComponent />,
    },
    {
      path: "customization/general/dns-settings",
      element: <ViewComponent />,
    },
    {
      path: "customization/general/portal-renaming",
      element: <ViewComponent />,
    },
    {
      path: "customization/general/configure-deep-link",
      element: <ViewComponent />,
    },
    {
      path: "customization/general/ad-management",
      element: <ViewComponent />,
    },
    {
      path: "security",
      element: <Navigate to="security/access-portal" replace />,
    },
    {
      path: "security/access-portal",
      element: <ViewComponent />,
    },
    {
      path: "security/login-history",
      element: <ViewComponent />,
    },
    {
      path: "security/audit-trail",
      element: <ViewComponent />,
    },
    {
      path: "security/access-portal/tfa",
      element: <ViewComponent />,
    },
    {
      path: "security/access-portal/password",
      element: <ViewComponent />,
    },
    {
      path: "security/access-portal/trusted-mail",
      element: <ViewComponent />,
    },
    {
      path: "security/access-portal/access-dev-tools",
      element: <ViewComponent />,
    },
    {
      path: "security/access-portal/invitation-settings",
      element: <ViewComponent />,
    },
    {
      path: "security/access-portal/ip",
      element: <ViewComponent />,
    },
    {
      path: "security/access-portal/brute-force-protection",
      element: <ViewComponent />,
    },
    {
      path: "security/access-portal/admin-message",
      element: <ViewComponent />,
    },
    {
      path: "security/access-portal/lifetime",
      element: <ViewComponent />,
    },
    {
      path: "integration",
      element: <Navigate to="integration/third-party-services" replace />,
    },
    {
      path: "integration/ldap",
      element: <ViewComponent />,
    },
    {
      path: "integration/third-party-services",
      element: <ViewComponent />,
    },
    {
      path: "integration/sso",
      element: <ViewComponent />,
    },
    {
      path: "integration/portal-integration",
      element: <ViewComponent />,
    },
    {
      path: "integration/document-service",
      element: <ViewComponent />,
    },
    {
      path: "integration/plugins",
      element: <ViewComponent />,
    },
    {
      path: "integration/smtp-settings",
      element: <ViewComponent />,
    },
    {
      path: "integration/ldap/settings",
      element: <ViewComponent />,
    },
    {
      path: "integration/ldap/sync-data",
      element: <ViewComponent />,
    },
    {
      path: "integration/sso/settings",
      element: <ViewComponent />,
    },
    {
      path: "integration/sso/metadata",
      element: <ViewComponent />,
    },
    {
      path: "payments/portal-payments",
      element: <ViewComponent />,
    },
    {
      path: "payments/tariff",
      element: <ViewComponent />,
    },
    {
      path: "services",
      element: <ViewComponent />,
    },
    {
      path: "management/disk-space",
      element: <ViewComponent />,
    },
    {
      path: "management/disk-space/quota-per-room",
      element: <ViewComponent />,
    },
    {
      path: "management/disk-space/quota-per-user",
      element: <ViewComponent />,
    },
    {
      path: "data-import",
      element: <ViewComponent />,
    },
    {
      path: "backup",
      element: <Navigate to="backup/data-backup" replace />,
    },
    {
      path: "backup/data-backup",
      element: <ViewComponent />,
    },
    {
      path: "backup/auto-backup",
      element: <ViewComponent />,
    },
    {
      path: "delete-data",
      element: <Navigate to="delete-data/deletion" replace />,
    },
    {
      path: "delete-data/deletion",
      element: <ViewComponent />,
    },
    {
      path: "delete-data/deactivation",
      element: <ViewComponent />,
    },
    {
      path: "restore",
      element: <Navigate to="restore/restore-backup" replace />,
    },
    {
      path: "restore/restore-backup",
      element: <ViewComponent />,
    },
    {
      path: "bonus",
      element: <ViewComponent />,
    },
    {
      path: "developer-tools",
      element: <ViewComponent />,
    },
    {
      path: "developer-tools/api",
      element: <ViewComponent />,
    },
    {
      path: "developer-tools/api-keys",
      element: <ViewComponent />,
    },
    {
      path: "developer-tools/javascript-sdk",
      element: <ViewComponent />,
    },
    {
      path: "developer-tools/javascript-sdk/docspace",
      lazy: () =>
        componentLoader(
          () =>
            import(
              "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/DocSpace"
            ),
        ),
    },
    {
      path: "developer-tools/javascript-sdk/public-room",
      lazy: () =>
        componentLoader(
          () =>
            import(
              "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/SimpleRoom"
            ),
        ),
    },
    {
      path: "developer-tools/javascript-sdk/custom",
      lazy: () =>
        componentLoader(
          () =>
            import(
              "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Manager"
            ),
        ),
    },
    {
      path: "developer-tools/javascript-sdk/room-selector",
      lazy: () =>
        componentLoader(
          () =>
            import(
              "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/RoomSelector"
            ),
        ),
    },
    {
      path: "developer-tools/javascript-sdk/file-selector",
      lazy: () =>
        componentLoader(
          () =>
            import(
              "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/FileSelector"
            ),
        ),
    },
    {
      path: "developer-tools/javascript-sdk/editor",
      lazy: () =>
        componentLoader(
          () =>
            import(
              "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Editor"
            ),
        ),
    },
    {
      path: "developer-tools/javascript-sdk/viewer",
      lazy: () =>
        componentLoader(
          () =>
            import(
              "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Viewer"
            ),
        ),
    },
    {
      path: "developer-tools/plugin-sdk",
      element: <ViewComponent />,
    },
    {
      path: "developer-tools/webhooks",
      element: <ViewComponent />,
    },
    {
      path: "developer-tools/webhooks/:id",
      lazy: () =>
        componentLoader(
          () =>
            import(
              "SRC_DIR/pages/PortalSettings/categories/developer-tools/Webhooks/WebhookHistory"
            ),
        ),
    },
    {
      path: "developer-tools/webhooks/:id/:eventId",
      lazy: () =>
        componentLoader(
          () =>
            import(
              "SRC_DIR/pages/PortalSettings/categories/developer-tools/Webhooks/WebhookEventDetails"
            ),
        ),
    },
    {
      path: "developer-tools/oauth",
      element: <ViewComponent />,
    },
    {
      path: "developer-tools/oauth/create",
      lazy: () =>
        componentLoader(
          () =>
            import(
              "SRC_DIR/pages/PortalSettings/categories/developer-tools/OAuth/OAuthCreatePage"
            ),
        ),
    },
    {
      path: "developer-tools/oauth/:id",
      lazy: () =>
        componentLoader(
          () =>
            import(
              "SRC_DIR/pages/PortalSettings/categories/developer-tools/OAuth/OAuthEditPage"
            ),
        ),
    },
    ...generalRoutes,
  ],
};

export default PortalSettingsRoutes;
