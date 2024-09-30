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

import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useLocation, Outlet } from "react-router-dom";
import Section from "@docspace/shared/components/section";
import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import SectionHeaderContent from "../Home/Section/Header";
import SectionFilterContent from "../Home/Section/Filter";
import FilesPanels from "../../components/FilesPanels";
import SectionWrapper from "SRC_DIR/components/Section";
import SelectionArea from "../Home/SelectionArea/FilesSelectionArea";
import MediaViewer from "../Home/MediaViewer";
import { usePublic, useSDK } from "../Home/Hooks";
import { Link } from "@docspace/shared/components/link";
import { StyledToast } from "./StyledPublicRoom";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { PUBLIC_STORAGE_KEY } from "@docspace/shared/constants";

const PublicRoomPage = (props) => {
  const {
    withPaging,
    fetchFiles,
    isEmptyPage,

    showSecondaryProgressBar,
    secondaryProgressBarValue,
    secondaryProgressBarIcon,
    showSecondaryButtonAlert,
    fetchPublicRoom,
    fetchPreviewMediaFile,

    frameConfig,
    setFrameConfig,
    isFrame,
    isLoading,
  } = props;

  const location = useLocation();

  const { t } = useTranslation(["Common"]);

  const [windowIsOpen, setWindowIsOpen] = useState(false);

  usePublic({
    location,
    fetchFiles,
    fetchPublicRoom,
    fetchPreviewMediaFile,
  });

  useSDK({ frameConfig, setFrameConfig, isLoading });

  const getAuthWindow = () => {
    return new Promise((res, rej) => {
      try {
        const path = combineUrl(
          window.ClientConfig?.proxy?.url,
          "/login?publicAuth=true",
        );

        const authModal = window.open(
          path,
          t("Common:Authorization"),
          "height=800, width=866",
        );

        const checkConnect = setInterval(() => {
          if (!authModal || !authModal.closed) {
            return;
          }

          clearInterval(checkConnect);

          res(authModal);
        }, 500);
      } catch (error) {
        rej(error);
      }
    });
  };

  const onOpenSignInWindow = async () => {
    if (windowIsOpen) return;

    setWindowIsOpen(true);
    await getAuthWindow();
    setWindowIsOpen(false);

    const isAuth = localStorage.getItem(PUBLIC_STORAGE_KEY);

    if (isAuth) {
      localStorage.removeItem(PUBLIC_STORAGE_KEY);
      window.location.reload();
    }
  };

  useEffect(() => {
    const toastText = (
      <StyledToast>
        <Text fontSize="12px" fontWeight={400}>
          {t("Common:PublicAuthorizeToast")}
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
  }, []);

  const sectionProps = {
    showSecondaryProgressBar,
    secondaryProgressBarValue,
    secondaryProgressBarIcon,
    showSecondaryButtonAlert,
  };

  return (
    <>
      <SectionWrapper
        withBodyScroll
        // withBodyAutoFocus={!isMobile}
        withPaging={withPaging}
        {...sectionProps}
      >
        <Section.SectionHeader>
          <SectionHeaderContent
            showSignInButton
            onSignInClick={onOpenSignInWindow}
            signInButtonIsDisabled={windowIsOpen}
          />
        </Section.SectionHeader>

        {!isEmptyPage && (
          <Section.SectionFilter>
            {isFrame ? (
              frameConfig?.showFilter && <SectionFilterContent />
            ) : (
              <SectionFilterContent />
            )}
          </Section.SectionFilter>
        )}

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
  }) => {
    const { withPaging, frameConfig, setFrameConfig, isFrame } = settingsStore;
    const { isLoaded, isLoading, roomStatus, fetchPublicRoom } =
      publicRoomStore;

    const { fetchFiles, isEmptyPage } = filesStore;
    const { getFilesSettings } = filesSettingsStore;

    const {
      visible: showSecondaryProgressBar,
      percent: secondaryProgressBarValue,
      icon: secondaryProgressBarIcon,
      alert: showSecondaryButtonAlert,
    } = uploadDataStore.secondaryProgressDataStore;

    const { fetchPreviewMediaFile } = mediaViewerDataStore;

    return {
      isLoaded,
      isLoading,
      roomStatus,
      fetchFiles,
      getFilesSettings,

      withPaging,

      showSecondaryProgressBar,
      secondaryProgressBarValue,
      secondaryProgressBarIcon,
      showSecondaryButtonAlert,

      isAuthenticated: authStore.isAuthenticated,
      isEmptyPage,
      fetchPublicRoom,
      fetchPreviewMediaFile,

      frameConfig,
      setFrameConfig,
      isFrame,
    };
  },
)(observer(PublicRoomPage));
