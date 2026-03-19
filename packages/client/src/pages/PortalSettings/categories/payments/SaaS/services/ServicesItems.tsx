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

import React from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";
import { Trans } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import {
  AI_ENUM,
  AI_TOOLS,
  BACKUP_SERVICE,
  DISK_STORAGE,
  TOTAL_SIZE,
} from "@docspace/shared/constants";
import {
  calculateTotalPrice,
  getConvertedSize,
} from "@docspace/shared/utils/common";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { DeviceType } from "@docspace/shared/enums";

import CheckIcon from "PUBLIC_DIR/images/icons/16/check.round.react.svg";
import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg";
import PriceIcon from "PUBLIC_DIR/images/icons/16/price.react.svg";

import styles from "./styles/AdditionalStorage.module.scss";
import { useServicesActions } from "./hooks/useServicesActions";
import PayerInformation from "../shared/payer-information";
import ServiceCard from "./sub-components/ServiceCard";
import { DISK_SPACE } from "@docspace/shared/pages/backup/restore-backup/RestoreBackup.constants";

interface ServiceQuotaFeature {
  title: string;
  image: string;
  priceTitle: string;
  id: string;
  enabled?: boolean;
  cancellation?: boolean;
  value: boolean;
  serviceName: string;
  price: {
    value: number;
    currencySymbol: string;
    isoCurrencySymbol: string;
  };
}

type ServicesItemsProps = {
  onToggle?: (id: string, enabled: boolean) => void;
  servicesQuotasFeatures?: Map<string, ServiceQuotaFeature>;
  storageSizeIncrement?: number;
  onClick?: (id: string) => void;
  storagePriceIncrement?: number;
  isPayer?: boolean;
  cardLinkedOnFreeTariff?: boolean;
  isFreeTariff?: boolean;
  currentStoragePlanSize?: number;
  nextStoragePlanSize?: number;
  storageExpiryDate?: string;
  isCardLinkedToPortal?: boolean;
  hasStorageSubscription?: boolean;
  isGracePeriod?: boolean;
  hasScheduledStorageChange?: boolean;
  isTablet?: boolean;
  isMobile?: boolean;
  formatWalletCurrency?: (amount: number, fractionDigits?: number) => string;
  formatAiServiceCurrency?: (
    amount?: number,
    fractionDigits?: number,
  ) => string;
  aiServiceBalance?: number;
  isAiServiceLowBalance?: boolean;
  walletCustomerInfo?: { displayName?: string } | null;
  walletCustomerEmail?: string | null;
  wasFirstAiServiceTopUp?: boolean;
  availableBackupsCount?: number;
  isBackupServiceOn?: boolean;
  previousStoragePlanSize?:boolean;
};

