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

import React from "react";
import { useLocation, Outlet, useParams } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";

import { showLoader, hideLoader } from "@docspace/shared/utils/common";
import Section from "@docspace/shared/components/section";

import SectionWrapper from "SRC_DIR/components/Section";
import DragTooltip from "SRC_DIR/components/DragTooltip";
import { getContactsView } from "SRC_DIR/helpers/contacts";

import {
  SectionFilterContent,
  SectionHeaderContent,
  SectionPagingContent,
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

    //homepage,
    setIsSectionHeaderLoading,
    setIsSectionBodyLoading,
    setIsSectionFilterLoading,
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
    uploaded,
    converted,
    setUploadPanelVisible,
    clearPrimaryProgressData,
    primaryProgressDataVisible,
    isProgressFinished,
    secondaryProgressDataStoreIcon,
    itemsSelectionLength,
    itemsSelectionTitle,
    setItemsSelectionTitle,
    refreshFiles,

    setFrameConfig,
    user,
    folders,
    files,
    selection,
    filesList,

    createFile,
    createFolder,
    createRoom,

    setViewAs,
    viewAs,

    firstLoad,

    isPrivacyFolder,
    isRecycleBinFolder,
    isErrorRoomNotAvailable,
    isIndexEditingMode,

    primaryProgressDataPercent,
    primaryProgressDataIcon,
    primaryProgressDataAlert,
    clearUploadedFilesHistory,

    secondaryProgressDataStoreVisible,
    secondaryProgressDataStorePercent,

    secondaryProgressDataStoreAlert,

    tReady,
    isFrame,
    showTitle,
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

    enablePlugins,
    getSettings,
    logout,
    login,
    addTagsToRoom,
    createTag,
    removeTagsFromRoom,
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
    disableUploadPanelOpen,
    setContactsTab,
    isUsersEmptyView,
  } = props;

  //console.log(t("ComingSoon"))

  const location = useLocation();

  const isSettingsPage =
    location.pathname.includes("settings") &&
    !location.pathname.includes("settings/plugins");

  const contactsView = getContactsView(location);
  const isContactsPage = !!contactsView;
  const isContactsEmptyView =
    contactsView === "groups" ? isEmptyGroups : isUsersEmptyView;

  const setIsLoading = React.useCallback(
    (param, withoutTimer, withHeaderLoader) => {
      if (withHeaderLoader) setIsSectionHeaderLoading(param, !withoutTimer);
      setIsSectionFilterLoading(param, !withoutTimer);
      setIsSectionBodyLoading(param, !withoutTimer);
    },
    [
      setIsSectionHeaderLoading,
      setIsSectionFilterLoading,
      setIsSectionBodyLoading,
    ],
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

  const { showUploadPanel } = useOperations({
    t,
    setUploadPanelVisible,
    primaryProgressDataVisible,
    uploaded,
    converted,
    clearPrimaryProgressData,
    isProgressFinished,
    refreshFiles,
    itemsSelectionTitle,
    secondaryProgressDataStoreIcon,
    itemsSelectionLength,
    disableUploadPanelOpen,
    setItemsSelectionTitle,
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
    user,
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

      sectionProps.clearUploadedFilesHistory = clearUploadedFilesHistory;
      sectionProps.viewAs = viewAs;
      sectionProps.hideAside =
        primaryProgressDataVisible || secondaryProgressDataStoreVisible;

      sectionProps.isEmptyPage = isEmptyPage;
      sectionProps.isTrashFolder = isRecycleBinFolder;
    } else {
      sectionProps.isAccounts = isContactsPage;
    }
  }

  sectionProps.onOpenUploadPanel = showUploadPanel;
  sectionProps.showPrimaryProgressBar = primaryProgressDataVisible;
  sectionProps.primaryProgressBarValue = primaryProgressDataPercent;
  sectionProps.primaryProgressBarIcon = primaryProgressDataIcon;
  sectionProps.showPrimaryButtonAlert = primaryProgressDataAlert;
  sectionProps.showSecondaryProgressBar = secondaryProgressDataStoreVisible;
  sectionProps.secondaryProgressBarValue = secondaryProgressDataStorePercent;
  sectionProps.secondaryProgressBarIcon = secondaryProgressDataStoreIcon;
  sectionProps.showSecondaryButtonAlert = secondaryProgressDataStoreAlert;
  sectionProps.getContextModel = getContextModel;
  sectionProps.isIndexEditingMode = isIndexEditingMode;

  return (
    <>
      {isSettingsPage ? (
        <></>
      ) : isContactsPage ? (
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
        {(!isErrorRoomNotAvailable || isContactsPage || isSettingsPage) && (
          <Section.SectionHeader>
            <SectionHeaderContent />
          </Section.SectionHeader>
        )}

        <Section.SectionSubmenu>
          <SectionSubmenuContent />
        </Section.SectionSubmenu>

        {isRecycleBinFolder && !isEmptyPage && (
          <Section.SectionWarning>
            <SectionWarningContent />
          </Section.SectionWarning>
        )}

        {(((!isEmptyPage || showFilterLoader) && !isErrorRoomNotAvailable) ||
          (!isContactsEmptyView && isContactsPage)) &&
          !isSettingsPage && (
            <Section.SectionFilter>
              {isFrame ? (
                showFilter && <SectionFilterContent />
              ) : (
                <SectionFilterContent />
              )}
            </Section.SectionFilter>
          )}

        <Section.SectionBody isAccounts={isContactsPage}>
          <>
            <Outlet />
          </>
        </Section.SectionBody>

        <Section.InfoPanelHeader>
          <InfoPanelHeaderContent />
        </Section.InfoPanelHeader>
        <Section.InfoPanelBody>
          <InfoPanelBodyContent />
        </Section.InfoPanelBody>

        {/* {withPaging && !isSettingsPage && (
          <Section.SectionPaging>
            <SectionPagingContent tReady={tReady} />
          </Section.SectionPaging>
        )} */}
      </SectionWrapper>
    </>
  );
};

const Home = withTranslation(["Files", "People"])(PureHome);

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
    tagsStore,
    selectedFolderStore,
    clientLoadingStore,
    userStore,
    settingsStore,
    contextOptionsStore,
    indexingStore,
  }) => {
    const { setSelectedFolder, security: folderSecurity } = selectedFolderStore;
    const {
      secondaryProgressDataStore,
      primaryProgressDataStore,
      clearUploadedFilesHistory,
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
      createFolder,
      createRoom,
      refreshFiles,
      setViewAs,
      isEmptyPage,

      disableDrag,
      isErrorRoomNotAvailable,
      setIsPreview,
      addTagsToRoom,
      removeTagsFromRoom,
      getRooms,
      scrollToTop,
      wsCreatedPDFForm,
    } = filesStore;

    const { createTag } = tagsStore;

    const { gallerySelected } = oformsStore;

    const {
      isRecycleBinFolder,
      isPrivacyFolder,

      setExpandedKeys,
      isRoomsFolder,
      isArchiveFolder,
      setSelectedNode,
    } = treeFoldersStore;

    const {
      visible: primaryProgressDataVisible,
      percent: primaryProgressDataPercent,
      icon: primaryProgressDataIcon,
      alert: primaryProgressDataAlert,
      disableUploadPanelOpen,
      clearPrimaryProgressData,
    } = primaryProgressDataStore;

    const {
      visible: secondaryProgressDataStoreVisible,
      percent: secondaryProgressDataStorePercent,
      icon: secondaryProgressDataStoreIcon,
      alert: secondaryProgressDataStoreAlert,
      isSecondaryProgressFinished: isProgressFinished,
      itemsSelectionLength,
      itemsSelectionTitle,
      setItemsSelectionTitle,
    } = secondaryProgressDataStore;

    const { setUploadPanelVisible, startUpload, uploaded, converted } =
      uploadDataStore;

    const { createFoldersTree, onClickBack } = filesActionsStore;

    const selectionLength = isProgressFinished ? selection.length : null;
    const selectionTitle = isProgressFinished
      ? filesStore.selectionTitle
      : null;

    const { setToPreviewFile, playlist } = mediaViewerDataStore;

    const {
      setFrameConfig,
      frameConfig,
      isFrame,
      showCatalog,
      enablePlugins,
      getSettings,
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
      !groupsIsFiltered &&
      ((groups && groups.length === 0) || !Boolean(groups));

    console.log(isEmptyGroups);

    if (!firstLoad) {
      if (isLoading) {
        showLoader();
      } else {
        hideLoader();
      }
    }

    return {
      //homepage: config.homepage,
      firstLoad,
      dragging,
      viewAs,
      uploaded,
      converted,
      isRecycleBinFolder,
      isPrivacyFolder,
      isVisitor: userStore.user.isVisitor,
      userId: userStore?.user?.id,
      folderSecurity,
      primaryProgressDataVisible,
      primaryProgressDataPercent,
      primaryProgressDataIcon,
      primaryProgressDataAlert,
      clearPrimaryProgressData,
      disableUploadPanelOpen,

      clearUploadedFilesHistory,

      secondaryProgressDataStoreVisible,
      secondaryProgressDataStorePercent,
      secondaryProgressDataStoreIcon,
      secondaryProgressDataStoreAlert,

      selectionLength,
      isProgressFinished,
      selectionTitle,

      enablePlugins,

      itemsSelectionLength,
      setItemsSelectionTitle,
      itemsSelectionTitle,
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

      setUploadPanelVisible,
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
      user: userStore.user,
      folders,
      files,
      selection,
      filesList,
      selectedFolderStore,
      createFile,
      createFolder,
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

      createTag,
      addTagsToRoom,
      removeTagsFromRoom,
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
    };
  },
)(observer(Home));
