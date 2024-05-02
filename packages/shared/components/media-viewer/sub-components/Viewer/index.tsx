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

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { DeviceType } from "@docspace/shared/enums";
import { Portal } from "@docspace/shared/components/portal";
import { includesMethod } from "@docspace/shared/utils/typeGuards";
import type { TContextMenuRef } from "@docspace/shared/components/context-menu";

import { StyledViewerContainer } from "../../MediaViewer.styled";

import { NextButton } from "../NextButton";
import { PrevButton } from "../PrevButton";
import { ImageViewer } from "../ImageViewer";
import { MobileDetails } from "../MobileDetails";
import { DesktopDetails } from "../DesktopDetails";
import { ViewerPlayer } from "../ViewerPlayer";
import { PDFViewer } from "../PDFViewer";

import type ViewerProps from "./Viewer.props";

export const Viewer = (props: ViewerProps) => {
  const {
    title,
    isPdf,
    isAudio,
    isImage,
    isVideo,
    visible,
    fileUrl,
    toolbar,
    playlist,
    audioIcon,
    errorTitle,
    targetFile,
    headerIcon,
    playlistPos,
    isPreviewFile,
    currentDeviceType,
    onNextClick,
    onPrevClick,
    onMaskClick,
    contextModel,
    onDownloadClick,
    onSetSelectionFile,
    generateContextMenu,
  } = props;

  const timerIDRef = useRef<NodeJS.Timeout>();

  const [isPDFSidebarOpen, setIsPDFSidebarOpen] = useState<boolean>(false);
  const [panelVisible, setPanelVisible] = useState<boolean>(true);
  const [isOpenContextMenu, setIsOpenContextMenu] = useState<boolean>(false);

  const [isError, setIsError] = useState<boolean>(false);

  // const [imageTimer, setImageTimer] = useState<NodeJS.Timeout>();

  const panelVisibleRef = useRef<boolean>(false);
  const panelToolbarRef = useRef<boolean>(false);

  const contextMenuRef = useRef<TContextMenuRef>(null);

  const [isFullscreen, setIsFullScreen] = useState<boolean>(false);

  const devices = useMemo(
    () => ({
      isMobileOnly: currentDeviceType === DeviceType.mobile,
      isMobile:
        currentDeviceType === DeviceType.tablet ||
        currentDeviceType === DeviceType.mobile,
      isDesktop: currentDeviceType === DeviceType.desktop,
    }),
    [currentDeviceType],
  );
  const { isMobile } = devices;

  const resetToolbarVisibleTimer = useCallback(() => {
    if (panelToolbarRef.current) return;

    if (panelVisibleRef.current && panelVisible) {
      clearTimeout(timerIDRef.current);
      timerIDRef.current = setTimeout(() => {
        panelVisibleRef.current = false;
        setPanelVisible(false);
      }, 2500);
    } else {
      setPanelVisible(true);
      clearTimeout(timerIDRef.current);
      panelVisibleRef.current = true;

      timerIDRef.current = setTimeout(() => {
        panelVisibleRef.current = false;
        setPanelVisible(false);
      }, 2500);
    }
  }, [panelVisible]);

  const removeToolbarVisibleTimer = useCallback(() => {
    clearTimeout(timerIDRef.current);
    panelVisibleRef.current = false;
    panelToolbarRef.current = true;
  }, []);

  const removePanelVisibleTimeout = useCallback(() => {
    clearTimeout(timerIDRef.current);
    panelVisibleRef.current = true;
    panelToolbarRef.current = false;
    setPanelVisible(true);
  }, []);

  const restartToolbarVisibleTimer = useCallback(() => {
    panelToolbarRef.current = false;
    resetToolbarVisibleTimer();
  }, [resetToolbarVisibleTimer]);

  const onMobileContextMenu = useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      setIsOpenContextMenu((open) => !open);
      onSetSelectionFile();
      contextMenuRef.current?.show(e);
    },
    [onSetSelectionFile, setIsOpenContextMenu],
  );

  const onHide = useCallback(() => {
    setIsOpenContextMenu(false);
  }, [setIsOpenContextMenu]);

  const handleMaskClick = () => {
    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (includesMethod(document, "webkitExitFullscreen")) {
        document.webkitExitFullscreen();
      } else if (includesMethod(document, "mozCancelFullScreen")) {
        document.mozCancelFullScreen();
      } else if (includesMethod(document, "msExitFullscreen")) {
        document.msExitFullscreen();
      }
    }

    onMaskClick?.();
  };

  useEffect(() => {
    return () => {
      if (timerIDRef.current) clearTimeout(timerIDRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOpenContextMenu) {
      clearTimeout(timerIDRef.current);
    }
  }, [isOpenContextMenu]);

  useEffect(() => {
    resetToolbarVisibleTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isMobile) return;

    document.addEventListener("mousemove", resetToolbarVisibleTimer, {
      passive: true,
    });

    return () => {
      document.removeEventListener("mousemove", resetToolbarVisibleTimer);
      clearTimeout(timerIDRef.current);

      if (isMobile) setPanelVisible(true);
    };
  }, [resetToolbarVisibleTimer, isMobile]);

  const mobileDetails = (
    <MobileDetails
      title={title}
      icon={headerIcon}
      isError={isError}
      ref={contextMenuRef}
      isPreviewFile={isPreviewFile}
      onHide={onHide}
      contextModel={contextModel}
      onMaskClick={handleMaskClick}
      onContextMenu={onMobileContextMenu}
    />
  );

  const isNotFirstElement = playlistPos !== 0;
  const isNotLastElement = playlistPos < playlist.length - 1;

  const playlistFile = playlist[playlistPos];

  const isTiff =
    playlistFile.fileExst === ".tiff" || playlistFile.fileExst === ".tif";

  return (
    <StyledViewerContainer visible={visible}>
      {!isFullscreen && !isMobile && panelVisible && !isPdf && (
        <DesktopDetails title={title} onMaskClick={handleMaskClick} />
      )}

      {playlist.length > 1 && !isFullscreen && !isMobile && (
        <>
          {isNotFirstElement && !isPDFSidebarOpen && (
            <PrevButton prevClick={onPrevClick} />
          )}
          {isNotLastElement && (
            <NextButton isPDFFile={isPdf} nextClick={onNextClick} />
          )}
        </>
      )}

      {isImage ? (
        <Portal
          visible
          element={
            <ImageViewer
              isTiff={isTiff}
              devices={devices}
              toolbar={toolbar}
              errorTitle={errorTitle}
              panelVisible={panelVisible}
              mobileDetails={mobileDetails}
              imageId={playlistFile.fileId}
              version={playlistFile.version}
              isLastImage={!isNotLastElement}
              isFistImage={!isNotFirstElement}
              thumbnailSrc={playlistFile.thumbnailUrl}
              src={fileUrl}
              onMask={onMaskClick}
              onPrev={onPrevClick}
              onNext={onNextClick}
              contextModel={contextModel}
              generateContextMenu={generateContextMenu}
              setIsOpenContextMenu={setIsOpenContextMenu}
              resetToolbarVisibleTimer={resetToolbarVisibleTimer}
            />
          }
        />
      ) : isVideo || isAudio ? (
        <Portal
          visible
          element={
            <ViewerPlayer
              isError={isError}
              src={fileUrl}
              devices={devices}
              isAudio={isAudio}
              isVideo={isVideo}
              audioIcon={audioIcon}
              errorTitle={errorTitle}
              panelVisible={panelVisible}
              isFullScreen={isFullscreen}
              isPreviewFile={isPreviewFile}
              mobileDetails={mobileDetails}
              isLastImage={!isNotLastElement}
              isFistImage={!isNotFirstElement}
              isOpenContextMenu={isOpenContextMenu}
              thumbnailSrc={playlistFile.thumbnailUrl}
              canDownload={!!targetFile?.security.Download}
              onPrev={onPrevClick}
              onNext={onNextClick}
              setIsError={setIsError}
              onMask={handleMaskClick}
              contextModel={contextModel}
              setPanelVisible={setPanelVisible}
              setIsFullScreen={setIsFullScreen}
              onDownloadClick={onDownloadClick}
              generateContextMenu={generateContextMenu}
              removeToolbarVisibleTimer={removeToolbarVisibleTimer}
              removePanelVisibleTimeout={removePanelVisibleTimeout}
              restartToolbarVisibleTimer={restartToolbarVisibleTimer}
              isThirdParty={targetFile?.providerItem}
            />
          }
        />
      ) : (
        isPdf && (
          <Portal
            visible
            element={
              <PDFViewer
                title={title}
                toolbar={toolbar}
                devices={devices}
                src={fileUrl ?? ""}
                mobileDetails={mobileDetails}
                isLastImage={!isNotLastElement}
                isFistImage={!isNotFirstElement}
                isPDFSidebarOpen={isPDFSidebarOpen}
                onNext={onNextClick}
                onPrev={onPrevClick}
                onMask={handleMaskClick}
                generateContextMenu={generateContextMenu}
                setIsOpenContextMenu={setIsOpenContextMenu}
                setIsPDFSidebarOpen={setIsPDFSidebarOpen}
              />
            }
          />
        )
      )}
    </StyledViewerContainer>
  );
};