const ServicesItems: React.FC<ServicesItemsProps> = ({
  servicesQuotasFeatures,
  storageSizeIncrement,
  onClick,
  storagePriceIncrement,
  cardLinkedOnFreeTariff,
  isFreeTariff,
  isPayer,
  onToggle,
  currentStoragePlanSize,
  nextStoragePlanSize,
  storageExpiryDate,
  isCardLinkedToPortal,
  hasStorageSubscription = false,
  isGracePeriod,
  hasScheduledStorageChange,
  isTablet,
  isMobile,
  formatWalletCurrency,
  formatAiServiceCurrency,
  aiServiceBalance,
  isAiServiceLowBalance,
  walletCustomerInfo,
  walletCustomerEmail,
  wasFirstAiServiceTopUp,
  availableBackupsCount,
  isBackupServiceOn,
  previousStoragePlanSize
}) => {
  const isDisabled = cardLinkedOnFreeTariff || !isFreeTariff ? !isPayer : false;
  const { t } = useServicesActions();

  const permissionTooltipText = (
    <Trans
      t={t}
      i18nKey="InsufficientPermissionsMessage"
      ns="Services"
      values={{
        payerContact:
          walletCustomerInfo?.displayName || walletCustomerEmail || "",
      }}
      components={{ 1: <strong /> }}
    />
  );

  const handleToggle = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const dataset = (e.currentTarget as HTMLElement).dataset;
    const handleDisabled = dataset.disabled?.toLowerCase() === "true";

    if (handleDisabled) return;

    e.preventDefault();
    e.stopPropagation();

    const isEnabled = dataset.enabled?.toLowerCase() === "true";
    const id = dataset.id;

    onToggle?.(id!, isEnabled);
  };

  const handleClick = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const dataset = (e.currentTarget as HTMLElement).dataset;
    const id = dataset.id;

    onClick?.(id!);
  };

  const textTooltip = (
    <>
      <Text fontWeight={600} fontSize="12px">
        {t("StorageUpgradeMessage", {
          fromSize: `${currentStoragePlanSize} ${t("Common:Gigabyte")}`,
          toSize: `${nextStoragePlanSize} ${t("Common:Gigabyte")}`,
        })}
      </Text>
      <Text fontSize="12px">
        {nextStoragePlanSize === 0
          ? t("SubscriptionAutoCancellation", {
              finalDate: storageExpiryDate,
            })
          : t("SubscriptionAutoRenewed", {
              finalDate: storageExpiryDate,
            })}
      </Text>
    </>
  );

  const priceDescription = (
    serviceName: string,
    priceValue?: number,
    enabled?: boolean,
  ) => {
    switch (serviceName) {
      case TOTAL_SIZE:

      if(previousStoragePlanSize) {
        return t("Services:SubscriptionDeactivated")
      }

        if (hasScheduledStorageChange) {
          return t("ChangeShedule");
        }

        if (!hasScheduledStorageChange && currentStoragePlanSize! > 0) {
          return t("CurrentPaymentMonth", {
            price: formatWalletCurrency!(
              calculateTotalPrice(
                currentStoragePlanSize!,
                storagePriceIncrement!,
              ),
              2,
            ),
            size: `${currentStoragePlanSize} ${t("Common:Gigabyte")}`,
          });
        }

        return t("PerStorage", {
          currency: formatWalletCurrency!(storagePriceIncrement!, 2),
          amount: getConvertedSize(t, storageSizeIncrement || 0),
        });

      case BACKUP_SERVICE:
        if (
          isBackupServiceOn &&
          availableBackupsCount === 0
        ) {
          return t("Services:BackupsNotAvailable");
        }

        if (isBackupServiceOn) {
          return t("Services:BackupsAvailable", {
            currency: formatWalletCurrency!(priceValue!, 2),
          });
        }

        return t("PerBackup", {
          currency: formatWalletCurrency!(priceValue!, 2),
        });

      case AI_ENUM:
        if (isAiServiceLowBalance) {
          return t("Services:AIPricingAvailableCreditsLowBalance", {
            price: formatAiServiceCurrency!(),
          });
        }

        if (aiServiceBalance && aiServiceBalance > 0) {
          return t("Services:AIPricingAvailableCredits", {
            price: formatAiServiceCurrency!(),
          });
        }

        return t("Services:AIPricingBilledPerUsage");
      default:
        return "";
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <Text className={styles.storageDescription}>
        {isPayer || !isCardLinkedToPortal
          ? t("ConnectAndConfigureServices")
          : t("ServiceConfigurationNotice")}
      </Text>

      <div
        className={classNames(styles.servicesWrapper, {
          [styles.servicesWrapperMobile]: isMobile,
          [styles.servicesWrapperTablet]: isTablet,
        })}
      >
        {Array.from(servicesQuotasFeatures?.values() || []).map((item) => {

       console.log("item",item)
          if (!item.title || !item.image) return null;

       
          if (item.serviceName === BACKUP_SERVICE) {
            return (
              <ServiceCard
                key={item.id}
                cardDisabled={isDisabled}
                toggleDisabled={isDisabled}
                priceTitle={item.priceTitle}
                id={item.id}
                image={item.image}
                isEnabled={item.value}
                serviceTitle={item.title}
                onClick={handleClick}
                onToggle={handleToggle}
                priceDescription={priceDescription(
                  item.serviceName,
                  item.price.value,
                )}
                tooltip={isDisabled ? permissionTooltipText : undefined}
                isWarningColor={item.value && walletCustomerEmail ? availableBackupsCount === 0 : false}
              />
            );
          }

          if (item.serviceName === AI_TOOLS) {
            return (
              <ServiceCard
                key={item.id}
                toggleDisabled={isDisabled}
                cardDisabled={wasFirstAiServiceTopUp ? false : isDisabled}
                onClick={handleClick}
                onToggle={handleToggle}
                serviceTitle={item.title}
                priceDescription={priceDescription(item.id, 0, item.value)}
                priceTitle={item.priceTitle}
                id={item.id}
                image={item.image}
                isEnabled={item.value}
                tooltip={isDisabled ? permissionTooltipText : undefined}
                isInactiveColor={
                  aiServiceBalance ? aiServiceBalance > 0 && !item.value : false
                }
                isErrorColor={isAiServiceLowBalance}
                icon={<PriceIcon />}
              />
            );
          }

          if (item.serviceName === DISK_STORAGE) {
            const eventDisabled =
              isGracePeriod || isDisabled || hasScheduledStorageChange;

            return (
              <ServiceCard
                key={item.id}
                cardDisabled={isDisabled}
                toggleDisabled={!!eventDisabled}
                onClick={handleClick}
                onToggle={handleToggle}
                serviceTitle={item.title}
                priceDescription={priceDescription(item.id)}
                priceTitle={item.priceTitle}
                id={item.id}
                image={item.image}
                isEnabled={hasStorageSubscription}
                tooltip={isDisabled ? permissionTooltipText : undefined}
                priceTooltip={hasScheduledStorageChange ? textTooltip : undefined}
                isWarningColor={hasScheduledStorageChange}
                isErrorColor={previousStoragePlanSize}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default inject(
  ({
    paymentStore,
    currentTariffStatusStore,
    currentQuotaStore,
    settingsStore,
    servicesStore,
  }: TStore) => {
    const {
      cardLinkedOnFreeTariff,
      isPayer,
      isCardLinkedToPortal,
      servicesQuotasFeatures,
      storageSizeIncrement,
      storagePriceIncrement,
      formatWalletCurrency,
      availableBackupsCount,
      isBackupServiceOn,
    } = paymentStore;

    const {
      aiServiceBalance,
      formatAiServiceCurrency,
      isAiServiceLowBalance,
      wasFirstAiServiceTopUp,
    } = servicesStore;
    const {
      isGracePeriod,
      hasScheduledStorageChange,
      walletCustomerInfo,
      walletCustomerEmail,
      currentStoragePlanSize,
      nextStoragePlanSize,
      storageExpiryDate,
      hasStorageSubscription,
      previousStoragePlanSize
    } = currentTariffStatusStore;

    const { isFreeTariff } = currentQuotaStore;
    const { currentDeviceType } = settingsStore;
    const isMobile = currentDeviceType === DeviceType.mobile;
    const isTablet = currentDeviceType === DeviceType.tablet;

    return {
      servicesQuotasFeatures,
      storageSizeIncrement,
      isPayer,
      cardLinkedOnFreeTariff,
      isFreeTariff,
      storagePriceIncrement,
      currentStoragePlanSize,
      hasStorageSubscription,
      nextStoragePlanSize,
      storageExpiryDate,
      isCardLinkedToPortal,
      isGracePeriod,
      hasScheduledStorageChange,
      isTablet,
      isMobile,
      formatWalletCurrency,
      formatAiServiceCurrency,
      aiServiceBalance,
      isAiServiceLowBalance,
      walletCustomerInfo,
      walletCustomerEmail,
      wasFirstAiServiceTopUp,
      availableBackupsCount,
      isBackupServiceOn,
      previousStoragePlanSize
    };
  },
)(observer(ServicesItems));
