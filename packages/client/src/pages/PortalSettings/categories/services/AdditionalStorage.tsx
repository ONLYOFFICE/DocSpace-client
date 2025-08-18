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

import React from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { Text } from "@docspace/shared/components/text";
import { TOTAL_SIZE } from "@docspace/shared/constants";
import {
  calculateTotalPrice,
  getConvertedSize,
} from "@docspace/shared/utils/common";
import { Tooltip } from "@docspace/shared/components/tooltip";
import { DeviceType } from "@docspace/shared/enums";

import CheckIcon from "PUBLIC_DIR/images/icons/16/check.round.react.svg";
import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg";

import styles from "./styles/AdditionalStorage.module.scss";
import { useServicesActions } from "./hooks/useServicesActions";
import PayerInformation from "../payments/PayerInformation";
import ServiceCard from "./sub-components/ServiceCard";

interface ServiceQuotaFeature {
  title: string;
  image: string;
  priceTitle: string;
  id: string;
  enabled?: boolean;
  cancellation?: boolean;
  value: boolean;
  price: {
    value: number;
    currencySymbol: string;
    isoCurrencySymbol: string;
  };
}

type AdditionalStorageProps = {
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
};

const AdditionalStorage: React.FC<AdditionalStorageProps> = ({
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
}) => {
  const isDisabled = cardLinkedOnFreeTariff || !isFreeTariff ? !isPayer : false;
  const { t } = useServicesActions();

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

  const textTooltip = () => {
    return (
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
  };

  const priceDescription = (id: string, priceValue?: number) => {
    switch (id) {
      case TOTAL_SIZE:
        return t("PerStorage", {
          currency: formatWalletCurrency!(storagePriceIncrement!, 2),
          amount: getConvertedSize(t, storageSizeIncrement || 0),
        });
      case "backup":
        return t("PerBackup", {
          currency: formatWalletCurrency!(priceValue!, 2),
        });
      default:
        return "";
    }
  };

  return (
    <div>
      <Text className={styles.storageDescription}>
        {isPayer || !isCardLinkedToPortal
          ? t("ConnectAndConfigureServices")
          : t("ServiceConfigurationNotice")}
      </Text>
      {isCardLinkedToPortal ? (
        <div className={styles.payerContainer}>
          <PayerInformation
            style={undefined}
            theme={undefined}
            user={undefined}
            accountLink={undefined}
            payerInfo={undefined}
            email={undefined}
            isNotPaidPeriod={undefined}
            isStripePortalAvailable={undefined}
          />
        </div>
      ) : null}
      <div
        className={classNames(styles.servicesWrapper, {
          [styles.servicesWrapperMobile]: isMobile,
          [styles.servicesWrapperTablet]: isTablet,
        })}
      >
        {Array.from(servicesQuotasFeatures?.values() || []).map((item) => {
          if (!item.title || !item.image) return null;
          const eventDisabled =
            isGracePeriod || isDisabled || hasScheduledStorageChange;

          if (item.id === TOTAL_SIZE) {
            return (
              <ServiceCard
                key={item.id}
                isDisabled={isDisabled}
                eventDisabled={eventDisabled || !hasStorageSubscription}
                onClick={handleClick}
                onToggle={handleToggle}
                serviceTitle={item.title}
                priceDescription={priceDescription(item.id)}
                priceTitle={item.priceTitle}
                id={item.id}
                image={item.image}
                isEnabled={hasStorageSubscription}
              >
                {hasScheduledStorageChange ? (
                  <div
                    className={classNames(styles.changeShedule, {
                      [styles.warningColor]: true,
                    })}
                    data-tooltip-id="serviceTooltip"
                  >
                    <InfoIcon />
                    <Text fontWeight={600} fontSize="12px">
                      {t("ChangeShedule")}
                    </Text>
                    <Tooltip
                      id="serviceTooltip"
                      place="bottom"
                      maxWidth="300px"
                      float
                      getContent={textTooltip}
                      dataTestId="service_change_shedule_tooltip"
                    />
                  </div>
                ) : null}

                {!hasScheduledStorageChange && currentStoragePlanSize! > 0 ? (
                  <div
                    className={classNames(styles.changeShedule, {
                      [styles.greenColor]: true,
                    })}
                  >
                    <CheckIcon />
                    <Text>
                      {t("CurrentPaymentMonth", {
                        price: formatWalletCurrency!(
                          calculateTotalPrice(
                            currentStoragePlanSize!,
                            storagePriceIncrement!,
                          ),
                          2,
                        ),
                        size: `${currentStoragePlanSize} ${t("Common:Gigabyte")}`,
                      })}
                    </Text>
                  </div>
                ) : null}
              </ServiceCard>
            );
          }

          return (
            <ServiceCard
              key={item.id}
              isDisabled={isDisabled}
              eventDisabled={eventDisabled || false}
              priceTitle={item.priceTitle}
              id={item.id}
              image={item.image}
              isEnabled={item.value}
              serviceTitle={item.title}
              onClick={handleClick}
              onToggle={handleToggle}
              priceDescription={priceDescription(item.id, item.price.value)}
            />
          );
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
  }: TStore) => {
    const {
      cardLinkedOnFreeTariff,
      isPayer,
      isCardLinkedToPortal,
      servicesQuotasFeatures,
      storageSizeIncrement,
      storagePriceIncrement,
      formatWalletCurrency,
    } = paymentStore;

    const {
      currentStoragePlanSize,
      nextStoragePlanSize,
      storageExpiryDate,
      hasStorageSubscription,
      isGracePeriod,
      hasScheduledStorageChange,
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
    };
  },
)(observer(AdditionalStorage));
