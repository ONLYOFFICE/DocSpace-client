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

import CrossSidebarReactSvgUrl from "PUBLIC_DIR/images/cross.sidebar.react.svg?url";
import InfoEditReactSvgUrl from "PUBLIC_DIR/images/info.edit.react.svg?url";
import MobileActionsRemoveReactSvgUrl from "PUBLIC_DIR/images/mobile.actions.remove.react.svg?url";
import React from "react";
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";

import { mobile } from "@docspace/shared/utils";
import { isMobileOnly } from "react-device-detect";

import { MainButtonMobile } from "@docspace/shared/components/main-button-mobile";

const StyledMainButtonMobile = styled(MainButtonMobile)`
  position: fixed;
  z-index: 200;

  inset-inline-end: ${({ theme }) => {
    const side = theme.interfaceDirection === "rtl" ? "left" : "right";
    return isMobileOnly ? `calc(16px + env(safe-area-inset-${side}))` : "24px";
  }};

  bottom: 24px;

  @media ${mobile} {
    position: absolute;
    inset-inline-end: 16px;
    bottom: 16px;
  }
`;

const MobileView = ({
  t,
  titleProp,
  actionOptions,
  buttonOptions,
  isRooms,
  withoutButton,
  withMenu,
  files,
  clearUploadData,
  setUploadPanelVisible,
  primaryProgressDataVisible,
  primaryProgressDataPercent,
  primaryProgressDataLoadingFile,
  primaryProgressDataAlert,
  primaryProgressDataErrors,
  clearPrimaryProgressData,
  secondaryProgressDataStoreVisible,
  secondaryProgressDataStorePercent,
  secondaryProgressDataStoreIsDownload,
  secondaryProgressDataStoreCurrentFile,
  secondaryProgressDataStoreCurrentFilesCount,
  clearSecondaryProgressData,
  onMainButtonClick,
  isRoomsFolder,
  mainButtonMobileVisible,
  uploaded,
  setGuidanceCoordinates,
  guidanceCoordinates,
}) => {
  const [isOpenButton, setIsOpenButton] = React.useState(false);
  const [percentProgress, setPercentProgress] = React.useState(0);
  const [progressOptions, setProgressOptions] = React.useState([]);

  const [primaryNumEl, setPrimaryNumEl] = React.useState(0);
  const primaryCurrentFile = React.useRef(null);
  const mainButtonRef = React.useRef(null);

  const openButtonToggler = React.useCallback(() => {
    setIsOpenButton((prevState) => !prevState);
  }, []);

  const showUploadPanel = React.useCallback(() => {
    setUploadPanelVisible && setUploadPanelVisible(true);
  }, [setUploadPanelVisible]);

  const clearUploadPanel = React.useCallback(() => {
    clearUploadData && clearUploadData();
    clearPrimaryProgressData && clearPrimaryProgressData();
  }, [clearUploadData, clearPrimaryProgressData]);

  React.useEffect(() => {
    if (mainButtonRef?.current) {
      setGuidanceCoordinates({
        uploading: mainButtonRef?.current.getClientRects()[0],
      });
    }
  }, [
    mainButtonRef?.current,
    guidanceCoordinates.ready,
    guidanceCoordinates.pdf,
  ]);

  React.useEffect(() => {
    let currentPrimaryNumEl = primaryNumEl;

    const uploadedFileCount = files.filter(
      (item) => item.percent === 100 && !item.cancel,
    ).length;
    const fileLength = files.filter((item) => !item.cancel).length;

    if (primaryCurrentFile.current === null && primaryProgressDataLoadingFile) {
      primaryCurrentFile.current = primaryProgressDataLoadingFile.uniqueId;
      currentPrimaryNumEl = 0;
    }

    if (primaryCurrentFile.current !== null && primaryProgressDataLoadingFile) {
      if (
        primaryCurrentFile.current !== primaryProgressDataLoadingFile.uniqueId
      ) {
        currentPrimaryNumEl++;
        primaryCurrentFile.current = primaryProgressDataLoadingFile.uniqueId;
      }
    }

    const currentSecondaryProgressItem =
      (secondaryProgressDataStoreCurrentFilesCount *
        secondaryProgressDataStorePercent) /
      100;

    const secondaryProgressStatus = secondaryProgressDataStoreIsDownload
      ? `${Math.floor(secondaryProgressDataStorePercent)}%`
      : `${Math.floor(
          currentSecondaryProgressItem,
        )}/${secondaryProgressDataStoreCurrentFilesCount}`;

    const isUploaded = primaryProgressDataPercent === 100 && uploaded;
    const isError = isUploaded && primaryProgressDataErrors;

    let primaryLabel =
      isUploaded && !primaryProgressDataErrors
        ? t("FilesUploaded")
        : `${uploadedFileCount}/${fileLength}`;

    if (isError) {
      primaryLabel = t("FilesNotLoaded", { count: primaryProgressDataErrors });
    }

    const newProgressOptions = [
      {
        key: "primary-progress",
        open: primaryProgressDataVisible,
        label: t("UploadPanel:Uploads"),
        icon: isError ? InfoEditReactSvgUrl : CrossSidebarReactSvgUrl,
        percent: primaryProgressDataPercent,
        status: primaryLabel,
        onClick: showUploadPanel,
        onCancel: clearUploadPanel,
        error: primaryProgressDataErrors,
      },
      {
        key: "secondary-progress",
        open: secondaryProgressDataStoreVisible,
        label: t("Common:OtherOperations"),
        icon: MobileActionsRemoveReactSvgUrl,
        percent: secondaryProgressDataStorePercent,
        status: secondaryProgressStatus,
        onCancel: clearSecondaryProgressData,
      },
    ];

    let newPercentProgress =
      primaryProgressDataPercent + secondaryProgressDataStorePercent;

    if (primaryProgressDataVisible && secondaryProgressDataStoreVisible) {
      newPercentProgress =
        ((currentPrimaryNumEl + currentSecondaryProgressItem) /
          (files.length + secondaryProgressDataStoreCurrentFilesCount)) *
        100;
    }

    if (primaryProgressDataPercent === 100) {
      currentPrimaryNumEl = 0;
      primaryCurrentFile.current = null;
    }

    setPrimaryNumEl(currentPrimaryNumEl);
    setPercentProgress(newPercentProgress);
    setProgressOptions([...newProgressOptions]);
  }, [
    uploaded,
    files.length,
    showUploadPanel,
    clearUploadPanel,
    primaryProgressDataVisible,
    primaryProgressDataPercent,
    primaryProgressDataLoadingFile,
    primaryProgressDataErrors,
    secondaryProgressDataStoreVisible,
    secondaryProgressDataStorePercent,
    secondaryProgressDataStoreIsDownload,
    secondaryProgressDataStoreCurrentFile,
    secondaryProgressDataStoreCurrentFilesCount,
  ]);

  return (
    <>
      {mainButtonMobileVisible && (
        <StyledMainButtonMobile
          actionOptions={actionOptions}
          isOpenButton={isOpenButton}
          mainButtonRef={mainButtonRef}
          onUploadClick={openButtonToggler}
          onClose={openButtonToggler}
          buttonOptions={buttonOptions}
          percent={percentProgress}
          progressOptions={progressOptions}
          title={titleProp}
          withoutButton={withoutButton}
          alert={primaryProgressDataAlert}
          withMenu={withMenu}
          onClick={onMainButtonClick}
          onAlertClick={showUploadPanel}
          withAlertClick={isRoomsFolder}
        />
      )}
    </>
  );
};

