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

import React, { useState, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { toastr } from "@docspace/shared/components/toast";
import {
  AI_TOOLS,
  BACKUP_SERVICE,
  TOTAL_SIZE,
  WEB_SEARCH,
} from "@docspace/shared/constants";
import { setServiceState } from "@docspace/shared/api/portal";

import { StorageTariffDeactiveted } from "SRC_DIR/components/dialogs";
import TopUpModal from "SRC_DIR/components/panels/TopUpBalance/TopUpModal";

import ServicesItems from "./ServicesItems";
import ServicesLoader from "./ServicesLoader";
import StoragePlanUpgrade from "./sub-components/AdditionalStorage/StoragePlanUpgrade";
import StoragePlanCancel from "./sub-components/AdditionalStorage/StoragePlanCancel";
import GracePeriodModal from "./sub-components/AdditionalStorage/GracePeriodModal";
import BackupServiceDialog from "./sub-components/Backup/BackupServiceDialog";
import ConfirmationDialog from "./sub-components/ConfirmationDialog";
import AIServiceDialog from "./sub-components/AITools/AIServiceDialog";
import WebSearchDialog from "./sub-components/WebSearch/WebSearchDialog";

const Services = (props: InjectedProps) => {
  const {
    isInitServicesPage,
    isVisibleWalletSettings,
    isGracePeriod,
    previousStoragePlanSize,
    isShowStorageTariffDeactivatedModal,
    changeServiceState,
    isCardLinkedToPortal,
    setConfirmActionType,
    confirmActionType,
    setIsInitServicesPage,
    setVisibleWalletSetting,
    showPortalSettingsLoader,
    isFreeTariff,
  } = props;
  const { t, ready } = useTranslation(["Payments", "Services", "Common"]);
  const [dialogVisibility, setDialogVisibility] = useState({
    [TOTAL_SIZE]: false,
    [BACKUP_SERVICE]: false,
    [AI_TOOLS]: false,
    [WEB_SEARCH]: false,
  });

  const updateDialogVisibility = (
    dialogType: keyof typeof dialogVisibility,
    isVisible: boolean,
  ) => {
    setDialogVisibility((prev) => ({
      ...prev,
      [dialogType]: isVisible,
    }));
  };

  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const [isCurrentConfirmState, setIsCurrentConfirmState] = useState(false);
  const [isStorageCancelattion, setIsStorageCancellation] = useState(false);
  const [isGracePeriodModalVisible, setIsGracePeriodModalVisible] =
    useState(false);
  const [previousValue, setPreviousValue] = useState(0);

  const [isTopUpBalanceVisible, setIsTopUpBalanceVisible] = useState(false);

  const shouldShowLoader = !isInitServicesPage || !ready;
  const location = useLocation();
  const navigate = useNavigate();
  const { openDialog } = location.state || {};

  const previousDialogRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isVisibleWalletSettings || !isInitServicesPage) return;

    if (confirmActionType === TOTAL_SIZE) {
      updateDialogVisibility(TOTAL_SIZE, isVisibleWalletSettings);
    } else {
      setIsTopUpBalanceVisible(true);
    }
  }, [
    isVisibleWalletSettings,
    confirmActionType,
    isInitServicesPage,
    updateDialogVisibility,
  ]);

  useEffect(() => {
    if (openDialog) {
      updateDialogVisibility(TOTAL_SIZE, openDialog);
      setPreviousValue(previousStoragePlanSize);
      navigate(location.pathname, { replace: true });
    }
  }, [openDialog, updateDialogVisibility]);

  useEffect(() => {
    return () => {
      setIsInitServicesPage(false);
    };
  }, []);

  const confirmationDialogContent = {
    [BACKUP_SERVICE]: {
      title: t("Common:Confirmation"),
      body: !isCurrentConfirmState
        ? t("Services:EnableBackupConfirm", {
            productName: t("Common:ProductName"),
          })
        : isFreeTariff
          ? t("Services:DisableBackupConfirmWithoutQuota", {
              productName: t("Common:ProductName"),
            })
          : t("Services:DisableBackupConfirm", {
              productName: t("Common:ProductName"),
            }),
    },
    [AI_TOOLS]: {
      title: t("Common:Confirmation"),
      body: t("Services:AItoolsConfirm", {
        productName: t("Common:ProductName"),
      }),
    },
    [WEB_SEARCH]: {
      title: t("Common:Confirmation"),
      body: "Temp Web Search Description Text",
    },
  };

  const getDialogContent = (actionType: string | null) => {
    if (!actionType || !(actionType in confirmationDialogContent)) {
      return { title: "", body: "" };
    }
    return confirmationDialogContent[
      actionType as keyof typeof confirmationDialogContent
    ];
  };

  const onClick = (id: string) => {
    setConfirmActionType(id);

    if (id === TOTAL_SIZE && isGracePeriod) {
      setIsGracePeriodModalVisible(true);
      return;
    }

    updateDialogVisibility(id as keyof typeof dialogVisibility, true);
  };

  const onClose = () => {
    updateDialogVisibility(TOTAL_SIZE, false);
  };

  const onCloseStorageCancell = () => {
    setIsStorageCancellation(false);
  };

  const onToggle = async (id: string, currentEnabled: boolean) => {
    setConfirmActionType(id);

    setIsCurrentConfirmState(currentEnabled);

    if (id === TOTAL_SIZE) {
      if (currentEnabled) {
        setIsStorageCancellation(true);
        return;
      }
      updateDialogVisibility(TOTAL_SIZE, true);

      return;
    }

    if (!currentEnabled && !isCardLinkedToPortal) {
      setIsTopUpBalanceVisible(true);
      return;
    }

    if (id !== TOTAL_SIZE) {
      if (dialogVisibility[id as keyof typeof dialogVisibility]) {
        previousDialogRef.current = true;
      }
    }

    if (!currentEnabled || id === BACKUP_SERVICE)
      setIsConfirmDialogVisible(true);
    else {
      const raw = {
        service: id,
        enabled: false,
      };

      changeServiceState(id);

      try {
        await setServiceState(raw);
      } catch (error) {
        console.error(error);
        toastr.error(t("Common:UnexpectedError"));
        changeServiceState(id);
      }
    }
  };

  const onCloseGracePeriodModal = () => {
    setIsGracePeriodModalVisible(false);
  };

  const onCloseBackup = () => {
    updateDialogVisibility(BACKUP_SERVICE, false);
  };

  const onCloseAiService = () => {
    updateDialogVisibility(AI_TOOLS, false);
  };

  const onCloseWebSearch = () => {
    updateDialogVisibility(WEB_SEARCH, false);
  };

  const onCloseConfirmDialog = () => {
    const isDialogVisible = previousDialogRef.current;

    previousDialogRef.current = false;

    if (isDialogVisible && confirmActionType) {
      updateDialogVisibility(
        confirmActionType as keyof typeof dialogVisibility,
        true,
      );
    }

    setIsConfirmDialogVisible(false);
  };

  const onConfirm = async () => {
    if (!confirmActionType) return;

    const raw = {
      service: confirmActionType,
      enabled: !isCurrentConfirmState,
    };

    setIsConfirmDialogVisible(false);
    changeServiceState(confirmActionType);

    const getSuccessMessage = () => {
      if (confirmActionType === BACKUP_SERVICE) {
        return t("Services:BackupServiceEnabled");
      }
      if (confirmActionType === AI_TOOLS) {
        return t("Services:AIToolsEnabled");
      }
      if (confirmActionType === WEB_SEARCH) {
        return t("Services:WebSearchEnabled");
      }
    };

    try {
      const result = await setServiceState(raw);

      if (!result) {
        toastr.error(t("Common:UnexpectedError"));
        changeServiceState(confirmActionType);
        return;
      }

      if (!isCurrentConfirmState) toastr.success(getSuccessMessage());
    } catch (error) {
      console.error(error);
      toastr.error(t("Common:UnexpectedError"));
      changeServiceState(confirmActionType);
    }
  };

  const onCloseTopUpModal = (isTopUp: boolean | Event) => {
    setIsTopUpBalanceVisible(false);
    setVisibleWalletSetting(false);
    if (isTopUp) {
      setIsConfirmDialogVisible(true);
    }
  };

  return shouldShowLoader && showPortalSettingsLoader ? (
    <ServicesLoader />
  ) : (
    <>
      <ServicesItems onClick={onClick} onToggle={onToggle} />
      {isShowStorageTariffDeactivatedModal ? (
        <StorageTariffDeactiveted
          visible={isShowStorageTariffDeactivatedModal}
        />
      ) : null}
      {dialogVisibility[TOTAL_SIZE] ? (
        <StoragePlanUpgrade
          visible={dialogVisibility[TOTAL_SIZE]}
          onClose={onClose}
          previousValue={previousValue}
        />
      ) : null}
      {isStorageCancelattion ? (
        <StoragePlanCancel
          visible={isStorageCancelattion}
          onClose={onCloseStorageCancell}
        />
      ) : null}
      {isGracePeriodModalVisible ? (
        <GracePeriodModal
          visible={isGracePeriodModalVisible}
          onClose={onCloseGracePeriodModal}
        />
      ) : null}
      {dialogVisibility[BACKUP_SERVICE] ? (
        <BackupServiceDialog
          visible={dialogVisibility[BACKUP_SERVICE]}
          onClose={onCloseBackup}
          onToggle={onToggle}
        />
      ) : null}
      {dialogVisibility[AI_TOOLS] ? (
        <AIServiceDialog
          visible={dialogVisibility[AI_TOOLS]}
          onClose={onCloseAiService}
          onToggle={onToggle}
        />
      ) : null}
      {dialogVisibility[WEB_SEARCH] ? (
        <WebSearchDialog
          visible={dialogVisibility[WEB_SEARCH]}
          onClose={onCloseWebSearch}
          onToggle={onToggle}
        />
      ) : null}
      {isConfirmDialogVisible && confirmActionType ? (
        <ConfirmationDialog
          visible={isConfirmDialogVisible}
          onClose={onCloseConfirmDialog}
          onConfirm={onConfirm}
          title={getDialogContent(confirmActionType).title}
          bodyText={getDialogContent(confirmActionType).body}
        />
      ) : null}
      {isTopUpBalanceVisible ? (
        <TopUpModal
          visible={isTopUpBalanceVisible}
          onClose={onCloseTopUpModal}
        />
      ) : null}
    </>
  );
};

