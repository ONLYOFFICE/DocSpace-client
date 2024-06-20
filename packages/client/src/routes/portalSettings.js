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

import CustomizationSettings from "SRC_DIR/pages/PortalSettings/categories/common";
import LanguageAndTimeZoneSettings from "SRC_DIR/pages/PortalSettings/categories/common/Customization/language-and-time-zone";
import WelcomePageSettings from "SRC_DIR/pages/PortalSettings/categories/common/Customization/welcome-page-settings";
import DNSSettings from "SRC_DIR/pages/PortalSettings/categories/common/Customization/dns-settings";
import PortalRenaming from "SRC_DIR/pages/PortalSettings/categories/common/Customization/portal-renaming";
import WhiteLabel from "SRC_DIR/pages/PortalSettings/categories/common/Branding/whitelabel";
import CompanyInfoSettings from "SRC_DIR/pages/PortalSettings/categories/common/Branding/companyInfoSettings";
import AdditionalResources from "SRC_DIR/pages/PortalSettings/categories/common/Branding/additionalResources";

import SecuritySettings from "SRC_DIR/pages/PortalSettings/categories/security";
import TfaPage from "SRC_DIR/pages/PortalSettings/categories/security/access-portal/tfa";
import PasswordStrengthPage from "SRC_DIR/pages/PortalSettings/categories/security/access-portal/passwordStrength";
import TrustedMailPage from "SRC_DIR/pages/PortalSettings/categories/security/access-portal/trustedMail";
import IpSecurityPage from "SRC_DIR/pages/PortalSettings/categories/security/access-portal/ipSecurity";
import BruteForceProtectionPage from "SRC_DIR/pages/PortalSettings/categories/security/access-portal/bruteForceProtection";
import AdminMessagePage from "SRC_DIR/pages/PortalSettings/categories/security/access-portal/adminMessage";
import SessionLifetimePage from "SRC_DIR/pages/PortalSettings/categories/security/access-portal/sessionLifetime";

import Integration from "SRC_DIR/pages/PortalSettings/categories/integration";
import SPSettings from "SRC_DIR/pages/PortalSettings/categories/integration/SingleSignOn/SPSettings";
import SPMetadata from "SRC_DIR/pages/PortalSettings/categories/integration/SingleSignOn/ProviderMetadata";
import SettingsContainer from "SRC_DIR/pages/PortalSettings/categories/integration/LDAP/sub-components/SettingsContainer";
import SyncContainer from "SRC_DIR/pages/PortalSettings/categories/integration/LDAP/sub-components/SyncContainer";

import Statistics from "SRC_DIR/pages/PortalSettings/categories/storage-management";
import QuotaPerRoom from "SRC_DIR/pages/PortalSettings/categories/storage-management/sub-components/QuotaPerRoom";
import QuotaPerUser from "SRC_DIR/pages/PortalSettings/categories/storage-management/sub-components/QuotaPerUser";

import Payments from "SRC_DIR/pages/PortalSettings/categories/payments";

import DeveloperTools from "SRC_DIR/pages/PortalSettings/categories/developer-tools";
import WebhookHistory from "SRC_DIR/pages/PortalSettings/categories/developer-tools/Webhooks/WebhookHistory";
import WebhookDetails from "SRC_DIR/pages/PortalSettings/categories/developer-tools/Webhooks/WebhookEventDetails";
import DocSpace from "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/DocSpace";
import SimpleRoom from "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/SimpleRoom";
import Manager from "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Manager";
import RoomSelector from "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/RoomSelector";
import FileSelector from "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/FileSelector";
import Editor from "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Editor";
import Viewer from "SRC_DIR/pages/PortalSettings/categories/developer-tools/JavascriptSDK/presets/Viewer";

import Backup from "SRC_DIR/pages/PortalSettings/categories/data-management";
import RestoreBackup from "SRC_DIR/pages/PortalSettings/categories/data-management/backup/restore-backup";

import DeleteDataPage from "SRC_DIR/pages/PortalSettings/categories/delete-data";

import Bonus from "SRC_DIR/pages/Bonus";

