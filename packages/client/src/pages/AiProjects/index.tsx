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

import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import classnames from "classnames";
import { comparer, reaction } from "mobx";

import Section from "@onlyoffice/apps-ui-kit/components/section";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { QuickActions } from "@onlyoffice/apps-ui-kit/components/quick-actions";
import { CreateAgentIcon } from "@onlyoffice/apps-ui-kit/components/quick-actions/icons";
import { MainButtonMobile } from "@onlyoffice/apps-ui-kit/components/main-button-mobile";
import {
  AiChatPanelBody,
  AiChatPanelHeaderContainer,
  useAiChatPanel,
} from "@onlyoffice/apps-ui-kit/ai-agent/ai-chat-panel";
import { useAiChatStore } from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";
import { useIsAiChatAvailable } from "@onlyoffice/apps-ui-kit/ai-agent/providers/availability";
import { useStores } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import { AI_SETTINGS_URL } from "SRC_DIR/helpers/constants";
import ChatPanelView from "@onlyoffice/apps-ui-kit/components/section/sub-components/ChatPanel";
import { useIsDesktop } from "@onlyoffice/apps-ui-kit/hooks/use-is-desktop";
import { AnimationEvents } from "@onlyoffice/apps-ui-kit/hooks/useAnimation";
import { useDocumentTitle } from "@docspace/shared/hooks/useDocumentTitle";
import { ConfirmationModal } from "@docspace/shared/dialogs/confirmation-modal";
import { DeviceType } from "@docspace/shared/enums";
import type { TAiProject } from "@docspace/shared/api/ai/projects";
import { aiProjectToRoom, interceptAiProjectRoutes } from "@docspace/shared/api/ai/projectsRouteMock";

import SectionWrapper from "SRC_DIR/components/Section";
import {
  InfoPanelActions,
  InfoPanelBodyContent as InfoPanelBodyContentConnected,
  InfoPanelHeaderContent as InfoPanelHeaderContentConnected,
} from "SRC_DIR/pages/Home/InfoPanel";
import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";
import type DialogsStore from "SRC_DIR/store/DialogsStore";
import { useHideQuickActions } from "SRC_DIR/pages/Home/Hooks/useHideQuickActions";
import { usePanelExclusivity } from "SRC_DIR/pages/Home/View/usePanelExclusivity";
import type InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import { useStore } from "SRC_DIR/store/useStore";
import {
  mapChatNoAccessStores,
  useChatNoAccess,
  type ChatNoAccessStoreProps,
} from "SRC_DIR/Hooks/useChatNoAccess";

import ProjectsHeader from "./sub-components/ProjectsHeader";
import ProjectsFilter from "./sub-components/ProjectsFilter";
import EmptyProjects from "./sub-components/EmptyProjects";
import { TableView } from "./sub-components/list/TableView";
import { RowsView } from "./sub-components/list/RowsView";
import { TilesView } from "./sub-components/list/TilesView";
import { useProjectContextMenu } from "./sub-components/useProjectContextMenu";
import ProjectHeader from "./sub-components/project/ProjectHeader";
import SourcesStrip from "./sub-components/project/SourcesStrip";
import { ProjectSources } from "./sub-components/project/ProjectSources";
import CreateEditProjectDialog from "./sub-components/dialogs/CreateEditProjectDialog";
import { canManageProjects } from "./utils";
import styles from "./AiProjects.module.scss";

// The info panel of the Files section, reused as is: its stores inject every
// prop, as on the Home page, so none is passed here.
const InfoPanelHeaderContent = InfoPanelHeaderContentConnected as unknown as React.FC;
const InfoPanelBodyContent = InfoPanelBodyContentConnected as unknown as React.FC;

type AiProjectsProps = {
  aiProjectsStore: AiProjectsStore;
  currentDeviceType: DeviceType;
  userId: string;
  canManage: boolean;
  isAdmin: boolean;
  /** Stores behind the AI readiness / activation flow, shared with the agents page. */
  aiNoAccessStores: ChatNoAccessStoreProps;
  locale?: string;
  changeRoomOwnerIsVisible: boolean;
  invitePanelVisible: boolean;
  showQuickActions: boolean;
  setShowQuickActions: (value: boolean) => Promise<boolean>;
  infoPanelVisible: boolean;
  infoPanelStore: InfoPanelStore;
};

