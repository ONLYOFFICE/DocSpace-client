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

import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { isMobile, isIOS, isFirefox } from "react-device-detect";
import { toast as toastify } from "react-toastify";

import SocketHelper, {
  SocketEvents,
  SocketCommands,
} from "@onlyoffice/apps-ui-kit/utils/socket";
import {
  now,
  parseToDateTime,
  formatDate,
  formatDateLocalized,
  getCorrectDate,
  isBefore,
  isAfter,
} from "@onlyoffice/apps-ui-kit/utils/date";
import {
  PORTAL_BASE_THEME_ID,
  PORTAL_DARK_THEME_ID,
} from "@onlyoffice/apps-ui-kit/ai-agent/providers/themes";
import { getAiAccessSettings } from "@docspace/shared/api/settings";
import { setForbiddenHandler } from "@docspace/shared/api/client";
import { Portal } from "@onlyoffice/apps-ui-kit/components/portal";
import { SnackBar } from "@onlyoffice/apps-ui-kit/components/snackbar";
import {
  Toast,
  toastr,
  ToastType,
} from "@onlyoffice/apps-ui-kit/components/toast";
import { RootTooltip } from "@onlyoffice/apps-ui-kit/components/tooltip";
import AiAgentProviders from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { getCookie, deleteCookie } from "@onlyoffice/apps-ui-kit/utils/cookie";

import {
  getFrameInitialTheme,
  updateTempContent,
} from "@docspace/shared/utils/common";
import {
  AnalyticsEvents,
  DeviceType,
  IndexedDBStores,
} from "@docspace/shared/enums";

import indexedDbHelper from "@docspace/shared/utils/indexedDBHelper";
import { useThemeDetector } from "@docspace/shared/hooks/useThemeDetector";
import { sendToastReport } from "@docspace/shared/utils/crashReport";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { handleCopy } from "@docspace/shared/utils/copy";
import { getBrandName } from "@docspace/shared/constants/brands";
import { getServiceLimitChatError } from "@docspace/shared/utils/ai";

import "@docspace/shared/styles/theme.scss";

import { isTourDemoId } from "SRC_DIR/api/tourDemo/data";
import AiPresetsBridge from "SRC_DIR/components/AiPresetsBridge";
import ProjectIntro from "SRC_DIR/pages/AiProjects/sub-components/project/ProjectIntro";
import { useAiPresetsPickerActions } from "SRC_DIR/Hooks/useAiPresetsPickerActions";
import { PAYMENT_ROUTES } from "SRC_DIR/pages/PortalSettings/categories/payments/utils";
import { getSuggestionSet } from "SRC_DIR/helpers/aiSuggestions";
import { AIActivationBanner } from "SRC_DIR/pages/Home/View/AIActivationBanner";

import config from "PACKAGE_FILE";

import Main from "./components/Main";
import Layout from "./components/Layout";
import NavMenu from "./components/NavMenu";
import MainBar from "./components/MainBar";
import ScrollToTop from "./components/Layout/ScrollToTop";
import IndicatorLoader from "./components/IndicatorLoader";
import ErrorBoundary from "./components/ErrorBoundaryWrapper";
import DialogsWrapper from "./components/dialogs/DialogsWrapper";
import { AskAIChatBridge } from "./components/AskAIChatBridge";
import { AiChatVisibilityBridge } from "./components/AiChatVisibilityBridge";
import useCreateFileError from "./Hooks/useCreateFileError";
import { SectionNavigationProvider } from "./contexts/SectionNavigationContext";

import ReactSmartBanner from "./components/SmartBanner";

// Stable empty list, so the chat provider's memo is not re-run each render.
const NO_SUGGESTIONS = [];

// How long a denied request's caller has to show its own error toast before
// the generic "Access denied" one is shown in its place.
const FORBIDDEN_TOAST_DELAY = 500;

