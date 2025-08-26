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

import React, { useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";

import { LoaderWrapper } from "@docspace/shared/components/loader-wrapper";
import { DeviceType } from "@docspace/shared/enums";
import { AnimationEvents } from "@docspace/shared/hooks/useAnimation";

import { Component as Customization } from "../categories/common";
import { Component as Security } from "../categories/security";
import { Component as Backup } from "../categories/data-management";
import RestoreBackup from "../categories/data-management/backup/restore-backup";
import { Component as Integration } from "../categories/integration";
import { Component as DataImport } from "../categories/data-import";
import { Component as DeveloperTools } from "../categories/developer-tools";
import { Component as DeleteData } from "../categories/delete-data";
import { Component as StorageManagement } from "../categories/storage-management";

import useSecurity from "../categories/security/useSecurity";
import useBackup from "../categories/data-management/backup/useBackup";
import useIntegration from "../categories/integration/useIntegration";
import useDeveloperTools from "../categories/developer-tools/useDeveloperTools";
import useDeleteData from "../categories/delete-data/useDeleteData";
import useCommon from "../categories/common/useCommon";
import useDataImport from "../categories/data-import/useDataImport";

const View = ({
  setIsChangePageRequestRunning,
  setCurrentClientView,

  showHeaderLoader,

  // Common hook props
  loadBaseInfo,
  isMobileView,
  getGreetingSettingsIsDefault,
  getBrandName,
  initWhiteLabel,

  // Security hook props
  settingsStore,
  tfaStore,
  getLoginHistory,
  getLifetimeAuditSettings,
  getAuditTrail,

  // Backup hook props
  backupStore,
  treeFoldersStore,
  language,

  // Integration hook props
  isSSOAvailable,
  ssoFormStore,
  updatePlugins,
  getConsumers,
  fetchAndSetConsumers,
  setInitSMTPSettings,
  getDocumentServiceLocation,

  // Developer tools hook props
  getCSPSettings,
  loadWebhooks,
  fetchClients,
  fetchScopes,
  isInit,
  setIsInit,

  // Delete data hook props
  getPortalOwner,

  // Data import hook props
  isMigrationInit,
  getMigrationStatus,
  setUsers,
  setWorkspace,
  setMigratingWorkspace,
  setFiles,
  setLoadingStatus,
  setMigrationPhase,
  setServices,
  getMigrationList,

  // Storage management props
  init,
}: any) => {
  const location = useLocation();

  const [currentView, setCurrentView] = React.useState<
    | "customization"
    | "security"
    | "backup"
    | "restore"
    | "integration"
    | "data-import"
    | "management"
    | "developer-tools"
    | "delete-data"
    | "payments"
    | ""
  >("");
  const [isLoading, setIsLoading] = React.useState(false);

  const [securityDataLoaded, setSecurityDataLoaded] = React.useState(false);

  const animationStartedRef = useRef(false);
  const prevCurrentViewRef = React.useRef(currentView);
  const prevPathRef = useRef<string | null>(null);

  const isCustomizationPage = location.pathname.includes("customization");
  const isSecurityPage = location.pathname.includes("security");
  const isBackupPage = location.pathname.includes("backup");
  const isRestorePage = location.pathname.includes("restore");
  const isIntegrationPage = location.pathname.includes("integration");
  const isDataImportPage = location.pathname.includes("data-import");
  const isStorageManagementPage = location.pathname.includes("management");
  const isDeveloperToolsPage = location.pathname.includes("developer-tools");
  const isDeletePage = location.pathname.includes("delete-data");

  // Initialize useCommon hook with null checks
  const { getCommonInitialValue } = useCommon({
    loadBaseInfo: loadBaseInfo || (() => Promise.resolve()),
    isMobileView: isMobileView || false,
    getGreetingSettingsIsDefault: getGreetingSettingsIsDefault || (() => {}),
    getBrandName: getBrandName || (() => {}),
    initWhiteLabel: initWhiteLabel || (() => {}),
  });

  // Initialize useSecurity hook with null checks
  const { getSecurityInitialValue } = useSecurity({
    getPortalPasswordSettings:
      settingsStore?.getPortalPasswordSettings || (() => {}),
    getTfaType: tfaStore?.getTfaType || (() => {}),
    getInvitationSettings: settingsStore?.getInvitationSettings || (() => {}),
    getIpRestrictionsEnable:
      settingsStore?.getIpRestrictionsEnable || (() => Promise.resolve()),
    getIpRestrictions:
      settingsStore?.getIpRestrictions || (() => Promise.resolve()),
    getBruteForceProtection:
      settingsStore?.getBruteForceProtection || (() => {}),
    getSessionLifetime: settingsStore?.getSessionLifetime || (() => {}),
    getLoginHistory: getLoginHistory || (() => {}),
    getLifetimeAuditSettings: getLifetimeAuditSettings || (() => {}),
    getAuditTrail: getAuditTrail || (() => {}),
  });

  // Initialize useBackup hook with null checks
  const { getBackupInitialValue } = useBackup({
    getProgress: backupStore?.getProgress || (() => {}),
    rootFoldersTitles: treeFoldersStore?.rootFoldersTitles || {},
    fetchTreeFolders:
      treeFoldersStore?.fetchTreeFolders || (() => Promise.resolve()),
    setStorageRegions: backupStore?.setStorageRegions || (() => {}),
    setThirdPartyStorage: backupStore?.setThirdPartyStorage || (() => {}),
    setConnectedThirdPartyAccount:
      backupStore?.setConnectedThirdPartyAccount || (() => {}),
    setBackupSchedule: backupStore?.setBackupSchedule || (() => {}),
    setDefaultOptions: backupStore?.setDefaultOptions || (() => {}),
    language: language || "",
  });

  // Initialize useIntegration hook with null checks
  const { getIntegrationInitialValue } = useIntegration({
    isSSOAvailable: isSSOAvailable || (() => false),
    init: ssoFormStore?.init || (() => Promise.resolve()),
    isInit: ssoFormStore?.isInit || false,
    updatePlugins: updatePlugins || (() => Promise.resolve()),
    getConsumers: getConsumers || (() => Promise.resolve()),
    fetchAndSetConsumers:
      fetchAndSetConsumers || (() => Promise.resolve(false)),
    setInitSMTPSettings: setInitSMTPSettings || (() => Promise.resolve()),
    getDocumentServiceLocation:
      getDocumentServiceLocation || (() => Promise.resolve()),
  });

  // Initialize useDataImport hook with null checks
  const { getDataImportInitialValue } = useDataImport({
    isMigrationInit: isMigrationInit || (() => false),
    getMigrationStatus: getMigrationStatus || (() => Promise.resolve()),
    setUsers: setUsers || (() => {}),
    setWorkspace: setWorkspace || (() => {}),
    setMigratingWorkspace: setMigratingWorkspace || (() => {}),
    setFiles: setFiles || (() => {}),
    setLoadingStatus: setLoadingStatus || (() => {}),
    setMigrationPhase: setMigrationPhase || (() => {}),
    setServices: setServices || (() => {}),
    getMigrationList: getMigrationList || (() => Promise.resolve()),
  });

  // Initialize useDeveloperTools hook with null checks
  const { getDeveloperToolsInitialValue } = useDeveloperTools({
    getCSPSettings: getCSPSettings || (() => {}),
    loadWebhooks: loadWebhooks || (() => Promise.resolve()),
    fetchClients: fetchClients || (() => Promise.resolve()),
    fetchScopes: fetchScopes || (() => Promise.resolve()),
    isInit: isInit || false,
    setIsInit: setIsInit || (() => {}),
  });

  // Initialize useDeleteData hook with null check
  const { getDeleteDataInitialValue } = useDeleteData({
    getPortalOwner: getPortalOwner || (() => {}),
  });

  // Animation event handlers setup
  useEffect(() => {
    animationStartedRef.current = false;

    const animationStartedAction = () => {
      animationStartedRef.current = true;
    };

    window.addEventListener(
      AnimationEvents.ANIMATION_STARTED,
      animationStartedAction,
    );

    return () => {
      window.removeEventListener(
        AnimationEvents.ANIMATION_STARTED,
        animationStartedAction,
      );
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
    }
  }, [isLoading]);

  useEffect(() => {
    animationStartedRef.current = false;

    const animationEndedAction = () => {
      animationStartedRef.current = false;
    };

    window.addEventListener(
      AnimationEvents.ANIMATION_ENDED,
      animationEndedAction,
    );

    return () => {
      window.removeEventListener(
        AnimationEvents.ANIMATION_ENDED,
        animationEndedAction,
      );
    };
  }, []);

  useEffect(() => {
    if (prevPathRef.current === location.pathname) {
      return;
    }

    prevPathRef.current = location.pathname;

    const getView = async () => {
      try {
        // abortControllers.current.usersAbortController?.abort();
        // abortControllers.current.groupsAbortController?.abort();
        // abortControllers.current.filesAbortController?.abort();
        // abortControllers.current.roomsAbortController?.abort();

        setIsLoading(true);
        setIsChangePageRequestRunning(true);
        let view:
          | "customization"
          | "security"
          | "backup"
          | "restore"
          | "integration"
          | "data-import"
          | "management"
          | "developer-tools"
          | "delete-data"
          | undefined;

        if (isCustomizationPage) {
          view = "customization";

          if (prevCurrentViewRef.current !== "customization") {
            await getCommonInitialValue();
          }
        } else if (isSecurityPage) {
          view = "security";

          if (!securityDataLoaded) {
            await getSecurityInitialValue();
            setSecurityDataLoaded(true);
          }
        } else if (isRestorePage) {
          view = "restore";

          if (prevCurrentViewRef.current !== "restore") {
            await getBackupInitialValue();
          }
        } else if (isBackupPage) {
          view = "backup";

          if (prevCurrentViewRef.current !== "backup") {
            await getBackupInitialValue();
          }
        } else if (isIntegrationPage) {
          view = "integration";

          if (prevCurrentViewRef.current !== "integration") {
            await getIntegrationInitialValue();
          }
        } else if (isDataImportPage) {
          view = "data-import";

          if (prevCurrentViewRef.current !== "data-import") {
            await getDataImportInitialValue();
          }
        } else if (isStorageManagementPage) {
          view = "management";

          if (prevCurrentViewRef.current !== "management") {
            await init();
          }
        } else if (isDeveloperToolsPage) {
          view = "developer-tools";

          if (prevCurrentViewRef.current !== "developer-tools") {
            await getDeveloperToolsInitialValue();
          }
        } else if (isDeletePage) {
          view = "delete-data";

          if (prevCurrentViewRef.current !== "delete-data") {
            await getDeleteDataInitialValue();
          }
        }

        if (view) {
          prevCurrentViewRef.current = view;

          setCurrentView(view);
          setCurrentClientView(view);
        }

        setIsChangePageRequestRunning(false);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        if ((error as Error).message === "canceled") {
          return;
        }

        setIsChangePageRequestRunning(false);
        setIsLoading(false);
      }
    };

    getView();
  }, [location.pathname]);

  return (
    <LoaderWrapper isLoading={isLoading ? !showHeaderLoader : false}>
      {currentView === "customization" ? <Customization /> : null}
      {currentView === "security" ? <Security /> : null}
      {currentView === "backup" ? <Backup /> : null}
      {currentView === "restore" ? <RestoreBackup /> : null}
      {currentView === "integration" ? <Integration /> : null}
      {currentView === "data-import" ? <DataImport /> : null}
      {currentView === "management" ? <StorageManagement /> : null}
      {currentView === "developer-tools" ? <DeveloperTools /> : null}
      {currentView === "delete-data" ? <DeleteData /> : null}
    </LoaderWrapper>
  );
};

export const ViewComponent = inject(
  ({
    clientLoadingStore,
    setup,
    settingsStore,
    tfaStore,
    backup,
    treeFoldersStore,
    authStore,
    currentQuotaStore,
    ssoStore,
    pluginStore,
    filesSettingsStore,
    webhooksStore,
    oauthStore,
    brandingStore,
    common,
    importAccountsStore,
    storageManagement,
  }: TStore) => {
    const { language } = authStore;

    const { initSettings, getGreetingSettingsIsDefault } = common;

    const {
      setIsChangePageRequestRunning,
      setCurrentClientView,

      showHeaderLoader,
    } = clientLoadingStore;

    const {
      getLoginHistory,
      getLifetimeAuditSettings,
      getAuditTrail,
      getConsumers,
      fetchAndSetConsumers,
      setInitSMTPSettings,
    } = setup;

    const { isSSOAvailable } = currentQuotaStore;

    const { updatePlugins } = pluginStore;

    const { getDocumentServiceLocation } = filesSettingsStore;

    const { getCSPSettings, getPortalOwner } = settingsStore;

    const { loadWebhooks } = webhooksStore;

    const { fetchClients, fetchScopes, isInit, setIsInit } = oauthStore;

    const { getBrandName, initWhiteLabel } = brandingStore;

    const {
      getMigrationList,
      getMigrationStatus,
      isMigrationInit,
      setUsers,
      setWorkspace,
      setMigratingWorkspace,
      setFiles,
      setLoadingStatus,
      setMigrationPhase,
      setServices,
    } = importAccountsStore;

    const { init } = storageManagement;

    const isMobileView = settingsStore.deviceType === DeviceType.mobile;

    return {
      setIsChangePageRequestRunning,
      setCurrentClientView,

      showHeaderLoader,

      // Common hook props
      isMobileView,
      getGreetingSettingsIsDefault,
      getBrandName,
      initWhiteLabel,
      loadBaseInfo: async (page: string) => {
        await initSettings(page);
      },

      // Security hook props
      settingsStore,
      tfaStore,
      getLoginHistory,
      getLifetimeAuditSettings,
      getAuditTrail,

      // Backup hook props
      backup,
      treeFoldersStore,
      language,

      // Integration hook props
      isSSOAvailable,
      ssoFormStore: ssoStore,
      updatePlugins,
      getConsumers,
      fetchAndSetConsumers,
      setInitSMTPSettings,
      getDocumentServiceLocation,

      // Developer tools hook props
      getCSPSettings,
      loadWebhooks,
      fetchClients,
      fetchScopes,
      isInit,
      setIsInit,

      // Delete data hook props
      getPortalOwner,

      // Data import hook props
      isMigrationInit,
      getMigrationStatus,
      setUsers,
      setWorkspace,
      setMigratingWorkspace,
      setFiles,
      setLoadingStatus,
      setMigrationPhase,
      setServices,
      getMigrationList,

      // Storage management props
      init,
    };
  },
)(observer(View));
