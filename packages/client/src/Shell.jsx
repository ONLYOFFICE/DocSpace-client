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
import { Outlet, useLocation, useSearchParams } from "react-router";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { isMobile, isIOS, isFirefox } from "react-device-detect";
import { toast as toastify } from "react-toastify";

import SocketHelper, {
  SocketEvents,
  SocketCommands,
} from "@docspace/ui-kit/utils/socket";
import {
  now,
  parseToDateTime,
  formatDate,
  formatDateLocalized,
  isBefore,
  isAfter,
} from "@docspace/ui-kit/utils/date";
import {
  PORTAL_BASE_THEME_ID,
  PORTAL_DARK_THEME_ID,
} from "@docspace/ui-kit/ai-agent/providers/themes";
import { Portal } from "@docspace/ui-kit/components/portal";
import { SnackBar } from "@docspace/ui-kit/components/snackbar";
import { Toast, toastr, ToastType } from "@docspace/ui-kit/components/toast";
import { RootTooltip } from "@docspace/ui-kit/components/tooltip";
import AiAgentProviders from "@docspace/ui-kit/ai-agent/providers";
import { getCookie, deleteCookie } from "@docspace/ui-kit/utils/cookie";

import { updateTempContent } from "@docspace/shared/utils/common";
import {
  AnalyticsEvents,
  DeviceType,
  FolderType,
  IndexedDBStores,
  InfoPanelEvents,
  SearchArea,
} from "@docspace/shared/enums";
import FilesFilter from "@docspace/shared/api/files/filter";
import { editAIAgent } from "@docspace/shared/api/ai";
import { CategoryType } from "@docspace/shared/constants";

import indexedDbHelper from "@docspace/shared/utils/indexedDBHelper";
import { useThemeDetector } from "@docspace/shared/hooks/useThemeDetector";
import { sendToastReport } from "@docspace/shared/utils/crashReport";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { handleCopy } from "@docspace/shared/utils/copy";
import { getBrandName } from "@docspace/shared/constants/brands";

import "@docspace/shared/styles/theme.scss";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { setFileView } from "SRC_DIR/helpers/info-panel";
import { getSuggestionSet } from "SRC_DIR/helpers/aiSuggestions";
import { AIActivationBanner } from "SRC_DIR/pages/Home/View/AIActivationBanner";
import { useAiAgentsPickerActions } from "SRC_DIR/Hooks/useAiAgentsPickerActions";

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
import useCreateFileError from "./Hooks/useCreateFileError";
import { SectionNavigationProvider } from "./contexts/SectionNavigationContext";

import ReactSmartBanner from "./components/SmartBanner";

