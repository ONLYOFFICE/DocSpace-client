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

import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import difference from "lodash/difference";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { ADS_TIMEOUT } from "SRC_DIR/helpers/filesConstants";

import { getConvertedSize } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { getBannerAttribute } from "@docspace/shared/utils";
import { SnackBar } from "@docspace/shared/components/snackbar";
import { QuotaBarTypes } from "SRC_DIR/helpers/constants";

import { showEmailActivationToast } from "SRC_DIR/helpers/people-helpers";
import QuotasBar from "./QuotasBar";
import ConfirmEmailBar from "./ConfirmEmailBar";

const Bar = (props) => {
  const {
    t,
    tReady,
    firstLoad,

    isAdmin,
    isUser,
    isRoomAdmin,
    userEmail,
    setMaintenanceExist,
    withActivationBar,
    sendActivationLink,

    onPaymentsClick,

    maxCountRoomsByQuota,
    usedRoomsCount,

    maxTotalSizeByQuota,
    usedTotalStorageSizeCount,

    maxCountManagersByQuota,
    addedManagersCount,

    isStorageTariffAlmostLimit,
    isUserTariffAlmostLimit,

    currentColorScheme,

    setMainBarVisible,
    isPersonalQuotaLimit,

    tenantCustomQuota,
    isStorageTariffLimit,
    isUserTariffLimit,
    isStorageQuotaAlmostLimit,
    isStorageQuotaLimit,
    isRoomsTariffAlmostLimit,
    isRoomsTariffLimit,
  } = props;

  const navigate = useNavigate();

  const [barVisible, setBarVisible] = useState({
    roomsTariff: false,
    roomsTariffLimit: false,
    storageTariff: false,
    storageTariffLimit: false,
    storageQuota: false,
    storageQuotaLimit: false,
    usersTariff: false,
    usersTariffLimit: false,
    storageAndUserTariff: false,
    storageAndUserTariffLimit: false,
    roomsAndStorageTariff: false,
    roomsAndStorageTariffLimit: false,
    confirmEmail: false,
    personalUserQuota: false,
  });

  const [htmlLink, setHtmlLink] = useState();
  const [campaigns, setCampaigns] = useState();

  const { loadLanguagePath } = getBannerAttribute();

  const onCloseQuota = (currentBar) => {
    const closeItems = JSON.parse(localStorage.getItem("barClose")) || [];

    const closed =
      closeItems.length > 0 ? [...closeItems, currentBar] : [currentBar];

    localStorage.setItem("barClose", JSON.stringify(closed));

    switch (currentBar) {
      case QuotaBarTypes.RoomsTariff:
        setBarVisible((value) => ({ ...value, roomsTariff: false }));
        break;
      case QuotaBarTypes.RoomsTariffLimit:
        setBarVisible((value) => ({ ...value, roomsTariffLimit: false }));
        break;
      case QuotaBarTypes.StorageTariff:
        setBarVisible((value) => ({ ...value, storageTariff: false }));
        break;
      case QuotaBarTypes.StorageTariffLimit:
        setBarVisible((value) => ({ ...value, storageTariffLimit: false }));
        break;
      case QuotaBarTypes.StorageQuota:
        setBarVisible((value) => ({ ...value, storageQuota: false }));
        break;
      case QuotaBarTypes.StorageQuotaLimit:
        setBarVisible((value) => ({ ...value, storageQuotaLimit: false }));
        break;
      case QuotaBarTypes.UsersTariff:
        setBarVisible((value) => ({
          ...value,
          usersTariff: false,
        }));
        break;
      case QuotaBarTypes.UsersTariffLimit:
        setBarVisible((value) => ({
          ...value,
          usersTariffLimit: false,
        }));
        break;
      case QuotaBarTypes.UserAndStorageTariff:
        setBarVisible((value) => ({ ...value, storageAndUserTariff: false }));
        break;
      case QuotaBarTypes.UserAndStorageTariffLimit:
        setBarVisible((value) => ({
          ...value,
          storageAndUserTariffLimit: false,
        }));
        break;
      case QuotaBarTypes.RoomsAndStorageTariff:
        setBarVisible((value) => ({ ...value, roomsAndStorageTariff: false }));
        break;
      case QuotaBarTypes.RoomsAndStorageTariffLimit:
        setBarVisible((value) => ({
          ...value,
          roomsAndStorageTariffLimit: false,
        }));
        break;
      case QuotaBarTypes.PersonalUserQuota:
        setBarVisible((value) => ({ ...value, personalUserQuota: false }));
        break;
      default:
        break;
    }

    setMaintenanceExist(false);
  };

  const onClickTenantCustomQuota = (type) => {
    const managementPageUrl = combineUrl(
      "/portal-settings",
      "/management/disk-space",
    );

    navigate(managementPageUrl);

    onCloseQuota(type);
  };

  const onClickQuota = (type, e) => {
    type === QuotaBarTypes.StorageQuota ||
    type === QuotaBarTypes.PersonalUserQuota
      ? onClickTenantCustomQuota(type)
      : onPaymentsClick(e);

    onCloseQuota(type);
  };

  const sendActivationLinkAction = () => {
    sendActivationLink && sendActivationLink().then(showEmailActivationToast);
  };

  const onCloseActivationBar = () => {
    const closeItems = JSON.parse(localStorage.getItem("barClose")) || [];

    const closed =
      closeItems.length > 0
        ? [...closeItems, QuotaBarTypes.ConfirmEmail]
        : [QuotaBarTypes.ConfirmEmail];

    localStorage.setItem("barClose", JSON.stringify(closed));

    setBarVisible((value) => ({ ...value, confirmEmail: false }));
    setMaintenanceExist(false);
  };

  const updateBanner = React.useCallback(async () => {
    const bar = (localStorage.getItem("bar") || "")
      .split(",")
      .filter((elm) => elm.length > 0);

    const closed = JSON.parse(localStorage.getItem("barClose"));

    const banner = difference(bar, closed);

    let index = Number(localStorage.getItem("barIndex") || 0);

    if (banner.length < 1 || index + 1 >= banner.length) {
      index = 0;
    } else {
      index++;
    }

    if (closed) {
      if (isAdmin || isRoomAdmin) {
        setBarVisible((value) => ({
          ...value,
          roomsTariff: !closed.includes(QuotaBarTypes.RoomsTariff),
          roomsTariffLimit: !closed.includes(QuotaBarTypes.RoomsTariffLimit),
          usersTariffLimit: !closed.includes(QuotaBarTypes.UsersTariffLimit),
          usersTariff: !closed.includes(QuotaBarTypes.UsersTariff),
          storageAndUserTariff: !closed.includes(
            QuotaBarTypes.UserAndStorageTariff,
          ),
          roomsAndStorageTariff: closed.includes(
            QuotaBarTypes.RoomsAndStorageTariff,
          ),
          roomsAndStorageTariffLimit: closed.includes(
            QuotaBarTypes.RoomsAndStorageTariffLimit,
          ),
          storageAndUserTariffLimit: !closed.includes(
            QuotaBarTypes.UserAndStorageTariffLimit,
          ),
        }));
      }

      if (isAdmin || isUser || isRoomAdmin) {
        setBarVisible((value) => ({
          ...value,
          storageTariff: !closed.includes(QuotaBarTypes.StorageTariff),
          storageTariffLimit: !closed.includes(
            QuotaBarTypes.StorageTariffLimit,
          ),
          storageQuota: !closed.includes(QuotaBarTypes.StorageQuota),
          storageQuotaLimit: !closed.includes(QuotaBarTypes.StorageQuotaLimit),
          personalUserQuota: !closed.includes(QuotaBarTypes.PersonalUserQuota),
        }));
      }

      if (!closed.includes(QuotaBarTypes.ConfirmEmail)) {
        setBarVisible((value) => ({ ...value, confirmEmail: true }));
      }
      if (!closed.includes(QuotaBarTypes.PersonalUserQuota)) {
        setBarVisible((value) => ({ ...value, personalUserQuota: true }));
      }
    } else {
      setBarVisible({
        roomsTariff: isAdmin || isRoomAdmin,
        roomsTariffLimit: isAdmin || isRoomAdmin,
        storageTariff: isAdmin || isUser || isRoomAdmin,
        storageTariffLimit: isAdmin || isUser || isRoomAdmin,
        storageQuota: isAdmin || isUser || isRoomAdmin,
        storageQuotaLimit: isAdmin || isUser || isRoomAdmin,
        usersTariff: isAdmin || isRoomAdmin,
        usersTariffLimit: isAdmin || isRoomAdmin,
        storageAndUserTariff: isAdmin || isRoomAdmin,
        roomsAndStorageTariff: isAdmin || isRoomAdmin,
        roomsAndStorageTariffLimit: isAdmin || isRoomAdmin,
        storageAndUserTariffLimit: isAdmin || isRoomAdmin,
        confirmEmail: true,
        personalUserQuota: isAdmin || isUser || isRoomAdmin,
      });
    }

    try {
      const [htmlUrl, currentBar] = await loadLanguagePath();

      setHtmlLink(htmlUrl);
      setCampaigns(currentBar);
    } catch (e) {
      console.error(e);
      updateBanner();
    }

    localStorage.setItem("barIndex", index);
  }, []);

  useEffect(() => {
    const updateTimeout = setTimeout(() => updateBanner(), 1000);
    const updateInterval = setInterval(() => updateBanner(), ADS_TIMEOUT);
    return () => {
      clearTimeout(updateTimeout);
      clearInterval(updateInterval);
    };
  }, []);

  useEffect(() => {
    updateBanner();
  }, [t]);

  const getCurrentBar = () => {
    if (
      isRoomsTariffAlmostLimit &&
      isStorageTariffAlmostLimit &&
      barVisible.roomsAndStorageTariff
    ) {
      return {
        type: QuotaBarTypes.RoomsAndStorageTariff,
        maxValue: null,
        currentValue: null,
      };
    }

    if (
      isRoomsTariffLimit &&
      isStorageTariffLimit &&
      barVisible.roomsAndStorageTariffLimit
    ) {
      return {
        type: QuotaBarTypes.RoomsAndStorageTariffLimit,
        maxValue: null,
        currentValue: null,
      };
    }

    if (
      isUserTariffAlmostLimit &&
      isStorageTariffAlmostLimit &&
      barVisible.storageAndUserTariff
    ) {
      return {
        type: QuotaBarTypes.UserAndStorageTariff,
        maxValue: null,
        currentValue: null,
      };
    }

    if (
      isUserTariffLimit &&
      isStorageTariffLimit &&
      barVisible.storageAndUserTariffLimit
    ) {
      return {
        type: QuotaBarTypes.UserAndStorageTariffLimit,
        maxValue: null,
        currentValue: null,
      };
    }
    if (isRoomsTariffAlmostLimit && barVisible.roomsTariff) {
      return {
        type: QuotaBarTypes.RoomsTariff,
        maxValue: maxCountRoomsByQuota,
        currentValue: usedRoomsCount,
      };
    }
    if (isRoomsTariffLimit && barVisible.roomsTariffLimit) {
      return {
        type: QuotaBarTypes.RoomsTariffLimit,
        maxValue: maxCountRoomsByQuota,
        currentValue: usedRoomsCount,
      };
    }
    if (isStorageQuotaAlmostLimit && barVisible.storageQuota) {
      return {
        type: QuotaBarTypes.StorageQuota,
        maxValue: getConvertedSize(t, tenantCustomQuota),
        currentValue: getConvertedSize(t, usedTotalStorageSizeCount),
      };
    }

    if (isStorageQuotaLimit && barVisible.storageQuotaLimit) {
      return {
        type: QuotaBarTypes.StorageQuotaLimit,
        maxValue: getConvertedSize(t, tenantCustomQuota),
        currentValue: getConvertedSize(t, usedTotalStorageSizeCount),
      };
    }

    if (isStorageTariffAlmostLimit && barVisible.storageTariff) {
      return {
        type: QuotaBarTypes.StorageTariff,
        maxValue: getConvertedSize(t, maxTotalSizeByQuota),
        currentValue: getConvertedSize(t, usedTotalStorageSizeCount),
      };
    }

    if (isStorageTariffLimit && barVisible.storageTariffLimit) {
      return {
        type: QuotaBarTypes.StorageTariffLimit,
        maxValue: getConvertedSize(t, maxTotalSizeByQuota),
        currentValue: getConvertedSize(t, usedTotalStorageSizeCount),
      };
    }

    if (isUserTariffLimit && barVisible.usersTariffLimit) {
      return {
        type: QuotaBarTypes.UsersTariffLimit,
        maxValue: maxCountManagersByQuota,
        currentValue: addedManagersCount,
      };
    }

    if (isUserTariffAlmostLimit && barVisible.usersTariff) {
      return {
        type: QuotaBarTypes.UsersTariff,
        maxValue: maxCountManagersByQuota,
        currentValue: addedManagersCount,
      };
    }

    if (isPersonalQuotaLimit && barVisible.personalUserQuota) {
      return {
        type: QuotaBarTypes.PersonalUserQuota,
      };
    }

    return null;
  };

  const currentBar = getCurrentBar();

  const showQuotasBar = !!currentBar && tReady;

  React.useEffect(() => {
    const newValue =
      showQuotasBar ||
      (withActivationBar && barVisible.confirmEmail && tReady) ||
      (htmlLink && !firstLoad && tReady);

    setMainBarVisible(newValue);

    return () => {
      setMainBarVisible(false);
    };
  }, [
    showQuotasBar,
    withActivationBar,
    barVisible.confirmEmail,
    tReady,
    htmlLink,
    firstLoad,
  ]);

  const onClose = () => {
    setMaintenanceExist(false);
    const closeItems = JSON.parse(localStorage.getItem("barClose")) || [];
    const closed =
      closeItems.length > 0 ? [...closeItems, campaigns] : [campaigns];
    localStorage.setItem("barClose", JSON.stringify(closed));
    setHtmlLink(null);
  };

  const onLoad = () => {
    setMaintenanceExist(true);
  };

  return showQuotasBar ? (
    <QuotasBar
      currentColorScheme={currentColorScheme}
      {...currentBar}
      onClick={onClickQuota}
      onClose={onCloseQuota}
      onClickTenantCustomQuota={onClickTenantCustomQuota}
      onLoad={onLoad}
      isAdmin={isAdmin}
    />
  ) : withActivationBar && barVisible.confirmEmail && tReady ? (
    <ConfirmEmailBar
      userEmail={userEmail}
      currentColorScheme={currentColorScheme}
      onLoad={onLoad}
      onClick={sendActivationLinkAction}
      onClose={onCloseActivationBar}
    />
  ) : htmlLink && !firstLoad && tReady ? (
    <SnackBar
      onLoad={onLoad}
      onAction={onClose}
      isCampaigns
      htmlContent={htmlLink}
    />
  ) : null;
};

