import moment from "moment-timezone";
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "styled-components";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { isMobile, isIOS, isFirefox } from "react-device-detect";

import { getLogoFromPath } from "@docspace/shared/utils";
import { Portal } from "@docspace/shared/components/portal";
import { SnackBar } from "@docspace/shared/components/snackbar";
import { Toast, toastr } from "@docspace/shared/components/toast";
import { getRestoreProgress } from "@docspace/shared/api/portal";
import { updateTempContent } from "@docspace/shared/utils/common";
import { DeviceType, IndexedDBStores } from "@docspace/shared/enums";
import indexedDbHelper from "@docspace/shared/utils/indexedDBHelper";
import { useThemeDetector } from "@docspace/shared/hooks/useThemeDetector";

import config from "PACKAGE_FILE";

import Main from "./components/Main";
import Layout from "./components/Layout";
import NavMenu from "./components/NavMenu";
import MainBar from "./components/MainBar";
import ScrollToTop from "./components/Layout/ScrollToTop";
import IndicatorLoader from "./components/IndicatorLoader";
import ErrorBoundary from "./components/ErrorBoundaryWrapper";
import DialogsWrapper from "./components/dialogs/DialogsWrapper";
import useCreateFileError from "./Hooks/useCreateFileError";

// import ReactSmartBanner from "./components/SmartBanner";

const Shell = ({ items = [], page = "home", ...rest }) => {
  const {
    isLoaded,
    loadBaseInfo,

    isDesktop,
    language,
    FirebaseHelper,
    // personal,
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
    whiteLabelLogoUrls,
    userId,
    currentDeviceType,
    timezone,
    showArticleLoader,
    setPortalTariff,
    setFormCreationInfo,
    setConvertPasswordDialogVisible,
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
    if (!whiteLabelLogoUrls) return;
    const favicon = getLogoFromPath(whiteLabelLogoUrls[2]?.path?.light);

    if (!favicon) return;

    const link = document.querySelector("#favicon-icon");
    link.href = favicon;

    const shortcutIconLink = document.querySelector("#favicon");
    shortcutIconLink.href = favicon;

    const appleIconLink = document.querySelector(
      "link[rel~='apple-touch-icon']",
    );

    if (appleIconLink) appleIconLink.href = favicon;

    const androidIconLink = document.querySelector(
      "link[rel~='android-touch-icon']",
    );
    if (androidIconLink) androidIconLink.href = favicon;
  }, [whiteLabelLogoUrls]);

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
  }, [socketHelper]);

  const { t, ready } = useTranslation(["Common"]); //TODO: if enable banner ["Common", "SmartBanner"]

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
        productName: "ONLYOFFICE DocSpace",
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
    if (!userId || !window.DocSpaceConfig.imageThumbnails) return;
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

  const rootElement = document.getElementById("root");

  const toast =
    currentDeviceType === DeviceType.mobile ? (
      <Portal element={<Toast />} appendTo={rootElement} visible={true} />
    ) : (
      <Toast />
    );

  return (
    <Layout>
      {toast}
      {/* <ReactSmartBanner t={t} ready={ready} /> */}
      {isEditor ? <></> : <NavMenu />}
      {currentDeviceType === DeviceType.mobile && <MainBar />}
      <IndicatorLoader />
      <ScrollToTop />
      <DialogsWrapper t={t} />

      <Main isDesktop={isDesktop}>
        {currentDeviceType !== DeviceType.mobile && <MainBar />}
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
  }) => {
    const { i18n } = useTranslation();

    const { init, isLoaded, setProductVersion, language } = authStore;

    const {
      personal,
      roomsMode,
      isDesktopClient,
      firebaseHelper,
      setModuleInfo,
      setCheckedMaintenance,
      setMaintenanceExist,
      setSnackbarExist,
      socketHelper,
      setTheme,
      whiteLabelLogoUrls,
      currentDeviceType,
      isFrame,
      frameConfig,
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

    const { setPortalTariff } = currentTariffStatusStore;

    const {
      setConvertPasswordDialogVisible,

      setFormCreationInfo,
    } = dialogsStore;

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
      personal,
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
      whiteLabelLogoUrls,
      currentDeviceType,
      showArticleLoader: clientLoadingStore.showArticleLoader,
      setPortalTariff,
      setFormCreationInfo,
      setConvertPasswordDialogVisible,
    };
  },
)(observer(Shell));

const Root = () => (
  <ErrorBoundary>
    <ShellWrapper />
  </ErrorBoundary>
);

export default Root;
