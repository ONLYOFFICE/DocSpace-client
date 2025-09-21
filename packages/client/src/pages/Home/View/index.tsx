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
import { inject, observer } from "mobx-react";

import { useLocation } from "react-router";

import { Consumer } from "@docspace/shared/utils";
import { Nullable } from "@docspace/shared/types";

import { AnimationEvents } from "@docspace/shared/hooks/useAnimation";
import TopLoadingIndicator from "@docspace/shared/components/top-loading-indicator";
import { LoaderWrapper } from "@docspace/shared/components/loader-wrapper";

import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import FilesStore from "SRC_DIR/store/FilesStore";
import { getCategoryType } from "SRC_DIR/helpers/utils";

import { SectionBodyContent, ContactsSectionBodyContent } from "../Section";
import ProfileSectionBodyContent from "../../Profile/Section/Body";

import useProfileBody, {
  UseProfileBodyProps,
} from "../../Profile/Section/Body/useProfileBody";
import useContacts, { UseContactsProps } from "../Hooks/useContacts";
import useFiles, { UseFilesProps } from "../Hooks/useFiles";

type ViewProps = UseContactsProps &
  UseFilesProps &
  UseProfileBodyProps & {
    setIsChangePageRequestRunning: ClientLoadingStore["setIsChangePageRequestRunning"];
    setCurrentClientView: ClientLoadingStore["setCurrentClientView"];
    setIsSectionHeaderLoading: ClientLoadingStore["setIsSectionHeaderLoading"];

    clearFiles: FilesStore["clearFiles"];

    usersAbortController: Nullable<AbortController>;
    groupsAbortController: Nullable<AbortController>;

    filesAbortController: Nullable<AbortController>;
    roomsAbortController: Nullable<AbortController>;

    showHeaderLoader: ClientLoadingStore["showHeaderLoader"];
  };