const AiProjects = ({
  aiProjectsStore: store,
  currentDeviceType,
  userId,
  canManage,
  isAdmin,
  aiNoAccessStores,
  locale,
  changeRoomOwnerIsVisible,
  invitePanelVisible,
  showQuickActions,
  setShowQuickActions,
  infoPanelVisible,
  infoPanelStore,
}: AiProjectsProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const aiChatStore = useAiChatStore();
  const isAiChatAvailable = useIsAiChatAvailable();
  // Same readiness rule and activation flow as the AI agents section: on a
  // standalone portal AI is ready once a chat profile exists, on SaaS once the
  // AI service is on. Until the profiles are loaded the state is unknown, so
  // the page keeps its loader instead of flashing the "AI is off" view.
  const { aiReady, activation, topUpDialog } = useChatNoAccess(aiNoAccessStores);
  const { useProfilesStore, useRouter } = useStores();
  const profilesInitialized = useProfilesStore((s) => s.initialized);
  // The chat history takes the sources' place: while it is open they hide.
  const isHistoryOpen = useRouter((s) => s.currentPage) === "history";
  const aiStateKnown = !aiNoAccessStores.standalone || profilesInitialized;
  const showAiOff = aiStateKnown && !aiReady;
  const aiChatPanel = useAiChatPanel(true);
  const isDesktop = useIsDesktop();

  useDocumentTitle("Common:AIProjects");

  // The room dialogs and panels (invite, members, owner, leave) call the
  // Files API for the project; while the page is up those calls are served
  // by the projects service.
  React.useEffect(() => interceptAiProjectRoutes(userId), [userId]);

  React.useEffect(() => {
    void store.fetchProjects().then(() => {
      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
    });
  }, [store, location.key]);

  // A room dialog that changed the project (members, owner, leave) is
  // reflected in the list once it closes.
  const dialogsOpen = changeRoomOwnerIsVisible || invitePanelVisible;
  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    if (wasOpen.current && !dialogsOpen) {
      void store.fetchProjects();
      void store.refreshActiveProject();
    }
    wasOpen.current = dialogsOpen;
  }, [dialogsOpen, store]);

  const openProject = React.useCallback(
    (project: TAiProject) => {
      void store.openProject(project).then(() => {
        const { profile, instructionsRooms, knowledgeRooms } = project.aiProject;
        const toRoom = (room: { id: number; title: string }) => ({
          cloud: "docspace",
          id: String(room.id),
          name: room.title,
        });
        aiChatStore.openProject({
          profileId: profile?.id ?? null,
          profileName: profile?.name ?? null,
          instructionsRooms: instructionsRooms.map(toRoom),
          knowledgeRooms: knowledgeRooms.map(toRoom),
        });
      });
      if (String(project.id) !== projectId) navigate(`/ai-projects/${project.id}`);
    },
    [store, aiChatStore, navigate, projectId],
  );

  const closeProject = React.useCallback(() => {
    store.closeProject();
    aiChatPanel.closeChatPanel();
    navigate("/ai-projects");
  }, [store, aiChatPanel, navigate]);

  // A deep link opens the project once the list is there; the list URL
  // (Back from a project, or any navigation that skipped closeProject)
  // closes the one that is open.
  React.useEffect(() => {
    if (!projectId) {
      if (store.activeProject) {
        store.closeProject();
        aiChatPanel.closeChatPanel();
      }
      return;
    }
    if (store.activeProject?.id === Number(projectId)) return;
    void store.openProjectById(Number(projectId)).then(() => {
      const project = store.activeProject;
      if (project) openProject(project);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // The project dropped under the open chat (left, or handed over without
  // staying in it): the chat closes and the URL goes back to the list.
  React.useEffect(
    () =>
      reaction(
        () => store.activeProject,
        (project, previous) => {
          if (project === null && previous !== null && projectId) {
            aiChatPanel.closeChatPanel();
            navigate("/ai-projects");
          }
        },
      ),
    [store, aiChatPanel, navigate, projectId],
  );

  // The info panel reads the project from the Files selection, which only
  // the Info actions set. Keep it in step with the store: the open project
  // when another one is opened, the fresh copy after an edit, pin or owner
  // change, and nothing (panel closed) once the project is deleted or left.
  const filesStore = useStore("filesStore");
  React.useEffect(
    () =>
      reaction(
        () => {
          const selection = filesStore.bufferSelection as { id?: number; isAIProject?: boolean } | null;
          const selectedId = selection?.isAIProject ? selection.id : undefined;
          const source =
            selectedId === undefined
              ? undefined
              : store.activeProject?.id === selectedId
                ? store.activeProject
                : store.projects.find((p) => p.id === selectedId);
          return [store.activeProject, selectedId, source, infoPanelStore.isVisible] as const;
        },
        ([active, selectedId, source, visible], previous) => {
          if (active && visible && selectedId !== active.id) {
            filesStore.setBufferSelection(aiProjectToRoom(active) as never);
            return;
          }
          if (selectedId === undefined) return;
          if (!source) {
            filesStore.setBufferSelection(null);
            if (visible) infoPanelStore.setIsVisible(false);
            return;
          }
          filesStore.setBufferSelection(aiProjectToRoom(source) as never);
          // The same project, changed (an owner change re-roles its members):
          // the Contacts tab reloads, as Files does after a share change.
          const [, previousId, previousSource] = previous ?? [];
          if (visible && previousId === selectedId && previousSource && previousSource !== source) {
            infoPanelStore.refreshInfoPanel();
          }
        },
        { equals: comparer.shallow },
      ),
    [store, filesStore, infoPanelStore],
  );

  // Leaving the page drops the open project with it, and the project's chat:
  // it was opened fullscreen for the project and would otherwise cover the
  // next page. A chat opened from the list is left as it is. The project goes
  // first, so the "closing the chat leaves the project" reaction below finds
  // none and does not navigate back here.
  React.useEffect(
    () => () => {
      const hadProject = store.activeProject !== null;
      store.closeProject();
      if (hadProject) aiChatStore.close();
    },
    [store, aiChatStore],
  );

  // Closing the chat leaves the project.
  React.useEffect(
    () =>
      reaction(
        () => aiChatStore.isVisible,
        (visible) => {
          if (!visible && store.activeProject) {
            store.closeProject();
            navigate("/ai-projects");
          }
        },
      ),
    [aiChatStore, store, navigate],
  );

  const isAiChatFullscreen =
    isAiChatAvailable &&
    aiChatPanel.isChatPanelVisible &&
    (aiChatPanel.isChatPanelFullscreen || !isDesktop);
  // An open project is drawn the way an agent's chat is (AIAgentView): the
  // chat in the section body under the project's Navigation, so the section's
  // own info panel opens beside it. The chat panel is not used meanwhile.
  const isProjectView = isAiChatAvailable && aiReady && !!store.activeProject;
  const isPageCollapsed = isAiChatFullscreen && !isProjectView;

  // As on an agent: the history and the info panel share the side, so
  // opening one closes the other.
  usePanelExclusivity(infoPanelStore);

  // The sources column replaces the composer's chips while it is on screen.
  React.useEffect(() => {
    aiChatStore.setComposerContextHidden(isProjectView);
    return () => aiChatStore.setComposerContextHidden(false);
  }, [aiChatStore, isProjectView]);

  const getContextModel = useProjectContextMenu(store, { withOpen: true, onOpen: openProject });

  const onCreate = React.useCallback(() => store.openCreateDialog(), [store]);

  const onDelete = async () => {
    const project = store.deleteFor;
    if (!project) return;
    try {
      await store.removeProject(project);
      toastr.success(t("Common:AIProjectDeleted", { name: project.title }));
    } catch (e) {
      toastr.error((e as Error).message);
    } finally {
      store.closeDelete();
    }
  };

  const onLeave = async () => {
    const project = store.leaveFor;
    if (!project) return;
    try {
      await store.leaveProject(project);
      toastr.success(t("Common:AIProjectLeft", { name: project.title }));
    } catch (e) {
      toastr.error((e as Error).message);
    } finally {
      store.closeLeave();
    }
  };

  // With AI off the page shows only the "AI is off" view: no filter, no list,
  // no create actions, whatever the server returns (the agents root hides its
  // create entry points the same way).
  const hasProjects = !showAiOff && store.projects.length > 0;
  const showEmpty = showAiOff || (store.isLoaded && !hasProjects);
  const canCreate = canManage && isAiChatAvailable && aiReady;
  const isMobile = currentDeviceType === DeviceType.mobile;

  const quickActions = React.useMemo(
    () => [
      {
        id: "quick-new-ai-project",
        icon: <CreateAgentIcon />,
        label: t("Common:NewAIProject"),
        onClick: onCreate,
      },
    ],
    [t, onCreate],
  );
  const activeProject = store.activeProject;
  const onHideQuickActions = useHideQuickActions({ t, setShowQuickActions });
  const showBanner =
    showQuickActions && canCreate && hasProjects && isDesktop && !activeProject;

  const renderBody = () => {
    if (showEmpty) {
      return (
        <EmptyProjects
          kind={showAiOff ? "ai-off" : store.isFiltered ? "filter" : "empty"}
          canManage={canManage}
          isAdmin={isAdmin}
          standalone={!!aiNoAccessStores.standalone}
          isCardLinkedToPortal={!!aiNoAccessStores.isCardLinkedToPortal}
          isActivating={activation.isActivating}
          onActivateAI={activation.onActivateAI}
          onTopUpAndActivateAI={activation.onTopUpAndActivateAI}
          onGoToAISettings={() => navigate(AI_SETTINGS_URL)}
          onCreate={onCreate}
          onClearFilter={store.clearFilter}
        />
      );
    }
    if (!isDesktop && store.viewAs !== "tile") {
      return <RowsView store={store} onOpen={openProject} getContextModel={getContextModel} />;
    }
    switch (store.viewAs) {
      case "tile":
        return <TilesView store={store} onOpen={openProject} getContextModel={getContextModel} />;
      case "row":
        return <RowsView store={store} onOpen={openProject} getContextModel={getContextModel} />;
      default:
        return (
          <TableView
            store={store}
            onOpen={openProject}
            getContextModel={getContextModel}
            locale={locale}
            userId={userId}
            infoPanelVisible={infoPanelVisible}
          />
        );
    }
  };


  return (
    <div
      className={styles.layout}
      data-layout-mode={isPageCollapsed ? "ai-fullscreen" : undefined}
    >
      <div
        className={classnames(styles.page, {
          [styles.stickyBannerVars]: showBanner,
        })}
        inert={isPageCollapsed}
      >
        <SectionWrapper
          viewAs={store.viewAs}
          withBodyScroll
          settingsStudio={false}
          isEmptyPage={showEmpty}
          scrollableBanner={showBanner}
          stickyTableHeader={showBanner}
          // As Home does for an agent's chat: the body fills the section
          // instead of sizing to its content, and has no footer spacer.
          fullHeightBody={isProjectView}
          withoutFooter={isProjectView}
        >
          <Section.SectionHeader>
            {activeProject ? (
              <ProjectHeader
                store={store}
                project={activeProject}
                currentDeviceType={currentDeviceType}
                onBack={closeProject}
              />
            ) : (
              <ProjectsHeader
                currentDeviceType={currentDeviceType}
                hideChatButton={!aiReady}
              />
            )}
          </Section.SectionHeader>
          {showBanner ? (
            <Section.SectionBanner>
              <QuickActions
                items={quickActions}
                onClose={() => void onHideQuickActions()}
                closeLabel={t("Common:DisableQuickActionsOnAllPages")}
                prevLabel={t("Common:Previous")}
                nextLabel={t("Common:Next")}
                dataTestId="ai-projects-quick-actions"
              />
            </Section.SectionBanner>
          ) : null}
          {!isProjectView && (hasProjects || (store.isFiltered && !showAiOff)) ? (
            <Section.SectionFilter>
              <ProjectsFilter
                store={store}
                onCreate={onCreate}
                canCreate={canCreate}
                userId={userId}
                currentDeviceType={currentDeviceType}
                isDesktop={isDesktop}
              />
            </Section.SectionFilter>
          ) : null}
          <Section.SectionBody>
            {isProjectView && activeProject ? (
              // `chat-container` drops the body's vertical padding while the
              // chat shows, as for an agent's chat.
              <div className={classnames(styles.projectChat, "chat-container")}>
                {isMobile && !isHistoryOpen && !infoPanelVisible ? (
                  <SourcesStrip project={activeProject} />
                ) : null}
                <div className={classnames(styles.panelBody, styles.projectBody)}>
                  {/* The history and the info panel each take the sources' place. */}
                  {isDesktop && !isHistoryOpen && !infoPanelVisible ? (
                    <ProjectSources store={store} project={activeProject} />
                  ) : null}
                  <div className={styles.panelChat}>
                    <AiChatPanelBody />
                  </div>
                </div>
              </div>
            ) : (
              renderBody()
            )}
            {canCreate && !isDesktop && !isAiChatFullscreen && !isProjectView ? (
              <MainButtonMobile
                className={styles.mobileButton}
                title={t("Common:NewAIProject")}
                withMenu={false}
                onClick={onCreate}
              />
            ) : null}
          </Section.SectionBody>
          <Section.InfoPanelHeader>
            <InfoPanelHeaderContent />
          </Section.InfoPanelHeader>
          <Section.InfoPanelBody>
            <InfoPanelBodyContent />
          </Section.InfoPanelBody>
        </SectionWrapper>
      </div>

      {/* Listens for the info panel's events (its close button, open, tab
          switches), as on Home; without it the panel cannot be closed. */}
      <InfoPanelActions />
      {showAiOff ? topUpDialog : null}
      {isAiChatAvailable && aiReady && !isProjectView ? (
        <ChatPanelView
          isVisible={aiChatPanel.isChatPanelVisible}
          setIsVisible={(visible) => {
            if (!visible) aiChatPanel.closeChatPanel();
          }}
          currentDeviceType={currentDeviceType}
          isResizable
          isFullscreen={isAiChatFullscreen}
          width={aiChatPanel.chatPanelWidth}
          onResize={aiChatPanel.setChatPanelWidth}
          onRequestFullscreen={aiChatPanel.setChatPanelFullscreen}
          onExitFullscreen={aiChatPanel.unsetChatPanelFullscreen}
        >
          <AiChatPanelHeaderContainer />
          <div className={styles.panelBody}>
            <div className={styles.panelChat}>
              <AiChatPanelBody />
            </div>
          </div>
        </ChatPanelView>
      ) : null}

      {store.projectDialog ? <CreateEditProjectDialog key={store.projectDialog.mode} store={store} /> : null}
      {store.leaveFor ? (
        <ConfirmationModal
          visible
          title={t("Common:AIProjectLeave")}
          message={t("Common:AIProjectLeaveConfirm", { name: store.leaveFor.title })}
          confirmLabel={t("Common:AIProjectLeave")}
          onConfirm={() => void onLeave()}
          onCancel={store.closeLeave}
        />
      ) : null}
      {store.deleteFor ? (
        <ConfirmationModal
          visible
          title={t("Common:AIProjectDelete")}
          message={t("Common:AIProjectDeleteConfirm", { name: store.deleteFor.title })}
          confirmLabel={t("Common:Delete")}
          onConfirm={() => void onDelete()}
          onCancel={store.closeDelete}
        />
      ) : null}
    </div>
  );
};

const AiProjectsConnected = inject(
  ({
    aiProjectsStore,
    settingsStore,
    userStore,
    dialogsStore,
    filesSettingsStore,
    paymentStore,
    authStore,
    infoPanelStore,
  }: TStore & { dialogsStore: DialogsStore }) => ({
    aiProjectsStore,
    currentDeviceType: settingsStore.currentDeviceType,
    userId: userStore.user?.id ?? "",
    canManage: canManageProjects(userStore.user),
    isAdmin: !!(userStore.user?.isOwner || userStore.user?.isAdmin),
    aiNoAccessStores: mapChatNoAccessStores({
      settingsStore,
      userStore,
      paymentStore,
      authStore,
    } as TStore),
    locale: userStore.user?.cultureName ?? settingsStore.culture,
    changeRoomOwnerIsVisible: dialogsStore.changeRoomOwnerIsVisible,
    invitePanelVisible: dialogsStore.invitePanelOptions.visible,
    showQuickActions: filesSettingsStore.showQuickActions,
    setShowQuickActions: filesSettingsStore.setShowQuickActions,
    infoPanelVisible: infoPanelStore.isVisible,
    infoPanelStore,
  }),
)(observer(AiProjects));

export { AiProjectsConnected as AiProjects };
export default AiProjectsConnected;
