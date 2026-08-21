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

// (c) Copyright Ascensio System SIA 2009-2026
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
import { inject, observer } from "mobx-react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import { useTranslation, Trans } from "react-i18next";

import { QuickActions } from "@docspace/ui-kit/components/quick-actions";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Tooltip } from "@docspace/ui-kit/components/tooltip";
import { FloatingButton } from "@docspace/ui-kit/components/floating-button";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";
import { getBrandName } from "@docspace/shared/constants/brands";
import { DeviceType } from "@docspace/shared/enums";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";
import { useIsDesktop } from "@docspace/ui-kit/hooks/use-is-desktop";
import { useAiChatPanel } from "@docspace/ui-kit/ai-agent/ai-chat-panel";
import ChatPanelView from "@docspace/ui-kit/components/section/sub-components/ChatPanel";

import { useSdkFrame } from "SRC_DIR/components/SdkFrameHost/useSdkFrame";
import type { AppId } from "SRC_DIR/helpers/apps-catalog";
import { setDashboardVisited } from "SRC_DIR/helpers/dashboardVisited";
import { useHasAiProfiles } from "SRC_DIR/Hooks/useHasAiProfiles";
import {
  useChatNoAccess,
  mapChatNoAccessStores,
  type ChatNoAccessStoreProps,
} from "SRC_DIR/Hooks/useChatNoAccess";

import { WelcomeDialog } from "./WelcomeDialog";
import { DashboardTourHost } from "./DashboardTourHost";
import { ModuleCard } from "./sub-components/ModuleCard";
import { ProfileCard } from "./sub-components/ProfileCard";
import { IntegrationsCard } from "./sub-components/IntegrationsCard";
import { DevToolsCard } from "./sub-components/DevToolsCard";
import { Header } from "./sub-components/Header";
import { DashboardLoader } from "./sub-components/DashboardLoader";
import { GuestRestrictionTooltip } from "./sub-components/GuestRestrictionTooltip";
import { useUploadToMyDocuments } from "./hooks/useUploadToMyDocuments";
import { useCreateActions } from "./hooks/useCreateActions";
import { useModuleItems } from "./hooks/useModuleItems";
import { useMyFolderId } from "./hooks/useMyFolderId";
import styles from "./Dashboard.module.scss";

type DashboardProps = ChatNoAccessStoreProps & {
  isGuest: boolean;
  showLoader: boolean;
  currentDeviceType?: TStore["settingsStore"]["currentDeviceType"];
  requestAppTour: (appId: AppId) => void;
  userId?: string;
  /** False until the welcome has been shown to this user (and dismissed). */
  isWelcomeSeen: boolean;
  /** Reads `isWelcomeSeen` back for `userId` — the flag is per-user. */
  hydrateWelcome: (userId?: string) => void;
  /** Marks the welcome as shown, whether the tour was taken from it or not. */
  dismissWelcome: (userId?: string) => void;
  /** Arms the dashboard's own tour, which `DashboardTour` then starts. */
  requestDashboardTour: () => void;
  /** Admins / owners / room admins — the set allowed to create rooms. */
  canCreateRooms: boolean;
  /** Portal admins and the owner — the only ones who can reach Docs Connect. */
  isAdminOrOwner: boolean;
  /** Whether the portal's AI is set up, which agent creation also needs. */
  aiReady: boolean;
  /** Names the plan in the apps subtitle: Startup when free, Business when paid. */
  isFreeTariff: boolean;
  /** Rooms quota exhausted or portal in its grace period. */
  isWarningRoomsDialog: boolean;
  setQuotaWarningDialogVisible: (visible: boolean) => void;
};

const UPLOAD_LINK_ID = "dashboard-upload-link";
const DOCS_CONNECT_PATH = "/developer-tools/docs-connect";