const Shell = ({ page = "home", ...rest }) => {
  const {
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
    isAdmin,
    isRoomAdmin,
    setSocialAuthWelcomeDialogVisible,
    getAIConfig,
    fetchWalletBalance,
    setWalletLowBalance,
    agentEntityId,
    isInsideAgentRoom,
    canEditAgentRoom,
    getAgentRoomId,
    openResultFile,
    closeEditorPanel,
    currentClientView,
    selectedFolderType,
    selectedRoomType,
    selectedRootFolderType,
    selectedIsFolder,
    selectedIsRootFolder,
    selectedSecurity,
    isPrivacyFolder,
    isAIReady,
  } = rest;

  const [searchParams] = useSearchParams();
  const location = useLocation();

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
    selectedFolderType !== FolderType.ResultStorage &&
    selectedRootFolderType !== FolderType.AIAgents;

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

  // Agent picked in the model picker (or restored from an opened thread's
  // persisted context): the picker shows the agent's name while its profile
  // drives every request, and sends carry the agent's room as the request
  // context — the conversation itself stays in the current location.
  const [pickedAgent, setPickedAgent] = useState(null);

  // "Choose AI Agent" entry (with the agents submenu) for the model picker;
  // empty until agents are loaded and unless there is more than one of them.
  const { actions: profilePickerActions, getAgentByRoomId } =
    useAiAgentsPickerActions(isLoaded && isAiChatAvailable, setPickedAgent);

  // Re-derive the picked agent from the opened thread's persisted context:
  // agent threads restore their agent (alias + request context), plain
  // threads drop it. An agent missing from the loaded list still restores
  // the request context — only the picker alias is skipped.
  const onThreadContextChange = useCallback(
    (contextEntityId) => {
      if (!contextEntityId) {
        setPickedAgent(null);
        return;
      }
      setPickedAgent(
        getAgentByRoomId(contextEntityId) ?? { entityId: contextEntityId },
      );
    },
    [getAgentByRoomId],
  );

  // Picking a plain profile row returns the chat to the current-location
  // scope; entering an AI agent room does the same — there the room itself
  // fixes the entity.
  //
  // Inside an AI agent room the picker is an editable combo for users who may
  // edit the room. A pick there must persist for that specific agent, not
  // just the session: the chat lib keeps entity-scoped picks session-local
  // (never hits the API), so the host rebinds the agent's Chat-action profile
  // via PUT /ai/agents/:id — the exact path the Edit-agent dialog uses. A
  // pick always carries `actionId === undefined` here (agent-picker actions
  // are suppressed in agent rooms), so no extra guard is needed.
  const onProfilePickerSelect = useCallback(
    (profile, actionId) => {
      if (!actionId) setPickedAgent(null);

      if (isInsideAgentRoom && !actionId && profile?.id && agentEntityId) {
        editAIAgent(Number(agentEntityId), { profileId: profile.id }).catch(
          (err) => toastr.error(err),
        );
      }
    },
    [isInsideAgentRoom, agentEntityId],
  );

  useEffect(() => {
    if (isInsideAgentRoom) setPickedAgent(null);
  }, [isInsideAgentRoom]);

  // Talking to a picked agent keeps the conversation where the user is:
  // history and uploads stay under the current location's entity, and only
  // the request context (agent tools, workspace steering, profile fallback)
  // targets the agent's room via contextEntityId.
  const chatContextEntityId =
    !isInsideAgentRoom && pickedAgent ? pickedAgent.entityId : undefined;

  const chatPickerAlias = useMemo(
    () =>
      !isInsideAgentRoom && pickedAgent?.profileId && pickedAgent?.title
        ? { profileId: pickedAgent.profileId, label: pickedAgent.title }
        : null,
    [isInsideAgentRoom, pickedAgent],
  );

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
        toastr.error(t("Common:UnexpectedError"));
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
          // UI are switched off. Viewer-role gating inside agent rooms is
          // handled by `accessRightsStore.canUseChat` in AIAgentView.
          canUseAi={isAuthenticated && !isGuest}
          callbacks={aiChatCallbacks}
          entityId={agentEntityId}
          contextEntityId={chatContextEntityId}
          // The picker area is always present (an explicit `false` also
          // overrides the lib's entityId default-hide heuristic — the chat
          // is always entity-scoped here). Inside an AI agent room the
          // room's assigned profile drives the chat: users without the
          // EditRoom right see it as a read-only label, managers get an
          // interactive picker to change it. `isAgentRoom` keeps the
          // room-assignment-wins reset on scope switches even though the
          // picker is no longer hidden there.
          hideProfilePicker={false}
          profilePickerReadOnly={isInsideAgentRoom && !canEditAgentRoom}
          isAgentRoom={isInsideAgentRoom}
          profilePickerActions={
            isInsideAgentRoom ? undefined : profilePickerActions
          }
          profilePickerAlias={chatPickerAlias}
          onProfilePickerSelect={onProfilePickerSelect}
          onThreadContextChange={onThreadContextChange}
          getAgentRoomId={getAgentRoomId}
          openResultFile={openResultFile}
          closeEditorPanel={closeEditorPanel}
          composerHeader={standalone ? undefined : composerHeader}
          composerDisabled={standalone ? undefined : !isAIReady}
          suggestions={aiSuggestions}
        >
          <AskAIChatBridge />
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

        if (settingsStore.walletLowBalance) {
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
      userTheme: isFrame ? frameConfig?.theme : userTheme,
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
      isFrame,
      barTypeInFrame: frameConfig?.showHeaderBanner,
      logoText,
      setLogoText,
      standalone,
      setSocialAuthWelcomeDialogVisible,
      getAIConfig,
      isAIReady: paymentStore.isAIReady,
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
      // Scope the chat to the current location: inside any room (including
      // its subfolders) the room id wins, elsewhere the currently selected
      // folder id is used. Only when nothing is selected yet does the chat
      // stay unscoped (entityId === undefined).
      agentEntityId:
        selectedFolderStore.rootRoomId || selectedFolderStore.id
          ? String(selectedFolderStore.rootRoomId || selectedFolderStore.id)
          : undefined,
      // Inside AI agent rooms the model is fixed by the agent's assigned
      // profile. It is shown in the composer as a read-only label, or — for
      // users who may edit the room — an interactive picker to change it.
      isInsideAgentRoom: selectedFolderStore.isAIRoom,
      // EditRoom is the room-manager right; viewers (EditRoom === false, or
      // security not resolved yet) get the read-only label. Both room and
      // sub-folder security view-models carry EditRoom.
      canEditAgentRoom: selectedFolderStore.security?.EditRoom === true,
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
