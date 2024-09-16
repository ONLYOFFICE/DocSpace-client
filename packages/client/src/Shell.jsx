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

import moment from "moment-timezone";
import React, { useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTheme } from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { isMobile, isIOS, isFirefox } from "react-device-detect";
import { toast as toastify } from "react-toastify";

import config from "PACKAGE_FILE";

import { Portal } from "@docspace/shared/components/portal";
import { SnackBar } from "@docspace/shared/components/snackbar";
import { Toast, toastr } from "@docspace/shared/components/toast";
import { ToastType } from "@docspace/shared/components/toast/Toast.enums";
import { getRestoreProgress } from "@docspace/shared/api/portal";
import { updateTempContent } from "@docspace/shared/utils/common";
import { DeviceType, IndexedDBStores } from "@docspace/shared/enums";
import indexedDbHelper from "@docspace/shared/utils/indexedDBHelper";
import { useThemeDetector } from "@docspace/shared/hooks/useThemeDetector";
import { sendToastReport } from "@docspace/shared/utils/crashReport";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import Main from "./components/Main";
import Layout from "./components/Layout";
import NavMenu from "./components/NavMenu";
import MainBar from "./components/MainBar";
import ScrollToTop from "./components/Layout/ScrollToTop";
import IndicatorLoader from "./components/IndicatorLoader";
import ErrorBoundary from "./components/ErrorBoundaryWrapper";
import DialogsWrapper from "./components/dialogs/DialogsWrapper";
import useCreateFileError from "./Hooks/useCreateFileError";

import ReactSmartBanner from "./components/SmartBanner";

