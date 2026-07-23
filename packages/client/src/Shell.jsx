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

import React, { useEffect, useMemo } from "react";
import {
  now,
  parseToDateTime,
  formatDate,
  formatDateLocalized,
  isBefore,
  isAfter,
} from "@docspace/ui-kit/utils/date";
import { Outlet, useLocation } from "react-router";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { isMobile, isIOS, isFirefox } from "react-device-detect";
import { toast as toastify } from "react-toastify";

import SocketHelper, {
  SocketEvents,
  SocketCommands,
} from "@docspace/ui-kit/utils/socket";
import {
  PORTAL_BASE_THEME_ID,
  PORTAL_DARK_THEME_ID,
} from "@docspace/ui-kit/ai-agent/providers/themes";
import { Portal } from "@docspace/ui-kit/components/portal";
import { SnackBar } from "@docspace/ui-kit/components/snackbar";
import { Toast, toastr, ToastType } from "@docspace/ui-kit/components/toast";
import { RootTooltip } from "@docspace/ui-kit/components/tooltip";
import AiAgentProviders from "@docspace/ui-kit/ai-agent/providers";

import { AIActivationBanner } from "SRC_DIR/pages/Home/View/AIActivationBanner";
import { updateTempContent } from "@docspace/shared/utils/common";
import {
  AnalyticsEvents,
  DeviceType,
  FolderType,
  IndexedDBStores,
  InfoPanelEvents,
  SearchArea,
} from "@docspace/shared/enums";
import { setFileView } from "SRC_DIR/helpers/info-panel";
import FilesFilter from "@docspace/shared/api/files/filter";
import { CategoryType } from "@docspace/shared/constants";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { getSuggestions } from "SRC_DIR/helpers/aiSuggestions";
import indexedDbHelper from "@docspace/shared/utils/indexedDBHelper";
import { useThemeDetector } from "@docspace/shared/hooks/useThemeDetector";
import { sendToastReport } from "@docspace/shared/utils/crashReport";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { getCookie, deleteCookie } from "@docspace/ui-kit/utils/cookie";
import { handleCopy } from "@docspace/shared/utils/copy";

import "@docspace/shared/styles/theme.scss";

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
import { SectionNavigationProvider } from "./contexts/SectionNavigationContext";

import ReactSmartBanner from "./components/SmartBanner";
import { getBrandName } from "@docspace/shared/constants/brands";

