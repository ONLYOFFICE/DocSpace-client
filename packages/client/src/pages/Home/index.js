// (c) Copyright Ascensio System SIA 2009-2025
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
import { useLocation, Outlet } from "react-router";
import { isMobile } from "react-device-detect";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";

import {
  addTagsToRoom,
  removeTagsFromRoom,
  createTag,
} from "@docspace/shared/api/rooms";
import { createFolder } from "@docspace/shared/api/files";
import Section from "@docspace/shared/components/section";

import SectionWrapper from "SRC_DIR/components/Section";
import DragTooltip from "SRC_DIR/components/DragTooltip";
import { getContactsView } from "SRC_DIR/helpers/contacts";

import {
  SectionFilterContent,
  SectionHeaderContent,
  SectionSubmenuContent,
  SectionWarningContent,
} from "./Section";
import AccountsDialogs from "./Section/ContactsBody/Dialogs";

import FilesSelectionArea from "./SelectionArea/FilesSelectionArea";
import ContactsSelectionArea from "./SelectionArea/ContactsSelectionArea";

import { InfoPanelBodyContent, InfoPanelHeaderContent } from "./InfoPanel";

import MediaViewer from "./MediaViewer";

import {
  useFiles,
  useSDK,
  useOperations,
  useContacts,
  useSettings,
} from "./Hooks";

