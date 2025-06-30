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

import { useTranslation, Trans } from "react-i18next";
import { useNavigate } from "react-router";
import { inject, observer } from "mobx-react";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  calculateTotalPrice,
  getConvertedSize,
} from "@docspace/shared/utils/common";
import { STORAGE_TARIFF_DEACTIVATED } from "@docspace/shared/constants";

import styles from "./StorageTariff.module.scss";

type StorageTariffDeactivetedProps = {
  visible: boolean;
  onClose: () => void;
  totalPrice?: number;
  previousStoragePlanSize?: number;
  usedTotalStorageSizeCount?: number;
  maxTotalSizeByQuota?: number;
  isStorageTariffLimit?: boolean;
  formatWalletCurrency?: (item: number, fractionDigits?: number) => string;
  setIsShowTariffDeactivatedModal?: (value: boolean) => void;
};

const StorageTariffDeactiveted: React.FC<StorageTariffDeactivetedProps> = ({
  visible,
  onClose,
  totalPrice,
  previousStoragePlanSize,
  usedTotalStorageSizeCount,
  maxTotalSizeByQuota,
  isStorageTariffLimit,
  formatWalletCurrency,
  setIsShowTariffDeactivatedModal,
}) => {
  const { t, ready } = useTranslation(["Payments", "Common"]);
  const navigate = useNavigate();

  const onCloseModal = () => {
    localStorage.setItem(STORAGE_TARIFF_DEACTIVATED, "true");

    setIsShowTariffDeactivatedModal(false);

    onClose && onClose();
  };

  const onClick = () => {
    const servicesUrl = combineUrl("/portal-settings", "/services");

    navigate(servicesUrl, {
      state: { openDialog: true },
    });

    onCloseModal();
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onCloseModal}
      autoMaxHeight
      isLoading={!ready}
      displayType={ModalDialogType.modal}
      isLarge
    >
      <ModalDialog.Header>
        <Text fontSize="21px" isBold>
          {t("Common:Warning")}
        </Text>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontWeight={600}>{t("StorageTariffDeactivated")}</Text>
        <br />
        <Text as="span">
          <Trans
            t={t}
            ns="Payments"
            i18nKey="PreviousPlan"
            values={{
              amount: `${previousStoragePlanSize} ${t("Common:Gigabyte")}`,
              price: formatWalletCurrency(totalPrice, 2),
            }}
            components={{
              1: <Text fontWeight={600} as="span" />,
              2: <Text className={styles.monthPayment} as="span" />,
            }}
          />
        </Text>
        <Text>
          <Trans
            t={t}
            ns="Payments"
            i18nKey="StorageUsed"
            values={{
              amount: getConvertedSize(t, usedTotalStorageSizeCount),
            }}
            components={{
              1: <Text fontWeight={600} as="span" />,
            }}
          />
        </Text>
        <Text>
          <Trans
            t={t}
            ns="Payments"
            i18nKey="AvailableLimit"
            values={{
              amount: getConvertedSize(t, maxTotalSizeByQuota),
            }}
            components={{
              1: <Text fontWeight={600} as="span" />,
            }}
          />
        </Text>
        <br />
        <Text>{t("TopUpToReactivateStorage")}</Text>
        {isStorageTariffLimit ? (
          <Text as="span">{t("StorageRestrictions")}</Text>
        ) : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="send-button"
          label={t("GoToService")}
          size={ButtonSize.normal}
          primary
          onClick={onClick}
        />
        <Button
          className="cancel-button"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onCloseModal}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({ paymentStore, currentTariffStatusStore, currentQuotaStore }: TStore) => {
    const {
      fetchPortalTariff,
      currentStoragePlanSize,
      previousStoragePlanSize,
    } = currentTariffStatusStore;
    const {
      fetchBalance,
      storageSizeIncrement,
      storagePriceIncrement,
      handleServicesQuotas,
      formatWalletCurrency,
      setIsShowTariffDeactivatedModal,
    } = paymentStore;

    const {
      usedTotalStorageSizeCount,
      maxTotalSizeByQuota,
      isStorageTariffLimit,
    } = currentQuotaStore;

    const totalPrice = calculateTotalPrice(
      previousStoragePlanSize,
      storagePriceIncrement,
    );

    return {
      storageSizeIncrement,
      fetchPortalTariff,
      fetchBalance,
      usedTotalStorageSizeCount,
      totalPrice,
      currentStoragePlanSize,
      handleServicesQuotas,
      previousStoragePlanSize,
      maxTotalSizeByQuota,
      isStorageTariffLimit,
      formatWalletCurrency,
      setIsShowTariffDeactivatedModal,
    };
  },
)(observer(StorageTariffDeactiveted));