import DataImport from "SRC_DIR/pages/PortalSettings/categories/data-import";
import GoogleDataImport from "SRC_DIR/pages/PortalSettings/categories/data-import/GoogleWorkspace";
import NextcloudDataImport from "SRC_DIR/pages/PortalSettings/categories/data-import/NextCloudWorkspace";
import OnlyofficeDataImport from "SRC_DIR/pages/PortalSettings/categories/data-import/OnlyofficeWorkspace";

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
      element: <CustomizationSettings />,
    },
    {
      path: "customization/branding",
      element: <CustomizationSettings />,
    },
    {
      path: "customization/branding/white-label",
      element: <WhiteLabel />,
    },
    {
      path: "customization/branding/company-info-settings",
      element: <CompanyInfoSettings />,
    },
    {
      path: "customization/branding/additional-resources",
      element: <AdditionalResources />,
    },
    {
      path: "customization/appearance",
      element: <CustomizationSettings />,
    },
    {
      path: "customization/general/language-and-time-zone",
      element: <LanguageAndTimeZoneSettings />,
    },
    {
      path: "customization/general/welcome-page-settings",
      element: <WelcomePageSettings />,
    },
    {
      path: "customization/general/dns-settings",
      element: <DNSSettings />,
    },
    {
      path: "customization/general/portal-renaming",
      element: <PortalRenaming />,
    },
    {
      path: "security",
      element: <Navigate to="security/access-portal" replace />,
    },
    {
      path: "security/access-portal",
      element: <SecuritySettings />,
    },
    {
      path: "security/login-history",
      element: <SecuritySettings />,
    },
    {
      path: "security/audit-trail",
      element: <SecuritySettings />,
    },
    {
      path: "security/access-portal/tfa",
      element: <TfaPage />,
    },
    {
      path: "security/access-portal/password",
      element: <PasswordStrengthPage />,
    },
    {
      path: "security/access-portal/trusted-mail",
      element: <TrustedMailPage />,
    },
    {
      path: "security/access-portal/ip",
      element: <IpSecurityPage />,
    },
    {
      path: "security/access-portal/brute-force-protection",
      element: <BruteForceProtectionPage />,
    },
    {
      path: "security/access-portal/admin-message",
      element: <AdminMessagePage />,
    },
    {
      path: "security/access-portal/lifetime",
      element: <SessionLifetimePage />,
    },
    {
      path: "integration",
      element: <Navigate to="integration/third-party-services" replace />,
    },
    {
      path: "integration/ldap",
      element: <Integration />,
    },
    {
      path: "integration/ldap/settings",
      element: <SettingsContainer />,
    },
    {
      path: "integration/ldap/sync-data",
      element: <SyncContainer />,
    },
    {
      path: "integration/third-party-services",
      element: <Integration />,
    },
    {
      path: "integration/sso",
      element: <Integration />,
    },
    {
      path: "integration/sso/settings",
      element: <SPSettings />,
    },
    {
      path: "integration/sso/metadata",
      element: <SPMetadata />,
    },
    {
      path: "integration/portal-integration",
      element: <Integration />,
    },
    {
      path: "integration/document-service",
      element: <Integration />,
    },
    {
      path: "integration/plugins",
      element: <Integration />,
    },
    {
      path: "integration/smtp-settings",
      element: <Integration />,
    },
    {
      path: "payments/portal-payments",
      element: <Payments />,
    },
    {
      path: "management/disk-space",
      element: <Statistics />,
    },
    {
      path: "management/disk-space/quota-per-room",
      element: <QuotaPerRoom />,
    },
    {
      path: "management/disk-space/quota-per-user",
      element: <QuotaPerUser />,
    },
    {
      path: "developer-tools",
      element: <Navigate to="javascript-sdk" replace />,
    },
    {
      path: "developer-tools/api",
      element: <DeveloperTools />,
    },
    {
      path: "developer-tools/javascript-sdk",
      element: <DeveloperTools />,
    },
    {
      path: "data-import/migration",
      element: <DataImport />,
    },
    {
      path: "data-import/migration/google",
      element: <GoogleDataImport />,
    },
    {
      path: "data-import/migration/nextcloud",
      element: <NextcloudDataImport />,
    },
    {
      path: "data-import/migration/onlyoffice",
      element: <OnlyofficeDataImport />,
    },
    {
      path: "developer-tools/javascript-sdk/docspace",
      element: <DocSpace />,
    },
    {
      path: "developer-tools/javascript-sdk/public-room",
      element: <SimpleRoom />,
    },
    {
      path: "developer-tools/javascript-sdk/custom",
      element: <Manager />,
    },
    {
      path: "developer-tools/javascript-sdk/room-selector",
      element: <RoomSelector />,
    },
    {
      path: "developer-tools/javascript-sdk/file-selector",
      element: <FileSelector />,
    },
    {
      path: "developer-tools/javascript-sdk/editor",
      element: <Editor />,
    },
    {
      path: "developer-tools/javascript-sdk/viewer",
      element: <Viewer />,
    },
    {
      path: "developer-tools/plugin-sdk",
      element: <DeveloperTools />,
    },
    {
      path: "developer-tools/webhooks",
      element: <DeveloperTools />,
    },
    {
      path: "developer-tools/webhooks/:id",
      element: <WebhookHistory />,
    },
    {
      path: "developer-tools/webhooks/:id/:eventId",
      element: <WebhookDetails />,
    },
    {
      path: "backup",
      element: <Navigate to="backup/data-backup" replace />,
    },
    {
      path: "backup/data-backup",
      element: <Backup />,
    },
    {
      path: "backup/auto-backup",
      element: <Backup />,
    },
    {
      path: "delete-data",
      element: <Navigate to="delete-data/deletion" replace />,
    },
    {
      path: "delete-data/deletion",
      element: <DeleteDataPage />,
    },
    {
      path: "delete-data/deactivation",
      element: <DeleteDataPage />,
    },
    {
      path: "restore",
      element: <Navigate to="restore/restore-backup" replace />,
    },
    {
      path: "restore/restore-backup",
      element: <RestoreBackup />,
    },
    {
      path: "bonus",
      element: <Bonus />,
    },
    ...generalRoutes,
  ],
};

export default PortalSettingsRoutes;
