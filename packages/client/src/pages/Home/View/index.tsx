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
import { Trans, useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { getCategoryType } from "@docspace/shared/utils/common";
import { CategoryType } from "@docspace/shared/constants";
import { Consumer } from "@onlyoffice/apps-ui-kit/utils";
import type { Nullable } from "@docspace/shared/types";
import type { TError } from "@docspace/shared/utils/axiosClient";

import { AnimationEvents } from "@onlyoffice/apps-ui-kit/hooks/useAnimation";
import {
  clearTextSelection,
  isEditableElementFocused,
} from "@docspace/shared/utils/copy";
import { TopLoaderService as TopLoadingIndicator } from "@onlyoffice/apps-ui-kit/components";
import { LoaderWrapper } from "@onlyoffice/apps-ui-kit/components/loader-wrapper";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { TOAST_FOLDER_PUBLIC_KEY } from "@docspace/shared/constants";
import type { TFolder } from "@docspace/shared/api/files/types";
import { getAccessLabel } from "@docspace/shared/components/share/Share.helpers";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";
import { UserStore } from "@docspace/shared/store/UserStore";

import type ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import type FilesStore from "SRC_DIR/store/FilesStore";

import { SectionBodyContent, ContactsSectionBodyContent } from "../Section";
import ProfileSectionBodyContent from "../../Profile/Section/Body";

import useProfileBody, {
  type UseProfileBodyProps,
} from "../../Profile/Section/Body/useProfileBody";
import useContacts, { type UseContactsProps } from "../Hooks/useContacts";
import useFiles, { type UseFilesProps } from "../Hooks/useFiles";
import OformsStore from "SRC_DIR/store/OformsStore";

type ViewProps = UseContactsProps &
  UseFilesProps &
  UseProfileBodyProps & {
    getEncryptionKeys: UserStore["getEncryptionKeys"];
    setIsChangePageRequestRunning: ClientLoadingStore["setIsChangePageRequestRunning"];
    setCurrentClientView: ClientLoadingStore["setCurrentClientView"];
    setIsSectionHeaderLoading: ClientLoadingStore["setIsSectionHeaderLoading"];

    clearFiles: FilesStore["clearFiles"];

    usersAbortController: Nullable<AbortController>;
    groupsAbortController: Nullable<AbortController>;

    filesAbortController: Nullable<AbortController>;
    roomsAbortController: Nullable<AbortController>;

    showHeaderLoader: ClientLoadingStore["showHeaderLoader"];

    setHotkeyCaret: FilesStore["setHotkeyCaret"];
    currentExtensionGallery: OformsStore["currentExtensionGallery"];
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
  currentExtensionGallery,
  userId,

  selectedFolderStore,
  wsCreatedPDFForm,
  setHotkeyCaret,
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
  getEncryptionKeys,
}: ViewProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation(["Common", "Files"]);

  const isContactsPage = location.pathname.includes("accounts");
  const isProfilePage = location.pathname.includes("profile");

  const [currentView, setCurrentView] = React.useState(() => {
    const type = getCategoryType(location);

    if (type === CategoryType.Accounts) {
      return "users";
    }

    if (isProfilePage) {
      return "profile";
    }

    return "files";
  });

  React.useEffect(() => {
    const guestShareLinkInvalid = sessionStorage.getItem(
      "guestShareLinkInvalid",
    );

    if (guestShareLinkInvalid === "true") {
      toastr.error(t("Common:InvalidLink"));
      sessionStorage.removeItem("guestShareLinkInvalid");
    }
  }, []);

  const [isLoading, setIsLoading] = React.useState(false);
  const getViewRequestIdRef = React.useRef(0);

  const prevCurrentViewRef = React.useRef(currentView);
  const prevCategoryType = React.useRef<number>(getCategoryType(location));

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

    selectedFolderStore,
    wsCreatedPDFForm,
    currentExtensionGallery,
    setIsSectionHeaderLoading: setIsSectionHeaderLoading!,
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
    getEncryptionKeys: getEncryptionKeys!,
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

  const showToastAccess = useEventCallback(() => {
    if (
      selectedFolderStore.isFolder &&
      sessionStorage.getItem(TOAST_FOLDER_PUBLIC_KEY) ===
        selectedFolderStore.id?.toString()
    ) {
      const access = getAccessLabel(
        t,
        selectedFolderStore as unknown as TFolder,
      );

      toastr.info(
        <Trans
          t={t}
          ns="Files"
          i18nKey="OpenedViaLink"
          values={{ access }}
          components={{
            strong: <strong />,
          }}
        />,
      );
      sessionStorage.removeItem(TOAST_FOLDER_PUBLIC_KEY);
    }
  });

  React.useEffect(() => {
    const getView = async () => {
      const requestId = ++getViewRequestIdRef.current;
      const isStale = () => getViewRequestIdRef.current !== requestId;

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
          await getProfileInitialValue();

          clearFiles();
          setContactsTab(false);

          view = "profile";
        } else if (!isContactsPage) {
          await getFilesRef.current();

          prevCategoryType.current = getCategoryType(location);

          view = "files";
          setContactsTab(false);
        } else {
          clearFiles();
        }

        // A newer getView() run has since started (and aborted this one's
        // requests) — let it own the loading state instead of stomping on it.
        if (isStale()) return;

        if (view) {
          setCurrentView(view);
          setCurrentClientView(view);
        }

        setIsChangePageRequestRunning(false);
        setIsLoading(false);

        clearTextSelection();
        showToastAccess();
      } catch (error) {
        console.log(error);
        if ((error as Error).message === "canceled") {
          // Only a superseded run should stay silent here; if this is still
          // the latest run, nothing else will clear the loading indicator.
          if (isStale()) return;

          setIsChangePageRequestRunning(false);
          setIsLoading(false);
          return;
        }

        if (isStale()) return;

        const typedError = error as TError;

        if (
          typedError?.response?.data?.error?.message === "Access denied" &&
          isContactsPage
        ) {
          setIsSectionHeaderLoading(false, false);
          navigate("/no-access");
        }

        setIsChangePageRequestRunning(false);
        setIsLoading(false);
      }
    };

    getView();
  }, [
    location.pathname,
    location.search,
    isContactsPage,
    isProfilePage,
    showToastAccess,
  ]);

  React.useEffect(() => {
    if (isLoading || currentView === "profile") return;

    const scroll = document.getElementsByClassName("section-body");

    // Don't steal focus while the user is typing (e.g. the search input).
    if (scroll && scroll[0] && !isEditableElementFocused()) {
      const firstChild = scroll[0] as HTMLElement;
      firstChild.focus();
      setHotkeyCaret(null);
    }

    scrollToTop();
  }, [isLoading, currentView, scrollToTop]);

  return (
    <LoaderWrapper isLoading={isLoading ? !showHeaderLoader : false}>
      <Consumer>
        {(context) =>
          currentView === "users" || currentView === "groups" ? (
            <ContactsSectionBodyContent
              sectionWidth={context.sectionWidth}
              currentView={currentView}
            />
          ) : currentView === "profile" ? (
            <ProfileSectionBodyContent />
          ) : (
            <SectionBodyContent sectionWidth={context.sectionWidth} />
          )
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
      setHotkeyCaret,

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

    const {
      gallerySelected,
      isVisibleInfoPanelTemplateGallery,
      currentExtensionGallery,
    } = oformsStore;

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
      setHotkeyCaret,

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
      currentExtensionGallery,

      userId: userStore?.user?.id,
      getEncryptionKeys: userStore?.getEncryptionKeys,

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