const Shell = ({ page = "home", ...rest }) => {
  const {
    checkUserTypeLowered,
    refreshRightsAfterForbidden,
    isLoaded,
    isAuthenticated,
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
    isNotPaidPeriod,
    isAdmin,
    isPayer,
    isRoomAdmin,
    setSocialAuthWelcomeDialogVisible,
    getAIConfig,
    fetchTreeFolders,
    aiServicesEnabled,
    setAiServicesEnabled,
    fetchWalletBalance,
    setWalletLowBalance,
    chatScopeEntityId,
    currentClientView,
    selectedFolderType,
    selectedRoomType,
    selectedRootFolderType,
    selectedIsFolder,
    selectedIsRootFolder,
    selectedSecurity,
    isPrivacyFolder,
    isFormsFolderRoot,
    isFormRoomRoot,
    isAIReady,
    aiPresetContextRooms,
    aiPresets,
    requestPresetApply,
    isAiProjectOpen,
    aiActiveProject,
    openEditAiProject,
  } = rest;

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const folderType = searchParams.get("folderType");
  const searchArea = searchParams.get("searchArea");

  // The Overview (dashboard) page sits outside the Files/Rooms sections, so
  // its chat suggestions are resolved by route rather than by folder context.
  const isOverview = location.pathname.startsWith("/dashboard");

  const { t, ready } = useTranslation([
    "Common",
    "SmartBanner",
    "AiSuggestions",
  ]);

  // A set rather than a flat list: while files are attached in the composer,
  // the chat provider swaps the location chips for the file / form ones (it
  // owns the attachments state).
  const aiSuggestions = useMemo(
    () =>
      getSuggestionSet(
        {
          folderType,
          searchArea,
          selectedFolderType,
          roomType: selectedRoomType,
          rootFolderType: selectedRootFolderType,
          isFolder: selectedIsFolder,
          isRootFolder: selectedIsRootFolder,
          security: selectedSecurity,
          isAdmin,
          isRoomAdmin,
          isGuest,
          isOverview,
        },
        t,
      ),
    [
      selectedRoomType,
      selectedFolderType,
      selectedRootFolderType,
      selectedIsFolder,
      selectedIsRootFolder,
      selectedSecurity,
      isAdmin,
      isRoomAdmin,
      isGuest,
      isOverview,
      folderType,
      searchArea,
      t,
    ],
  );

  // Inside an AI project (the projects page with a project open) the chat
  // is the project's: its model is fixed and the welcome chips are the
  // project's own rather than the section's.
  const isInsideAiProject =
    isAiProjectOpen && location.pathname.startsWith("/ai-projects");
  useCreateFileError({
    setPortalTariff,
    setFormCreationInfo,
    setConvertPasswordDialogVisible,
  });

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

  // A denied request in a room section is only reported: navigating away
  // threw every open room tab back to the default page. A burst of denied
  // requests is handled once: it checks whether the user's type or room role
  // was lowered while the tab missed the socket event, and gets one toast.
  //
  // That toast waits a moment, because the request is still rejected to its
  // caller, and a caller that reports errors shows a toast of its own; a
  // second "Access denied" next to it would only be noise.
  useEffect(() => {
    let toastId = null;
    let pendingTimer = null;
    let callerReported = false;

    const unsubscribe = toastify.onChange((payload) => {
      if (
        pendingTimer !== null &&
        payload.status === "added" &&
        payload.type === ToastType.error
      ) {
        callerReported = true;
      }
    });

    setForbiddenHandler(() => {
      if (pendingTimer !== null) return;
      if (toastId !== null && toastr.isActive(toastId)) return;

      checkUserTypeLowered();
      refreshRightsAfterForbidden();

      callerReported = false;
      pendingTimer = setTimeout(() => {
        pendingTimer = null;

        if (!callerReported) toastId = toastr.error(t("Common:AccessDenied"));
      }, FORBIDDEN_TOAST_DELAY);
    });

    return () => {
      setForbiddenHandler(null);
      unsubscribe();
      if (pendingTimer !== null) clearTimeout(pendingTimer);
    };
  }, [t, checkUserTypeLowered, refreshRightsAfterForbidden]);

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

    SocketHelper?.emit(SocketCommands.Subscribe, {
      roomParts: "change-ai-access-settings",
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

  // Admin toggled the portal AI switch: refresh the switch value, the AI
  // config and the folders tree so the AI Agents section and the AI entry
  // points (chat button, Ask AI) appear/disappear for everyone without a
  // page reload (the nav item is rendered from the tree, so refetching the
  // config alone leaves a stale entry behind).
  useEffect(() => {
    const handleAiAccessChanged = async () => {
      try {
        const { enabled } = await getAiAccessSettings();
        setAiServicesEnabled?.(enabled);
      } catch (e) {
        console.error(e);
      }

      getAIConfig?.();
      fetchTreeFolders?.();
    };

    SocketHelper?.on(
      SocketEvents.ChangeAiAccessSettings,
      handleAiAccessChanged,
    );

    return () => {
      SocketHelper?.off(
        SocketEvents.ChangeAiAccessSettings,
        handleAiAccessChanged,
      );
    };
  }, [getAIConfig, fetchTreeFolders, setAiServicesEnabled]);

  // The quota room is shared by every user, but the balance is admin-only data:
  // the settings response exposes walletLowBalance to admins alone, so the socket
  // event must be gated the same way or a regular user would see the banner until
  // the next reload and get a rejected balance request.
  useEffect(() => {
    if (!isAdmin) return;

    const handleWalletLowBalance = async () => {
      try {
        await fetchWalletBalance?.(true);
      } catch (e) {
        console.error(e);
      }

      setWalletLowBalance?.(true);
    };

    SocketHelper?.on(SocketEvents.WalletLowBalance, handleWalletLowBalance);

    return () => {
      SocketHelper?.off(SocketEvents.WalletLowBalance, handleWalletLowBalance);
    };
  }, [isAdmin, setWalletLowBalance, fetchWalletBalance]);

  useEffect(() => {
    if (!isAdmin) return;

    const handleTopUpWallet = async () => {
      setWalletLowBalance?.(false);

      try {
        await fetchWalletBalance?.(true);
      } catch (e) {
        console.error(e);
      }
    };

    SocketHelper?.on(SocketEvents.TopUpWallet, handleTopUpWallet);

    return () => {
      SocketHelper?.off(SocketEvents.TopUpWallet, handleTopUpWallet);
    };
  }, [isAdmin, setWalletLowBalance, fetchWalletBalance]);

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
        organizationName: logoText,
        productName: getBrandName("ProductName"),
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

  // Single source of truth for AI chat availability: computed once here in the
  // host and handed to AiAgentProviders, which shares it with descendants
  // (Home page, section header) via context / `useIsAiChatAvailable()`. The
  // chat is offered only on file/room/document views — never on contacts,
  // profile, settings or the embedded chat view.
  const isSettingsPage =
    location.pathname.includes("settings") &&
    !location.pathname.includes("settings/plugins");

  // The AI projects page is a section of its own: the client view and the
  // selected folder are only set by Home, so on this page they still hold
  // whatever the previous page left (contacts, profile, a folder) and must
  // not switch the chat off.
  const isAiProjectsPage = location.pathname.startsWith("/ai-projects");

  const isAiChatAvailable =
    aiServicesEnabled &&
    !isSettingsPage &&
    (isAiProjectsPage ||
      (currentClientView !== "users" &&
        currentClientView !== "groups" &&
        currentClientView !== "profile" &&
        currentClientView !== "chat" &&
        !isPrivacyFolder));

  // The Forms section takes a single attachment: a question there is about one
  // form and the responses collected in it, and two forms in one message
  // would mix two schemas.
  //
  // Both signals come from the store rather than from `rootFolderType`:
  // `FolderType.Forms` only ever sits on the bare Forms root, while a form
  // filling room and everything inside it report `rootFolderType = Rooms`
  // (see the note in helpers/utils.js) — `isFormRoomRoot` is the getter that
  // covers the room and its In progress / Complete folders.
  const isFormsSection = isFormsFolderRoot || isFormRoomRoot;

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

  // Anonymous sessions (public room / public preview via a share link) and
  // guests must never issue AI calls: they answer 401, and the shared axios
  // client reacts to a 401 with logout + redirect to the login page, killing
  // the public link view. An unpaid portal skips AI boot requests entirely,
  // and so does a portal with AI switched off (Settings -> Customization ->
  // AI services): every ASC.AI controller is behind `[AiFeature]` and answers
  // 403, so hydrating the chat stores only floods the console on every page.
  const canUseAi =
    isAuthenticated && !isGuest && !isNotPaidPeriod && aiServicesEnabled;

  // Whether the side chat panel is open — reported from inside the providers
  // by AiChatVisibilityBridge, since the panel store lives there.
  const [isChatPanelVisible, setIsChatPanelVisible] = useState(false);

  // While the side chat panel is closed the providers only remember the
  // scope (entityId): entering a folder must not cost AI requests — they
  // wait for the chat to open.
  const isChatOpen = isChatPanelVisible;

  // "Choose AI Project" entry for the model picker: the user's AI projects,
  // applied to the open chat by AiPresetsBridge (the chat stores live below
  // AiAgentProviders). A project that is gone by now is only reported.
  const onProjectPick = useCallback(
    (preset) => {
      void requestPresetApply(preset).then((applied) => {
        if (!applied) toastr.info(t("Common:AIProjectNotAvailable"));
      });
    },
    [requestPresetApply, t],
  );
  const profilePickerActions = useAiPresetsPickerActions(
    aiPresets,
    onProjectPick,
  );

  // Inside an AI project the chat is scoped to the project: the AI service
  // recognises the project by this id and takes the round's model and
  // linked rooms from the project itself (`ai/projects/{id}/chat-context`).
  const chatEntityId =
    isInsideAiProject && aiActiveProject
      ? String(aiActiveProject.id)
      : chatScopeEntityId;

  // Chat error box override (Bug 83207): the wallet 402 must read as a
  // human message with a way to top up instead of the raw provider text.
  // Only the Payer can actually top the wallet up, so the button to
  // Billing -> Wallet is theirs alone; everyone else is pointed to the Payer
  // (`action: null` also drops the default Retry, which would just fail
  // again on an empty wallet). A spending limit reached (relayed as a 403, see
  // getServiceLimitChatError) is handled the same way: admins get a button to
  // AI settings -> Limits, everyone else is pointed to an admin. Every other
  // code keeps the library default (localized text + Retry).
  const formatChatError = useCallback(
    (payload) => {
      // The project's model is gone or cannot chat (409 from the AI
      // service): the round is refused until someone changes the model.
      // Owner and managers get the Edit project action, members are told
      // to ask one of them.
      if (payload?.code === "projectModelUnavailable") {
        const canEdit = !!aiActiveProject?.security?.EditRoom;
        return {
          title: t("Common:AIProjectModelUnavailableTitle"),
          description: canEdit
            ? t("Common:AIProjectModelUnavailableManager")
            : t("Common:AIProjectModelUnavailableMember"),
          action:
            canEdit && aiActiveProject
              ? {
                  text: t("Common:AIProjectEdit"),
                  onClick: () => openEditAiProject(aiActiveProject),
                }
              : null,
        };
      }

      // Standalone pays its AI provider directly: no wallet and no spending
      // limits, so the library default (localized text + Retry) stands.
      if (standalone) return null;

      const serviceLimit = getServiceLimitChatError(payload);
      if (serviceLimit) {
        const date = getCorrectDate(language, serviceLimit.until);

        return {
          title: t("Common:AILimitReached"),
          description: isAdmin
            ? t("Common:AILimitReachedResetsOn", { date })
            : t("Common:AILimitReachedContactAdminResetsOn", { date }),
          action: isAdmin
            ? {
                text: t("Common:ChangeAILimit"),
                onClick: () => navigate("/portal-settings/ai-settings/limits"),
              }
            : null,
        };
      }

      if (payload?.code !== "insufficient_funds") return null;

      return {
        title: t("Common:WalletBalanceTooLow"),
        description: isPayer
          ? t("Common:TopUpWalletToContinue")
          : t("Common:InsufficientFundsContactPayerShort"),
        action: isPayer
          ? {
              text: t("Common:TopUpWallet"),
              onClick: () => navigate(PAYMENT_ROUTES.wallet),
            }
          : null,
      };
    },
    [t, isAdmin, isPayer, navigate, standalone, language, aiActiveProject, openEditAiProject],
  );

  // Inside a project whose model is unavailable nothing can be sent until
  // the model is changed; the intro says so and offers the change.
  const isProjectModelUnavailable =
    isInsideAiProject && aiActiveProject?.aiProject.profile?.available === false;

  // AI chat host callbacks. Web Search settings save on an explicit button
  // (see `webSearchSaveMode` in AiAgentProviders); notify the user on success.
  const aiChatCallbacks = useMemo(
    () => ({
      onWebSearchSaved: () =>
        toastr.success(t("Common:ChangesSavedSuccessfully")),
      // The widget hydrates its stores from mount effects that can't await,
      // so failures there reach us only through this callback. Without it a
      // failed profiles load looks like a portal with no AI models
      // configured. `context` names the failing step (e.g. "profiles:init").
      onError: ({ type, error, context }) => {
        console.error(`[ai-agent] ${context ?? type} failed`, error);
        // A 403 means the user has no access to this agent/room's AI (e.g. a
        // view-only agent opened by a non-member): every hydration read 403s
        // at once, and the "view-only" notice already explains it, so the
        // generic error toast is just noise (Bug 83181). The chat lib rejects
        // with the status only in the message (`HTTP <status>`), not as a
        // property, so the message is checked alongside the axios-style shape.
        const status = error?.response?.status ?? error?.status;
        const isForbidden =
          status === 403 || /\bHTTP\s+403\b/.test(error?.message ?? "");
        if (!isForbidden) toastr.error(t("Common:UnexpectedError"));
      },
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
          // Anonymous sessions (login redirect, public room, public preview)
          // would 401 on every AI call; guests are barred from AI both
          // server-side (endpoint checks) and by role — a guest can never
          // hold a chat-capable room role (`UseChat` needs RoomManager /
          // ContentCreator), so excluding the type is exact. Providers stay
          // mounted for useStores() consumers; only hydration and the chat
          // UI are switched off.
          canUseAi={canUseAi}
          callbacks={aiChatCallbacks}
          entityId={chatEntityId}
          // The picker area is always present (an explicit `false` also
          // overrides the lib's entityId default-hide heuristic — the chat
          // is always entity-scoped here). Inside an AI project the model
          // is fixed by the project, so the picker is a read-only label.
          formatChatError={formatChatError}
          hideProfilePicker={false}
          profilePickerReadOnly={isInsideAiProject}
          isChatOpen={isChatOpen}
          profilePickerActions={profilePickerActions}
          composerHeader={standalone ? undefined : composerHeader}
          composerDisabled={
            isProjectModelUnavailable || (standalone ? undefined : !isAIReady)
          }
          // A chat opened from an AI preset or inside a project starts with
          // no suggestion chips: its sources are the subject, not the page.
          suggestions={
            isInsideAiProject || aiPresetContextRooms ? NO_SUGGESTIONS : aiSuggestions
          }
          // An empty project chat opens with the project's logo, name and
          // sources instead of the default illustration.
          chatIntro={
            isInsideAiProject && aiActiveProject ? (
              <ProjectIntro project={aiActiveProject} />
            ) : undefined
          }
          // Instructions rooms are connected on their own only from an AI
          // project (its linked rooms, see AiPresetsBridge); standing in an
          // Instructions room does not connect it, the user picks it in the
          // composer like a knowledge base.
          contextRoom={canUseAi ? aiPresetContextRooms : undefined}
          attachmentLimit={isFormsSection ? 1 : undefined}
        >
          <AskAIChatBridge />
          <AiPresetsBridge />

          <AiChatVisibilityBridge onChange={setIsChatPanelVisible} />
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
    aiPresetsStore,
    aiProjectsStore,
    paymentStore,
    peopleStore,
    filesStore,
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
      isPortalBlocked,
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

      setFormCreationInfo,
      setSocialAuthWelcomeDialogVisible,
    } = dialogsStore;
    const { user } = userStore;

    // What the chat would be scoped to at the current location, before the
    // exceptions below decide whether it may be scoped there at all.
    const chatScopeId =
      selectedFolderStore.rootRoomId || selectedFolderStore.id;

    const pagesWithoutNavMenu =
      clientError ||
      isPortalDeactivate ||
      isPortalBlocked ||
      isPortalRestoring ||
      (isNotPaidPeriod && !user?.isOwner && !user?.isAdmin);

    return {
      checkUserTypeLowered: peopleStore.usersStore.checkUserTypeLowered,
      refreshRightsAfterForbidden: filesStore.refreshRightsAfterForbidden,
      loadBaseInfo: async () => {
        await init(false, i18n);

        if (
          settingsStore.walletLowBalance &&
          !settingsStore.isPortalDeactivate &&
          !settingsStore.isPortalBlocked
        ) {
          paymentStore.fetchWalletBalance().catch((e) => console.error(e));
        }

        setModuleInfo(config.homepage, "home");
        setProductVersion(config.version);

        if (isDesktopClient) {
          document.body.classList.add("desktop");
        }
      },
      language,
      isLoaded,
      isAuthenticated: authStore.isAuthenticated,

      isDesktop: isDesktopClient,
      FirebaseHelper: firebaseHelper,
      setCheckedMaintenance,
      setMaintenanceExist,
      setPreparationPortalDialogVisible,
      isBase,
      setTheme,
      roomsMode,
      setSnackbarExist,
      userTheme:
        isFrame || getFrameInitialTheme()
          ? (frameConfig?.theme ?? getFrameInitialTheme())
          : userTheme,
      userId: userStore?.user?.id,
      userLoginEventId: userStore?.user?.loginEventId,
      isOwner: userStore?.user?.isOwner,
      isAdmin: userStore?.user?.isAdmin || userStore?.user?.isOwner,
      // Room admin — the role that may create rooms and form spaces; gates
      // the room / forms AI suggestions that the spec limits to owners and
      // managers.
      isRoomAdmin: authStore.isRoomAdmin,
      isGuest: userStore?.user?.isVisitor,
      registrationDate: userStore?.user?.registrationDate,

      currentDeviceType,
      showArticleLoader: clientLoadingStore.showArticleLoader,
      setPortalTariff,
      setFormCreationInfo,
      setConvertPasswordDialogVisible,
      version,
      pagesWithoutNavMenu,
      isNotPaidPeriod,
      isFrame,
      barTypeInFrame: frameConfig?.showHeaderBanner,
      logoText,
      setLogoText,
      standalone,
      setSocialAuthWelcomeDialogVisible,
      getAIConfig,
      fetchTreeFolders: treeFoldersStore.fetchTreeFolders,
      aiServicesEnabled: settingsStore.aiServicesEnabled,
      setAiServicesEnabled: settingsStore.setAiServicesEnabled,
      isAIReady: paymentStore.isAIReady,
      isPayer: paymentStore.isPayer,
      fetchWalletBalance: paymentStore.fetchWalletBalance,
      setWalletLowBalance: settingsStore.setWalletLowBalance,
      currentClientView: clientLoadingStore.currentClientView,
      selectedFolderType: selectedFolderStore.type,
      selectedRoomType: selectedFolderStore.roomType,
      selectedRootFolderType: selectedFolderStore.rootFolderType,
      selectedIsFolder: selectedFolderStore.isFolder,
      selectedIsRootFolder: selectedFolderStore.isRootFolder,
      // Drives which AI suggestions the current user is offered: actions the
      // rights of the opened folder / room do not allow are filtered out.
      selectedSecurity: selectedFolderStore.security,
      isPrivacyFolder: treeFoldersStore.isPrivacyFolder,
      // The Instructions rooms of the project the chat runs on, as its
      // context rooms; a new array per render, the ui-kit provider memoizes
      // it by id and name.
      aiPresetContextRooms: aiPresetsStore.activePresetContextRooms,
      isAiProjectOpen: aiProjectsStore.activeProject !== null,
      aiActiveProject: aiProjectsStore.activeProject,
      openEditAiProject: aiProjectsStore.openEditDialog,
      aiPresets: aiPresetsStore.presets,
      requestPresetApply: aiPresetsStore.requestApply,
      // The Forms section, in both its shapes: the bare Forms root, and a
      // form filling room with its In progress / Complete folders. Caps the
      // chat's attachments at one (see `attachmentLimit`).
      isFormsFolderRoot: treeFoldersStore.isFormsFolderRoot,
      isFormRoomRoot: treeFoldersStore.isFormRoomRoot,
      // Scope the chat to the current location: inside any room (including
      // its subfolders) the room id wins, elsewhere the currently selected
      // folder id is used. Only when nothing is selected yet does the chat
      // stay unscoped (entityId === undefined).
      // Exception: a tour standing inside a stand-in space: that is a room
      // the server has never heard of, so every scoped AI request made for
      // it comes back 404 ("Entity not found") — the demo answers what the
      // section asks about the space, and the AI service is no part of that.
      // And a location whose id is not a room id (a third-party storage
      // folder carries a string id): the AI service accepts only integer room
      // ids as a scope, reads included (Bug 84417), and folds any other
      // location to the global scope anyway, so send that scope outright.
      chatScopeEntityId:
        !chatScopeId ||
        isTourDemoId(chatScopeId) ||
        !/^\d+$/.test(String(chatScopeId))
          ? undefined
          : String(chatScopeId),
    };
  },
)(observer(Shell));

const Root = () => (
  <ErrorBoundary>
    <ShellWrapper />
  </ErrorBoundary>
);

export default Root;

