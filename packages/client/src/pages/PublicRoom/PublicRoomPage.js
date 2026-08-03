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

import { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";
import { useLocation, Outlet } from "react-router";
import Section from "@docspace/ui-kit/components/section";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { ShareAccessRights } from "@docspace/shared/enums";
import { isPublicRoom } from "@docspace/shared/utils/common";

import SectionWrapper from "SRC_DIR/components/Section";
import SectionHeaderContent from "../Home/Section/Header";
import SectionFilterContent from "../Home/Section/Filter";
import FilesPanels from "../../components/FilesPanels";
import SelectionArea from "../Home/SelectionArea/FilesSelectionArea";
import MediaViewer from "../Home/MediaViewer";
import { usePublic, useSDK } from "../Home/Hooks";
import styles from "./PublicRoom.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

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
    secondaryOperationsStopped,
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
      case ShareAccessRights.FormFilling:
        return t("Common:FillingOnly");
      default:
        return t("Common:ViewOnly");
    }
  };

  useEffect(() => {
    const toastIsDisabled =
      sessionStorage.getItem(PUBLIC_SIGN_IN_TOAST) === access?.toString();

    if (!access || !ready || toastIsDisabled || isFrame || isAuthenticated)
      return;

    const roomMode = getAccessTranslation().toLowerCase();

    sessionStorage.setItem(PUBLIC_SIGN_IN_TOAST, access?.toString());

    const content = (
      <Trans
        t={t}
        ns="Common"
        i18nKey="PublicAuthorizeToast"
        values={{ roomMode, productName: getBrandName("ProductName") }}
        components={{
          1: (
            <Text
              key="productName"
              as="span"
              fontSize="12px"
              fontWeight={700}
            />
          ),
        }}
      />
    );

    const toastText = (
      <div className={styles.toast}>
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
      </div>
    );

    toastr.info(toastText);
  }, [access, ready, roomType, parentRoomType, isAuthenticated]);

  const sectionProps = {
    isSecondaryProgressVisbile,
    secondaryOperationsCompleted,
    clearSecondaryProgressData,
    secondaryActiveOperations,
    secondaryOperationsStopped,
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
      secondaryOperationsStopped,
      secondaryOperationsAlert,
    } = uploadDataStore.secondaryProgressDataStore;

    const { fetchPreviewMediaFile } = mediaViewerDataStore;

    const isAuthenticated =
      (validationData?.isAuthenticated || authStore.isAuthenticated) &&
      !isPublicRoom();

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
      secondaryOperationsStopped,
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
