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

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type JSX,
} from "react";

import { isMobile as isMobileUtils, isTablet } from "../../utils";
import { getFileExtension } from "../../utils/common";
import { checkDialogsOpen } from "../../utils/checkDialogsOpen";
import { decodeTiff } from "../../utils/decodeTiff";
import { isNullOrUndefined } from "../../utils/typeGuards";

import { ViewerWrapper } from "./sub-components/ViewerWrapper";

import { mapSupplied, mediaTypes } from "./MediaViewer.constants";
import type { MediaViewerProps } from "./MediaViewer.types";
import { KeyboardEventKeys } from "./MediaViewer.enums";
import { isHeic, isTiff } from "./MediaViewer.utils";

import {
  getDesktopMediaContextModel,
  getMobileMediaContextModel,
  getPDFContextModel,
} from "./MediaViewer.helpers";

const MediaViewer = (props: MediaViewerProps): JSX.Element | undefined => {
  const {
    files,
    visible,
    playlist,
    userAccess,
    playlistPos,
    currentFileId,
    isPreviewFile,
    extsImagePreviewed,
    deleteDialogVisible,
    pluginContextMenuItems,
    currentDeviceType,
    isPublicFile = false,
    autoPlay = false,

    t,
    getIcon,
    onClose,
    onDelete,
    nextMedia,
    prevMedia,
    onDownload,
    onChangeUrl,
    setActiveFiles,
    setBufferSelection,
    onEmptyPlaylistError,

    ...other
  } = props;

  const TiffAbortSignalRef = useRef<AbortController>(undefined);
  const HeicAbortSignalRef = useRef<AbortController>(undefined);

  const isWillUnmountRef = useRef(false);
  const lastRemovedFileIdRefRef = useRef<number>(undefined);

  const [title, setTitle] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string | undefined>(() => {
    const item = playlist.find(
      (file) => file.fileId.toString() === currentFileId.toString(),
    );
    return item?.src;
  });

  const [targetFile, setTargetFile] = useState(() => {
    return files.find((item) => item.id === currentFileId);
  });

  const ext = useMemo(() => getFileExtension(title), [title]);
  const audioIcon = useMemo(() => getIcon(96, ext), [ext, getIcon]);
  const headerIcon = useMemo(() => getIcon(32, ext), [ext, getIcon]);

  let isVideo = false;
  let isAudio = false;
  let canOpen = true;
  let isImage = false;
  let isPdf = false;

  const archiveRoom =
    other.archiveRoomsId === targetFile?.rootFolderId ||
    (!targetFile?.security?.Rename && !targetFile?.security?.Delete);

  const getContextModel = (isError?: boolean) => {
    const {
      onClickDownloadAs,
      onClickLinkEdit,
      onClickDownload,
      onPreviewClick,
      onClickRename,
      onClickDelete,
      onShowInfoPanel,
      onMoveAction,
      onCopyAction,
      onDuplicate,
      onCopyLink,
    } = other;

    const isMobile = isMobileUtils() || isTablet();

    if (!targetFile) return [];

    const desktopModel = getDesktopMediaContextModel(
      t,
      targetFile,
      archiveRoom,
      isPublicFile,
      {
        onClickDownload,
        onClickRename,
        onClickDelete,
      },
    );

    const model = getMobileMediaContextModel(t, targetFile, isPublicFile, {
      onShowInfoPanel,
      onClickDownload,
      onMoveAction,
      onCopyAction,
      onDuplicate,
      onClickRename,
      onClickDelete,
    });

    if (isPdf)
      return getPDFContextModel(t, targetFile, {
        onClickDownloadAs,
        onMoveAction,
        onCopyAction,
        onClickRename,
        onDuplicate,
        onClickDelete,
        onClickDownload,
        onClickLinkEdit,
        onPreviewClick,
        onCopyLink,
      });

    if (pluginContextMenuItems && pluginContextMenuItems.length > 0) {
      model.unshift({
        key: "separator-plugin",
        isSeparator: true,
        disabled: false,
      });

      pluginContextMenuItems.forEach((item) => {
        const onClick = async (): Promise<void> => {
          onClose?.();

          if (item.value.withActiveItem) setActiveFiles?.([targetFile.id]);

          await item.value.onClick(targetFile.id);

          if (item.value.withActiveItem) setActiveFiles?.([]);
        };

        if (
          item.value.fileType &&
          item.value.fileType.includes("image") &&
          !targetFile.viewAccessibility.ImageView
        )
          return;
        if (
          item.value.fileType &&
          item.value.fileType.includes("video") &&
          !targetFile.viewAccessibility.MediaView
        )
          return;

        model.unshift({
          id: item.key,
          key: item.key,
          disabled: false,
          ...item.value,
          onClick,
        });

        desktopModel.unshift({
          key: item.key,
          disabled: false,
          ...item.value,
          onClick: () => {
            onClick();
          },
        });
      });
    }

    return isMobile
      ? model
      : isImage && !isMobile && !isError
        ? desktopModel.filter((el) => el.key !== "download")
        : desktopModel;
  };

  const canImageView = useCallback(
    (extension: string) => extsImagePreviewed.indexOf(extension) !== -1,
    [extsImagePreviewed],
  );

  const canPlay = useCallback(
    (fileTitle: string) => {
      const extensionension =
        fileTitle[0] === "." ? fileTitle : getFileExtension(fileTitle);

      const supply = mapSupplied[extensionension];

      return !!supply && extsImagePreviewed.indexOf(extensionension) !== -1;
    },
    [extsImagePreviewed],
  );

  const onDeleteMediaMedia = useCallback(() => {
    const tempCurrentFileId = playlist.find(
      (file) => file.id === playlistPos,
    )?.fileId;

    if (tempCurrentFileId === lastRemovedFileIdRefRef.current) return;

    const canDelete = targetFile?.security?.Delete;

    if (!canDelete) return;

    if (!isNullOrUndefined(tempCurrentFileId)) {
      onDelete?.(tempCurrentFileId);
      lastRemovedFileIdRefRef.current = tempCurrentFileId;
    }
  }, [onDelete, playlist, playlistPos, targetFile?.security?.Delete]);

  const onDownloadMedia = useCallback(() => {
    if (!targetFile?.security.Download) return;

    const tempCurrentFileId = playlist.find(
      (file) => file.id === playlistPos,
    )?.fileId;

    if (!isNullOrUndefined(tempCurrentFileId)) onDownload?.(tempCurrentFileId);
  }, [onDownload, playlist, playlistPos, targetFile?.security.Download]);

  const onKeydown = useCallback(
    (event: KeyboardEvent) => {
      const { code, ctrlKey } = event;

      const someDialogIsOpen = checkDialogsOpen();
      if (deleteDialogVisible || someDialogIsOpen) return;

      if (code in KeyboardEventKeys) {
        const includesKeyboardCode = [
          KeyboardEventKeys.KeyS,
          KeyboardEventKeys.Numpad1,
          KeyboardEventKeys.Digit1,
          KeyboardEventKeys.Space,
        ].includes(code as KeyboardEventKeys);

        if (!includesKeyboardCode || ctrlKey) event.preventDefault();
      }

      switch (code) {
        case KeyboardEventKeys.ArrowLeft:
          if (document.fullscreenElement) return;

          if (!ctrlKey) prevMedia?.();
          break;

        case KeyboardEventKeys.ArrowRight:
          if (document.fullscreenElement) return;

          if (!ctrlKey) nextMedia?.();

          break;

        case KeyboardEventKeys.Escape:
          event.stopPropagation();
          if (!deleteDialogVisible) onClose?.();
          break;

        case KeyboardEventKeys.KeyS:
          if (ctrlKey) onDownloadMedia();
          break;

        case KeyboardEventKeys.Delete:
          onDeleteMediaMedia();
          break;

        default:
          break;
      }
    },
    [
      deleteDialogVisible,
      nextMedia,
      onClose,
      onDeleteMediaMedia,
      onDownloadMedia,
      prevMedia,
    ],
  );

  const fetchAndSetTiffDataURL = useCallback((src: string) => {
    TiffAbortSignalRef.current?.abort();
    TiffAbortSignalRef.current = new AbortController();

    fetch(src, { signal: TiffAbortSignalRef.current.signal })
      .then((response) => response.arrayBuffer())
      .then(async (response) => {
        const blob = await decodeTiff(response);

        if (blob) {
          setFileUrl(URL.createObjectURL(blob));
        }
      })
      .catch((error: Error) => {
        if (error.name === "AbortError") {
          return;
        }

        console.log(error);
      });
  }, []);

  const fetchAndSetHeicDataURL = useCallback(async (src: string) => {
    HeicAbortSignalRef.current?.abort();
    HeicAbortSignalRef.current = new AbortController();

    try {
      const { default: heic2any } = await import("heic2any");
      const response = await fetch(src, {
        signal: HeicAbortSignalRef.current.signal,
      });
      const blob = await response.blob();
      const conversionResult = await heic2any({ blob });

      if (conversionResult && !Array.isArray(conversionResult)) {
        setFileUrl(URL.createObjectURL(conversionResult));
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error(error);
    }
  }, []);

  const onSetSelectionFile = useCallback(() => {
    setBufferSelection?.(targetFile);
  }, [setBufferSelection, targetFile]);

  useEffect(() => {
    isWillUnmountRef.current = false;
    return () => {
      isWillUnmountRef.current = true;
    };
  });

  const { src, title: currentTitle, fileId } = playlist[playlistPos];

  useEffect(() => {
    if (!isNullOrUndefined(fileId) && currentFileId !== fileId) {
      onChangeUrl?.(fileId);
    }
  }, [fileId, onChangeUrl, currentFileId]);

  useEffect(() => {
    return () => {
      TiffAbortSignalRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const extension = getFileExtension(currentTitle);

    if (!src) {
      onEmptyPlaylistError?.();
      return;
    }

    if (!isTiff(extension) && !isHeic(extension)) {
      TiffAbortSignalRef.current?.abort();
      HeicAbortSignalRef.current?.abort();
      setFileUrl(src);
    }

    if (isHeic(extension)) {
      setFileUrl(undefined);
      fetchAndSetHeicDataURL(src);
    }
    if (isTiff(extension)) {
      setFileUrl(undefined);
      fetchAndSetTiffDataURL(src);
    }

    const foundFile = files.find((file) => file.id === fileId);

    if (!isNullOrUndefined(foundFile)) {
      setTargetFile(foundFile);
      setBufferSelection?.(foundFile);
    }

    setTitle(currentTitle);
  }, [
    src,
    files,
    fileId,
    currentTitle,
    setBufferSelection,
    onEmptyPlaylistError,
    fetchAndSetTiffDataURL,
    fetchAndSetHeicDataURL,
  ]);

  useEffect(() => {
    document.addEventListener("keydown", onKeydown);

    return () => {
      document.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown]);

  if (canPlay(ext) && canImageView(ext)) {
    canOpen = false;
    other.onError?.();
  }

  if (canImageView(ext)) {
    isImage = true;
  } else {
    isImage = false;

    isVideo = mapSupplied[ext]
      ? mapSupplied[ext]?.type === mediaTypes.video
      : false;

    isAudio = mapSupplied[ext]
      ? mapSupplied[ext]?.type === mediaTypes.audio
      : false;

    isPdf = mapSupplied[ext]
      ? mapSupplied[ext]?.type === mediaTypes.pdf
      : false;
  }

  return canOpen ? (
    <ViewerWrapper
      title={title}
      isPdf={isPdf}
      visible={visible}
      isImage={isImage}
      isAudio={isAudio}
      isVideo={isVideo}
      fileUrl={fileUrl}
      playlist={playlist}
      audioIcon={audioIcon}
      headerIcon={headerIcon}
      targetFile={targetFile}
      userAccess={userAccess}
      playlistPos={playlistPos}
      isPublicFile={isPublicFile}
      isPreviewFile={isPreviewFile}
      autoPlay={autoPlay}
      currentDeviceType={currentDeviceType}
      onClose={onClose}
      onPrevClick={prevMedia}
      onNextClick={nextMedia}
      contextModel={getContextModel}
      onDeleteClick={onDeleteMediaMedia}
      onSetSelectionFile={onSetSelectionFile}
      onDownloadClick={onDownloadMedia}
      errorTitle={t("Common:MediaError")}
    />
  ) : undefined;
};

export default MediaViewer;
