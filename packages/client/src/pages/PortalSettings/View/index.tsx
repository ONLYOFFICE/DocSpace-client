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
import { createDefaultHookSettingsProps } from "../utils/createDefaultHookSettingsProps";

type TView =
  | "customization"
  | "security"
  | "backup"
  | "restore"
  | "integration"
  | "data-import"
  | "management"
  | "developer-tools"
  | "delete-data"
  | "";

const View = ({
  setIsChangePageRequestRunning,
  loadBaseInfo,
  isMobileView,
  settingsStore,
  tfaStore,
  backupStore,
  treeFoldersStore,
  ssoFormStore,
  init,
  setup,
  authStore,
  currentQuotaStore,
  pluginStore,
  filesSettingsStore,
  webhooksStore,
  oauthStore,
  brandingStore,
  importAccountsStore,
  ldapStore,
  common,
}: any) => {
  const location = useLocation();

  const [currentView, setCurrentView] = React.useState<TView>("");
  const [isLoading, setIsLoading] = React.useState(false);

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

  const defaultProps = createDefaultHookSettingsProps({
    loadBaseInfo,
    isMobileView,
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
    common,
  });

  const { getCommonInitialValue } = useCommon(defaultProps.common);
  const { getSecurityInitialValue } = useSecurity(defaultProps.security);
  const { getBackupInitialValue } = useBackup(defaultProps.backup);
  const { getIntegrationInitialValue } = useIntegration(
    defaultProps.integration,
  );
  const { getDataImportInitialValue } = useDataImport(defaultProps.dataImport);
  const { getDeveloperToolsInitialValue } = useDeveloperTools(
    defaultProps.developerTools,
  );
  const { getDeleteDataInitialValue } = useDeleteData(defaultProps.deleteData);

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
    if (!isLoading) {
      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
    }
  }, [isLoading]);

  const loadViewData = async (view: TView, prevView: TView): Promise<void> => {
    switch (view) {
      case "customization":
        if (prevView !== "customization") {
          await getCommonInitialValue();
        }
        break;
      case "security":
        if (prevView !== "security") {
          await getSecurityInitialValue();
        }
        break;
      case "restore":
      case "backup":
        if (prevView !== "restore" && prevView !== "backup") {
          await getBackupInitialValue();
        }
        break;
      case "integration":
        if (prevView !== "integration") {
          await getIntegrationInitialValue();
        }
        break;
      case "data-import":
        if (prevView !== "data-import") {
          await getDataImportInitialValue();
        }
        break;
      case "management":
        if (prevView !== "management") {
          await init();
        }
        break;
      case "developer-tools":
        if (prevView !== "developer-tools") {
          await getDeveloperToolsInitialValue();
        }
        break;
      case "delete-data":
        if (prevView !== "delete-data") {
          await getDeleteDataInitialValue();
        }
        break;
    }
  };

  const determineViewFromPath = (): TView => {
    if (isCustomizationPage) return "customization";
    if (isSecurityPage) return "security";
    if (isRestorePage) return "restore";
    if (isBackupPage) return "backup";
    if (isIntegrationPage) return "integration";
    if (isDataImportPage) return "data-import";
    if (isStorageManagementPage) return "management";
    if (isDeveloperToolsPage) return "developer-tools";
    if (isDeletePage) return "delete-data";
    return "";
  };

  useEffect(() => {
    if (prevPathRef.current === location.pathname) {
      return;
    }

    prevPathRef.current = location.pathname;

    const getView = async () => {
      try {
        setIsLoading(true);
        setIsChangePageRequestRunning(true);

        const view = determineViewFromPath();

        if (view) {
          await loadViewData(view, prevCurrentViewRef.current);
          prevCurrentViewRef.current = view;
          setCurrentView(view);
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
  }, [location.pathname, isDeveloperToolsPage]);

  return (
    <LoaderWrapper isLoading={isLoading}>
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
    ldapStore,
  }: TStore) => {
    const { initSettings: initSettingsCommon } = common;

    const {
      setIsChangePageRequestRunning,
      setCurrentClientView,
      showHeaderLoader,
    } = clientLoadingStore;

    const isMobileView = settingsStore.deviceType === DeviceType.mobile;

    const loadBaseInfo = async (page: string) => {
      await initSettingsCommon(page);
    };

    return {
      setIsChangePageRequestRunning,
      setCurrentClientView,
      showHeaderLoader,

      // Stores for safeProps
      setup,
      settingsStore,
      tfaStore,
      backup: backup,
      treeFoldersStore,
      authStore,
      currentQuotaStore,
      ssoStore,
      pluginStore,
      filesSettingsStore,
      webhooksStore,
      oauthStore,
      brandingStore,
      importAccountsStore,
      storageManagement,
      ldapStore,
      common,

      // Direct values needed in safeProps
      isMobileView,
      loadBaseInfo,
    };
  },
)(observer(View));
