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

import React, { useCallback } from "react";
import classnames from "classnames";
import { useLocation, Outlet, Navigate } from "react-router";
import { isOAuthFrame } from "@docspace/shared/utils/oauthToken";
import { isMobile } from "react-device-detect";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";

import { useAiChatPanel } from "@docspace/ui-kit/ai-agent/ai-chat-panel";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";
import { useIsDesktop } from "@docspace/ui-kit/hooks/use-is-desktop";
import {
  useChatNoAccess,
  mapChatNoAccessStores,
} from "SRC_DIR/Hooks/useChatNoAccess";
import {
  useIsAiChatAvailable,
  useStores,
} from "@docspace/ui-kit/ai-agent/providers";

import {
  addTagsToRoom,
  removeTagsFromRoom,
  createTag,
} from "@docspace/shared/api/rooms";
import { createFolder } from "@docspace/shared/api/files";
import Section from "@docspace/ui-kit/components/section";
import { QuickActions } from "@docspace/ui-kit/components/quick-actions";
import { hasOwnProperty } from "@docspace/shared/utils/object";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getCategoryType } from "@docspace/shared/utils/common";
import { CategoryType } from "@docspace/shared/constants";

import SectionWrapper from "SRC_DIR/components/Section";
import DragTooltip from "SRC_DIR/components/DragTooltip";
import SectionTours from "SRC_DIR/components/Tour/SectionTours";
import { getContactsView } from "SRC_DIR/helpers/contacts";
import { isPluginPage } from "SRC_DIR/helpers/plugins/utils";

import {
  SectionFilterContent,
  SectionHeaderContent,
  SectionSubmenuContent,
  SectionWarningContent,
} from "./Section";
import AccountsDialogs from "./Section/ContactsBody/Dialogs";
import UploadFileInputs from "SRC_DIR/components/UploadInputs";
import CreateButtonMobile from "SRC_DIR/components/CreateButtonMobile";

import FilesSelectionArea from "./SelectionArea/FilesSelectionArea";
import ContactsSelectionArea from "./SelectionArea/ContactsSelectionArea";

import {
  InfoPanelActions,
  InfoPanelBodyContent,
  InfoPanelHeaderContent,
} from "./InfoPanel";

import MediaViewer from "./MediaViewer";

import {
  useSDK,
  useOperations,
  usePluginOperations,
  usePanelExclusivity,
} from "./Hooks";
import { useQuickActions } from "./Hooks/useQuickActions";

import styles from "./Home.module.scss";