const Shell = ({ page = "home", ...rest }) => {
  const {
    isLoaded,
    loadBaseInfo,

    isDesktop,
    language,
    FirebaseHelper,
    setCheckedMaintenance,
    setPreparationPortalDialogVisible,
    isBase,
    setTheme,
    setMaintenanceExist,
    setSnackbarExist,
    userTheme,
    userId,
    userLoginEventId,
    currentDeviceType,
    setPortalTariff,
    setFormCreationInfo,
    setConvertPasswordDialogVisible,
    version,
    pagesWithoutNavMenu,
    isFrame,
    barTypeInFrame,

    logoText,
    setLogoText,
    standalone,
    isGuest,
    setSocialAuthWelcomeDialogVisible,
    getAIConfig,
    agentEntityId,
    isInsideAgentRoom,
    getAgentRoomId,
    openResultFile,
    closeEditorPanel,
    currentClientView,
    selectedFolderType,
    aiSuggestions,
    isPrivacyFolder,
    isAIReady,
  } = rest;

  console.debug({ currentClientView });

  useCreateFileError({
    setPortalTariff,
    setFormCreationInfo,
    setConvertPasswordDialogVisible,
  });

  const { t, ready } = useTranslation(["Common", "SmartBanner"]);

  useEffect(() => {
    if (!logoText) setLogoText(getBrandName("OrganizationName"));
  }, [logoText, setLogoText]);

  useEffect(() => {
    try {
      loadBaseInfo();
    } catch (err) {
      toastr.error(err);
    }
  }, []);

  // Locale is handled by Luxon date utilities - no global locale setup needed

  useEffect(() => {
    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "restore",
    });

    if (standalone) {
      SocketHelper?.emit(SocketCommands.SubscribeInSpaces, {
        roomParts: "restore",
      });
    }

    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "quota",
    });

    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "QUOTA",
      individual: true,
    });

    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "change-web-plugin",
    });

    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "change-ai-config",
    });
  }, []);

  useEffect(() => {
    if (standalone) {
      SocketHelper?.emit(SocketCommands.SubscribeInSpaces, {
        roomParts: "restore",
      });

      SocketHelper?.emit(SocketCommands.SubscribeInSpaces, {
        roomParts: "storage-encryption",
      });
    }
  }, [standalone]);

  useEffect(() => {
    SocketHelper?.emit(SocketCommands.Subscribe, { roomParts: userId });
  }, [userId]);

  useEffect(() => {
    if (isGuest && userId) {
      const token = getCookie(`x-signature`);

      if (token) {
        deleteCookie(`x-signature-${userId}`);
        deleteCookie("x-signature");
      }
    }
  }, [userId]);

  useEffect(() => {
    SocketHelper?.on(SocketEvents.RestoreBackup, () => {
      setPreparationPortalDialogVisible(true);
    });

    return () => {
      SocketHelper?.off(SocketEvents.RestoreBackup, () => {
        setPreparationPortalDialogVisible(false);
      });
    };
  }, [setPreparationPortalDialogVisible]);

  useEffect(() => {
    const storageEncryptionHandler = () => {
      window.location.href = "/encryption-portal";
    };

    SocketHelper?.on(SocketEvents.StorageEncryption, storageEncryptionHandler);

    return () => {
      SocketHelper?.off(
        SocketEvents.StorageEncryption,
        storageEncryptionHandler,
      );
    };
  }, []);

  useEffect(() => {
    const callback = ({ loginEventId, redirectUrl }) => {
      console.log(
        `[WS] "logout-session"`,
        loginEventId,
        userLoginEventId,
        redirectUrl,
      );

      if (userLoginEventId !== loginEventId && loginEventId !== 0) return;

      const { pathname, search, origin } = window.location;
      const redirectDomain = redirectUrl || origin;
      const loginUrl = redirectUrl || window.ClientConfig?.proxy?.url;

      sessionStorage.setItem(
        "referenceUrl",
        `${redirectDomain}${pathname}${search}`,
      );
      sessionStorage.setItem("loggedOutUserId", userId);

      window.location.replace(combineUrl(loginUrl, "/login"));
    };

    SocketHelper?.on(SocketEvents.LogoutSession, callback);

    return () => {
      SocketHelper?.off(SocketEvents.LogoutSession, callback);
    };
  }, [userLoginEventId, userId]);

  useEffect(() => {
    const handleAiConfigChanged = () => {
      getAIConfig?.();
    };

    SocketHelper?.on(SocketEvents.ChangeAiConfig, handleAiConfigChanged);

    return () => {
      SocketHelper?.off(SocketEvents.ChangeAiConfig, handleAiConfigChanged);
    };
  }, [getAIConfig]);

  let snackTimer = null;
  let fbInterval = null;
  // let lastCampaignStr = null;
  const LS_CAMPAIGN_DATE = "maintenance_to_date";
  const DATE_FORMAT = "yyyy-MM-dd";
  const SNACKBAR_TIMEOUT = 10000;

  const clearSnackBarTimer = () => {
    if (!snackTimer) return;

    clearTimeout(snackTimer);
    snackTimer = null;
  };

  const showSnackBar = (campaign) => {
    const setSnackBarTimer = (campaignItem) => {
      clearSnackBarTimer();
      snackTimer = setTimeout(
        () => showSnackBar(campaignItem),
        SNACKBAR_TIMEOUT,
      );
    };

    let skipMaintenance;

    const { fromDate, toDate, desktop } = campaign;

    console.log(
      `FB: 'bar/maintenance' desktop=${desktop} fromDate=${fromDate} toDate=${toDate}`,
    );

    if (!campaign || !fromDate || !toDate) {
      console.log("Skip snackBar by empty campaign params");
      skipMaintenance = true;
    }

    const to = parseToDateTime(toDate)?.toLocal();

    const watchedCampaignDateStr = localStorage.getItem(LS_CAMPAIGN_DATE);

    const campaignDateStr = to ? formatDate(to, DATE_FORMAT) : null;
    if (campaignDateStr == watchedCampaignDateStr) {
      console.log("Skip snackBar by already watched");
      skipMaintenance = true;
    }

    const from = parseToDateTime(fromDate)?.toLocal();
    const currentTime = now();

    if (from && isBefore(currentTime, from)) {
      setSnackBarTimer(campaign);

      SnackBar.close();
      console.log(`Show snackBar has been delayed for 1 minute`, currentTime);
      skipMaintenance = true;
    }

    if (to && isAfter(currentTime, to)) {
      console.log("Skip snackBar by current date", currentTime);
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

    // const campaignStr = JSON.stringify(campaign);
    // let skipRender = lastCampaignStr === campaignStr;

    const hasChild = document.getElementById("main-bar").hasChildNodes();

    if (hasChild) return;

    // lastCampaignStr = campaignStr;

    const targetDate = to
      ? formatDateLocalized(to, "DATE_MED", { locale: language })
      : "";

    const barConfig = {
      parentElementId: "main-bar",
      headerText: t("Attention"),
      text: `${t("BarMaintenanceDescription", {
        targetDate,
        productName: `${logoText} ${getBrandName("ProductName")}`,
      })} ${t("BarMaintenanceDisclaimer")}`,
      isMaintenance: true,
      onAction: () => {
        setMaintenanceExist(false);
        setSnackbarExist(false);
        SnackBar.close();
        localStorage.setItem(
          LS_CAMPAIGN_DATE,
          to ? formatDate(to, DATE_FORMAT) : "",
        );
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

  const fetchMaintenance = async () => {
    try {
      if (!FirebaseHelper.isEnabled) return;

      const campaign = await FirebaseHelper.checkMaintenance();

      console.log("checkMaintenance", campaign);

      if (!campaign) {
        setCheckedMaintenance(true);
        clearSnackBarTimer();
        SnackBar.close();
        return;
      }

      setTimeout(() => showSnackBar(campaign), 1000);
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
    if (userTheme) setTheme(userTheme);
  }, [userTheme]);

  useEffect(() => {
    if (isLoaded && localStorage.getItem("socialAuthWelcomeBar") === "true") {
      setSocialAuthWelcomeDialogVisible(true);

      if (localStorage.getItem("portalCreatedEventSent") !== "true") {
        localStorage.setItem("portalCreatedEventSent", "true");

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: AnalyticsEvents.PortalCreated,
        });
      }
    }
  }, [isLoaded]);

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

  useEffect(() => {
    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  const rootElement = document.getElementById("root");

  const toast =
    currentDeviceType === DeviceType.mobile ? (
      <Portal element={<Toast />} appendTo={rootElement} visible />
    ) : (
      <Toast />
    );
  const location = useLocation();

  // Single source of truth for AI chat availability: computed once here in the
  // host and handed to AiAgentProviders, which shares it with descendants
  // (Home page, section header) via context / `useIsAiChatAvailable()`. The
  // chat is offered only on file/room/document views — never on contacts,
  // profile, settings, the embedded chat view, or the Knowledge /
  // ResultStorage system folders.
  const isSettingsPage =
    location.pathname.includes("settings") &&
    !location.pathname.includes("settings/plugins");

  const isAiChatAvailable =
    currentClientView !== "users" &&
    currentClientView !== "groups" &&
    currentClientView !== "profile" &&
    currentClientView !== "chat" &&
    !isSettingsPage &&
    !isPrivacyFolder &&
    selectedFolderType !== FolderType.Knowledge &&
    selectedFolderType !== FolderType.ResultStorage;

  const withoutNavMenu =
    isEditor ||
    pagesWithoutNavMenu ||
    location.pathname === "/access-restricted";

  const isMobileOnly = currentDeviceType === DeviceType.mobile;

  const layout = (
    <Layout>
      {toast}
      <RootTooltip />
      {isMobileOnly && !isFrame ? (
        <ReactSmartBanner t={t} ready={ready} />
      ) : null}
      {withoutNavMenu ? null : <NavMenu />}
      <IndicatorLoader />
      <ScrollToTop />
      <DialogsWrapper t={t} />

      <Main isDesktop={isDesktop}>
        {!isMobileOnly && !isFrame ? (
          <ReactSmartBanner t={t} ready={ready} />
        ) : null}
        {barTypeInFrame !== "none" ? <MainBar /> : null}
        <div className="main-container">
          <Outlet />
        </div>
      </Main>
    </Layout>
  );

  const composerHeader = useMemo(() => <AIActivationBanner />, []);

  // AI chat host callbacks. Web Search settings save on an explicit button
  // (see `webSearchSaveMode` in AiAgentProviders); notify the user on success.
  const aiChatCallbacks = useMemo(
    () => ({
      onWebSearchSaved: () =>
        toastr.success(t("Common:ChangesSavedSuccessfully")),
    }),
    [t],
  );

  // Defer mounting AiAgentProviders until authStore is loaded — otherwise
  // `standalone` flips after the first render, the providers' useMemo
  // rebuilds the chat stores, and StoresHydrator refires every fetch
  // (profiles/threads/servers/web-search/knowledge/...) a second time.
  return (
    <SectionNavigationProvider>
      {isLoaded ? (
        <AiAgentProviders
          locale={language}
          theme={isBase ? PORTAL_BASE_THEME_ID : PORTAL_DARK_THEME_ID}
          isStandalone={standalone}
          isAvailable={isAiChatAvailable}
          callbacks={aiChatCallbacks}
          entityId={agentEntityId}
          hideProfilePicker={isInsideAgentRoom}
          getAgentRoomId={getAgentRoomId}
          openResultFile={openResultFile}
          closeEditorPanel={closeEditorPanel}
          composerHeader={standalone ? undefined : composerHeader}
          composerDisabled={standalone ? undefined : !isAIReady}
          suggestions={aiSuggestions}
        >
          {layout}
        </AiAgentProviders>
      ) : (
        layout
      )}
    </SectionNavigationProvider>
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
    selectedFolderStore,
    treeFoldersStore,
    aiRoomStore,
    paymentStore,
  }) => {
    const { i18n } = useTranslation();

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
      setTheme,
      currentDeviceType,
      isFrame,
      frameConfig,
      isPortalDeactivate,
      isPortalRestoring,
      logoText,
      setLogoText,
      standalone,
      getAIConfig,
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
      setFormFillingTipsDialog,
      formFillingTipsVisible,

      setFormCreationInfo,
      setSocialAuthWelcomeDialogVisible,
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
      setPreparationPortalDialogVisible,
      setFormFillingTipsDialog,
      formFillingTipsVisible,
      isBase,
      setTheme,
      roomsMode,
      setSnackbarExist,
      userTheme: isFrame ? frameConfig?.theme : userTheme,
      userId: userStore?.user?.id,
      userLoginEventId: userStore?.user?.loginEventId,
      isOwner: userStore?.user?.isOwner,
      isAdmin: userStore?.user?.isAdmin || userStore?.user?.isOwner,
      isGuest: userStore?.user?.isVisitor,
      registrationDate: userStore?.user?.registrationDate,

      currentDeviceType,
      showArticleLoader: clientLoadingStore.showArticleLoader,
      setPortalTariff,
      setFormCreationInfo,
      setConvertPasswordDialogVisible,
      version,
      pagesWithoutNavMenu,
      isFrame,
      barTypeInFrame: frameConfig?.showHeaderBanner,
      logoText,
      setLogoText,
      standalone,
      setSocialAuthWelcomeDialogVisible,
      getAIConfig,
      isAIReady: paymentStore.isAIReady,
      currentClientView: clientLoadingStore.currentClientView,
      selectedFolderType: selectedFolderStore.type,
      aiSuggestions: getSuggestions({
        roomType: selectedFolderStore.roomType,
        folderType: selectedFolderStore.type,
        rootFolderType: selectedFolderStore.rootFolderType,
        isRoom: selectedFolderStore.isRoom,
        isFolder: selectedFolderStore.isFolder,
        isRootFolder: selectedFolderStore.isRootFolder,
      }),
      isPrivacyFolder: treeFoldersStore.isPrivacyFolder,
      // Scope the chat to the current location: inside any room (including
      // its subfolders) the room id wins, elsewhere the currently selected
      // folder id is used. Only when nothing is selected yet does the chat
      // stay unscoped (entityId === undefined).
      agentEntityId:
        selectedFolderStore.rootRoomId || selectedFolderStore.id
          ? String(selectedFolderStore.rootRoomId || selectedFolderStore.id)
          : undefined,
      // The composer model picker is hidden only where the model is fixed
      // by the agent's assigned profile — inside AI agent rooms.
      isInsideAgentRoom: selectedFolderStore.isAIRoom,
      getAgentRoomId: () => {
        const id = selectedFolderStore.rootRoomId;
        return id ? Number(id) : null;
      },
      openResultFile: (fileId) => {
        if (!selectedFolderStore.isAIRoom) return;
        const roomId = selectedFolderStore.rootRoomId || selectedFolderStore.id;
        if (!roomId) return;

        aiRoomStore.setCurrentTab("result");
        aiRoomStore.setSelectedResultFileId(Number(fileId));

        const filesFilter = FilesFilter.getDefault();
        filesFilter.folder = String(roomId);
        filesFilter.searchArea = SearchArea.ResultStorage;
        const path = getCategoryUrl(CategoryType.AIAgent, roomId);
        clientLoadingStore.setIsSectionBodyLoading(true, false);
        window.DocSpace.navigate(`${path}?${filesFilter.toUrlParams()}`);

        window.dispatchEvent(new CustomEvent(InfoPanelEvents.showInfoPanel));
        setFileView("info_ai_chat");
      },
      closeEditorPanel: () => {
        aiRoomStore.setSelectedResultFileId(null);
      },
    };
  },
)(observer(Shell));

const Root = () => (
  <ErrorBoundary>
    <ShellWrapper />
  </ErrorBoundary>
);

export default Root;

