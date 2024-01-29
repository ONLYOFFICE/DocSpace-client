import equal from "fast-deep-equal/react";
import { useTheme } from "styled-components";
import React, { useMemo, memo, useCallback } from "react";

import Viewer from "../Viewer";
import { isSeparator } from "../../helpers";
import {
  getCustomToolbar,
  getPDFToolbar,
} from "../../helpers/getCustomToolbar";

import { StyledDropDown, StyledDropDownItem } from "../../MediaViewer.styled";

import type { ContextMenuModel } from "../../types";
import type ViewerWrapperProps from "./ViewerWrapper.props";

function ViewerWrapper(props: ViewerWrapperProps) {
  const {
    isPdf,
    title,
    isAudio,
    isVideo,
    visible,
    fileUrl,
    isImage,
    playlist,
    audioIcon,
    targetFile,
    userAccess,
    errorTitle,
    headerIcon,
    playlistPos,
    isPreviewFile,

    onClose,
    onNextClick,
    onPrevClick,
    contextModel,
    onDeleteClick,
    onDownloadClick,
    onSetSelectionFile,
  } = props;

  const { interfaceDirection } = useTheme();
  const isRtl = interfaceDirection === "rtl";

  const onClickContextItem = useCallback(
    (item: ContextMenuModel) => {
      if (isSeparator(item)) return;

      onSetSelectionFile();
      item.onClick();
    },
    [onSetSelectionFile],
  );

  const generateContextMenu = (
    isOpen: boolean,
    right?: string,
    bottom?: string,
  ) => {
    const model = contextModel();

    return (
      <StyledDropDown
        open={isOpen}
        fixedDirection
        directionY="top"
        withBackdrop={false}
        isDefaultMode={false}
        directionX={isRtl ? "left" : "right"}
        manualY={`${bottom ?? 63}px`}
        manualX={`${right ?? -31}px`}
      >
        {model.map((item) => {
          if (item.disabled) return;
          const isItemSeparator = isSeparator(item);

          return (
            <StyledDropDownItem
              className={`${item.isSeparator ? "is-separator" : ""}`}
              key={item.key}
              label={isItemSeparator ? undefined : item.label}
              icon={!isItemSeparator && item.icon ? item.icon : ""}
              onClick={() => onClickContextItem(item)}
            />
          );
        })}
      </StyledDropDown>
    );
  };

  const toolbar = useMemo(() => {
    const file = targetFile;
    const isEmptyContextMenu =
      contextModel().filter((item) => !item.disabled).length === 0;

    const customToolbar = isPdf
      ? getPDFToolbar()
      : file
        ? getCustomToolbar(
            file,
            isEmptyContextMenu,
            onDeleteClick,
            onDownloadClick,
          )
        : [];

    const canShare = playlist[playlistPos].canShare;
    const toolbars =
      !canShare && userAccess
        ? customToolbar.filter(
            (x) => x.key !== "share" && x.key !== "share-separator",
          )
        : customToolbar.filter((x) => x.key !== "delete");

    return toolbars;
  }, [
    isPdf,
    playlist,
    userAccess,
    targetFile,
    playlistPos,
    contextModel,
    onDeleteClick,
    onDownloadClick,
  ]);

  return (
    <Viewer
      title={title}
      isPdf={isPdf}
      fileUrl={fileUrl}
      isAudio={isAudio}
      isVideo={isVideo}
      visible={visible}
      isImage={isImage}
      toolbar={toolbar}
      playlist={playlist}
      audioIcon={audioIcon}
      errorTitle={errorTitle}
      headerIcon={headerIcon}
      targetFile={targetFile}
      playlistPos={playlistPos}
      isPreviewFile={isPreviewFile}
      onMaskClick={onClose}
      onNextClick={onNextClick}
      onPrevClick={onPrevClick}
      contextModel={contextModel}
      onDownloadClick={onDownloadClick}
      onSetSelectionFile={onSetSelectionFile}
      generateContextMenu={generateContextMenu}
    />
  );
}

export default memo(ViewerWrapper, (prevProps, nextProps) =>
  equal(prevProps, nextProps),
);