const mapStoreToProps = ({
  servicesStore,
  currentTariffStatusStore,
  paymentStore,
  clientLoadingStore,
  currentQuotaStore,
}: TStore) => {
  const {
    isInitServicesPage,
    isVisibleWalletSettings,
    setConfirmActionType,
    confirmActionType,
    setIsInitServicesPage,
    setVisibleWalletSetting,
  } = servicesStore;
  const { isGracePeriod, previousStoragePlanSize } = currentTariffStatusStore;
  const { isFreeTariff } = currentQuotaStore;
  const {
    isShowStorageTariffDeactivatedModal,
    changeServiceState,
    isCardLinkedToPortal,
  } = paymentStore;

  const { showPortalSettingsLoader } = clientLoadingStore;

  return {
    isInitServicesPage,
    isVisibleWalletSettings,
    isShowStorageTariffDeactivatedModal,
    isGracePeriod,
    previousStoragePlanSize,
    changeServiceState,
    isCardLinkedToPortal,
    setConfirmActionType,
    confirmActionType,
    setIsInitServicesPage,
    setVisibleWalletSetting,
    showPortalSettingsLoader,
    isFreeTariff,
  };
};

type InjectedProps = ReturnType<typeof mapStoreToProps>;

export const Component = inject(mapStoreToProps)(
  observer(Services),
) as unknown as React.ComponentType;
