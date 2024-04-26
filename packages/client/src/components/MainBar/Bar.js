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

import React, { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import difference from "lodash/difference";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ADS_TIMEOUT } from "@docspace/client/src/helpers/filesConstants";

import { getConvertedSize } from "@docspace/shared/utils/common";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { getBannerAttribute } from "@docspace/shared/utils";
import { SnackBar } from "@docspace/shared/components/snackbar";
import { QuotaBarTypes } from "SRC_DIR/helpers/constants";

import QuotasBar from "./QuotasBar";
import ConfirmEmailBar from "./ConfirmEmailBar";
import { showEmailActivationToast } from "SRC_DIR/helpers/people-helpers";

const Bar = (props) => {
  const {
    t,
    tReady,
    firstLoad,

    isAdmin,
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

    showRoomQuotaBar,
    showStorageQuotaBar,
    showUserQuotaBar,

    currentColorScheme,

    setMainBarVisible,
    showUserPersonalQuotaBar,

    tenantCustomQuota,
    showTenantCustomQuotaBar,
  } = props;

  const navigate = useNavigate();

  const [barVisible, setBarVisible] = useState({
    roomQuota: false,
    storageQuota: false,
    tenantCustomQuota: false,
    userQuota: false,
    storageAndUserQuota: false,
    storageAndRoomQuota: false,
    confirmEmail: false,
    personalUserQuota: false,
  });

  const [htmlLink, setHtmlLink] = useState();
  const [campaigns, setCampaigns] = useState();

  const { loadLanguagePath } = getBannerAttribute();

  const updateBanner = React.useCallback(async () => {
    const bar = (localStorage.getItem("bar") || "")
      .split(",")
      .filter((bar) => bar.length > 0);

    const closed = JSON.parse(localStorage.getItem("barClose"));

    const banner = difference(bar, closed);

    let index = Number(localStorage.getItem("barIndex") || 0);

    if (banner.length < 1 || index + 1 >= banner.length) {
      index = 0;
    } else {
      index++;
    }

    if (closed) {
      if (isAdmin) {
        setBarVisible((value) => ({
          ...value,
          roomQuota: !closed.includes(QuotaBarTypes.RoomQuota),
          storageQuota: !closed.includes(QuotaBarTypes.StorageQuota),
          tenantCustomQuota: !closed.includes(QuotaBarTypes.TenantCustomQuota),
          userQuota: !closed.includes(QuotaBarTypes.UserQuota),
          storageAndRoomQuota: !closed.includes(
            QuotaBarTypes.UserAndStorageQuota,
          ),
          storageAndUserQuota: !closed.includes(
            QuotaBarTypes.RoomAndStorageQuota,
          ),
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
        roomQuota: isAdmin,
        storageQuota: isAdmin,
        tenantCustomQuota: isAdmin,
        userQuota: isAdmin,
        storageAndUserQuota: isAdmin,
        storageAndRoomQuota: isAdmin,
        confirmEmail: true,
        personalUserQuota: true,
      });
    }

    try {
      const [htmlUrl, campaigns] = await loadLanguagePath();

      setHtmlLink(htmlUrl);
      setCampaigns(campaigns);
    } catch (e) {
      updateBanner();
    }

    localStorage.setItem("barIndex", index);
    return;
  }, []);

  useEffect(() => {
    const updateTimeout = setTimeout(() => updateBanner(), 1000);
    const updateInterval = setInterval(updateBanner, ADS_TIMEOUT);
    return () => {
      clearTimeout(updateTimeout);
      clearInterval(updateInterval);
    };
  }, []);

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

  const onClickQuota = (type) => {
    type === QuotaBarTypes.StorageQuota && onPaymentsClick && onPaymentsClick();
    type === QuotaBarTypes.TenantCustomQuota && onClickTenantCustomQuota();

    onCloseQuota(type);
  };

  const onClickTenantCustomQuota = (type) => {
    const managementPageUrl = combineUrl(
      "/portal-settings",
      "/management/disk-space",
    );

    navigate(managementPageUrl);

    onCloseQuota(type);
  };

  const onCloseQuota = (currentBar) => {
    const closeItems = JSON.parse(localStorage.getItem("barClose")) || [];

    const closed =
      closeItems.length > 0 ? [...closeItems, currentBar] : [currentBar];

    localStorage.setItem("barClose", JSON.stringify(closed));

    switch (currentBar) {
      case QuotaBarTypes.RoomQuota:
        setBarVisible((value) => ({ ...value, roomQuota: false }));
        break;
      case QuotaBarTypes.StorageQuota:
        setBarVisible((value) => ({ ...value, storageQuota: false }));
        break;
      case QuotaBarTypes.TenantCustomQuota:
        setBarVisible((value) => ({ ...value, tenantCustomQuota: false }));
        break;
      case QuotaBarTypes.UserQuota:
        setBarVisible((value) => ({ ...value, userQuota: false }));
        break;
      case QuotaBarTypes.UserAndStorageQuota:
        setBarVisible((value) => ({ ...value, storageAndUserQuota: false }));
        break;
      case QuotaBarTypes.RoomAndStorageQuota:
        setBarVisible((value) => ({ ...value, storageAndRoomQuota: false }));
        break;
      case QuotaBarTypes.PersonalUserQuota:
        setBarVisible((value) => ({ ...value, personalUserQuota: false }));
        break;
    }

    setMaintenanceExist(false);
  };

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

  const getCurrentBar = () => {
    if (
      showRoomQuotaBar &&
      showStorageQuotaBar &&
      barVisible.storageAndRoomQuota
    ) {
      return {
        type: QuotaBarTypes.RoomAndStorageQuota,
        maxValue: null,
        currentValue: null,
      };
    }
    if (
      showUserQuotaBar &&
      showStorageQuotaBar &&
      barVisible.storageAndUserQuota
    ) {
      return {
        type: QuotaBarTypes.UserAndStorageQuota,
        maxValue: null,
        currentValue: null,
      };
    }

    if (showRoomQuotaBar && barVisible.roomQuota) {
      return {
        type: QuotaBarTypes.RoomQuota,
        maxValue: maxCountRoomsByQuota,
        currentValue: usedRoomsCount,
      };
    }
    if (showStorageQuotaBar && barVisible.storageQuota) {
      return {
        type: QuotaBarTypes.StorageQuota,
        maxValue: getConvertedSize(t, maxTotalSizeByQuota),
        currentValue: getConvertedSize(t, usedTotalStorageSizeCount),
      };
    }
    if (showTenantCustomQuotaBar && barVisible.tenantCustomQuota) {
      return {
        type: QuotaBarTypes.TenantCustomQuota,
        maxValue: getConvertedSize(t, tenantCustomQuota),
        currentValue: getConvertedSize(t, usedTotalStorageSizeCount),
      };
    }

    if (showUserQuotaBar && barVisible.userQuota) {
      return {
        type: QuotaBarTypes.UserQuota,
        maxValue: maxCountManagersByQuota,
        currentValue: addedManagersCount,
      };
    }

    if (showUserPersonalQuotaBar && barVisible.personalUserQuota) {
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
      isCampaigns={true}
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

      showRoomQuotaBar,
      showStorageQuotaBar,
      showUserQuotaBar,
      showUserPersonalQuotaBar,
      tenantCustomQuota,
      showTenantCustomQuotaBar,
    } = currentQuotaStore;

    const { currentColorScheme, setMainBarVisible } = settingsStore;

    return {
      isAdmin: user?.isAdmin,
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

      showRoomQuotaBar,
      showStorageQuotaBar,
      showUserQuotaBar,

      currentColorScheme,
      setMainBarVisible,

      showUserPersonalQuotaBar,
      tenantCustomQuota,
      showTenantCustomQuotaBar,
    };
  },
)(withTranslation(["Profile", "Common"])(observer(Bar)));