const Shell = ({ items = [], page = "home", ...rest }) => {
  const {
    isLoaded,
    loadBaseInfo,

    isDesktop,
    language,
    FirebaseHelper,
    setCheckedMaintenance,
    socketHelper,
    setPreparationPortalDialogVisible,
    isBase,
    setTheme,
    setMaintenanceExist,
    roomsMode,
    setSnackbarExist,
    userTheme,
    //user,
    userId,
    userLoginEventId,
    currentDeviceType,
    timezone,
    showArticleLoader,
    setPortalTariff,
    setFormCreationInfo,
    setConvertPasswordDialogVisible,
    version,
    pagesWithoutNavMenu,
    isFrame,
    barTypeInFrame,
    setDataFromSocket,
    updateDataFromSocket,
    sessionLogout,
    setMultiConnections,
    sessionMultiLogout,
  } = rest;

  const theme = useTheme();

  useCreateFileError({
    setPortalTariff,
    setFormCreationInfo,
    setConvertPasswordDialogVisible,
  });

  useEffect(() => {
    const regex = /(\/){2,}/g;
    const replaceRegex = /(\/)+/g;
    const pathname = window.location.pathname;

    if (regex.test(pathname)) {
      window.location.replace(pathname.replace(replaceRegex, "$1"));
    }
  }, []);

  const moveToLastSession = useCallback((data) => {
    return data.map((item) => {
      if (item.status === "online" && item.sessions.length !== 0) {
        const {
          sessions: [first, ...ohterElement],
          ...otherField
        } = item;

        return {
          ...otherField,
          sessions: [...ohterElement, first],
        };
      }
      return item;
    });
  }, []);

  useEffect(() => {
    try {
      loadBaseInfo();
    } catch (err) {
      toastr.error(err);
    }
  }, []);

  useEffect(() => {
    moment.updateLocale("ar-sa", {
      longDateFormat: {
        LT: "h:mm a",
        LTS: "h:mm:ss a",
        L: "YYYY/MM/DD",
        LL: "YYYY MMMM D",
        LLL: "h:mm a YYYY MMMM D",
        LLLL: "h:mm a YYYY MMMM D dddd",
      },
    });

    moment.locale(language);
  }, []);

  useEffect(() => {
    if (!socketHelper.isEnabled) return;

    socketHelper.emit({
      command: "subscribeToPortal",
    });

    socketHelper.emit({
      command: "getSessionsInPortal",
    });

    socketHelper.on("statuses-in-portal", (data) => {
      const newData = moveToLastSession(data);

      setDataFromSocket(newData);
    });

    socketHelper.on("enter-in-portal", (data) => {
      const [newData] = moveToLastSession([data]);

      updateDataFromSocket(newData);
    });

    socketHelper.on("leave-in-portal", (data) => {
      sessionLogout(data);
    });

    socketHelper.on("enter-session-in-portal", (data) => {
      setMultiConnections(data);
    });

    socketHelper.on("leave-session-in-portal", (data) => {
      sessionMultiLogout(data);
    });
  }, [
    socketHelper,
    setDataFromSocket,
    updateDataFromSocket,
    sessionLogout,
    setMultiConnections,
    moveToLastSession,
    sessionMultiLogout,
  ]);

  useEffect(() => {
    socketHelper.emit({
      command: "subscribe",
      data: { roomParts: "backup-restore" },
    });

    socketHelper.on("restore-backup", () => {
      getRestoreProgress()
        .then((response) => {
          if (!response) {
            console.log(
              "Skip show <PreparationPortalDialog /> - empty progress response",
            );
            return;
          }
          setPreparationPortalDialogVisible(true);
        })
        .catch((e) => {
          console.error("getRestoreProgress", e);
        });
    });

    socketHelper.emit({
      command: "subscribe",
      data: { roomParts: "quota" },
    });

    socketHelper.emit({
      command: "subscribe",
      data: { roomParts: "QUOTA", individual: true },
    });

    socketHelper.emit({
      command: "subscribe",
      data: { roomParts: userId },
    });

    socketHelper.on("s:logout-session", (loginEventId) => {
      console.log(`[WS] "logout-session"`, loginEventId, userLoginEventId);

      if (userLoginEventId === loginEventId || loginEventId === 0) {
        window.location.replace(
          combineUrl(window.ClientConfig?.proxy?.url, "/login"),
        );
      }
    });
  }, [
    socketHelper,
    userLoginEventId,
    setPreparationPortalDialogVisible,
    userId,
  ]);

  const { t, ready } = useTranslation(["Common", "SmartBanner"]);

  let snackTimer = null;
  let fbInterval = null;
  let lastCampaignStr = null;
  const LS_CAMPAIGN_DATE = "maintenance_to_date";
  const DATE_FORMAT = "YYYY-MM-DD";
  const SNACKBAR_TIMEOUT = 10000;

  const setSnackBarTimer = (campaign) => {
    snackTimer = setTimeout(() => showSnackBar(campaign), SNACKBAR_TIMEOUT);
  };

  const clearSnackBarTimer = () => {
    if (!snackTimer) return;

    clearTimeout(snackTimer);
    snackTimer = null;
  };

  const showSnackBar = (campaign) => {
    clearSnackBarTimer();

    let skipMaintenance;

    const { fromDate, toDate, desktop } = campaign;

    console.log(
      `FB: 'bar/maintenance' desktop=${desktop} fromDate=${fromDate} toDate=${toDate}`,
    );

    if (!campaign || !fromDate || !toDate) {
      console.log("Skip snackBar by empty campaign params");
      skipMaintenance = true;
    }

    const to = moment(toDate).local();

    const watchedCampaignDateStr = localStorage.getItem(LS_CAMPAIGN_DATE);

    const campaignDateStr = to.format(DATE_FORMAT);
    if (campaignDateStr == watchedCampaignDateStr) {
      console.log("Skip snackBar by already watched");
      skipMaintenance = true;
    }

    const from = moment(fromDate).local();
    const now = moment();

    if (now.isBefore(from)) {
      setSnackBarTimer(campaign);

      SnackBar.close();
      console.log(`Show snackBar has been delayed for 1 minute`, now);
      skipMaintenance = true;
    }

    if (now.isAfter(to)) {
      console.log("Skip snackBar by current date", now);
      SnackBar.close();
      skipMaintenance = true;
    }

    if (isDesktop && !desktop) {
      console.log("Skip snackBar by desktop", desktop);
      SnackBar.close();
      skipMaintenance = true;
    }

    if (skipMaintenance) {
      setCheckedMaintenance(true);
      return;
    }

    setSnackBarTimer(campaign);

    if (!document.getElementById("main-bar")) return;

    const campaignStr = JSON.stringify(campaign);
    // let skipRender = lastCampaignStr === campaignStr;

    const hasChild = document.getElementById("main-bar").hasChildNodes();

    if (hasChild) return;

    lastCampaignStr = campaignStr;

    const targetDate = to.locale(language).format("LL");

    const barConfig = {
      parentElementId: "main-bar",
      headerText: t("Attention"),
      text: `${t("BarMaintenanceDescription", {
        targetDate: targetDate,
        productName: `${t("Common:OrganizationName")} ${t("Common:ProductName")}`,
      })} ${t("BarMaintenanceDisclaimer")}`,
      isMaintenance: true,
      onAction: () => {
        setMaintenanceExist(false);
        setSnackbarExist(false);
        SnackBar.close();
        localStorage.setItem(LS_CAMPAIGN_DATE, to.format(DATE_FORMAT));
      },
      opacity: 1,
      onLoad: () => {
        setCheckedMaintenance(true);
        setSnackbarExist(true);
        setMaintenanceExist(true);
      },
      theme,
    };

    SnackBar.show(barConfig);
  };

  const fetchMaintenance = () => {
    try {
      if (!FirebaseHelper.isEnabled) return;

      FirebaseHelper.checkMaintenance()
        .then((campaign) => {
          console.log("checkMaintenance", campaign);
          if (!campaign) {
            setCheckedMaintenance(true);
            clearSnackBarTimer();
            SnackBar.close();
            return;
          }

          setTimeout(() => showSnackBar(campaign), 1000);
        })
        .catch((err) => {
          console.error(err);
        });
    } catch (e) {
      console.log(e);
    }
  };

  const fetchBanners = () => {
    if (!FirebaseHelper.isEnabled) return;

    FirebaseHelper.checkBar()
      .then((bar) => {
        localStorage.setItem("bar", bar);
      })
      .catch((err) => {
        console.log(err);
      });

    FirebaseHelper.checkCampaigns()
      .then((campaigns) => {
        localStorage.setItem("docspace_campaigns", campaigns);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const initIndexedDb = React.useCallback(async () => {
    await indexedDbHelper.init(userId, [IndexedDBStores.images]);
  }, [userId]);

  useEffect(() => {
    if (!userId || !window.ClientConfig?.imageThumbnails) return;
    initIndexedDb();

    return () => {
      indexedDbHelper.deleteDatabase(userId);
    };
  }, [userId, initIndexedDb]);

  useEffect(() => {
    if (!isLoaded) return;

    updateTempContent();

    if (!FirebaseHelper.isEnabled) {
      setCheckedMaintenance(true);
      localStorage.setItem("campaigns", "");
      return;
    }

    fetchMaintenance();
    fetchBanners();
    fbInterval = setInterval(fetchMaintenance, 60000);
    const bannerInterval = setInterval(fetchBanners, 60000 * 720); // get every 12 hours

    return () => {
      if (fbInterval) {
        clearInterval(fbInterval);
      }
      clearInterval(bannerInterval);
      clearSnackBarTimer();
    };
  }, [isLoaded]);

  // fix night mode for IOS firefox
  useEffect(() => {
    if (isIOS && isMobile && isFirefox) {
      Array.from(document.querySelectorAll("style")).forEach((sheet) => {
        if (
          sheet?.textContent?.includes(
            "-webkit-filter: hue-rotate(180deg) invert(100%) !important;",
          )
        ) {
          sheet.parentNode?.removeChild(sheet);
        }
      });
    }
  }, []);

  useEffect(() => {
    console.log("Current page ", page);
  }, [page]);

  useEffect(() => {
    if (userTheme) setTheme(userTheme);
  }, [userTheme]);

  const pathname = window.location.pathname.toLowerCase();
  const isEditor = pathname.indexOf("doceditor") !== -1;

  const currentTheme = isBase ? "Base" : "Dark";
  const systemTheme = useThemeDetector();
  useEffect(() => {
    if (userTheme === "System" && currentTheme !== systemTheme)
      setTheme(systemTheme);
  }, [systemTheme]);

  useEffect(() => {
    if (!FirebaseHelper.isEnabled || !isLoaded) return;
    toastify.onChange((payload) => {
      if (
        payload.status === "added" &&
        (payload.type === ToastType.error || payload.type === ToastType.warning)
      ) {
        sendToastReport(
          userId,
          version,
          language,
          payload?.data,
          FirebaseHelper,
        );
      }
    });
  }, [isLoaded]);

  const rootElement = document.getElementById("root");

  const toast =
    currentDeviceType === DeviceType.mobile ? (
      <Portal element={<Toast />} appendTo={rootElement} visible={true} />
    ) : (
      <Toast />
    );
  const location = useLocation();

  const withoutNavMenu =
    isEditor ||
    pagesWithoutNavMenu ||
    location.pathname === "/access-restricted";

  return (
    <Layout>
      {toast}
      <ReactSmartBanner t={t} ready={ready} />
      {withoutNavMenu ? <></> : <NavMenu />}
      <IndicatorLoader />
      <ScrollToTop />
      <DialogsWrapper t={t} />

      <Main isDesktop={isDesktop}>
        {barTypeInFrame !== "none" && <MainBar />}
        <div className="main-container">
          <Outlet />
        </div>
      </Main>
    </Layout>
  );
};

const ShellWrapper = inject(
  ({
    authStore,
    settingsStore,
    backup,
    clientLoadingStore,
    userStore,
    currentTariffStatusStore,
    dialogsStore,
    peopleStore,
  }) => {
    const { i18n } = useTranslation();
    const {
      setDataFromSocket,
      updateDataFromSocket,
      sessionLogout,
      setMultiConnections,
      sessionMultiLogout,
    } = peopleStore.selectionStore;

    const {
      init,
      isLoaded,
      setProductVersion,
      language,
      version,
      clientError,
    } = authStore;

    const {
      roomsMode,
      isDesktopClient,
      firebaseHelper,
      setModuleInfo,
      setCheckedMaintenance,
      setMaintenanceExist,
      setSnackbarExist,
      socketHelper,
      setTheme,
      currentDeviceType,
      isFrame,
      frameConfig,
      isPortalDeactivate,
      isPortalRestoring,
    } = settingsStore;

    const isBase = settingsStore.theme.isBase;
    const { setPreparationPortalDialogVisible } = backup;

    const userTheme = isDesktopClient
      ? userStore?.user?.theme
        ? userStore?.user?.theme
        : window.RendererProcessVariable?.theme?.type === "dark"
          ? "Dark"
          : "Base"
      : userStore?.user?.theme;

    const { setPortalTariff, isNotPaidPeriod } = currentTariffStatusStore;

    const {
      setConvertPasswordDialogVisible,

      setFormCreationInfo,
    } = dialogsStore;
    const { user } = userStore;

    const pagesWithoutNavMenu =
      clientError ||
      isPortalDeactivate ||
      isPortalRestoring ||
      (isNotPaidPeriod && !user?.isOwner && !user?.isAdmin);

    return {
      loadBaseInfo: async () => {
        await init(false, i18n);

        setModuleInfo(config.homepage, "home");
        setProductVersion(config.version);

        if (isDesktopClient) {
          document.body.classList.add("desktop");
        }
      },
      language,
      isLoaded,

      isDesktop: isDesktopClient,
      FirebaseHelper: firebaseHelper,
      setCheckedMaintenance,
      setMaintenanceExist,
      socketHelper,
      setPreparationPortalDialogVisible,
      isBase,
      setTheme,
      roomsMode,
      setSnackbarExist,
      userTheme: isFrame ? frameConfig?.theme : userTheme,
      userId: userStore?.user?.id,
      userLoginEventId: userStore?.user?.loginEventId,
      currentDeviceType,
      showArticleLoader: clientLoadingStore.showArticleLoader,
      setPortalTariff,
      setFormCreationInfo,
      setConvertPasswordDialogVisible,
      version,
      pagesWithoutNavMenu,
      isFrame,
      barTypeInFrame: frameConfig?.showHeaderBanner,
      setDataFromSocket,
      updateDataFromSocket,
      sessionLogout,
      setMultiConnections,
      sessionMultiLogout,
    };
  },
)(observer(Shell));

const Root = () => (
  <ErrorBoundary>
    <ShellWrapper />
  </ErrorBoundary>
);

export default Root;
