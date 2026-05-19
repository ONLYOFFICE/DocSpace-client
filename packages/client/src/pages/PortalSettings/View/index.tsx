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

import React, { useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";

import { LoaderWrapper } from "@docspace/ui-kit/components/loader-wrapper";
import { DeviceType } from "@docspace/shared/enums";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";

import { Component as Customization } from "../categories/common";
import { Component as Security } from "../categories/security";
import { Component as Backup } from "../categories/data-management";
import RestoreBackup from "../categories/data-management/backup/restore-backup";
import { Component as Integration } from "../categories/integration";
import { Component as DataImport } from "../categories/data-import";
import { Component as DeleteData } from "../categories/delete-data";
import { Component as StorageManagement } from "../categories/storage-management";
import { Component as Payments } from "../categories/payments";
import { Component as Bonus } from "../../Bonus";
import { Component as AISettings } from "../categories/ai-settings";

import useSecurity from "../categories/security/useSecurity";
import useBackup from "../categories/data-management/backup/useBackup";
import useIntegration from "../categories/integration/useIntegration";
import useDeleteData from "../categories/delete-data/useDeleteData";
import useCommon from "../categories/common/useCommon";
import useDataImport from "../categories/data-import/useDataImport";
import usePayments from "../categories/payments/usePayments";
import useAiSettings from "../categories/ai-settings/useAiSettings";
import { createDefaultHookSettingsProps } from "../utils/createDefaultHookSettingsProps";
import { isMainSectionChange } from "../utils/isMainSectionChange";
import { TView, ViewProps } from "./View.types";
import { Component as ServicesPage } from "../categories/payments/ServicesPage";

const getViewFromPathname = (pathname: string): TView => {
  if (pathname.includes("customization")) return "customization";
  if (pathname.includes("security")) return "security";
  if (pathname.includes("restore")) return "restore";
  if (pathname.includes("backup") && !pathname.includes("services"))
    return "backup";
  if (pathname.includes("integration")) return "integration";
  if (pathname.includes("data-import")) return "data-import";
  if (pathname.includes("management")) return "management";
  if (pathname.includes("delete-data")) return "delete-data";
  if (pathname.includes("backup")) return "backup-service";
  if (pathname.includes("disk-storage")) return "disk-storage";
  if (pathname.includes("ai-services")) return "ai-services";

  if (pathname.includes("payments")) return "payments";

  if (pathname.includes("bonus")) return "bonus";

  if (pathname.includes("ai-settings")) return "ai-settings";

  return "";
};

const View = ({
  setIsPortalSettingsLoading,
  loadBaseInfo,
  isMobileView,
  settingsStore,
  tfaStore,
  backupStore,
  ssoFormStore,
  init,
  standaloneInit,
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
  paymentStore,
  currentTariffStatusStore,
  defaultTemplatesStore,

  clearAbortControllerArr,

  fetchAIProviders,
  fetchMCPServers,
  fetchWebSearch,
  fetchKnowledge,
  initDefaultProvider,
}: ViewProps) => {
  const location = useLocation();
  const { t } = useTranslation();

  const [currentView, setCurrentView] = React.useState<TView>(() => {
    const pathView = getViewFromPathname(location.pathname);
    return pathView;
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const activeRequestIdRef = useRef(0);
  const prevPathRef = useRef<string>("");
  const clearAbortControllerArrRef = React.useRef(clearAbortControllerArr);
  const animationStartedRef = useRef(false);

  const defaultProps = createDefaultHookSettingsProps({
    loadBaseInfo,
    isMobileView,
    settingsStore,
    tfaStore,
    backupStore,
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
    paymentStore,
    currentTariffStatusStore,
    defaultTemplatesStore,
  });

  const { getCommonInitialValue } = useCommon(defaultProps.common);
  const { getSecurityInitialValue } = useSecurity(defaultProps.security);
  const { getBackupInitialValue } = useBackup(defaultProps.backup);
  const { getIntegrationInitialValue } = useIntegration({
    ...defaultProps.integration,
  });
  const { getDataImportInitialValue } = useDataImport(defaultProps.dataImport);
  const { getDeleteDataInitialValue } = useDeleteData(defaultProps.deleteData);
  const { getPaymentsInitialValue } = usePayments(defaultProps.payment);

  const { getAiSettingsInitialValue } = useAiSettings({
    fetchAIProviders,
    initDefaultProvider,
    fetchMCPServers,
    fetchWebSearch,
    fetchKnowledge,
    standalone: true,
  });

  useEffect(() => {
    clearAbortControllerArrRef.current = clearAbortControllerArr;
  }, [clearAbortControllerArr]);

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

  useEffect(() => {
    const getView = async () => {
      const requestId = ++activeRequestIdRef.current;
      try {
        const currentPath = location.pathname;
        const previousPath = prevPathRef.current;

        const isMainSectionChanged =
          !previousPath || isMainSectionChange(currentPath, previousPath);
        const isSameSectionClick =
          previousPath && !isMainSectionChanged && currentPath === previousPath;

        const view = getViewFromPathname(currentPath);

        // Handles sub-page navigation within "payments" (e.g. /payments/services → /payments/services/disk-storage).
        // TODO: consider making this generic — check `view !== currentView` for all sections.
        const isPaymentsSubPageChange =
          !isMainSectionChanged &&
          previousPath?.includes("payments") &&
          view !== currentView;

        prevPathRef.current = currentPath;

        // Only proceed with data loading if it's a main section change or a view change within payments sub-pages
        if (
          !isMainSectionChanged &&
          !isSameSectionClick &&
          !isPaymentsSubPageChange
        ) {
          if (requestId === activeRequestIdRef.current) {
            setIsLoading(false);
          }
          return;
        }

        clearAbortControllerArrRef.current();

        setIsLoading(true);

        switch (view) {
          case "customization":
            await getCommonInitialValue();
            break;
          case "security":
            await getSecurityInitialValue();
            break;
          case "restore":
            await getBackupInitialValue();
            break;
          case "backup":
            await getBackupInitialValue();
            break;
          case "integration":
            await getIntegrationInitialValue();
            break;
          case "data-import":
            await getDataImportInitialValue();
            break;
          case "management":
            await init();
            break;
          case "delete-data":
            await getDeleteDataInitialValue();
            break;
          case "payments":
            await getPaymentsInitialValue();
            break;
          case "bonus":
            await standaloneInit(t);
            break;

          case "ai-settings":
            await getAiSettingsInitialValue();
            break;
        }

        if (requestId === activeRequestIdRef.current) {
          setCurrentView(view);
          setIsPortalSettingsLoading(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
        if ((error as Error).message === "canceled") {
          return;
        }

        if (requestId === activeRequestIdRef.current) {
          setIsPortalSettingsLoading(false);
          setIsLoading(false);
        }
      }
    };

    getView();
  }, [location]);

  return (
    <LoaderWrapper isLoading={isLoading}>
      {currentView === "customization" ? <Customization /> : null}
      {currentView === "security" ? <Security /> : null}
      {currentView === "backup" ? <Backup /> : null}
      {currentView === "restore" ? <RestoreBackup /> : null}
      {currentView === "integration" ? <Integration /> : null}
      {currentView === "data-import" ? <DataImport /> : null}
      {currentView === "management" ? <StorageManagement /> : null}
      {currentView === "delete-data" ? <DeleteData /> : null}
      {currentView === "payments" ? <Payments /> : null}
      {currentView === "bonus" ? <Bonus /> : null}
      {currentView === "ai-settings" ? <AISettings /> : null}
      {currentView === "ai-services" ||
      currentView === "backup-service" ||
      currentView === "disk-storage" ? (
        <ServicesPage />
      ) : null}
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
    paymentStore,
    currentTariffStatusStore,
    aiSettingsStore,
    defaultTemplatesStore,
  }: TStore) => {
    const { initSettings: initSettingsCommon } = common;

    const { clearAbortControllerArr } = settingsStore;

    const { setIsPortalSettingsLoading } = clientLoadingStore;

    const isMobileView = settingsStore.deviceType === DeviceType.mobile;

    const loadBaseInfo = async (page: string) => {
      await initSettingsCommon(page);
    };

    const { init } = storageManagement;
    const { standaloneInit } = paymentStore;

    return {
      setIsPortalSettingsLoading,
      init,
      standaloneInit,

      // Stores for safeProps
      setup,
      settingsStore,
      tfaStore,
      backupStore: backup,
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
      paymentStore,
      currentTariffStatusStore,
      ssoFormStore: ssoStore,
      defaultTemplatesStore,

      // Direct values needed in safeProps
      isMobileView,
      loadBaseInfo,

      clearAbortControllerArr,

      fetchAIProviders: aiSettingsStore.fetchAIProviders,
      fetchMCPServers: aiSettingsStore.fetchMCPServers,
      fetchWebSearch: aiSettingsStore.fetchWebSearch,
      fetchKnowledge: aiSettingsStore.fetchKnowledge,
      initDefaultProvider: aiSettingsStore.initDefaultProvider,
    };
  },
)(observer(View));

