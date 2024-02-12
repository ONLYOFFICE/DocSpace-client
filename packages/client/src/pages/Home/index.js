import React from "react";
import { useLocation, useNavigate, Outlet, useParams } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { observer, inject } from "mobx-react";
import { withTranslation } from "react-i18next";

import { showLoader, hideLoader } from "@docspace/shared/utils/common";

import Section from "@docspace/shared/components/section";
import SectionWrapper from "SRC_DIR/components/Section";
import DragTooltip from "SRC_DIR/components/DragTooltip";

import {
  SectionFilterContent,
  SectionHeaderContent,
  SectionPagingContent,
  SectionSubmenuContent,
  SectionWarningContent,
} from "./Section";
import AccountsDialogs from "./Section/AccountsBody/Dialogs";

import MediaViewer from "./MediaViewer";
import FilesSelectionArea from "./SelectionArea/FilesSelectionArea";
import AccountsSelectionArea from "./SelectionArea/AccountsSelectionArea";
import { InfoPanelBodyContent, InfoPanelHeaderContent } from "./InfoPanel";

import {
  useFiles,
  useSDK,
  useOperations,
  useAccounts,
  useSettings,
  useGroups,
  useInsideGroup,
} from "./Hooks";

const PureHome = (props) => {
  const {
    fetchFiles,
    fetchRooms,

    //homepage,
    setIsLoading,
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
    uploadEmptyFolders,
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
    withPaging,
    isEmptyPage,

    setPortalTariff,

    accountsViewAs,
    fetchPeople,
    fetchGroups,
    fetchGroup,
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
  } = props;

  const location = useLocation();
  const { groupId } = useParams();

  const isSettingsPage =
    location.pathname.includes("settings") &&
    !location.pathname.includes("settings/plugins");
  const isAccountsPage = location.pathname.includes("/accounts");
  const isPeopleAccounts = location.pathname.includes("accounts/people");
  const isGroupsAccounts =
    location.pathname.includes("accounts/groups") && !groupId;

  const { onDrop } = useFiles({
    t,
    dragging,
    setDragging,
    disableDrag,
    uploadEmptyFolders,
    startUpload,
    fetchFiles,
    fetchRooms,
    setIsLoading,

    isAccountsPage,
    isSettingsPage,

    location,

    playlist,

    getFileInfo,
    setToPreviewFile,
    setIsPreview,

    setIsUpdatingRowItem,

    gallerySelected,
    folderSecurity,
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

    setItemsSelectionTitle,
  });

  useAccounts({
    t,
    isAccountsPage,
    isPeopleAccounts,
    location,

    setIsLoading,

    setSelectedNode,
    fetchPeople,
    setPortalTariff,
  });

  useGroups({
    t,
    isAccountsPage,
    isGroupsAccounts,
    location,

    setIsLoading,

    setSelectedNode,
    fetchGroups,
  });

  useInsideGroup({
    t,
    groupId,
    location,
    setIsLoading,
    setPortalTariff,
    fetchGroup,
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
      withPaging,
      withBodyScroll: true,
      withBodyAutoFocus: !isMobile,
      firstLoad,
      isLoaded: !firstLoad,
      viewAs: accountsViewAs,
      isAccounts: isAccountsPage,
    };

    if (!isAccountsPage) {
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
      sectionProps.isAccounts = isAccountsPage;
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

  return (
    <>
      {isSettingsPage ? (
        <></>
      ) : isAccountsPage ? (
        <>
          <AccountsDialogs />
          <AccountsSelectionArea />
        </>
      ) : (
        <>
          <DragTooltip />
          <FilesSelectionArea />
        </>
      )}
      <MediaViewer />
      <SectionWrapper {...sectionProps}>
        {(!isErrorRoomNotAvailable || isAccountsPage || isSettingsPage) && (
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
          isAccountsPage) &&
          !isSettingsPage && (
            <Section.SectionFilter>
              {isFrame ? (
                showFilter && <SectionFilterContent />
              ) : (
                <SectionFilterContent />
              )}
            </Section.SectionFilter>
          )}

        <Section.SectionBody isAccounts={isAccountsPage}>
          <Outlet />
        </Section.SectionBody>

        <Section.InfoPanelHeader>
          <InfoPanelHeaderContent />
        </Section.InfoPanelHeader>
        <Section.InfoPanelBody>
          <InfoPanelBodyContent />
        </Section.InfoPanelBody>

        {withPaging && !isSettingsPage && (
          <Section.SectionPaging>
            <SectionPagingContent tReady={tReady} />
          </Section.SectionPaging>
        )}
      </SectionWrapper>
    </>
  );
};

const Home = withTranslation(["Files", "People"])(PureHome);

export default inject(
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
    currentTariffStatusStore,
    settingsStore,
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

    const setIsLoading = (param, withoutTimer, withHeaderLoader) => {
      if (withHeaderLoader) setIsSectionHeaderLoading(param, !withoutTimer);
      setIsSectionFilterLoading(param, !withoutTimer);
      setIsSectionBodyLoading(param, !withoutTimer);
    };

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
    } = filesStore;

    const { updateProfileCulture } = peopleStore.targetUserStore;

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

    const { uploadEmptyFolders, onClickBack } = filesActionsStore;

    const selectionLength = isProgressFinished ? selection.length : null;
    const selectionTitle = isProgressFinished
      ? filesStore.selectionTitle
      : null;

    const { setToPreviewFile, playlist } = mediaViewerDataStore;

    const { setPortalTariff } = currentTariffStatusStore;

    const {
      setFrameConfig,
      frameConfig,
      isFrame,
      withPaging,
      showCatalog,
      enablePlugins,
      getSettings,
    } = settingsStore;

    const { usersStore, groupsStore, viewAs: accountsViewAs } = peopleStore;

    const { getUsersList: fetchPeople } = usersStore;
    const { getGroups: fetchGroups, fetchGroup } = groupsStore;

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
      folderSecurity,
      primaryProgressDataVisible,
      primaryProgressDataPercent,
      primaryProgressDataIcon,
      primaryProgressDataAlert,
      clearPrimaryProgressData,

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

      disableDrag,

      setExpandedKeys,

      setDragging,
      setIsLoading,
      isLoading,
      fetchFiles,
      fetchRooms,

      setUploadPanelVisible,
      startUpload,
      uploadEmptyFolders,

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
      withPaging,
      isEmptyPage,

      setPortalTariff,

      accountsViewAs,
      fetchPeople,
      fetchGroups,
      fetchGroup,
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
      updateProfileCulture,
      getRooms,
      setSelectedFolder,
    };
  },
)(observer(Home));
