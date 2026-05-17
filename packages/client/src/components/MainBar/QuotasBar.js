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

import React from "react";
import { withTranslation, Trans } from "react-i18next";

import { SnackBar } from "@docspace/ui-kit/components/snackbar";

import { Link } from "@docspace/ui-kit/components/link";
import { QuotaBarTypes } from "SRC_DIR/helpers/constants";
import { getBrandName } from "@docspace/shared/constants/brands";

const QuotasBar = ({
  t,
  tReady,
  type,
  currentValue,
  maxValue,
  onClick,
  onClose,
  onLoad,
  currentColorScheme,
  isAdmin,
}) => {
  const onClickAction = (e) => {
    onClick && onClick(type, e);
  };

  const onCloseAction = () => {
    onClose && onClose(type);
  };

  const getTenantCustomQuota = () => {
    if (!isAdmin)
      return t("RemoveFilesOrContactToUpgradeQuota", {
        productName: getBrandName("ProductName"),
      });

    return (
      <Trans
        t={t}
        i18nKey="TenantCustomQuotaDescription"
        components={{
          1: (
            <Link
              fontSize="12px"
              fontWeight="400"
              color={currentColorScheme?.main?.accent}
              onClick={onClickAction}
            />
          ),
        }}
      />
    );
  };

  const getUserTariffAlmostLimit = () => {
    if (!isAdmin)
      return t("UserTariffAlmostReached", {
        productName: getBrandName("ProductName"),
      });

    return (
      <Trans
        t={t}
        i18nKey="UserTariffAlmostReachedForAdmins"
        components={{
          1: (
            <Link
              fontSize="12px"
              fontWeight="400"
              color={currentColorScheme?.main?.accent}
              className="error_description_link"
              onClick={onClickAction}
            />
          ),
        }}
      />
    );
  };

  const getUserTariffLimit = () => {
    if (!isAdmin)
      return t("UserTariffReached", { productName: getBrandName("ProductName") });

    return (
      <Trans
        t={t}
        i18nKey="UserTariffReachedForAdmins"
        values={{
          productName: getBrandName("ProductName"),
        }}
        components={{
          1: (
            <Link
              fontSize="12px"
              fontWeight="400"
              color={currentColorScheme?.main?.accent}
              className="error_description_link"
              onClick={onClickAction}
            />
          ),
        }}
      />
    );
  };

  const getStorageTariffDescription = () => {
    if (!isAdmin)
      return t("RemoveFilesOrContactToUpgrade", {
        productName: getBrandName("ProductName"),
      });

    return (
      <Trans
        t={t}
        i18nKey="RemoveFilesOrClickToUpgrade"
        components={{
          1: (
            <Link
              fontSize="12px"
              fontWeight="400"
              color={currentColorScheme?.main?.accent}
              className="error_description_link"
              onClick={onClickAction}
            />
          ),
        }}
      />
    );
  };

  const getPersonalQuotaDescription = () => {
    if (!isAdmin)
      return t("PersonalUserQuotaDescription", {
        productName: getBrandName("ProductName"),
      });

    return (
      <Trans
        t={t}
        i18nKey="PersonalUserQuotaAdminsDescription"
        components={{
          1: (
            <Link
              fontSize="12px"
              fontWeight="400"
              color={currentColorScheme?.main?.accent}
              className="error_description_link"
              onClick={onClickAction}
            />
          ),
        }}
      />
    );
  };

  const getPersonalQuotaHeader = () => {
    if (!isAdmin) return t("PersonalQuotaHeader");
    return t("PersonalQuotaHeaderForAdmins");
  };

  const getUpgradeTariffDescription = () => {
    if (!isAdmin)
      return t("ContactToUpgradeTariff", {
        productName: getBrandName("ProductName"),
      });

    return (
      <Trans
        t={t}
        i18nKey="ClickToUpgradeTariff"
        components={{
          1: (
            <Link
              fontSize="12px"
              fontWeight="400"
              color={currentColorScheme?.main?.accent}
              className="error_description_link"
              onClick={onClickAction}
            />
          ),
        }}
      />
    );
  };

  const getRoomsTariffDescription = () => {
    if (!isAdmin)
      return t("ArchivedRoomsOrContact", {
        productName: getBrandName("ProductName"),
      });

    return (
      <Trans
        t={t}
        i18nKey="RoomQuotaDescription"
        values={{
          productName: getBrandName("ProductName"),
        }}
        components={{
          1: (
            <Link
              fontSize="12px"
              fontWeight="400"
              color={currentColorScheme?.main?.accent}
              className="error_description_link"
              onClick={onClickAction}
            />
          ),
        }}
      />
    );
  };
  const getQuotaInfo = () => {
    switch (type) {
      case QuotaBarTypes.RoomsTariff:
        return {
          header: t("RoomQuotaHeader", { currentValue, maxValue }),
          description: getRoomsTariffDescription(),
        };
      case QuotaBarTypes.RoomsTariffLimit:
        return {
          header: t("RoomQuotaHeaderLimit", { currentValue, maxValue }),
          description: getRoomsTariffDescription(),
        };
      case QuotaBarTypes.StorageTariff:
        return {
          header: t("StorageQuotaHeader", { currentValue, maxValue }),
          description: getStorageTariffDescription(),
        };
      case QuotaBarTypes.StorageTariffLimit:
        return {
          header: t("StorageLimitHeader", { currentValue, maxValue }),
          description: getStorageTariffDescription(),
        };
      case QuotaBarTypes.StorageQuota:
        return {
          header: t("StorageQuotaHeader", { currentValue, maxValue }),
          description: getTenantCustomQuota(),
        };
      case QuotaBarTypes.StorageQuotaLimit:
        return {
          header: t("StorageLimitHeader", { currentValue, maxValue }),
          description: getTenantCustomQuota(),
        };
      case QuotaBarTypes.UsersTariff:
        return {
          header: t("UserQuotaHeader", { currentValue, maxValue }),
          description: getUserTariffAlmostLimit(),
        };
      case QuotaBarTypes.UsersTariffLimit:
        return {
          header: t("UserTariffLimitHeader", { currentValue, maxValue }),
          description: getUserTariffLimit(),
        };
      case QuotaBarTypes.UserAndStorageTariff:
        return {
          header: t("StorageAndUserHeader"),
          description: getUpgradeTariffDescription(),
        };
      case QuotaBarTypes.UserAndStorageTariffLimit:
        return {
          header: t("StorageAndUserTariffLimitHeader"),
          description: getUpgradeTariffDescription(),
        };
      case QuotaBarTypes.RoomsAndStorageTariff:
        return {
          header: t("StorageAndRoomHeader"),
          description: getUpgradeTariffDescription(),
        };
      case QuotaBarTypes.RoomsAndStorageTariffLimit:
        return {
          header: t("StorageAndRoomLimitHeader"),
          description: getUpgradeTariffDescription(),
        };
      case QuotaBarTypes.PersonalUserQuota:
        return {
          header: getPersonalQuotaHeader(),
          description: getPersonalQuotaDescription(),
        };

      default:
        return null;
    }
  };

  const quotaInfo = getQuotaInfo();

  return tReady && quotaInfo ? (
    <SnackBar
      headerText={quotaInfo.header}
      text={quotaInfo.description}
      isCampaigns={false}
      opacity={1}
      onLoad={onLoad}
      onAction={onCloseAction}
      showIcon
    />
  ) : null;
};

export default withTranslation(["MainBar"])(QuotasBar);
