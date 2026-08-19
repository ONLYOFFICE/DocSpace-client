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

import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import difference from "lodash/difference";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { ADS_TIMEOUT } from "SRC_DIR/helpers/filesConstants";
import { AnalyticsEvents } from "@docspace/ui-kit/enums";

import { getConvertedSize } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { getBannerAttribute } from "@docspace/shared/utils";
import { SnackBar } from "@docspace/ui-kit/components/snackbar";
import { QuotaBarTypes } from "SRC_DIR/helpers/constants";

import { showEmailActivationToast } from "SRC_DIR/helpers/people-helpers";
import ClientSimpleTopUpDialog from "SRC_DIR/components/EmptyContainer/sub-components/EmptyViewContainer/ClientSimpleTopUpDialog";

import QuotasBar from "./QuotasBar";
import ConfirmEmailBar from "./ConfirmEmailBar";

const WALLET_LOW_BALANCE_CLOSED = "walletLowBalanceClosed";

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
    walletLowBalance,
    formatWalletCurrency,
    isPayer,
    walletCustomerEmail,
    walletCustomerDisplayName,
    language,
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
    walletLowBalance: false,
  });

  const [isTopUpVisible, setIsTopUpVisible] = useState(false);
  const [htmlLink, setHtmlLink] = useState();
  const [campaigns, setCampaigns] = useState();

  const { loadLanguagePath } = getBannerAttribute();

  const onCloseQuota = (currentBar) => {
    // The tariff bars stay closed for good — they are resolved by an upgrade.
    // A low balance is cyclical, so its dismissal is kept per session instead:
    // it survives a reload of the same dip, but a later dip is announced again.
    if (currentBar === QuotaBarTypes.WalletLowBalance) {
      sessionStorage.setItem(WALLET_LOW_BALANCE_CLOSED, "true");
      setBarVisible((value) => ({ ...value, walletLowBalance: false }));
      return;
    }

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
    if (type === QuotaBarTypes.WalletLowBalance) {
      setIsTopUpVisible(true);
      return;
    }

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
      if (!sessionStorage.getItem(WALLET_LOW_BALANCE_CLOSED)) {
        setBarVisible((value) => ({ ...value, walletLowBalance: true }));
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
        walletLowBalance: !sessionStorage.getItem(WALLET_LOW_BALANCE_CLOSED),
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

  // The backend re-arms its own notification once the balance recovers, so the
  // dismissal is dropped on the same edge. Guarded on the true -> false
  // transition: the initial value is false too, and clearing on that would let a
  // reload resurrect a banner the user had already closed for the current dip.
  const wasLowBalance = React.useRef(false);

  useEffect(() => {
    if (walletLowBalance) {
      wasLowBalance.current = true;
      return;
    }

    if (!wasLowBalance.current) return;
    wasLowBalance.current = false;

    sessionStorage.removeItem(WALLET_LOW_BALANCE_CLOSED);
    setBarVisible((value) => ({ ...value, walletLowBalance: true }));
  }, [walletLowBalance]);

  const getCurrentBar = () => {
    if (isAdmin && walletLowBalance && barVisible.walletLowBalance) {
      return {
        type: QuotaBarTypes.WalletLowBalance,
        maxValue: null,
        currentValue: formatWalletCurrency?.(),
      };
    }

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

  const pushLimitEvent = React.useCallback((context) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer?.push({ event: AnalyticsEvents.LimitReached, context });
  }, []);

  React.useEffect(() => {
    if (isRoomsTariffLimit) pushLimitEvent("rooms");
  }, [isRoomsTariffLimit, pushLimitEvent]);

  React.useEffect(() => {
    if (isUserTariffLimit) pushLimitEvent("admins");
  }, [isUserTariffLimit, pushLimitEvent]);

  React.useEffect(() => {
    if (isStorageTariffLimit || isStorageQuotaLimit) pushLimitEvent("storage");
  }, [isStorageTariffLimit, isStorageQuotaLimit, pushLimitEvent]);

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

  const topUpDialog = isTopUpVisible ? (
    <ClientSimpleTopUpDialog
      visible={isTopUpVisible}
      onClose={() => setIsTopUpVisible(false)}
      language={language}
      service=""
    />
  ) : null;

  return showQuotasBar ? (
    <>
      <QuotasBar
        currentColorScheme={currentColorScheme}
        {...currentBar}
        onClick={onClickQuota}
        onClose={onCloseQuota}
        onClickTenantCustomQuota={onClickTenantCustomQuota}
        onLoad={onLoad}
        isAdmin={isAdmin}
        isPayer={isPayer}
        walletCustomerEmail={walletCustomerEmail}
        walletCustomerDisplayName={walletCustomerDisplayName}
      />
      {topUpDialog}
    </>
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
  ({
    settingsStore,
    profileActionsStore,
    userStore,
    currentQuotaStore,
    currentTariffStatusStore,
    paymentStore,
    authStore,
  }) => {
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

    const { formatWalletCurrency, isPayer } = paymentStore;
    const { walletLowBalance } = settingsStore;
    const { language } = authStore;
    const { walletCustomerEmail, walletCustomerInfo } =
      currentTariffStatusStore;

    return {
      isAdmin: user?.isAdmin || user?.isOwner,
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

      walletLowBalance,
      language,
      formatWalletCurrency,
      isPayer,
      walletCustomerEmail,
      walletCustomerDisplayName: walletCustomerInfo?.displayName,
    };
  },
)(withTranslation(["Profile", "Common"])(observer(Bar)));