const PureHome = (props) => {
  const {
    fetchFiles,
    fetchRooms,

    // homepage,
    setIsSectionHeaderLoading,
    setIsSectionBodyLoading,
    isLoading,

    setToPreviewFile,
    playlist,

    folderSecurity,
    getFileInfo,
    gallerySelected,
    setIsUpdatingRowItem,
    setIsPreview,
    selectedFolderStore,
    t,
    startUpload,
    setDragging,
    dragging,
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

    isPrivacyFolder,
    isRecycleBinFolder,
    isErrorRoomNotAvailable,
    isIndexEditingMode,

    isSecondaryProgressVisbile,

    isFrame,
    showFilter,
    frameConfig,
    isEmptyPage,

    contactsViewAs,
    getUsersList,
    getGroups,
    updateCurrentGroup,
    setSelectedNode,
    onClickBack,

    showFilterLoader,

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
    scrollToTop,
    isEmptyGroups,
    wsCreatedPDFForm,
    setContactsTab,
    isUsersEmptyView,
    showGuestReleaseTip,
    setGuestReleaseTipDialogVisible,
    secondaryOperationsCompleted,
    primaryOperationsCompleted,
    secondaryActiveOperations,
    clearSecondaryProgressData,
    primaryOperationsArray,
    cancelUpload,
    secondaryOperationsAlert,
    clearUploadData,
    clearUploadedFiles,
    mainButtonVisible,
    primaryOperationsAlert,
    clearConversionData,
    isErrorChecking,
    setOperationCancelVisible,
    hideConfirmCancelOperation,
    welcomeFormFillingTipsVisible,
    formFillingTipsVisible,

    allowInvitingGuests,
    checkGuests,
    hasGuests,
    sectionWithTabs,
  } = props;

  // console.log(t("ComingSoon"))

  const location = useLocation();

  const isSettingsPage =
    location.pathname.includes("settings") &&
    !location.pathname.includes("settings/plugins");

  const view = getContactsView(location);
  if (allowInvitingGuests === false && view === "guests") checkGuests();
  const contactsView = allowInvitingGuests
    ? view
    : typeof hasGuests === "boolean" && view === "guests" && !hasGuests
      ? "people"
      : view;

  const isContactsPage = !!contactsView;
  const isContactsEmptyView =
    contactsView === "groups" ? isEmptyGroups : isUsersEmptyView;

  const setIsLoading = React.useCallback(
    (param, withoutTimer, withHeaderLoader) => {
      if (withHeaderLoader)
        return setIsSectionHeaderLoading(param, !withoutTimer);

      setIsSectionBodyLoading(param, !withoutTimer);
    },
    [setIsSectionHeaderLoading, setIsSectionBodyLoading],
  );

  const { onDrop } = useFiles({
    t,
    dragging,
    setDragging,
    disableDrag,
    createFoldersTree,
    startUpload,
    fetchFiles,
    fetchRooms,
    setIsLoading,

    isContactsPage,
    isSettingsPage,

    location,

    playlist,

    getFileInfo,
    setToPreviewFile,
    setIsPreview,

    setIsUpdatingRowItem,

    gallerySelected,
    folderSecurity,
    userId,

    scrollToTop,
    selectedFolderStore,
    wsCreatedPDFForm,
  });

  useOperations({
    clearUploadData,
    clearUploadedFiles,
    primaryOperationsArray,
    clearConversionData,
  });

  useContacts({
    isContactsPage,
    contactsView,

    setContactsTab,

    setIsLoading,
    scrollToTop,
    setSelectedNode,

    getUsersList,
    getGroups,
    updateCurrentGroup,

    showGuestReleaseTip,
    setGuestReleaseTipDialogVisible,
  });

  useSettings({
    t,
    isSettingsPage,
    setIsLoading,
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

  const getContextModel = () => {
    if (isFrame) return null;
    if (isContactsPage) return getContactsModel(t, true);
    return getFolderModel(t, true);
  };

  const onCancelUpload = () => {
    if (hideConfirmCancelOperation) {
      cancelUpload(t);
      return;
    }

    setOperationCancelVisible(true);
  };

  React.useEffect(() => {
    window.addEventListener("popstate", onClickBack);

    return () => {
      setSelectedFolder(null);
      window.removeEventListener("popstate", onClickBack);
    };
  }, []);

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
    };

    if (!isContactsPage) {
      sectionProps.dragging = dragging;
      sectionProps.uploadFiles = true;
      sectionProps.onDrop =
        isRecycleBinFolder || isPrivacyFolder ? null : onDrop;

      sectionProps.viewAs = viewAs;
      sectionProps.hideAside =
        isPrimaryProgressVisbile || isSecondaryProgressVisbile;

      sectionProps.isEmptyPage = isEmptyPage;
      sectionProps.isTrashFolder = isRecycleBinFolder;
    } else {
      sectionProps.isAccounts = isContactsPage;
    }
  }

  // sectionProps.onOpenUploadPanel = showUploadPanel;

  sectionProps.getContextModel = getContextModel;
  sectionProps.isIndexEditingMode = isIndexEditingMode;

  sectionProps.secondaryActiveOperations = secondaryActiveOperations;
  sectionProps.secondaryOperationsCompleted = secondaryOperationsCompleted;
  sectionProps.clearSecondaryProgressData = clearSecondaryProgressData;
  sectionProps.primaryOperationsArray = primaryOperationsArray;
  sectionProps.clearPrimaryProgressData = clearPrimaryProgressData;
  sectionProps.primaryOperationsCompleted = primaryOperationsCompleted;
  sectionProps.cancelUpload = onCancelUpload;
  sectionProps.secondaryOperationsAlert = secondaryOperationsAlert;
  sectionProps.primaryOperationsAlert = primaryOperationsAlert;
  sectionProps.needErrorChecking = isErrorChecking;
  sectionProps.mainButtonVisible = mainButtonVisible;
  sectionProps.withTabs = sectionWithTabs;

  const hasVisibleContent =
    !isEmptyPage ||
    welcomeFormFillingTipsVisible ||
    formFillingTipsVisible ||
    showFilterLoader;

  const isValidMainContent = hasVisibleContent && !isErrorRoomNotAvailable;
  const isValidContactsContent = !isContactsEmptyView && isContactsPage;

  const shouldRenderSectionFilter =
    (isValidMainContent || isValidContactsContent) && !isSettingsPage;

  return (
    <>
      {isSettingsPage ? null : isContactsPage ? (
        <>
          <AccountsDialogs />
          <ContactsSelectionArea />
        </>
      ) : (
        <>
          <DragTooltip />
          <FilesSelectionArea />
        </>
      )}
      <MediaViewer />
      <SectionWrapper {...sectionProps}>
        {!isErrorRoomNotAvailable || isContactsPage || isSettingsPage ? (
          <Section.SectionHeader>
            <SectionHeaderContent />
          </Section.SectionHeader>
        ) : null}

        <Section.SectionWarning>
          <SectionWarningContent />
        </Section.SectionWarning>

        <Section.SectionSubmenu>
          <SectionSubmenuContent />
        </Section.SectionSubmenu>

        {shouldRenderSectionFilter ? (
          <Section.SectionFilter>
            {isFrame ? (
              showFilter && <SectionFilterContent />
            ) : (
              <SectionFilterContent />
            )}
          </Section.SectionFilter>
        ) : null}

        <Section.SectionBody isAccounts={isContactsPage}>
          <Outlet />
        </Section.SectionBody>

        <Section.InfoPanelHeader>
          <InfoPanelHeaderContent />
        </Section.InfoPanelHeader>
        <Section.InfoPanelBody>
          <InfoPanelBodyContent />
        </Section.InfoPanelBody>
      </SectionWrapper>
    </>
  );
};

const Home = withTranslation(["UploadPanel", "Files", "People"])(PureHome);