export default inject(({ uploadDataStore, treeFoldersStore, filesStore }) => {
  const { isRoomsFolder } = treeFoldersStore;
  const {
    files,
    setUploadPanelVisible,
    secondaryProgressDataStore,
    primaryProgressDataStore,
    clearUploadData,
    uploaded,
  } = uploadDataStore;

  const {
    visible: primaryProgressDataVisible,
    percent: primaryProgressDataPercent,
    loadingFile: primaryProgressDataLoadingFile,
    alert: primaryProgressDataAlert,
    errors: primaryProgressDataErrors,
    clearPrimaryProgressData,
  } = primaryProgressDataStore;

  const {
    visible: secondaryProgressDataStoreVisible,
    percent: secondaryProgressDataStorePercent,
    currentFile: secondaryProgressDataStoreCurrentFile,
    filesCount: secondaryProgressDataStoreCurrentFilesCount,
    clearSecondaryProgressData,
    isDownload: secondaryProgressDataStoreIsDownload,
  } = secondaryProgressDataStore;

  return {
    files,
    clearUploadData,
    setUploadPanelVisible,
    primaryProgressDataVisible,
    primaryProgressDataPercent,
    primaryProgressDataLoadingFile,
    primaryProgressDataAlert,
    primaryProgressDataErrors,
    clearPrimaryProgressData,
    secondaryProgressDataStoreVisible,
    secondaryProgressDataStorePercent,
    secondaryProgressDataStoreIsDownload,
    secondaryProgressDataStoreCurrentFile,
    secondaryProgressDataStoreCurrentFilesCount,
    clearSecondaryProgressData,
    isRoomsFolder,
    uploaded,
    setGuidanceCoordinates: filesStore.setGuidanceCoordinates,
    guidanceCoordinates: filesStore.guidanceCoordinates,
  };
})(observer(MobileView));
