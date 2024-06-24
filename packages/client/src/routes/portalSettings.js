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

import { Navigate } from "react-router-dom";

import Error404 from "@docspace/shared/components/errors/Error404";

import { generalRoutes } from "./general";

const PortalSettingsRoutes = {
  path: "portal-settings/",
  lazy: () => import("SRC_DIR/pages/PortalSettings"),
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
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/common"),
    },
    {
      path: "customization/branding",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/common"),
    },
    {
      path: "customization/appearance",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/common"),
    },
    {
      path: "customization/branding/white-label",
      async lazy() {
        const { WhiteLabel } = await import(
          "SRC_DIR/pages/PortalSettings/categories/common/Branding/whitelabel"
        );

        return { Component: WhiteLabel };
      },
    },
    {
      path: "customization/branding/company-info-settings",
      async lazy() {
        const { CompanyInfoSettings } = await import(
          "SRC_DIR/pages/PortalSettings/categories/common/Branding/companyInfoSettings"
        );

        return { Component: CompanyInfoSettings };
      },
    },
    {
      path: "customization/branding/additional-resources",
      async lazy() {
        const { AdditionalResources } = await import(
          "SRC_DIR/pages/PortalSettings/categories/common/Branding/additionalResources"
        );

        return { Component: AdditionalResources };
      },
    },
    {
      path: "customization/general/language-and-time-zone",
      async lazy() {
        const { LanguageAndTimeZoneSettings } = await import(
          "SRC_DIR/pages/PortalSettings/categories/common/Customization/language-and-time-zone"
        );

        return { Component: LanguageAndTimeZoneSettings };
      },
    },
    {
      path: "customization/general/welcome-page-settings",
      async lazy() {
        const { WelcomePageSettings } = await import(
          "SRC_DIR/pages/PortalSettings/categories/common/Customization/welcome-page-settings"
        );

        return { Component: WelcomePageSettings };
      },
    },
    {
      path: "customization/general/dns-settings",
      async lazy() {
        const { DNSSettings } = await import(
          "SRC_DIR/pages/PortalSettings/categories/common/Customization/dns-settings"
        );

        return { Component: DNSSettings };
      },
    },
    {
      path: "customization/general/portal-renaming",
      async lazy() {
        const { PortalRenaming } = await import(
          "SRC_DIR/pages/PortalSettings/categories/common/Customization/portal-renaming"
        );

        return { Component: PortalRenaming };
      },
    },
    {
      path: "security",
      element: <Navigate to="security/access-portal" replace />,
    },
    {
      path: "security/access-portal",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/security"),
    },
    {
      path: "security/login-history",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/security"),
    },
    {
      path: "security/audit-trail",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/security"),
    },
    {
      path: "security/access-portal/tfa",
      async lazy() {
        const { TfaSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/security/access-portal/tfa"
        );

        return { Component: TfaSection };
      },
    },
    {
      path: "security/access-portal/password",
      async lazy() {
        const { PasswordStrengthSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/security/access-portal/passwordStrength"
        );

        return { Component: PasswordStrengthSection };
      },
    },
    {
      path: "security/access-portal/trusted-mail",
      async lazy() {
        const { TrustedMailSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/security/access-portal/trustedMail"
        );

        return { Component: TrustedMailSection };
      },
    },
    {
      path: "security/access-portal/ip",
      async lazy() {
        const { IpSecuritySection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/security/access-portal/ipSecurity"
        );

        return { Component: IpSecuritySection };
      },
    },
    {
      path: "security/access-portal/brute-force-protection",
      async lazy() {
        const { BruteForceProtectionSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/security/access-portal/bruteForceProtection"
        );

        return { Component: BruteForceProtectionSection };
      },
    },
    {
      path: "security/access-portal/admin-message",
      async lazy() {
        const { AdminMessageSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/security/access-portal/adminMessage"
        );

        return { Component: AdminMessageSection };
      },
    },
    {
      path: "security/access-portal/lifetime",
      async lazy() {
        const { SessionLifetimeSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/security/access-portal/sessionLifetime"
        );

        return { Component: SessionLifetimeSection };
      },
    },
    {
      path: "integration",
      element: <Navigate to="integration/third-party-services" replace />,
    },
    {
      path: "integration/ldap",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/integration"),
    },
    {
      path: "integration/third-party-services",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/integration"),
    },
    {
      path: "integration/sso",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/integration"),
    },
    {
      path: "integration/portal-integration",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/integration"),
    },
    {
      path: "integration/document-service",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/integration"),
    },
    {
      path: "integration/plugins",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/integration"),
    },
    {
      path: "integration/smtp-settings",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/integration"),
    },
    {
      path: "integration/ldap/settings",
      async lazy() {
        const { SettingsContainerSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/integration/LDAP/sub-components/SettingsContainer"
        );

        return { Component: SettingsContainerSection };
      },
    },
    {
      path: "integration/ldap/sync-data",
      async lazy() {
        const { SyncContainerSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/integration/LDAP/sub-components/SyncContainer"
        );

        return { Component: SyncContainerSection };
      },
    },
    {
      path: "integration/sso/settings",
      async lazy() {
        const { SPSettingsSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/integration/SingleSignOn/SPSettings"
        );

        return { Component: SPSettingsSection };
      },
    },
    {
      path: "integration/sso/metadata",
      async lazy() {
        const { ProviderMetadataSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/integration/SingleSignOn/ProviderMetadata"
        );

        return { Component: ProviderMetadataSection };
      },
    },
    {
      path: "payments/portal-payments",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/payments"),
    },
    {
      path: "management/disk-space",
      lazy: () =>
        import("SRC_DIR/pages/PortalSettings/categories/storage-management"),
    },
    {
      path: "management/disk-space/quota-per-room",
      async lazy() {
        const { QuotaPerRoomComponentSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/storage-management/sub-components/QuotaPerRoom"
        );

        return { Component: QuotaPerRoomComponentSection };
      },
    },
    {
      path: "management/disk-space/quota-per-user",
      async lazy() {
        const { QuotaPerUserComponentSection } = await import(
          "SRC_DIR/pages/PortalSettings/categories/storage-management/sub-components/QuotaPerUser"
        );

        return { Component: QuotaPerUserComponentSection };
      },
    },
    {
      path: "developer-tools",
      element: <Navigate to="javascript-sdk" replace />,
    },
    {
      path: "developer-tools/api",
      lazy: () =>
        import("SRC_DIR/pages/PortalSettings/categories/developer-tools"),
    },
    {
      path: "developer-tools/javascript-sdk",
      lazy: () =>
        import("SRC_DIR/pages/PortalSettings/categories/developer-tools"),
    },
    {
      path: "data-import/migration",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/data-import"),
    },
    {
      path: "data-import/migration/google",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/data-import/GoogleWorkspace"
        ),
    },
    {
      path: "data-import/migration/nextcloud",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/data-import/NextCloudWorkspace"
        ),
    },
    {
      path: "data-import/migration/onlyoffice",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/data-import/OnlyofficeWorkspace"
        ),
    },
    {
      path: "developer-tools/javascript-sdk/docspace",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/DocSpace"
        ),
    },
    {
      path: "developer-tools/javascript-sdk/public-room",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/SimpleRoom"
        ),
    },
    {
      path: "developer-tools/javascript-sdk/custom",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Manager"
        ),
    },
    {
      path: "developer-tools/javascript-sdk/room-selector",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/RoomSelector"
        ),
    },
    {
      path: "developer-tools/javascript-sdk/file-selector",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/FileSelector"
        ),
    },
    {
      path: "developer-tools/javascript-sdk/editor",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Editor"
        ),
    },
    {
      path: "developer-tools/javascript-sdk/viewer",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Viewer"
        ),
    },
    {
      path: "developer-tools/plugin-sdk",
      lazy: () =>
        import("SRC_DIR/pages/PortalSettings/categories/developer-tools"),
    },
    {
      path: "developer-tools/webhooks",
      lazy: () =>
        import("SRC_DIR/pages/PortalSettings/categories/developer-tools"),
    },
    {
      path: "developer-tools/webhooks/:id",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/developer-tools/Webhooks/WebhookHistory"
        ),
    },
    {
      path: "developer-tools/webhooks/:id/:eventId",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/developer-tools/Webhooks/WebhookEventDetails"
        ),
    },
    {
      path: "backup",
      element: <Navigate to="backup/data-backup" replace />,
    },
    {
      path: "backup/data-backup",
      lazy: () =>
        import("SRC_DIR/pages/PortalSettings/categories/data-management"),
    },
    {
      path: "backup/auto-backup",
      lazy: () =>
        import("SRC_DIR/pages/PortalSettings/categories/data-management"),
    },
    {
      path: "delete-data",
      element: <Navigate to="delete-data/deletion" replace />,
    },
    {
      path: "delete-data/deletion",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/delete-data"),
    },
    {
      path: "delete-data/deactivation",
      lazy: () => import("SRC_DIR/pages/PortalSettings/categories/delete-data"),
    },
    {
      path: "restore",
      element: <Navigate to="restore/restore-backup" replace />,
    },
    {
      path: "restore/restore-backup",
      lazy: () =>
        import(
          "SRC_DIR/pages/PortalSettings/categories/data-management/backup/restore-backup"
        ),
    },
    {
      path: "bonus",
      lazy: () => import("SRC_DIR/pages/Bonus"),
    },
    ...generalRoutes,
  ],
};

export default PortalSettingsRoutes;