const View = ({
  scrollToTop,

  setSelectedNode,

  setContactsTab,
  getUsersList,

  getGroups,
  updateCurrentGroup,

  setIsChangePageRequestRunning,
  setCurrentClientView,

  usersAbortController,
  groupsAbortController,

  filesAbortController,
  roomsAbortController,

  fetchFiles,
  fetchRooms,

  playlist,

  getFileInfo,
  setToPreviewFile,
  setIsPreview,

  setIsUpdatingRowItem,

  gallerySelected,
  isVisibleInfoPanelTemplateGallery,
  userId,

  selectedFolderStore,
  wsCreatedPDFForm,
  clearFiles,

  setIsSectionHeaderLoading,

  showHeaderLoader,

  getFilesSettings,
  setSubscriptions,
  isFirstSubscriptionsLoad,
  fetchConsents,
  fetchScopes,
  tfaSettings,
  setBackupCodes,
  setProviders,
  getCapabilities,
  getSessions,

  getTfaType,
  setIsProfileLoaded,

  setNotificationChannels,
  checkTg,
}: ViewProps) => {
  const location = useLocation();

  const isContactsPage = location.pathname.includes("accounts");
  const isProfilePage = location.pathname.includes("profile");

  const [currentView, setCurrentView] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const prevCurrentViewRef = React.useRef(currentView);
  const prevCategoryType = React.useRef(getCategoryType(location));

  const { fetchContacts } = useContacts({
    isContactsPage,

    setContactsTab,

    scrollToTop,
    setSelectedNode,

    getUsersList,
    getGroups,
    updateCurrentGroup,
  });

  const { getFiles } = useFiles({
    fetchFiles,
    fetchRooms,

    playlist,

    getFileInfo,
    setToPreviewFile,
    setIsPreview,

    setIsUpdatingRowItem,

    gallerySelected,
    isVisibleInfoPanelTemplateGallery,
    userId,

    scrollToTop,
    selectedFolderStore,
    wsCreatedPDFForm,
  });

  const { getProfileInitialValue } = useProfileBody({
    getFilesSettings: getFilesSettings!,
    setSubscriptions: setSubscriptions!,
    setNotificationChannels: setNotificationChannels!,
    isFirstSubscriptionsLoad,
    fetchConsents: fetchConsents!,
    fetchScopes: fetchScopes!,
    tfaSettings,
    setBackupCodes: setBackupCodes!,
    setProviders: setProviders!,
    getCapabilities: getCapabilities!,
    getSessions: getSessions!,
    setIsProfileLoaded: setIsProfileLoaded!,
    setIsSectionHeaderLoading: setIsSectionHeaderLoading!,
    getTfaType: getTfaType!,
    checkTg: checkTg!,
  });

  const getFilesRef = React.useRef(getFiles);
  const fetchContactsRef = React.useRef(fetchContacts);

  const animationStartedRef = React.useRef(false);

  const abortControllers = React.useRef({
    filesAbortController,
    roomsAbortController,
    usersAbortController,
    groupsAbortController,
  });

  React.useLayoutEffect(() => {
    setIsSectionHeaderLoading(true, false);
  }, [setIsSectionHeaderLoading]);

  React.useEffect(() => {
    prevCurrentViewRef.current = currentView;
  }, [currentView]);

  React.useEffect(() => {
    getFilesRef.current = getFiles;
  }, [getFiles]);

  React.useEffect(() => {
    fetchContactsRef.current = fetchContacts;
  }, [fetchContacts]);

  React.useEffect(() => {
    abortControllers.current.filesAbortController = filesAbortController;
    abortControllers.current.roomsAbortController = roomsAbortController;
    abortControllers.current.usersAbortController = usersAbortController;
    abortControllers.current.groupsAbortController = groupsAbortController;
  }, [
    filesAbortController,
    roomsAbortController,
    usersAbortController,
    groupsAbortController,
  ]);

  React.useEffect(() => {
    animationStartedRef.current = false;

    const animationStartedAction = () => {
      animationStartedRef.current = true;
    };

    window.addEventListener(
      AnimationEvents.ANIMATION_STARTED,
      animationStartedAction,
    );

    return () => {
      window.removeEventListener(
        AnimationEvents.ANIMATION_STARTED,
        animationStartedAction,
      );
    };
  }, []);

  React.useEffect(() => {
    if (!isLoading) {
      TopLoadingIndicator.end();

      if (currentView === "profile" && prevCurrentViewRef.current === "profile")
        return;

      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
    }
  }, [isLoading]);

  React.useEffect(() => {
    animationStartedRef.current = false;

    const animationEndedAction = () => {
      animationStartedRef.current = false;
    };

    window.addEventListener(
      AnimationEvents.ANIMATION_ENDED,
      animationEndedAction,
    );

    return () => {
      window.removeEventListener(
        AnimationEvents.ANIMATION_ENDED,
        animationEndedAction,
      );
    };
  }, []);

  React.useEffect(() => {
    if (showHeaderLoader) return;

    if (isLoading) {
      if (!animationStartedRef.current) {
        TopLoadingIndicator.start();
      }
    }
  }, [isLoading, showHeaderLoader]);

  React.useEffect(() => {
    const getView = async () => {
      try {
        abortControllers.current.usersAbortController?.abort();
        abortControllers.current.groupsAbortController?.abort();
        abortControllers.current.filesAbortController?.abort();
        abortControllers.current.roomsAbortController?.abort();

        setIsLoading(true);
        setIsChangePageRequestRunning(true);
        let view: void | "groups" | "files" | "users" | "profile" =
          await fetchContactsRef.current();

        if (isProfilePage) {
          if (prevCurrentViewRef.current !== "profile") {
            await getProfileInitialValue();
          }

          clearFiles();
          setContactsTab(false);

          view = "profile";
        } else if (!isContactsPage) {
          await getFilesRef.current();

          view = "files";
          prevCategoryType.current = getCategoryType(location);
          setContactsTab(false);
        } else {
          clearFiles();
        }

        if (view) {
          setCurrentView(view);
          setCurrentClientView(view);
        }

        setIsChangePageRequestRunning(false);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        if ((error as Error).message === "canceled") {
          return;
        }

        setIsChangePageRequestRunning(false);
        setIsLoading(false);
      }
    };

    getView();
  }, [location, isContactsPage, isProfilePage]);

  return (
    <LoaderWrapper isLoading={isLoading ? !showHeaderLoader : false}>
      <Consumer>
        {(context) =>
          context.sectionWidth &&
          (currentView === "users" || currentView === "groups" ? (
            <ContactsSectionBodyContent
              sectionWidth={context.sectionWidth}
              currentView={currentView}
            />
          ) : currentView === "profile" ? (
            <ProfileSectionBodyContent />
          ) : (
            <SectionBodyContent sectionWidth={context.sectionWidth} />
          ))
        }
      </Consumer>
    </LoaderWrapper>
  );
};

