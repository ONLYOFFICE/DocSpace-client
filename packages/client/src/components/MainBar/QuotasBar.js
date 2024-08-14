// (c) Copyright Ascensio System SIA 2009-2024
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
import styled, { css } from "styled-components";

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

  const getStorageQuotaDescription = () => {
    if (!isAdmin) return t("StorageQuotaUserDescription");

    return (
      <Trans
        i18nKey="StorageQuotaDescription"
        t={t}
        values={{ productName: t("Common:ProductName") }}
      >
        You can remove the unnecessary files or
        <Link
          fontSize="12px"
          fontWeight="400"
          color={currentColorScheme?.main?.accent}
          onClick={onClickAction}
        >
          {{ clickHere: t("ClickHere").toLowerCase() }}
        </Link>{" "}
        to find a better pricing plan for your portal.
      </Trans>
    );
  };
  const getTenantCustomQuota = () => {
    if (!isAdmin) return t("StorageQuotaUserDescription");

    return (
      <Trans i18nKey="TenantCustomQuotaDescription" t={t}>
        You can remove the unnecessary files or change quota in the
        <Link
          fontSize="12px"
          fontWeight="400"
          color={currentColorScheme?.main?.accent}
          onClick={onClickAction}
        >
          Storage management settings.
        </Link>
      </Trans>
    );
  };
  const getUserQuotaDescription = () => {
    if (!isAdmin) return t("UserTariffAlmostReached");

    return (
      <Trans
        t={t}
        i18nKey="UserTariffAlmostReachedForAdmins"
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
  const getUserTariffAlmostLimit = () => {
    if (!isAdmin)
      return t("UserTariffAlmostReached", {
        productName: t("Common:ProductName"),
      });

    return (
      <Trans
        t={t}
        i18nKey="UserTariffAlmostReachedForAdmins"
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

  const getUserTariffLimit = () => {
    if (!isAdmin) return t("UserTariffReached");

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
  const getQuotaInfo = () => {
    switch (type) {
      case QuotaBarTypes.RoomQuota:
        return {
          header: t("RoomQuotaHeader", { currentValue, maxValue }),
          description: (
            <Trans
              i18nKey="RoomQuotaDescription"
              t={t}
              values={{ productName: t("Common:ProductName") }}
            >
              You can archived the unnecessary rooms or
              <Link
                fontSize="12px"
                fontWeight="400"
                color={currentColorScheme?.main?.accent}
                onClick={onClickAction}
              >
                {{ clickHere: t("ClickHere").toLowerCase() }}
              </Link>{" "}
              to find a better pricing plan for your portal.
            </Trans>
          ),
        };
      case QuotaBarTypes.StorageTariff:
        return {
          header: t("StorageQuotaHeader", { currentValue, maxValue }),
          description: getStorageTariffDescription(),
        };
      case QuotaBarTypes.StorageTariffLimit:
        return {
          header: t("StorageTariffLimit", { currentValue, maxValue }),
          description: getStorageTariffDescription(),
        };
      case QuotaBarTypes.TenantCustomQuota:
        return {
          header: t("StorageQuotaHeader", { currentValue, maxValue }),
          description: getTenantCustomQuota(),
        };
      case QuotaBarTypes.UsersTariff:
        return {
          header: t("UserQuotaHeader", { currentValue, maxValue }),
          description: getUserTariffAlmostLimit(),
        };
      case QuotaBarTypes.TariffLimitPerUser:
        return {
          header: t("UserTariffLimit", { currentValue, maxValue }),
          description: getUserTariffLimit(),
        };
      case QuotaBarTypes.UserAndStorageQuota:
        return {
          header: t("StorageAndUserHeader", { currentValue, maxValue }),
          description: getUserQuotaDescription(),
        };
      case QuotaBarTypes.RoomAndStorageQuota:
        return {
          header: t("StorageAndRoomHeader", { currentValue, maxValue }),
          description: getUserQuotaDescription(),
        };
      case QuotaBarTypes.PersonalUserQuota:
        const description = !isAdmin ? (
          t("PersonalUserQuotaDescription")
        ) : (
          <Trans i18nKey="PersonalUserQuotaAdminsDescription" t={t}>
            To upload and create new files and folders, please free up disk
            space, or manage quota per user in the
            <Link
              fontSize="12px"
              fontWeight="400"
              color={currentColorScheme?.main?.accent}
              onClick={onClickAction}
            >
              Storage management settings.
            </Link>
          </Trans>
        );
        return {
          header: t("StorageQuotaExceeded"),
          description,
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
    />
  ) : (
    <></>
  );
};

export default withTranslation(["MainBar"])(QuotasBar);
