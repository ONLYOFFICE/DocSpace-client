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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { getConvertedSize } from "@docspace/shared/utils/common";
import { Tooltip } from "@docspace/shared/components/tooltip";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg";

import styles from "./styles/AdditionalStorage.module.scss";
import { useServicesActions } from "./hooks/useServicesActions";
import PayerInformation from "../payments/PayerInformation";

interface ServiceQuotaFeature {
  title: string;
  image: string;
  priceTitle: string;
  id: string;
  enabled?: boolean;
  cancellation?: boolean;
}

type AdditionalStorageProps = {
  onToggle?: (id: string, enabled: boolean) => void;
  servicesQuotasFeatures?: Map<string, ServiceQuotaFeature>;
  storageSizeIncrement?: number;
  onClick?: () => void;
  storagePriceIncrement?: number;
  isPayer?: boolean;
  cardLinkedOnFreeTariff?: boolean;
  isFreeTariff?: boolean;
  payerInfo?: { displayName: string };
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
  payerInfo,
}) => {
  const isDisabled = cardLinkedOnFreeTariff || !isFreeTariff ? !isPayer : false;

  const handleToggle = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const dataset = (e.currentTarget as HTMLElement).dataset;
    const isDisabled = dataset.disabled?.toLowerCase() === "true";
    if (isDisabled) return;

    e.preventDefault();
    e.stopPropagation();

    const isEnabled = dataset.enabled?.toLowerCase() === "true";
    const id = dataset.id;

    onToggle(id, isEnabled);
  };

  const { formatWalletCurrency, t } = useServicesActions();

  return (
    <div>
      <Text className={styles.storageDescription}>
        {isPayer ? t("SelectAndPayServices") : t("ServiceConfigurationNotice")}
      </Text>
      {payerInfo ? (
        <div className={styles.payerContainer}>
          <PayerInformation />
        </div>
      ) : null}
      {Array.from(servicesQuotasFeatures?.values() || []).map((item) => {
        if (!item.title || !item.image) return null;
        const eventDisabled = isDisabled || item.cancellation;

        return (
          <div
            key={item.id}
            className={classNames(styles.storageContainer, {
              [styles.disabled]: isDisabled,
            })}
            {...(!isDisabled ? { onClick } : {})}
            data-tooltip-id="serviceTooltip"
          >
            <div className={styles.headerContainer}>
              <div className={styles.iconWrapper}>
                <div
                  dangerouslySetInnerHTML={{ __html: item.image }}
                  className={styles.iconsContainer}
                />
              </div>

              <div
                onClick={handleToggle}
                className={styles.toggleWrapper}
                data-id={item.id}
                data-enabled={item.enabled}
                data-disabled={eventDisabled}
              >
                <ToggleButton
                  isChecked={item.enabled}
                  className={styles.serviceToggle}
                  isDisabled={eventDisabled}
                />
              </div>
            </div>
            <div className={styles.contentContainer}>
              <Text
                fontWeight={600}
                fontSize="14px"
                className={styles.containerTitle}
              >
                {item.title}
              </Text>
              <Text fontSize="12px" className={styles.priceDescription}>
                {item.priceTitle}
              </Text>
              {item.cancellation ? (
                <div className={styles.changeShedule}>
                  <InfoIcon />
                  <Text fontWeight={600} fontSize="12px">
                    {t("ChangeShedule")}
                  </Text>
                </div>
              ) : null}
              <div className={styles.priceContainer}>
                <Text fontSize="12px" fontWeight={600}>
                  {t("PerStorage", {
                    currency: formatWalletCurrency(storagePriceIncrement),
                    amount: getConvertedSize(t, storageSizeIncrement || 0),
                  })}
                </Text>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default inject(
  ({
    paymentStore,
    currentTariffStatusStore,
    currentQuotaStore,
    servicesStore,
  }: TStore) => {
    const { cardLinkedOnFreeTariff, isPayer, walletPayer } = paymentStore;
    const {
      servicesQuotasFeatures,
      storageSizeIncrement,
      storagePriceIncrement,
    } = servicesStore;
    const { payerInfo: paymentPayer } = currentTariffStatusStore;

    const { isFreeTariff } = currentQuotaStore;

    const payerInfo = paymentPayer ?? walletPayer;

    return {
      servicesQuotasFeatures,
      storageSizeIncrement,
      isPayer,
      cardLinkedOnFreeTariff,
      isFreeTariff,
      payerInfo,
      storagePriceIncrement,
    };
  },
)(observer(AdditionalStorage));