export const ViewComponent = inject(
  ({
    peopleStore,
    treeFoldersStore,

    filesStore,
    clientLoadingStore,
    mediaViewerDataStore,
    oformsStore,
    userStore,
    selectedFolderStore,
    filesSettingsStore,
    oauthStore,
    tfaStore,
    setup,
    authStore,
    telegramStore,
  }: TStore) => {
    const { usersStore, groupsStore } = peopleStore;

    const {
      getUsersList,
      setContactsTab,
      abortController: usersAbortController,
    } = usersStore;

    const {
      getGroups,
      updateCurrentGroup,
      abortController: groupsAbortController,
    } = groupsStore!;

    const { setSelectedNode } = treeFoldersStore;

    const {
      scrollToTop,
      fetchFiles,
      fetchRooms,
      getFileInfo,
      setIsPreview,
      setIsUpdatingRowItem,
      wsCreatedPDFForm,

      filesController,
      roomsController,

      clearFiles,
    } = filesStore;

    const {
      setIsChangePageRequestRunning,
      setCurrentClientView,
      setIsSectionHeaderLoading,
      setIsProfileLoaded,

      showHeaderLoader,
    } = clientLoadingStore;

    const { playlist, setToPreviewFile } = mediaViewerDataStore;

    const { gallerySelected, isVisibleInfoPanelTemplateGallery } = oformsStore;

    const { getFilesSettings } = filesSettingsStore;

    const {
      setSubscriptions,
      setNotificationChannels,
      isFirstSubscriptionsLoad,
    } = peopleStore.targetUserStore!;

    const { fetchConsents, fetchScopes } = oauthStore;

    const { tfaSettings, setBackupCodes, getTfaType } = tfaStore;

    const { setProviders } = peopleStore.usersStore;
    const { getCapabilities } = authStore;

    const { getSessions } = setup;

    const { checkTg } = telegramStore;

    return {
      setContactsTab,
      getUsersList,
      getGroups,
      updateCurrentGroup,

      setSelectedNode,

      scrollToTop,
      fetchFiles,
      fetchRooms,
      getFileInfo,
      setIsPreview,
      setIsUpdatingRowItem,
      wsCreatedPDFForm,

      setIsChangePageRequestRunning,
      setCurrentClientView,

      usersAbortController,
      groupsAbortController,

      filesAbortController: filesController,
      roomsAbortController: roomsController,

      playlist,
      setToPreviewFile,

      gallerySelected,
      isVisibleInfoPanelTemplateGallery,

      userId: userStore?.user?.id,

      selectedFolderStore,

      clearFiles,

      setIsSectionHeaderLoading,

      showHeaderLoader,

      getFilesSettings,
      setSubscriptions,
      isFirstSubscriptionsLoad,
      fetchConsents,
      fetchScopes,
      tfaSettings,
      setBackupCodes,
      setProviders,
      getCapabilities,
      getSessions,

      getTfaType,
      setIsProfileLoaded,
      setNotificationChannels,
      checkTg,
    };
  },
)(observer(View));
