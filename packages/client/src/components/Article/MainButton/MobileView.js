﻿import CrossSidebarReactSvgUrl from "PUBLIC_DIR/images/cross.sidebar.react.svg?url";
import MobileActionsRemoveReactSvgUrl from "PUBLIC_DIR/images/mobile.actions.remove.react.svg?url";
import React from "react";
import styled, { css } from "styled-components";
import { inject, observer } from "mobx-react";

import { mobile } from "@docspace/shared/utils";

import { MainButtonMobile } from "@docspace/shared/components/main-button-mobile";

const StyledMainButtonMobile = styled(MainButtonMobile)`
  position: fixed;
  z-index: 200;

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          left: 24px;
        `
      : css`
          right: 24px;
        `}

  bottom: 24px;

  @media ${mobile} {
    position: absolute;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 16px;
          `
        : css`
            right: 16px;
          `}
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
}) => {
  const [isOpenButton, setIsOpenButton] = React.useState(false);
  const [percentProgress, setPercentProgress] = React.useState(0);
  const [progressOptions, setProgressOptions] = React.useState([]);

  const [primaryNumEl, setPrimaryNumEl] = React.useState(0);
  const primaryCurrentFile = React.useRef(null);

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

    const newProgressOptions = [
      {
        key: "primary-progress",
        open: primaryProgressDataVisible,
        label: t("UploadPanel:Uploads"),
        icon: CrossSidebarReactSvgUrl,
        percent: primaryProgressDataPercent,
        status:
          primaryProgressDataPercent === 100 &&
          !primaryProgressDataErrors &&
          uploaded
            ? t("FilesUploaded")
            : `${uploadedFileCount}/${fileLength}`,
        onClick: showUploadPanel,
        onCancel: clearUploadPanel,
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

export default inject(({ uploadDataStore, treeFoldersStore }) => {
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
  };
})(observer(MobileView));
