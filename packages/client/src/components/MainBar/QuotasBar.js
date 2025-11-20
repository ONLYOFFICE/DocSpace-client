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
import { withTranslation, Trans } from "react-i18next";

import { SnackBar } from "@docspace/shared/components/snackbar";

import { Link } from "@docspace/shared/components/link";
import { QuotaBarTypes } from "SRC_DIR/helpers/constants";

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
        productName: t("Common:ProductName"),
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
        productName: t("Common:ProductName"),
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
      return t("UserTariffReached", { productName: t("Common:ProductName") });

    return (
      <Trans
        t={t}
        i18nKey="UserTariffReachedForAdmins"
        values={{
          productName: t("Common:ProductName"),
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
        productName: t("Common:ProductName"),
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
        productName: t("Common:ProductName"),
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
        productName: t("Common:ProductName"),
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
        productName: t("Common:ProductName"),
      });

    return (
      <Trans
        t={t}
        i18nKey="RoomQuotaDescription"
        values={{
          productName: t("Common:ProductName"),
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
