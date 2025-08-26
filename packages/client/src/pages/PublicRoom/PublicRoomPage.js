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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";
import { useLocation, Outlet } from "react-router";
import Section from "@docspace/shared/components/section";
import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import {
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";

import SectionWrapper from "SRC_DIR/components/Section";
import SectionHeaderContent from "../Home/Section/Header";
import SectionFilterContent from "../Home/Section/Filter";
import FilesPanels from "../../components/FilesPanels";
import SelectionArea from "../Home/SelectionArea/FilesSelectionArea";
import MediaViewer from "../Home/MediaViewer";
import { usePublic, useSDK } from "../Home/Hooks";
import { StyledToast } from "./StyledPublicRoom";

const PUBLIC_SIGN_IN_TOAST = "showPublicSignInToast";

const PublicRoomPage = (props) => {
  const {
    fetchFiles,
    isEmptyPage,

    fetchPublicRoom,
    fetchPreviewMediaFile,

    frameConfig,
    setFrameConfig,
    isFrame,
    isLoading,
    access,
    roomType,
    parentRoomType,

    isSecondaryProgressVisbile,
    secondaryOperationsCompleted,
    clearSecondaryProgressData,
    secondaryActiveOperations,
    secondaryOperationsAlert,
    onOpenSignInWindow,
    windowIsOpen,
    isAuthenticated,
  } = props;

  const location = useLocation();

  const { t, ready } = useTranslation(["Common"]);

  useSDK({ frameConfig, setFrameConfig, isLoading });

  usePublic({
    location,
    fetchFiles,
    fetchPublicRoom,
    fetchPreviewMediaFile,
  });

  const getAccessTranslation = () => {
    switch (access) {
      case ShareAccessRights.ReadOnly:
        return t("Common:ViewOnly");
      case ShareAccessRights.Comment:
        return t("Common:Commenting");
      case ShareAccessRights.Review:
        return t("Common:Reviewing");
      case ShareAccessRights.Editing:
        return t("Common:Editor");
      default:
        return t("Common:ViewOnly");
    }
  };

  useEffect(() => {
    const toastIsDisabled =
      sessionStorage.getItem(PUBLIC_SIGN_IN_TOAST) === "true";

    const isFormRoom =
      roomType === RoomsType.FormRoom || parentRoomType === FolderType.FormRoom;

    if (!access || !ready || toastIsDisabled || isFrame) return;

    const roomMode = getAccessTranslation().toLowerCase();

    sessionStorage.setItem(PUBLIC_SIGN_IN_TOAST, "true");

    const content = isFormRoom ? (
      t("Common:FormAuthorizeToast", { productName: t("Common:ProductName") })
    ) : (
      <Trans
        t={t}
        ns="Common"
        i18nKey="PublicAuthorizeToast"
        values={{ roomMode, productName: t("Common:ProductName") }}
        components={{
          1: <Text as="span" fontSize="12px" fontWeight={700} />,
        }}
      />
    );

    const toastText = (
      <StyledToast>
        <Text fontSize="12px" fontWeight={400}>
          {content}
        </Text>
        <Link
          fontSize="12px"
          fontWeight={400}
          className="public-toast_link"
          onClick={onOpenSignInWindow}
        >
          {t("Common:LoginButton")}
        </Link>
      </StyledToast>
    );

    toastr.info(toastText);
  }, [access, ready, roomType, parentRoomType]);

  const sectionProps = {
    isSecondaryProgressVisbile,
    secondaryOperationsCompleted,
    clearSecondaryProgressData,
    secondaryActiveOperations,
    secondaryOperationsAlert,
  };

  const showSignInButton = !isFrame && !isAuthenticated;

  return (
    <>
      <SectionWrapper
        withBodyScroll
        // withBodyAutoFocus={!isMobile}
        {...sectionProps}
      >
        <Section.SectionHeader>
          <SectionHeaderContent
            showSignInButton={showSignInButton}
            onSignInClick={() => onOpenSignInWindow()}
            signInButtonIsDisabled={windowIsOpen}
          />
        </Section.SectionHeader>

        {!isEmptyPage ? (
          <Section.SectionFilter>
            {isFrame ? (
              frameConfig?.showFilter && <SectionFilterContent />
            ) : (
              <SectionFilterContent />
            )}
          </Section.SectionFilter>
        ) : null}

        <Section.SectionBody>
          <Outlet />
        </Section.SectionBody>
      </SectionWrapper>

      <FilesPanels />
      <SelectionArea />
      <MediaViewer />
    </>
  );
};

export default inject(
  ({
    authStore,
    settingsStore,
    filesStore,
    publicRoomStore,
    uploadDataStore,
    filesSettingsStore,
    mediaViewerDataStore,
    selectedFolderStore,
    clientLoadingStore,
  }) => {
    const { frameConfig, setFrameConfig, isFrame } = settingsStore;
    const {
      isLoaded,
      roomStatus,
      fetchPublicRoom,
      onOpenSignInWindow,
      windowIsOpen,
      validationData,
    } = publicRoomStore;
    const { isLoading } = clientLoadingStore;

    const { fetchFiles, isEmptyPage } = filesStore;
    const { getFilesSettings } = filesSettingsStore;
    const { access, roomType, parentRoomType } = selectedFolderStore;

    const {
      isSecondaryProgressVisbile,
      secondaryOperationsCompleted,
      clearSecondaryProgressData,
      secondaryActiveOperations,
      secondaryOperationsAlert,
    } = uploadDataStore.secondaryProgressDataStore;

    const { fetchPreviewMediaFile } = mediaViewerDataStore;

    const isAuthenticated =
      validationData?.isAuthenticated || authStore.isAuthenticated;

    return {
      isLoaded,
      isLoading,
      roomStatus,
      fetchFiles,
      getFilesSettings,

      isSecondaryProgressVisbile,
      secondaryOperationsCompleted,
      clearSecondaryProgressData,
      secondaryActiveOperations,
      secondaryOperationsAlert,

      isAuthenticated,
      isEmptyPage,
      fetchPublicRoom,
      fetchPreviewMediaFile,

      frameConfig,
      setFrameConfig,
      isFrame,
      access,
      roomType,
      parentRoomType,
      onOpenSignInWindow,
      windowIsOpen,
    };
  },
)(observer(PublicRoomPage));