export const Component = inject(
  ({
    authStore,
    filesStore,
    uploadDataStore,
    treeFoldersStore,
    mediaViewerDataStore,
    peopleStore,
    filesActionsStore,
    oformsStore,
    selectedFolderStore,
    clientLoadingStore,
    userStore,
    settingsStore,
    contextOptionsStore,
    indexingStore,
    dialogsStore,
    filesSettingsStore,
  }) => {
    const { setSelectedFolder, security: folderSecurity } = selectedFolderStore;
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
      setIsSectionHeaderLoading,
      setIsSectionBodyLoading,
      setIsSectionFilterLoading,
      isLoading,
      showFilterLoader,
    } = clientLoadingStore;

    const { getFolderModel } = contextOptionsStore;

    const { getContactsModel } = peopleStore.contextOptionsStore;

    const {
      fetchFiles,
      fetchRooms,

      selection,
      dragging,
      setDragging,

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

      disableDrag,
      isErrorRoomNotAvailable,
      setIsPreview,
      getRooms,
      scrollToTop,
      wsCreatedPDFForm,
      mainButtonVisible,
    } = filesStore;

    const { gallerySelected } = oformsStore;

    const {
      isRecycleBinFolder,
      isPrivacyFolder,

      setExpandedKeys,
      isRoomsFolder,
      isArchiveFolder,
      setSelectedNode,
      isPersonalRoom,
      isRecentTab,
      isRoomsFolderRoot,
      isTemplatesFolder,
      isRoot,
    } = treeFoldersStore;

    const {
      clearPrimaryProgressData,
      primaryOperationsArray,
      primaryOperationsCompleted,
      primaryOperationsAlert,
      isErrorChecking,
      isPrimaryProgressVisbile,
    } = primaryProgressDataStore;

    const {
      isSecondaryProgressVisbile,
      secondaryOperationsCompleted,
      clearSecondaryProgressData,
      secondaryActiveOperations,
      secondaryOperationsAlert,
    } = secondaryProgressDataStore;

    const { startUpload } = uploadDataStore;

    const { createFoldersTree, onClickBack } = filesActionsStore;

    const { setToPreviewFile, playlist } = mediaViewerDataStore;

    const { hideConfirmCancelOperation } = filesSettingsStore;
    const { setOperationCancelVisible } = dialogsStore;
    const {
      setFrameConfig,
      frameConfig,
      isFrame,
      enablePlugins,
      getSettings,
      showGuestReleaseTip,
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
    const { getUsersList, setContactsTab, isUsersEmptyView, isFiltered } =
      usersStore;
    const { getGroups, updateCurrentGroup, groups, groupsIsFiltered } =
      groupsStore;

    const isEmptyGroups =
      !groupsIsFiltered && ((groups && groups.length === 0) || !groups);

    const {
      welcomeFormFillingTipsVisible,
      formFillingTipsVisible,
      setGuestReleaseTipDialogVisible,
    } = dialogsStore;

    const { isRoomAdmin, isAdmin } = authStore;

    const withDocumentTabs = isPersonalRoom || isRecentTab;
    const withRoomsTabs =
      (isRoomsFolderRoot || isTemplatesFolder) && (isRoomAdmin || isAdmin);

    const sectionWithTabs = (withDocumentTabs || withRoomsTabs) && isRoot;

    // if (!firstLoad) {
    //   if (isLoading) {
    //     showLoader();
    //   } else {
    //     hideLoader();
    //   }
    // }

    return {
      // homepage: config.homepage,
      firstLoad,
      dragging,
      viewAs,
      isRecycleBinFolder,
      isPrivacyFolder,
      isVisitor: userStore.user.isVisitor,
      userId: userStore?.user?.id,
      folderSecurity,

      clearPrimaryProgressData,

      isSecondaryProgressVisbile,
      isPrimaryProgressVisbile,

      enablePlugins,

      isErrorRoomNotAvailable,
      isRoomsFolder,
      isArchiveFolder,
      isIndexEditingMode: indexingStore.isIndexEditingMode,

      disableDrag,

      setExpandedKeys,

      setDragging,
      setIsSectionHeaderLoading,
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
      gallerySelected,
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

      setSelectedNode,
      onClickBack,

      showFilterLoader,

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
      contactsViewAs,
      getUsersList,
      getGroups,
      updateCurrentGroup,
      isEmptyGroups,
      updateProfileCulture,
      isUsersEmptyView: isUsersEmptyView && !isFiltered,
      showGuestReleaseTip,
      setGuestReleaseTipDialogVisible,
      welcomeFormFillingTipsVisible,
      formFillingTipsVisible,

      secondaryActiveOperations,
      secondaryOperationsCompleted,
      clearSecondaryProgressData,
      secondaryOperationsAlert,
      primaryOperationsArray,
      primaryOperationsCompleted,
      cancelUpload,
      clearUploadData,
      clearUploadedFiles,
      mainButtonVisible,
      primaryOperationsAlert,
      clearConversionData,
      isErrorChecking,
      setOperationCancelVisible,
      hideConfirmCancelOperation,

      allowInvitingGuests,
      checkGuests,
      hasGuests,
      sectionWithTabs,
    };
  },
)(observer(Home));
