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

import BackupStore from "SRC_DIR/store/BackupStore";
import TreeFoldersStore from "SRC_DIR/store/TreeFoldersStore";
import SetupStore from "SRC_DIR/store/SettingsSetupStore";
import SsoFormStore from "SRC_DIR/store/SsoFormStore";
import PluginStore from "SRC_DIR/store/PluginStore";
import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import WebhooksStore from "SRC_DIR/store/WebhooksStore";
import OAuthStore from "SRC_DIR/store/OAuthStore";
import BrandingStore from "SRC_DIR/store/portal-settings/BrandingStore";
import ImportAccountsStore from "SRC_DIR/store/ImportAccountsStore";
import LdapFormStore from "SRC_DIR/store/LdapFormStore";

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { TfaStore } from "@docspace/shared/store/TfaStore";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { AuthStore } from "@docspace/shared/store/AuthStore";

export interface DefaultHookSettingsPropsParams {
  loadBaseInfo: (page: string) => Promise<void>;
  isMobileView: boolean;
  getGreetingSettingsIsDefault: () => Promise<void>;
  setIsLoaded: (loaded: boolean) => void;
  isLoaded: boolean;
  settingsStore?: SettingsStore;
  tfaStore?: TfaStore;
  backupStore?: BackupStore;
  treeFoldersStore?: TreeFoldersStore;
  setup?: SetupStore;
  authStore?: AuthStore;
  currentQuotaStore?: CurrentQuotasStore;
  ssoFormStore?: SsoFormStore;
  pluginStore?: PluginStore;
  filesSettingsStore?: FilesSettingsStore;
  webhooksStore?: WebhooksStore;
  oauthStore?: OAuthStore;
  brandingStore?: BrandingStore;
  importAccountsStore?: ImportAccountsStore;
  ldapStore?: LdapFormStore;
}

export const createDefaultHookSettingsProps = ({
  loadBaseInfo,
  isMobileView,
  getGreetingSettingsIsDefault,
  setIsLoaded,
  isLoaded,
  settingsStore,
  tfaStore,
  backupStore,
  treeFoldersStore,
  setup,
  authStore,
  currentQuotaStore,
  ssoFormStore,
  pluginStore,
  filesSettingsStore,
  webhooksStore,
  oauthStore,
  brandingStore,
  importAccountsStore,
  ldapStore,
}: DefaultHookSettingsPropsParams) => ({
  common: {
    loadBaseInfo,
    isMobileView,
    getGreetingSettingsIsDefault,
    getBrandName: brandingStore?.getBrandName,
    initWhiteLabel: brandingStore?.initWhiteLabel,
    setIsLoaded,
    isLoaded,
    cultures: settingsStore?.cultures,
    getPortalCultures: settingsStore?.getPortalCultures,
  },
  security: {
    getPortalPasswordSettings: settingsStore?.getPortalPasswordSettings,
    getTfaType: tfaStore?.getTfaType,
    getInvitationSettings: settingsStore?.getInvitationSettings,
    getIpRestrictionsEnable: settingsStore?.getIpRestrictionsEnable,
    getIpRestrictions: settingsStore?.getIpRestrictions,
    getBruteForceProtection: settingsStore?.getBruteForceProtection,
    getSessionLifetime: settingsStore?.getSessionLifetime,
    getLoginHistory: setup?.getLoginHistory,
    getLifetimeAuditSettings: setup?.getLifetimeAuditSettings,
    getAuditTrail: setup?.getAuditTrail,
    initSettings: setup?.initSettings,
    isInit: setup?.isInit,
    currentDeviceType: settingsStore?.currentDeviceType,
  },
  backup: {
    getProgress: backupStore?.getProgress,
    rootFoldersTitles: treeFoldersStore?.rootFoldersTitles,
    fetchTreeFolders: treeFoldersStore?.fetchTreeFolders,
    setStorageRegions: backupStore?.setStorageRegions,
    setThirdPartyStorage: backupStore?.setThirdPartyStorage,
    setConnectedThirdPartyAccount: backupStore?.setConnectedThirdPartyAccount,
    setBackupSchedule: backupStore?.setBackupSchedule,
    setDefaultOptions: backupStore?.setDefaultOptions,
    language: authStore?.language,
  },
  integration: {
    isSSOAvailable: currentQuotaStore?.isSSOAvailable,
    init: ssoFormStore?.init,
    isInit: ssoFormStore?.isInit,
    updatePlugins: pluginStore?.updatePlugins,
    getConsumers: setup?.getConsumers,
    fetchAndSetConsumers: setup?.fetchAndSetConsumers,
    setInitSMTPSettings: setup?.setInitSMTPSettings,
    getDocumentServiceLocation: filesSettingsStore?.getDocumentServiceLocation,
    loadLDAP: ldapStore?.load,
    isLdapAvailable: currentQuotaStore?.isLdapAvailable,
  },
  dataImport: {
    isMigrationInit: importAccountsStore?.isMigrationInit,
    getMigrationStatus: importAccountsStore?.getMigrationStatus,
    setUsers: importAccountsStore?.setUsers,
    setWorkspace: importAccountsStore?.setWorkspace,
    setMigratingWorkspace: importAccountsStore?.setMigratingWorkspace,
    setFiles: importAccountsStore?.setFiles,
    setLoadingStatus: importAccountsStore?.setLoadingStatus,
    setMigrationPhase: importAccountsStore?.setMigrationPhase,
    setServices: importAccountsStore?.setServices,
    getMigrationList: importAccountsStore?.getMigrationList,
  },
  developerTools: {
    getCSPSettings: settingsStore?.getCSPSettings,
    loadWebhooks: webhooksStore?.loadWebhooks,
    fetchClients: oauthStore?.fetchClients,
    fetchScopes: oauthStore?.fetchScopes,
    isInit: oauthStore?.isInit,
    setIsInit: oauthStore?.setIsInit,
  },
  deleteData: {
    getPortalOwner: settingsStore?.getPortalOwner,
  },
});