export default inject(
  ({ settingsStore, profileActionsStore, userStore, currentQuotaStore }) => {
    const { user, withActivationBar, sendActivationLink } = userStore;

    const { onPaymentsClick } = profileActionsStore;

    const {
      maxCountRoomsByQuota,
      usedRoomsCount,

      maxTotalSizeByQuota,
      usedTotalStorageSizeCount,

      maxCountManagersByQuota,
      addedManagersCount,

      isStorageTariffAlmostLimit,
      isUserTariffAlmostLimit,
      isPersonalQuotaLimit,
      tenantCustomQuota,
      isStorageTariffLimit,
      isUserTariffLimit,
      isStorageQuotaAlmostLimit,
      isStorageQuotaLimit,
      isRoomsTariffAlmostLimit,
      isRoomsTariffLimit,
    } = currentQuotaStore;

    const { currentColorScheme, setMainBarVisible } = settingsStore;

    return {
      isAdmin: user?.isAdmin,
      isUser: user?.isCollaborator,
      isRoomAdmin: user?.isRoomAdmin,
      userEmail: user?.email,
      withActivationBar,
      sendActivationLink,

      onPaymentsClick,

      maxCountRoomsByQuota,
      usedRoomsCount,

      maxTotalSizeByQuota,
      usedTotalStorageSizeCount,

      maxCountManagersByQuota,
      addedManagersCount,

      isStorageTariffAlmostLimit,
      isUserTariffAlmostLimit,

      currentColorScheme,
      setMainBarVisible,

      isPersonalQuotaLimit,
      tenantCustomQuota,
      isStorageTariffLimit,
      isUserTariffLimit,
      isStorageQuotaAlmostLimit,
      isStorageQuotaLimit,
      isRoomsTariffAlmostLimit,
      isRoomsTariffLimit,
    };
  },
)(withTranslation(["Profile", "Common"])(observer(Bar)));
