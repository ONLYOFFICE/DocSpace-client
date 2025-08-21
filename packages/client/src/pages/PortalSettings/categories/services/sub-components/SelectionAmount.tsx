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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { Trans } from "react-i18next";

import QuantityPicker from "@docspace/shared/components/quantity-picker";
import { useInterfaceDirection } from "@docspace/shared/hooks/useInterfaceDirection";
import { getConvertedSize } from "@docspace/shared/utils/common";
import { Text } from "@docspace/shared/components/text";

import { useServicesActions } from "../hooks/useServicesActions";
import styles from "../styles/index.module.scss";

type SelectionAmountProps = {
  amount: number;
  onChangeNumber: (amount: number) => void;
  isLoading: boolean;
  storageSizeIncrement?: number;
  storagePriceIncrement?: number;
  currentStoragePlanSize?: number;
  nextStoragePlanSize?: number;
  hasScheduledStorageChange?: boolean;
  newStorageSizeOnUpgrade?: boolean;
  totalPrice?: number;
  partialUpgradeFee?: number;
  walletBalance?: number;
  setReccomendedAmount?: (amount: number) => void;
  reccomendedAmount?: number;
  fetchCardLinked?: (url: string) => Promise<any>;
  isPaymentBlockedByBalance?: boolean;
  isCardLinkedToPortal?: boolean;
  formatWalletCurrency?: (item?: number, fractionDigits?: number) => string;
  isUpgradeStoragePlan?: boolean;
};

let timeout: NodeJS.Timeout;
let controller: AbortController;

const MIN_VALUE = 100;

const SelectionAmount: React.FC<SelectionAmountProps> = (props) => {
  const {
    amount,
    onChangeNumber,
    hasScheduledStorageChange,
    isLoading,
    storageSizeIncrement,
    storagePriceIncrement,
    currentStoragePlanSize,
    nextStoragePlanSize,
    newStorageSizeOnUpgrade,
    totalPrice,
    partialUpgradeFee,
    setReccomendedAmount,
    walletBalance,
    fetchCardLinked,
    isCardLinkedToPortal,
    isPaymentBlockedByBalance,
    formatWalletCurrency,
    isUpgradeStoragePlan,
  } = props;

  const { maxStorageLimit, t } = useServicesActions();

  const { isRTL } = useInterfaceDirection();

  useEffect(() => {
    if (!isPaymentBlockedByBalance || !isUpgradeStoragePlan) {
      setReccomendedAmount!(0);
      return;
    }

    const amountValue = newStorageSizeOnUpgrade
      ? partialUpgradeFee
      : totalPrice;

    const difference = Math.abs(walletBalance! - amountValue!);
    const recommendedValue = Math.ceil(difference);
    setReccomendedAmount?.(recommendedValue);

    const getCardLink = () => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(async () => {
        if (controller) controller.abort();

        controller = new AbortController();

        try {
          const url = `${window.location.href}?complete=true&amount=${amount}&recommendedAmount=${recommendedValue}`;
          await fetchCardLinked?.(url);
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    };
    if (!isCardLinkedToPortal) getCardLink();
  }, [
    amount,
    isCardLinkedToPortal,
    isPaymentBlockedByBalance,
    totalPrice,
    partialUpgradeFee,
    newStorageSizeOnUpgrade,
    walletBalance,
  ]);

  const amountTabs = () => {
    const amounts = [100, 200, 500, 1024];
    return amounts.map((item) => {
      const name =
        item > 800
          ? `1 ${t("Common:Terabyte")}`
          : `${item} ${t("Common:Gigabyte")}`;
      return { value: item, name };
    });
  };

  const getDirectionalText = (from: number, to: number) => {
    return isRTL ? `${from} ← ${to}` : `${from} → ${to}`;
  };

  const disableValueProps = hasScheduledStorageChange
    ? {
        disableValue: getDirectionalText(
          currentStoragePlanSize ?? 0,
          nextStoragePlanSize ?? 0,
        ),
      }
    : {};

  const underContorlsTitle = (
    <Trans
      t={t}
      ns="Payments"
      i18nKey="PerStorageWitnMinValue"
      values={{
        currency: formatWalletCurrency!(storagePriceIncrement),
        amount: getConvertedSize(t, storageSizeIncrement || 0),
        storageUnit: t("Common:Gigabyte"),
        minValue: MIN_VALUE,
      }}
      components={{
        1: <Text fontWeight={600} as="span" />,
      }}
    />
  );

  return (
    <div className={styles.selectionAmount}>
      <QuantityPicker
        value={amount}
        minValue={100}
        maxValue={maxStorageLimit}
        step={1}
        title={t("ExtraStorage", { storageUnit: t("Common:Gigabyte") })}
        showPlusSign
        onChange={onChangeNumber}
        isDisabled={hasScheduledStorageChange || isLoading}
        items={amountTabs()}
        withoutContorls={hasScheduledStorageChange}
        underContorlsTitle={underContorlsTitle}
        {...disableValueProps}
        isLarge
        enableZero
      />
    </div>
  );
};

export default inject(
  ({ paymentStore, currentTariffStatusStore, servicesStore }: TStore) => {
    const {
      fetchPortalTariff,
      hasScheduledStorageChange,
      hasStorageSubscription,
      currentStoragePlanSize,
      nextStoragePlanSize,
    } = currentTariffStatusStore;

    const {
      walletBalance,
      fetchCardLinked,
      isCardLinkedToPortal,
      storageSizeIncrement,
      storagePriceIncrement,
      formatWalletCurrency,
    } = paymentStore;
    const { partialUpgradeFee, setReccomendedAmount } = servicesStore;

    return {
      storageSizeIncrement,
      hasStorageSubscription,
      currentStoragePlanSize,
      fetchPortalTariff,

      walletBalance,
      hasScheduledStorageChange,
      storagePriceIncrement,
      nextStoragePlanSize,

      partialUpgradeFee,

      fetchCardLinked,
      setReccomendedAmount,
      isCardLinkedToPortal,
      formatWalletCurrency,
    };
  },
)(observer(SelectionAmount));
