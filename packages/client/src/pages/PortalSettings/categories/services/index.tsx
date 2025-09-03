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
import { BACKUP_SERVICE, TOTAL_SIZE } from "@docspace/shared/constants";
import { TTranslation } from "@docspace/shared/types";
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

type ServicesProps = {
  servicesInit: (t: TTranslation) => void;
  isInitServicesPage: boolean;
  isVisibleWalletSettings: boolean;
  isShowStorageTariffDeactivatedModal: boolean;
  isGracePeriod: boolean;
  previousStoragePlanSize: number;
  changeServiceState: (service: string) => void;
  isCardLinkedToPortal: boolean;
  setConfirmActionType: (value: string) => void;
  confirmActionType: string | null;
  setIsInitServicesPage: (value: boolean) => void;
  setVisibleWalletSetting: (value: boolean) => void;
};

let timerId: NodeJS.Timeout | null = null;

const Services: React.FC<ServicesProps> = ({
  servicesInit,
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
}) => {
  const { t, ready } = useTranslation(["Payments", "Services", "Common"]);
  const [isStorageVisible, setIsStorageVisible] = useState(false);
  const [isBackupVisible, setIsBackupVisible] = useState(false);
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const [isStorageCancelattion, setIsStorageCancellation] = useState(false);
  const [isGracePeriodModalVisible, setIsGracePeriodModalVisible] =
    useState(false);
  const [previousValue, setPreviousValue] = useState(0);

  const [isTopUpBalanceVisible, setIsTopUpBalanceVisible] = useState(false);

  const [showLoader, setShowLoader] = useState(false);
  const shouldShowLoader = !isInitServicesPage || !ready;
  const location = useLocation();
  const navigate = useNavigate();
  const { openDialog } = location.state || {};

  const previousDialogRef = useRef<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await servicesInit(t);
      } catch (error) {
        console.error(error);
        toastr.error(t("Common:UnexpectedError"));
      }
    };

    fetchData();
  }, [servicesInit]);

  useEffect(() => {
    if (!isVisibleWalletSettings || !isInitServicesPage) return;

    if (confirmActionType === TOTAL_SIZE) {
      setIsStorageVisible(isVisibleWalletSettings);
    } else {
      setIsTopUpBalanceVisible(true);
    }
  }, [isVisibleWalletSettings, confirmActionType, isInitServicesPage]);

  useEffect(() => {
    if (openDialog) {
      setIsStorageVisible(openDialog);
      setPreviousValue(previousStoragePlanSize);
      navigate(location.pathname, { replace: true });
    }
  }, [openDialog]);

  useEffect(() => {
    timerId = setTimeout(() => {
      setShowLoader(true);
    }, 500);

    return () => {
      if (timerId) clearTimeout(timerId);
      setIsInitServicesPage(false);
    };
  }, []);

  const confirmationDialogContent = {
    backup: {
      title: t("Common:Backup"),
      body: t("Services:EnableBackupConfirm", {
        productName: t("Common:ProductName"),
      }),
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

    if (id === TOTAL_SIZE) setIsStorageVisible(true);

    if (id === BACKUP_SERVICE) setIsBackupVisible(true);
  };

  const onClose = () => {
    setIsStorageVisible(false);
  };

  const onCloseStorageCancell = () => {
    setIsStorageCancellation(false);
  };

  const onToggle = async (id: string, currentEnabled: boolean) => {
    setConfirmActionType(id);

    if (id === TOTAL_SIZE) {
      if (currentEnabled) {
        setIsStorageCancellation(true);
        return;
      }
      setIsStorageVisible(true);

      return;
    }

    if (!currentEnabled && !isCardLinkedToPortal) {
      setIsTopUpBalanceVisible(true);
      return;
    }

    if (id === BACKUP_SERVICE) {
      if (isBackupVisible) {
        previousDialogRef.current = true;
      }
    }

    if (!currentEnabled) setIsConfirmDialogVisible(true);
    else {
      const raw = {
        service: id,
        enabled: false,
      };

      changeServiceState(id);

      try {
        await setServiceState(raw);
      } catch (error) {
        toastr.error(t("Common:UnexpectedError"));
        changeServiceState(id);
      }
    }
  };

  const onCloseGracePeriodModal = () => {
    setIsGracePeriodModalVisible(false);
  };

  const onCloseBackup = () => {
    setIsBackupVisible(false);
  };

  const onCloseConfirmDialog = () => {
    const isDialogVisible = previousDialogRef.current;

    previousDialogRef.current = false;

    if (isDialogVisible) setIsBackupVisible(true);
    setIsConfirmDialogVisible(false);
  };

  const onConfirm = async () => {
    if (!confirmActionType) return;

    const raw = {
      service: confirmActionType,
      enabled: true,
    };

    setIsConfirmDialogVisible(false);
    changeServiceState(confirmActionType);

    try {
      const result = await setServiceState(raw);

      if (!result) {
        toastr.error(t("Common:UnexpectedError"));
        changeServiceState(confirmActionType);
        return;
      }

      toastr.success(t("Services:BackupServiceEnabled"));
    } catch (error) {
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

  return shouldShowLoader ? (
    showLoader ? (
      <ServicesLoader />
    ) : null
  ) : (
    <>
      <ServicesItems onClick={onClick} onToggle={onToggle} />
      {isShowStorageTariffDeactivatedModal ? (
        <StorageTariffDeactiveted
          visible={isShowStorageTariffDeactivatedModal}
        />
      ) : null}
      {isStorageVisible ? (
        <StoragePlanUpgrade
          visible={isStorageVisible}
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
      {isBackupVisible ? (
        <BackupServiceDialog
          visible={isBackupVisible}
          onClose={onCloseBackup}
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

export const Component = inject(
  ({ servicesStore, currentTariffStatusStore, paymentStore }: TStore) => {
    const {
      servicesInit,
      isInitServicesPage,
      isVisibleWalletSettings,
      setConfirmActionType,
      confirmActionType,
      setIsInitServicesPage,
      setVisibleWalletSetting,
    } = servicesStore;
    const { isGracePeriod, previousStoragePlanSize } = currentTariffStatusStore;
    const {
      isShowStorageTariffDeactivatedModal,
      changeServiceState,
      isCardLinkedToPortal,
    } = paymentStore;

    return {
      servicesInit,
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
    };
  },
)(observer(Services));

export default Component;