// `observer` is required because we read MobX observables from the shared
// AiChatStore directly here (via `useAiChatPanel`): without it, the AI chat
// panel's visibility changes (e.g. closing) would not re-render Home.
const PureHome = observer((props) => {
  const {
    currentClientView,
    isChangePageRequestRunning,

    isLoading,

    folderSecurity,

    selectedFolderStore,
    t,
    startUpload,
    setDragging,
    dragging,
    isChatDropTarget,
    createFoldersTree,
    disableDrag,
    clearPrimaryProgressData,
    isPrimaryProgressVisbile,

    refreshFiles,

    setFrameConfig,
    folders,
    files,
    selection,
    filesList,

    createFile,

    createRoom,

    setViewAs,
    viewAs,

    firstLoad,

    isRecycleBinFolder,
    isErrorRoomNotAvailable,
    isErrorAIAgentNotAvailable,
    isIndexEditingMode,

    isSecondaryProgressVisbile,

    isFrame,
    showFilter,
    frameConfig,
    isEmptyPage,
    roomsFilterGroupId,

    contactsTab,
    contactsViewAs,

    showFilterLoader,
    showHeaderLoader,

    getSettings,
    logout,
    login,
    loadCurrentUser,
    updateProfileCulture,
    getRooms,
    setSelectedFolder,
    userId,
    getFolderModel,
    getContactsModel,
    isEmptyGroups,

    isUsersEmptyView,
    secondaryOperationsCompleted,
    primaryOperationsCompleted,
    secondaryActiveOperations,
    clearSecondaryProgressData,
    primaryOperationsArray,
    cancelUpload,
    cancelSecondaryOperation,
    cancelSecondaryOperationById,
    secondaryOperationsStopped,
    secondaryOperationsAlert,
    clearUploadData,
    clearUploadedFiles,
    mainButtonVisible,
    primaryOperationsAlert,
    primaryOperationsCanceled,
    clearConversionData,
    isErrorChecking,
    setOperationCancelVisible,
    hideConfirmCancelOperation,
    chatFiles,

    allowInvitingGuests,
    checkGuests,
    sectionWithTabs,
    dropTargetPreview,
    setDropTargetPreview,
    selectedFolderTitle,
    clearDropPreviewLocation,
    canCreateSecurity,
    startDropPreview,

    aiConfig,
    currentTab,
    selectedResultFileId,
    setIsAboutDialogVisible,

    pluginFloatingOperationsArray,
    removePluginFloatingOperations,
    dispatchMessage,
    getPluginIconUrl,

    currentFolderId,
    canCreateFiles,
    canCreateEncrypted,
    canCreateRooms,
    isDocumentsFolder,
    isRoom,
    isRoomsFolder,
    isPrivacyFolder,
    isArchiveFolder,
    isTemplatesFolder,
    isFavoritesFolder,
    isRecentFolder,
    isAIAgentsFolder,
    templateGalleryAvailable,
    setTemplateGalleryVisible,
    setOformFromFolderId,
    setCreateRoomFromTemplate,

    infoPanelStore,
  } = props;

  const [shouldShowFilter, setShouldShowFilter] = React.useState(false);
  const isDesktop = useIsDesktop();

  const location = useLocation();

  const {
    aiReady: aiChatReady,
    noAccessProps: aiChatNoAccessProps,
    topUpDialog: aiChatTopUpDialog,
  } = useChatNoAccess(props.aiNoAccessStores);

  const aiChatPanel = useAiChatPanel(true, {
    aiReady: aiChatReady,
    noAccessProps: aiChatNoAccessProps,
  });

  React.useEffect(() => {
    if (location.state?.openAboutDialog && setIsAboutDialogVisible) {
      setIsAboutDialogVisible(true);
      // clear state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setIsAboutDialogVisible]);

  // console.log(t("Common:ComingSoon"))

  const isSettingsPage =
    location.pathname.includes("settings") &&
    !location.pathname.includes("settings/plugins");

  const view = getContactsView(location);
  if (allowInvitingGuests === false && view === "guests") checkGuests();

  const isContactsPage =
    currentClientView === "users" || currentClientView === "groups";
  const isProfile = currentClientView === "profile";
  const isContactsEmptyView =
    contactsTab === "groups" ? isEmptyGroups : isUsersEmptyView;
  const isChat = currentClientView === "chat";

  // Availability is computed once by the host (Shell) and shared through
  // AiAgentProviders' context.
  const isAiChatAvailable = useIsAiChatAvailable();

  usePanelExclusivity(infoPanelStore);

  const isAiChatFullscreen =
    isAiChatAvailable &&
    aiChatPanel.isChatPanelVisible &&
    (aiChatPanel.isChatPanelFullscreen || !isDesktop);

  // On tablets/phones the opened AI chat panel takes over the whole main
  // area, so navigating to another section via the left panel must hide it —
  // otherwise the new section stays covered by the chat overlay. Desktop
  // keeps the docked panel open across navigation by design.
  const prevPathnameRef = React.useRef(location.pathname);
  React.useEffect(() => {
    if (prevPathnameRef.current === location.pathname) return;
    prevPathnameRef.current = location.pathname;

    if (!isDesktop && aiChatPanel.isChatPanelVisible)
      aiChatPanel.closeChatPanel();
  }, [location.pathname, isDesktop, aiChatPanel]);

  // The "Forms" section root gets its own quick-actions tile set (collect
  // forms + from template), resolved by the hook below.
  const isFormsSection = getCategoryType(location) === CategoryType.Forms;

  // Inside a Form Filling room (or its subfolders) we offer the form-only tile
  // set. Derive this from the URL (CategoryType.Form ⇔ `/forms/{id}`) rather
  // than the selected-folder store: the store's roomType/parentRoomType load
  // asynchronously, so during navigation `isRoom` flips true before the form
  // type is known and the banner briefly flashes the regular-room file tiles.
  // The pathname changes atomically with the route, so this never lags.
  const isFormRoom = getCategoryType(location) === CategoryType.Form;

  // AI-agents create gating: AI must be ready and the user able to manage
  // agents (admins / owners / room admins — same set as canCreateRooms).
  // `aiReady` (portal /ai/config) can lag behind the chat-lib profiles, so
  // treat the presence of profiles as ready too — same signal the agents
  // EmptyView uses to decide whether to offer agent creation.
  const { useProfilesStore } = useStores();
  const hasAiProfiles = useProfilesStore((s) => s.profiles.length > 0);
  const canCreateAgents =
    (aiConfig?.aiReady || hasAiProfiles) && canCreateRooms;

  // Quick-actions banner (ported from the SDK): create tiles above the
  // files/rooms list. The hook resolves which tile set applies (or none) from
  // the current section + create permission.
  const quickActions = useQuickActions({
    currentFolderId,
    canCreateFiles,
    canCreateEncrypted,
    canCreateRooms,
    canCreateAgents,
    templateGalleryAvailable,
    setTemplateGalleryVisible,
    setOformFromFolderId,
    setCreateRoomFromTemplate,
    isDocumentsFolder,
    isRoom,
    isFormRoom,
    isRoomsFolder,
    isPrivacyFolder,
    isArchiveFolder,
    isRecycleBinFolder,
    isTemplatesFolder,
    isFavoritesFolder,
    isRecentFolder,
    isAIAgentsFolder,
    isFormsSection,
    isContactsPage,
    isProfile,
    isSettingsPage,
  });
  const showQuickActions = quickActions.show && !isChat && !isEmptyPage;

  const onDrop = useEventCallback((f, uploadToFolder) => {
    if (isContactsPage || isProfile) return;

    if (
      folderSecurity &&
      hasOwnProperty(folderSecurity, "Create") &&
      !folderSecurity.Create
    )
      return;

    const dragged = dragging;
    dragging && setDragging(false);

    if (disableDrag) return;

    createFoldersTree(t, f, uploadToFolder, dragged)
      .then((fItem) => {
        if (fItem.length > 0) startUpload(fItem, uploadToFolder, t);
      })
      .catch((err) => {
        toastr.error(err, null, 0, true);
      });
  });

  useOperations({
    clearUploadData,
    clearUploadedFiles,
    primaryOperationsArray,
    clearConversionData,
  });

  const {
    pluginOperations,
    pluginOperationsCompleted,
    pluginOperationsAlert,
    pluginShowCancelButton,
    handlePluginCancelOperation,
    handlePluginClearOperation,
  } = usePluginOperations({
    pluginFloatingOperationsArray,
    dispatchMessage,
    getPluginIconUrl,
    removePluginFloatingOperations,
  });

  useSDK({
    frameConfig,
    setFrameConfig,
    selectedFolderStore,
    folders,
    files,
    filesList,
    selection,
    userId,
    createFile,
    createFolder,
    createRoom,
    refreshFiles,
    setViewAs,
    getSettings,
    logout,
    login,
    addTagsToRoom,
    createTag,
    removeTagsFromRoom,
    loadCurrentUser,
    updateProfileCulture,
    getRooms,
    isLoading,
  });

  const getContextModel = useCallback(() => {
    if (isFrame || isProfile) return null;

    if (isContactsPage) return getContactsModel(t, true);
    return getFolderModel(t, true);
  }, [
    isFrame,
    isProfile,
    isContactsPage,
    getContactsModel,
    getFolderModel,
    contactsTab,
  ]);

  const onCancelUpload = useCallback(() => {
    if (pluginShowCancelButton) {
      handlePluginCancelOperation();
      return;
    }

    if (
      secondaryActiveOperations?.length > 0 &&
      !primaryOperationsArray?.length
    ) {
      cancelSecondaryOperation();
      return;
    }

    if (hideConfirmCancelOperation) {
      cancelUpload();
      return;
    }

    setOperationCancelVisible(true);
  }, [
    hideConfirmCancelOperation,
    cancelUpload,
    cancelSecondaryOperation,
    secondaryActiveOperations,
    primaryOperationsArray,
    setOperationCancelVisible,
    handlePluginCancelOperation,
    pluginOperations,
    pluginShowCancelButton,
  ]);

  const onClearSecondaryProgressData = useCallback(
    (operationId, operation, operationItem) => {
      // When button is hidden, clear progress data
      if (!operationItem && !operationId && !operation) {
        clearSecondaryProgressData?.();
        handlePluginClearOperation();
        return;
      }

      const isPluginOperation = pluginOperations.find(
        (item) => item.id === operationItem?.id,
      );

      if (isPluginOperation) {
        handlePluginClearOperation(operationItem.id);
      } else {
        clearSecondaryProgressData?.(operationId, operation);
      }
    },
    [clearSecondaryProgressData, handlePluginClearOperation],
  );

  React.useEffect(() => {
    return () => {
      setSelectedFolder(null);
    };
  }, [setSelectedFolder]);

  let sectionProps = {};

  if (isSettingsPage) {
    sectionProps.isInfoPanelAvailable = false;
    sectionProps.viewAs = "settings";
  } else {
    sectionProps = {
      withBodyScroll: true,
      withBodyAutoFocus: !isMobile,
      firstLoad,
      isLoaded: !firstLoad,
      viewAs: contactsViewAs,
      isAccounts: isContactsPage,
      chatFiles,
    };

    if (!isContactsPage) {
      sectionProps.dragging = dragging;
      sectionProps.uploadFiles = !isChat;
      sectionProps.onDrop = isRecycleBinFolder ? null : onDrop;

      sectionProps.viewAs = viewAs;
      sectionProps.hideAside =
        isPrimaryProgressVisbile || isSecondaryProgressVisbile;

      sectionProps.isEmptyPage = isEmptyPage;
      sectionProps.isTrashFolder = isRecycleBinFolder;
      sectionProps.fullHeightBody = isChat || !!selectedResultFileId;
    } else {
      sectionProps.isAccounts = isContactsPage;
    }
  }

  const onDragOverEmpty = React.useCallback(
    (isDragActive) => {
      if (
        isDragActive &&
        selectedFolderTitle &&
        !disableDrag &&
        canCreateSecurity
      ) {
        setDropTargetPreview(selectedFolderTitle);
      }
    },
    [selectedFolderTitle, setDropTargetPreview, disableDrag, canCreateSecurity],
  );

  const onDragLeaveEmpty = React.useCallback(
    (e) => {
      if (setDropTargetPreview) {
        // Check if mouse is over preview button or progress bar elements
        const target =
          e?.relatedTarget ||
          document.elementFromPoint(e?.clientX || 0, e?.clientY || 0);

        const isOverPreviewButton =
          target?.closest(".previewFloatingButtonContainer") ||
          target?.closest(".layout-progress-bar") ||
          target?.closest(".layout-progress-bar_wrapper") ||
          target?.closest('[role="tooltip"]');

        if (!isOverPreviewButton) {
          setDropTargetPreview(null);
        }
      }
    },
    [setDropTargetPreview],
  );

  // sectionProps.onOpenUploadPanel = showUploadPanel;

  sectionProps.getContextModel = isChat ? null : getContextModel;
  sectionProps.isIndexEditingMode = isIndexEditingMode;

  sectionProps.secondaryActiveOperations = secondaryActiveOperations;
  sectionProps.secondaryOperationsCompleted = secondaryOperationsCompleted;
  sectionProps.dropTargetPreview = dropTargetPreview;
  sectionProps.clearSecondaryProgressData = onClearSecondaryProgressData;
  sectionProps.cancelSecondaryOperationById = cancelSecondaryOperationById;
  sectionProps.primaryOperationsArray = primaryOperationsArray;
  sectionProps.clearPrimaryProgressData = clearPrimaryProgressData;
  sectionProps.clearDropPreviewLocation = clearDropPreviewLocation;
  sectionProps.primaryOperationsCompleted = primaryOperationsCompleted;
  sectionProps.cancelUpload = onCancelUpload;
  sectionProps.secondaryOperationsStopped = secondaryOperationsStopped;
  sectionProps.secondaryOperationsAlert = secondaryOperationsAlert;
  sectionProps.primaryOperationsAlert = primaryOperationsAlert;
  sectionProps.primaryOperationsCanceled = primaryOperationsCanceled;
  sectionProps.needErrorChecking = isErrorChecking;
  sectionProps.mainButtonVisible = mainButtonVisible;
  sectionProps.withTabs = sectionWithTabs;
  sectionProps.onDragOverEmpty = onDragOverEmpty;
  sectionProps.onDragLeaveEmpty = onDragLeaveEmpty;
  sectionProps.dragging = dragging;
  sectionProps.startDropPreview = startDropPreview;

  sectionProps.isChatPanelAvailable = isAiChatAvailable;
  sectionProps.isChatPanelVisible = aiChatPanel.isChatPanelVisible;
  sectionProps.chatPanelDropTargetLabel = isChatDropTarget
    ? t("Common:DropFilesToAttach")
    : undefined;
  sectionProps.setIsChatPanelVisible = (visible) => {
    if (!visible) aiChatPanel.closeChatPanel();
  };
  // In fullscreen the #section is collapsed to zero width but stays mounted, so
  // mark it inert (drops its content from tab order / pointer interaction).
  sectionProps.inert = isAiChatFullscreen;

  // Plugin operations
  sectionProps.pluginOperations = pluginOperations;
  sectionProps.pluginOperationsCompleted = pluginOperationsCompleted;
  sectionProps.pluginOperationsAlert = pluginOperationsAlert;
  sectionProps.pluginShowCancelButton = pluginShowCancelButton;

  const hasVisibleContent =
    !isEmptyPage || showFilterLoader || roomsFilterGroupId;

  const isValidMainContent = hasVisibleContent && !isErrorRoomNotAvailable;
  const isValidContactsContent = !isContactsEmptyView && isContactsPage;

  const shouldRenderSectionFilter =
    (isContactsPage ? isValidContactsContent : isValidMainContent) &&
    !isSettingsPage;

  React.useEffect(() => {
    if (isChangePageRequestRunning) return;

    setShouldShowFilter(shouldRenderSectionFilter);
  }, [shouldRenderSectionFilter, isChangePageRequestRunning]);

  const isDisabledKnowledge =
    !aiConfig?.vectorizationEnabled && currentTab === "knowledge";

  const isErrorAvailable =
    isErrorRoomNotAvailable || isErrorAIAgentNotAvailable;

  const isPluginSection = isPluginPage();

  return (
    <>
      {isSettingsPage || isPluginSection ? null : isContactsPage || isProfile ? (
        <>
          <AccountsDialogs />
          {isProfile ? null : <ContactsSelectionArea />}
        </>
      ) : (
        <>
          <DragTooltip />
          <FilesSelectionArea />
          <SectionTours />
        </>
      )}
      {isPluginSection ? null : (
        <>
          <MediaViewer />
          <UploadFileInputs />
          <CreateButtonMobile />
        </>
      )}
      {/* When the quick-actions banner shows, switch the Section to the SDK's
          stickyTableHeader mode so the banner renders above the (now in-body,
          sticky) filter. The host is always `display: contents` (no layout
          impact); the geometry CSS vars are layered on only when active. */}
      <div
        className={classnames(styles.sectionVarsHost, {
          [styles.stickyBannerVars]: showQuickActions,
        })}
        data-layout-mode={isAiChatFullscreen ? "ai-fullscreen" : undefined}
      >
        <SectionWrapper
          {...sectionProps}
          withoutFooter={isChat}
          scrollableBanner={showQuickActions}
          stickyTableHeader={showQuickActions}
        >
          {!isPluginSection &&
          (!isErrorAvailable ||
            isContactsPage ||
            isProfile ||
            isSettingsPage ||
            showHeaderLoader) ? (
            <Section.SectionHeader>
              <SectionHeaderContent />
            </Section.SectionHeader>
          ) : null}

          <Section.SectionSubmenu>
            <SectionSubmenuContent />
          </Section.SectionSubmenu>

          <Section.SectionWarning>
            <SectionWarningContent />
          </Section.SectionWarning>

          {!isPluginSection &&
          !isChat &&
          !isErrorAvailable &&
          !isDisabledKnowledge &&
          shouldShowFilter &&
          !isProfile &&
          !selectedResultFileId &&
          (!isFrame || showFilter) ? (
            <Section.SectionFilter>
              <SectionFilterContent />
            </Section.SectionFilter>
          ) : null}

          {showQuickActions ? (
            <Section.SectionBanner>
              <QuickActions
                items={quickActions.items}
                className={styles.quickActions}
                isLoading={showFilterLoader}
                dataTestId="quick-actions"
              />
            </Section.SectionBanner>
          ) : null}

          <Section.SectionBody>
            <Outlet />
          </Section.SectionBody>

          <Section.InfoPanelHeader>
            <InfoPanelHeaderContent />
          </Section.InfoPanelHeader>
          <Section.InfoPanelBody>
            <InfoPanelBodyContent />
          </Section.InfoPanelBody>
          <Section.ChatPanel>{aiChatPanel.chatPanelContent}</Section.ChatPanel>
        </SectionWrapper>
      </div>
      <InfoPanelActions />
      {aiChatTopUpDialog}
    </>
  );
});

const Home = withTranslation(["UploadPanel", "Files", "People"])(PureHome);

const PASS_THROUGH_PREFIXES = [
  "/accounts",
  "/contacts",
  "/developer-tools",
  "/p",
  "/portal-settings",
  "/profile",
];

const HomeWithGuard = (props) => {
  // Always treat as legacy mode — the new-design article is shown via
  // ClientArticleSidebar regardless of this flag.
  const isLegacyMode = true;
  const { pathname } = useLocation();

  if (
    !isLegacyMode &&
    !isOAuthFrame() &&
    !PASS_THROUGH_PREFIXES.some((p) => pathname.startsWith(p))
  )
    return <Navigate to="/dashboard" replace />;

  return <Home {...props} />;
};

export const Component = inject(
  ({
    authStore,
    filesStore,
    uploadDataStore,
    treeFoldersStore,
    mediaViewerDataStore,
    peopleStore,
    filesActionsStore,
    selectedFolderStore,
    clientLoadingStore,
    userStore,
    settingsStore,
    contextOptionsStore,
    indexingStore,
    dialogsStore,
    filesSettingsStore,
    aiRoomStore,
    profileActionsStore,
    pluginStore,
    infoPanelStore,
    oformsStore,
    paymentStore,
    currentTariffStatusStore,
  }) => {
    const {
      setSelectedFolder,
      security: folderSecurity,
      title: selectedFolderTitle,
      chatSettings: selectedFolderChatSettings,
    } = selectedFolderStore;

    const canCreateSecurity = folderSecurity?.Create;

    const {
      secondaryProgressDataStore,
      primaryProgressDataStore,

      cancelUpload,
      clearUploadData,
      clearUploadedFiles,
      clearConversionData,
    } = uploadDataStore;

    const {
      firstLoad,
      setIsSectionBodyLoading,
      setIsSectionFilterLoading,
      isLoading,
      showHeaderLoader,
      showFilterLoader,
      isChangePageRequestRunning,
      currentClientView,
    } = clientLoadingStore;

    const { getFolderModel } = contextOptionsStore;

    const { getContactsModel } = peopleStore.contextOptionsStore;

    const {
      fetchFiles,
      fetchRooms,

      selection,
      dragging,
      setDragging,
      isChatDropTarget,

      viewAs,
      getFileInfo,
      setIsUpdatingRowItem,

      folders,
      files,
      filesList,

      createFile,

      createRoom,
      refreshFiles,
      setViewAs,
      isEmptyPage,
      roomsFilter,

      disableDrag,
      isErrorRoomNotAvailable,
      isErrorAIAgentNotAvailable,
      setIsPreview,
      getRooms,
      scrollToTop,
      wsCreatedPDFForm,
      mainButtonVisible,

      removeActiveItem,
    } = filesStore;

    const {
      isRecycleBinFolder,

      setExpandedKeys,
      isRoomsFolder,
      isArchiveFolder,
      setSelectedNode,
      isRoomsFolderRoot,
      isTemplatesFolder,
      isRoot,

      // Quick-actions banner section classification.
      isDocumentsFolder,
      isRoom,
      isPrivacyFolder,
      isFavoritesFolder,
      isRecentFolder,
      isAIAgentsFolder,
      isFormsFolder,
    } = treeFoldersStore;

    const {
      clearPrimaryProgressData,
      primaryOperationsArray,
      primaryOperationsCompleted,
      primaryOperationsAlert,
      primaryOperationsCanceled,
      isErrorChecking,
      isPrimaryProgressVisbile,
      dropTargetPreview,
      setDropTargetPreview,
      clearDropPreviewLocation,
      startDropPreview,
    } = primaryProgressDataStore;

    const {
      isSecondaryProgressVisbile,
      secondaryOperationsCompleted,
      clearSecondaryProgressData,
      secondaryActiveOperations,
      secondaryOperationsStopped,
      secondaryOperationsAlert,
      cancelSecondaryOperation,
      cancelSecondaryOperationById,
    } = secondaryProgressDataStore;

    const { startUpload } = uploadDataStore;

    const { createFoldersTree } = filesActionsStore;

    const { setToPreviewFile, playlist } = mediaViewerDataStore;

    const { hideConfirmCancelOperation } = filesSettingsStore;
    const { setOperationCancelVisible } = dialogsStore;
    const {
      setFrameConfig,
      frameConfig,
      isFrame,
      enablePlugins,
      getSettings,
      allowInvitingGuests,
      checkGuests,
      hasGuests,
    } = settingsStore;

    const {
      usersStore,
      groupsStore,
      targetUserStore,
      viewAs: contactsViewAs,
    } = peopleStore;
    const { updateProfileCulture } = targetUserStore;
    const {
      getUsersList,
      setContactsTab,
      contactsTab,
      isUsersEmptyView,
      isFiltered,
    } = usersStore;
    const { getGroups, updateCurrentGroup, groups, groupsIsFiltered } =
      groupsStore;

    const isEmptyGroups =
      !groupsIsFiltered && ((groups && groups.length === 0) || !groups);

    const { isRoomAdmin, isAdmin } = authStore;

    const {
      pluginFloatingOperationsArray,
      dispatchMessage,
      getPluginIconUrl,
      removePluginFloatingOperations,
    } = pluginStore;

    const withRoomsTabs =
      (isRoomsFolderRoot || isTemplatesFolder) && (isRoomAdmin || isAdmin);

    const sectionWithTabs = withRoomsTabs && isRoot;

    // if (!firstLoad) {
    //   if (isLoading) {
    //     showLoader();
    //   } else {
    //     hideLoader();
    //   }
    // }

    return {
      aiNoAccessStores: mapChatNoAccessStores({
        settingsStore,
        userStore,
        paymentStore,
        currentTariffStatusStore,
        authStore,
      }),
      currentClientView,
      isChangePageRequestRunning,
      // homepage: config.homepage,
      firstLoad,
      dragging,
      isChatDropTarget,
      viewAs,
      isRecycleBinFolder,
      isVisitor: userStore.user.isVisitor,
      userId: userStore?.user?.id,
      folderSecurity,

      clearPrimaryProgressData,

      isSecondaryProgressVisbile,
      isPrimaryProgressVisbile,

      enablePlugins,

      isErrorRoomNotAvailable,
      isRoomsFolder,
      isFormsFolder,
      isArchiveFolder,
      isIndexEditingMode: indexingStore.isIndexEditingMode,

      disableDrag,

      setExpandedKeys,

      setDragging,
      setIsSectionBodyLoading,
      setIsSectionFilterLoading,
      isLoading,
      fetchFiles,
      fetchRooms,

      startUpload,
      createFoldersTree,

      setToPreviewFile,
      setIsPreview,
      playlist,

      getFileInfo,
      setIsUpdatingRowItem,

      setFrameConfig,
      frameConfig,
      isFrame,
      showTitle: frameConfig?.showTitle,
      showFilter: frameConfig?.showFilter,
      folders,
      files,
      selection,
      filesList,
      selectedFolderStore,
      createFile,

      createRoom,
      refreshFiles,
      setViewAs,
      isEmptyPage,
      roomsFilterGroupId: roomsFilter?.groupId,

      setSelectedNode,

      showFilterLoader,
      showHeaderLoader,

      getSettings,
      logout: authStore.logout,
      login: authStore.login,

      loadCurrentUser: userStore.loadCurrentUser,
      getRooms,
      setSelectedFolder,
      getFolderModel,
      getContactsModel,
      scrollToTop,
      wsCreatedPDFForm,

      // contacts store
      setContactsTab,
      contactsTab,
      contactsViewAs,
      getUsersList,
      getGroups,
      updateCurrentGroup,
      isEmptyGroups,
      updateProfileCulture,
      isUsersEmptyView: isUsersEmptyView && !isFiltered,

      secondaryActiveOperations,
      secondaryOperationsCompleted,
      clearSecondaryProgressData,
      secondaryOperationsStopped,
      secondaryOperationsAlert,
      primaryOperationsArray,
      primaryOperationsCompleted,
      cancelUpload,
      cancelSecondaryOperation,
      cancelSecondaryOperationById,
      clearUploadData,
      clearUploadedFiles,
      mainButtonVisible,
      primaryOperationsAlert,
      primaryOperationsCanceled,
      clearConversionData,
      isErrorChecking,
      setOperationCancelVisible,
      hideConfirmCancelOperation,

      removeActiveItem,
      allowInvitingGuests,
      checkGuests,
      hasGuests,
      sectionWithTabs,
      dropTargetPreview,
      setDropTargetPreview,
      selectedFolderTitle,
      selectedFolderChatSettings,
      clearDropPreviewLocation,
      canCreateSecurity,
      startDropPreview,

      // Quick-actions banner inputs. (isRoomsFolder / isArchiveFolder /
      // isRecycleBinFolder are already returned above.)
      currentFolderId: selectedFolderStore.id,
      canCreateFiles: folderSecurity?.Create,
      canCreateEncrypted: uploadDataStore.shouldEncryptCurrentUpload(),
      canCreateRooms: isAdmin || isRoomAdmin,
      isDocumentsFolder,
      isRoom,
      isPrivacyFolder,
      isTemplatesFolder,
      isFavoritesFolder,
      isRecentFolder,
      isAIAgentsFolder,
      templateGalleryAvailable: settingsStore.templateGalleryAvailable,
      setTemplateGalleryVisible: oformsStore.setTemplateGalleryVisible,
      setOformFromFolderId: oformsStore.setOformFromFolderId,
      setCreateRoomFromTemplate: oformsStore.setCreateRoomFromTemplate,

      isErrorAIAgentNotAvailable,
      currentTab: aiRoomStore.currentTab,
      selectedResultFileId: aiRoomStore.selectedResultFileId,
      aiConfig: settingsStore.aiConfig,

      setIsAboutDialogVisible: profileActionsStore.setIsAboutDialogVisible,

      pluginFloatingOperationsArray,
      removePluginFloatingOperations,
      dispatchMessage,
      getPluginIconUrl,

      infoPanelStore,
    };
  },
)(observer(HomeWithGuard));