const Dashboard = (props: DashboardProps) => {
  const {
    isGuest,
    showLoader,
    currentDeviceType,
    requestAppTour,
    userId,
    isWelcomeSeen,
    hydrateWelcome,
    dismissWelcome,
    requestDashboardTour,
    canCreateRooms,
    isAdminOrOwner,
    aiReady,
    isFreeTariff,
    isWarningRoomsDialog,
    setQuotaWarningDialogVisible,
  } = props;
  const { t } = useTranslation(["Common"]);
  useDocumentTitle("Common:Home");

  // Gates every tour entry point on this page. The tours walk through desktop
  // chrome (`useTour` refuses to run on mobile outright), so on a phone the
  // welcome is not offered and neither help icon is rendered — the CSS in
  // `Dashboard.module.scss` hides them too, but a button that cannot do
  // anything should not be in the tree to begin with.
  const isMobile = currentDeviceType === DeviceType.mobile;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const myFolderId = useMyFolderId();
  const openFiles = React.useCallback(() => {
    navigate("/rooms/personal/filter");
  }, [navigate]);
  const openDocsConnect = React.useCallback(() => {
    navigate(DOCS_CONNECT_PATH);
  }, [navigate]);
  const { openUploadDialog, progress, clearProgress } = useUploadToMyDocuments(
    myFolderId,
    openFiles,
  );
  const createItems = useCreateActions(myFolderId, isGuest);

  // Agent creation needs AI to be set up on top of the create right. `aiReady`
  // (portal /ai/config) can lag behind the chat-lib profiles, so existing
  // profiles count as ready too — the same signal Home and the agents EmptyView
  // use to decide whether to offer agent creation.
  const hasAiProfiles = useHasAiProfiles();
  const moduleItems = useModuleItems({
    isGuest,
    canCreateRooms,
    canCreateAgents: (aiReady || hasAiProfiles) && canCreateRooms,
    isWarningRoomsDialog,
    setQuotaWarningDialogVisible,
  });

  // The dashboard renders its own content (no SDK iframe). Tell the
  // persistent host to drop the previous app's frame so it doesn't linger
  // behind the dashboard.
  useSdkFrame({ appId: "dashboard", enabled: false });

  // The welcome flag is per-user and lives in storage, so it has to be read
  // back once the signed-in user is known. Keyed on `userId` rather than run
  // once: the same page survives a user switch on this route.
  React.useEffect(() => {
    hydrateWelcome(userId);
  }, [hydrateWelcome, userId]);

  // Spends this user's one first-load Overview: from the next sign-in on, the
  // entry redirect sends them to their Default Homepage instead. Recorded from
  // the page rather than from the redirect so that only reaching the Overview
  // for real counts, and only past the loader so a load abandoned on the
  // skeleton doesn't.
  React.useEffect(() => {
    if (showLoader) return;
    setDashboardVisited(userId);
  }, [showLoader, userId]);

  /**
   * Whether the welcome is on screen, which two different things can ask for:
   * the first visit (the stored flag) and the help button (this state). Local
   * rather than derived from the store alone, because reopening it deliberately
   * must not depend on un-dismissing a flag that means "has been offered once".
   */
  const [isWelcomeOpen, setIsWelcomeOpen] = React.useState(false);

  /**
   * The first-visit offer, made once to a user who can actually be walked
   * through the page afterwards.
   *
   * Not on mobile, where no tour runs at all (`useTour` refuses to) — and the
   * flag is deliberately left unspent there rather than dismissed, so somebody
   * whose first visit was on a phone still gets the offer on their desktop.
   * Behind the loader for the same reason the tour is: the modal introduces the
   * page, and the page is a skeleton until then.
   */
  const isFirstVisit = !isWelcomeSeen && !showLoader && !isMobile;

  const showWelcome = isFirstVisit || isWelcomeOpen;

  const onWelcomeClose = React.useCallback(() => {
    setIsWelcomeOpen(false);
    // Spends the first-visit offer. A no-op once already spent, so closing a
    // modal reopened from the help button costs nothing.
    dismissWelcome(userId);
  }, [dismissWelcome, userId]);

  // Both buttons dismiss; this one arms the tour on the way out. The host below
  // is what starts it, once the page has settled.
  const onWelcomeTakeTour = React.useCallback(() => {
    setIsWelcomeOpen(false);
    dismissWelcome(userId);
    requestDashboardTour();
  }, [dismissWelcome, userId, requestDashboardTour]);

  // AI chat panel, mirroring the Home page: the "AI Chat" quick action opens
  // the shared panel (AiChatStore), which the dashboard hosts itself since it
  // doesn't render inside a Section.
  const {
    aiReady: aiChatReady,
    noAccessProps: aiChatNoAccessProps,
    topUpDialog: aiChatTopUpDialog,
  } = useChatNoAccess(props);

  const aiChatPanel = useAiChatPanel(true, {
    aiReady: aiChatReady,
    noAccessProps: aiChatNoAccessProps,
  });

  const isDesktop = useIsDesktop();
  const isAiChatFullscreen =
    aiChatPanel.isChatPanelVisible &&
    (aiChatPanel.isChatPanelFullscreen || !isDesktop);

  // The dashboard has no async content to load, so finish the sidebar's
  // Overview item progress animation immediately (other pages dispatch this
  // once their content is ready). Keyed on location so re-clicking Overview
  // while already on it (same path, new location.key) ends the animation
  // again instead of leaving it stuck in "progress".
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
  }, [location.key]);

  const design = searchParams.get("design");
  if (design === "old") {
    localStorage.setItem("useDocSpace", "old");
    return <Navigate to="/" replace />;
  }
  if (design === "new") {
    localStorage.setItem("useDocSpace", "new");
    return <Navigate to="/dashboard" replace />;
  }

  // On first app load the sidebar shows its nav skeleton until initFiles
  // resolves; render the matching body skeleton so the Overview doesn't pop in
  // ahead of the navigation it sits next to.
  if (showLoader) return <DashboardLoader />;

  return (
    <div
      className={styles.dashboardLayout}
      data-layout-mode={isAiChatFullscreen ? "ai-fullscreen" : undefined}
    >
      <div className={styles.dashboard} inert={isAiChatFullscreen}>
        <Scrollbar className={styles.dashboardScrollbar}>
          <div className={styles.dashboardInner}>
            <Header
              onOpenTour={isMobile ? undefined : () => setIsWelcomeOpen(true)}
            />
            <ProfileCard />

            <section data-tour-id="dashboard-create" className={styles.section}>
              <div className={styles.sectionHeading}>
                <Text fontSize="18px" fontWeight={700} lineHeight="24px">
                  <Trans
                    t={t}
                    ns="Common"
                    i18nKey="CreateNewOrUpload"
                    components={{
                      1: (
                        <Link
                          id={UPLOAD_LINK_ID}
                          type={LinkType.action}
                          color="accent"
                          isHovered
                          isSemitransparent={isGuest}
                          fontSize="18px"
                          fontWeight={700}
                          lineHeight="24px"
                          onClick={isGuest ? undefined : openUploadDialog}
                        />
                      ),
                    }}
                  />
                </Text>
                <Text as="p" className={styles.createSubtitle}>
                  {t("Common:NewFilesDefaultPlace", {
                    sectionName: t("Common:Files"),
                  })}
                  {isAdminOrOwner ? (
                    <>
                      {" - "}
                      <Trans
                        t={t}
                        ns="Common"
                        i18nKey="OrConnectDocs"
                        values={{
                          docsName: getBrandName("ProductEditorsName"),
                        }}
                        components={{
                          1: (
                            <Link
                              type={LinkType.action}
                              color="accent"
                              isHovered
                              className={styles.createSubtitleLink}
                              onClick={openDocsConnect}
                            />
                          ),
                        }}
                      />
                    </>
                  ) : null}
                </Text>
              </div>
              {isGuest ? (
                <Tooltip
                  id={`${UPLOAD_LINK_ID}-tooltip`}
                  anchorSelect={`#${UPLOAD_LINK_ID}`}
                  place="bottom"
                  getContent={() => <GuestRestrictionTooltip />}
                />
              ) : null}
              <QuickActions
                items={createItems}
                className={styles.quickActions}
              />
            </section>

            {moduleItems.length > 0 ? (
              <section data-tour-id="dashboard-apps" className={styles.section}>
                <div className={styles.sectionHeading}>
                  <Text className={styles.sectionTitle}>
                    {t("Common:DiscoverApps")}
                  </Text>
                  <Text className={styles.sectionSubtitle}>
                    {t("Common:DiscoverAppsDescription", {
                      planName: isFreeTariff
                        ? t("Common:StartupPlan")
                        : t("Common:BusinessPlan"),
                    })}
                  </Text>
                </div>
                <div className={styles.modulesGrid}>
                  {moduleItems.map((mod) => (
                    <ModuleCard
                      key={mod.id}
                      mod={mod}
                      onTakeTour={
                        isMobile
                          ? undefined
                          : () => {
                              requestAppTour(mod.id as AppId);
                              // The tour runs inside the app's section, so this
                              // navigates even when the button next to it
                              // creates.
                              navigate(mod.href);
                            }
                      }
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <IntegrationsCard />
            <DevToolsCard />
          </div>
        </Scrollbar>

        {progress.isUploading ? (
          <FloatingButton
            icon="upload"
            percent={progress.percent}
            completed={progress.completed}
            alert={progress.alert}
            showCancelButton={progress.completed || progress.alert}
            clearUploadedFilesHistory={clearProgress}
          />
        ) : null}

        {showWelcome ? (
          <WelcomeDialog
            onTakeTour={onWelcomeTakeTour}
            onClose={onWelcomeClose}
          />
        ) : null}

        <DashboardTourHost />
      </div>

      <ChatPanelView
        isVisible={aiChatPanel.isChatPanelVisible}
        setIsVisible={(visible) => {
          if (!visible) aiChatPanel.closeChatPanel();
        }}
        currentDeviceType={currentDeviceType}
      >
        {aiChatPanel.chatPanelContent}
      </ChatPanelView>

      {aiChatTopUpDialog}
    </div>
  );
};

const DashboardConnected = inject((stores: TStore) => {
  const {
    authStore,
    userStore,
    clientLoadingStore,
    settingsStore,
    currentQuotaStore,
    dialogsStore,
    filesTourStore,
    roomsTourStore,
    formsTourStore,
    aiAgentsTourStore,
    dashboardTourStore,
  } = stores;

  // The app cards an onboarding tour can be started from. An app that isn't
  // here simply gets no "Take a tour" button in its promo.
  const appTourStores = {
    "ai-files": filesTourStore,
    "ai-rooms": roomsTourStore,
    "ai-forms": formsTourStore,
    "ai-agents": aiAgentsTourStore,
  } as const;

  return {
    ...mapChatNoAccessStores(stores),
    isGuest: userStore.user?.isVisitor ?? false,
    showLoader: clientLoadingStore.showArticleLoader,
    currentDeviceType: settingsStore.currentDeviceType,
    requestAppTour: (appId: AppId) => {
      if (appId in appTourStores)
        appTourStores[appId as keyof typeof appTourStores].requestTour();
    },
    // The welcome flag is per-user, so the id is passed through rather than read
    // inside the store — which has no view of who is signed in.
    userId: userStore.user?.id,
    isWelcomeSeen: dashboardTourStore.isWelcomeSeen,
    hydrateWelcome: dashboardTourStore.hydrateWelcome,
    dismissWelcome: dashboardTourStore.dismissWelcome,
    requestDashboardTour: dashboardTourStore.requestTour,
    // Same set the Home quick actions and the agents header button gate on.
    canCreateRooms: authStore.isAdmin || authStore.isRoomAdmin,
    // Room admins are excluded here: Docs Connect sits under the portal's
    // developer tools, which only admins and the owner can open. Same flags
    // the Header and ProfileCard gate on.
    isAdminOrOwner:
      (userStore.user?.isAdmin ?? false) || (userStore.user?.isOwner ?? false),
    aiReady: settingsStore.aiConfig?.aiReady ?? false,
    // Undefined until the tariff loads; the plan is free by default, matching
    // the header's own fallback.
    isFreeTariff: currentQuotaStore.isFreeTariff ?? true,
    isWarningRoomsDialog: currentQuotaStore.isWarningRoomsDialog,
    setQuotaWarningDialogVisible: dialogsStore.setQuotaWarningDialogVisible,
  };
})(observer(Dashboard));

export { DashboardConnected as Dashboard };

export default DashboardConnected;

