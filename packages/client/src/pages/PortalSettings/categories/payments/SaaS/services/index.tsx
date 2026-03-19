// (c) Copyright Ascensio System SIA 2009-2026
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

import React, { useCallback, useEffect, useRef, useState } from "react";
import { inject, observer } from "mobx-react";
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { toastr } from "@docspace/ui-kit/components/toast";
import {
  AI_ENUM,
  BACKUP_SERVICE,
  TOTAL_SIZE,
  WEB_SEARCH,
} from "@docspace/shared/constants";
import { setServiceState } from "@docspace/shared/api/portal";

import { StorageTariffDeactiveted } from "SRC_DIR/components/dialogs";
import TopUpModal from "SRC_DIR/pages/PortalSettings/categories/payments/SaaS/shared/top-up-balance/TopUpModal";

import ServicesItems from "./ServicesItems";
import ServicesLoader from "./ServicesLoader";
import StoragePlanUpgrade from "./panels/additional-storage/StoragePlanUpgrade";
import StoragePlanCancel from "./panels/additional-storage/StoragePlanCancel";
import GracePeriodModal from "./panels/additional-storage/GracePeriodModal";
import ConfirmationDialog from "./sub-components/ConfirmationDialog";
import AIServiceDialog from "./panels/ai-service/AIServiceDialog";

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
    wasFirstAiServiceTopUp,
    logoText,
    formatAiServiceCurrency,
    currentStoragePlanSize,
    getAIConfig,
  } = props;
  const { t, ready } = useTranslation(["Payments", "Services", "Common"]);
  const [dialogVisibility, setDialogVisibility] = useState({
    [TOTAL_SIZE]: false,
    [BACKUP_SERVICE]: false,
    [AI_ENUM]: false,
  });

  const updateDialogVisibility = useCallback(
    (dialogType: keyof typeof dialogVisibility, isVisible: boolean) => {
      setDialogVisibility((prev) => {
        if (prev[dialogType] === isVisible) return prev;

        return {
          ...prev,
          [dialogType]: isVisible,
        };
      });
    },
    [],
  );

  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const [isCurrentConfirmState, setIsCurrentConfirmState] = useState(false);
  const [isStorageCancellation, setIsStorageCancellation] = useState(false);
  const [isGracePeriodModalVisible, setIsGracePeriodModalVisible] =
    useState(false);
  const [previousValue, setPreviousValue] = useState("");

  const [isTopUpBalanceVisible, setIsTopUpBalanceVisible] = useState(false);

  const [isAiServiceTopUpVisible, setIsAiServiceTopUpVisible] = useState(false);
  const shouldShowLoader = !isInitServicesPage || !ready;

  const location = useLocation();
  const navigate = useNavigate();
  const { openDialog } = location.state || {};

  const previousDialogRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isVisibleWalletSettings || !isInitServicesPage) return;

    if (confirmActionType === TOTAL_SIZE) {
      updateDialogVisibility(TOTAL_SIZE, isVisibleWalletSettings);
    } else if (confirmActionType === AI_ENUM) {
      setIsAiServiceTopUpVisible(true);
      updateDialogVisibility(AI_ENUM, isVisibleWalletSettings);
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
      setPreviousValue(previousStoragePlanSize.toString());
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
    [AI_ENUM]: {
      title: t("Common:Confirmation"),
      body: isCurrentConfirmState
        ? [
            t("Services:DisableAIToolsConfirm", {
              organizationName: logoText,
            }),
            <Trans
              key="DisableBalance"
              i18nKey="Services:DisableAIToolsConfirmBalance"
              t={t}
              values={{ balance: formatAiServiceCurrency!() }}
              components={{
                1: <span style={{ fontWeight: 600 }} />,
              }}
            />,
            t("Services:DisableAIToolsConfirmReEnable"),
          ]
        : [
            t("Services:AIToolsDescription", {
              productName: t("Common:ProductName"),
              organizationName: logoText,
            }),
            <Trans
              key="Payments"
              ns="Payments"
              i18nKey="CurrentBalance"
              t={t}
              values={{ balance: formatAiServiceCurrency!() }}
              components={{
                1: <span style={{ fontWeight: 600 }} />,
              }}
            />,
            t("Common:WantToContinue"),
          ],
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

    if (
      id === TOTAL_SIZE &&
      (currentStoragePlanSize || previousStoragePlanSize)
    ) {
      navigate("/portal-settings/payments/services/disk-storage");
      return;
    }

    if (id === TOTAL_SIZE && isGracePeriod) {
      setIsGracePeriodModalVisible(true);
      return;
    }

    if (id === AI_ENUM && wasFirstAiServiceTopUp) {
      navigate("/portal-settings/payments/services/ai-services");
      return;
    }

    if (id === BACKUP_SERVICE && isCardLinkedToPortal) {
      navigate("/portal-settings/payments/services/backup");
      return;
    }

    if (id === BACKUP_SERVICE && !isCardLinkedToPortal) {
      setConfirmActionType(id);
      setIsConfirmDialogVisible(true);
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
      if (isGracePeriod) {
        setIsGracePeriodModalVisible(true);
        return;
      }
      if (currentEnabled) {
        setIsStorageCancellation(true);
        return;
      }
      updateDialogVisibility(TOTAL_SIZE, true);

      return;
    }

    if (id === AI_ENUM && !wasFirstAiServiceTopUp) {
      updateDialogVisibility(AI_ENUM, true);
      return;
    }

    // if (!currentEnabled && !isCardLinkedToPortal) {
    //   setIsTopUpBalanceVisible(true);
    //   return;
    // }

    if (id !== TOTAL_SIZE) {
      if (dialogVisibility[id as keyof typeof dialogVisibility]) {
        previousDialogRef.current = true;
      }
    }

    if (!currentEnabled || id === BACKUP_SERVICE || id === AI_ENUM)
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

  const onCloseAiService = () => {
    updateDialogVisibility(AI_ENUM, false);
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

    if (confirmActionType === BACKUP_SERVICE && !isCardLinkedToPortal) {
      setIsTopUpBalanceVisible(true);
      return;
    }

    changeServiceState(confirmActionType);

    const getSuccessMessage = () => {
      if (confirmActionType === BACKUP_SERVICE) {
        return t("Services:BackupServiceEnabled");
      }
      if (confirmActionType === AI_ENUM) {
        return t("Services:AIToolsEnabled");
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

      if (confirmActionType === AI_ENUM) {
        await getAIConfig?.();
      }
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
      {isStorageCancellation ? (
        <StoragePlanCancel
          visible={isStorageCancellation}
          onClose={onCloseStorageCancell}
        />
      ) : null}
      {isGracePeriodModalVisible ? (
        <GracePeriodModal
          visible={isGracePeriodModalVisible}
          onClose={onCloseGracePeriodModal}
        />
      ) : null}
      {dialogVisibility[AI_ENUM] ? (
        <AIServiceDialog
          visible={dialogVisibility[AI_ENUM]}
          onClose={onCloseAiService}
          isTopUpVisible={isAiServiceTopUpVisible}
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
  settingsStore,
}: TStore) => {
  const {
    isInitServicesPage,
    isVisibleWalletSettings,
    setConfirmActionType,
    confirmActionType,
    setIsInitServicesPage,
    setVisibleWalletSetting,
    wasFirstAiServiceTopUp,
    formatAiServiceCurrency,
  } = servicesStore;
  const { isGracePeriod, previousStoragePlanSize, currentStoragePlanSize } =
    currentTariffStatusStore;
  const { isFreeTariff } = currentQuotaStore;
  const {
    isShowStorageTariffDeactivatedModal,
    changeServiceState,
    isCardLinkedToPortal,
  } = paymentStore;

  const { showPortalSettingsLoader } = clientLoadingStore;
  const { logoText, getAIConfig } = settingsStore;
  return {
    isInitServicesPage,
    isVisibleWalletSettings,
    isShowStorageTariffDeactivatedModal,
    isGracePeriod,
    previousStoragePlanSize,
    currentStoragePlanSize,
    changeServiceState,
    isCardLinkedToPortal,
    setConfirmActionType,
    confirmActionType,
    setIsInitServicesPage,
    setVisibleWalletSetting,
    showPortalSettingsLoader,
    isFreeTariff,
    wasFirstAiServiceTopUp,
    logoText,
    formatAiServiceCurrency,
    getAIConfig,
  };
};

type InjectedProps = ReturnType<typeof mapStoreToProps>;

export const Component = inject(mapStoreToProps)(
  observer(Services),
) as unknown as React.ComponentType;

