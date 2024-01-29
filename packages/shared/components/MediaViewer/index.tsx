import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";

import { isMobile as isMobileUtils, isTablet } from "@docspace/shared/utils";
import { getFileExtension } from "@docspace/shared/utils/common";
import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";

import {
  isNullOrUndefined,
  KeyboardEventKeys,
  mapSupplied,
  mediaTypes,
} from "./helpers";
import {
  getDesktopMediaContextModel,
  getMobileMediaContextModel,
  getPDFContextModel,
} from "./helpers/contextModel";
import ViewerWrapper from "./sub-components/ViewerWrapper";

import type { MediaViewerProps } from "./MediaViewer.props";

function MediaViewer(props: MediaViewerProps): JSX.Element | undefined {
  const {
    files,
    visible,
    playlist,
    userAccess,
    playlistPos,
    currentFileId,
    isPreviewFile,
    setBufferSelection,
    extsImagePreviewed,
    deleteDialogVisible,
    pluginContextMenuItems,

    t,
    getIcon,
    onClose,
    onDelete,
    nextMedia,
    prevMedia,
    onDownload,
    onChangeUrl,
    setActiveFiles,
    onEmptyPlaylistError,

    ...other
  } = props;

  const TiffXMLHttpRequestRef = useRef<XMLHttpRequest>();
  const isWillUnmountRef = useRef(false);
  const lastRemovedFileIdRefRef = useRef<number>();

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
  const headerIcon = useMemo(() => getIcon(24, ext), [ext, getIcon]);

  let isVideo = false;
  let isAudio = false;
  let canOpen = true;
  let isImage = false;
  let isPdf = false;

  const archiveRoom =
    other.archiveRoomsId === targetFile?.rootFolderId ||
    (!targetFile?.security?.Rename && !targetFile?.security?.Delete);

  const getContextModel = () => {
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

    if (!targetFile) return [];

    const desktopModel = getDesktopMediaContextModel(
      t,
      targetFile,
      archiveRoom,
      {
        onClickDownload,
        onClickRename,
        onClickDelete,
      },
    );

    const model = getMobileMediaContextModel(t, targetFile, {
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
          onClose();

          if (item.value.withActiveItem) setActiveFiles([targetFile.id]);

          await item.value.onClick(targetFile.id);

          if (item.value.withActiveItem) setActiveFiles([]);
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
          onClick,
        });
      });
    }

    const isMobile = isMobileUtils() || isTablet();

    return isMobile
      ? model
      : isImage && !isMobile
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
      onDelete(tempCurrentFileId);
      lastRemovedFileIdRefRef.current = tempCurrentFileId;
    }
  }, [onDelete, playlist, playlistPos, targetFile?.security?.Delete]);

  const onDownloadMedia = useCallback(() => {
    if (!targetFile?.security.Download) return;

    const tempCurrentFileId = playlist.find(
      (file) => file.id === playlistPos,
    )?.fileId;

    if (!isNullOrUndefined(tempCurrentFileId)) onDownload(tempCurrentFileId);
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

          if (!ctrlKey) prevMedia();
          break;

        case KeyboardEventKeys.ArrowRight:
          if (document.fullscreenElement) return;

          if (!ctrlKey) nextMedia();

          break;

        case KeyboardEventKeys.Escape:
          if (!deleteDialogVisible) onClose();
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
    if (!window.Tiff) return;

    TiffXMLHttpRequestRef.current?.abort();

    const xhr = new XMLHttpRequest();
    TiffXMLHttpRequestRef.current = xhr;
    xhr.responseType = "arraybuffer";

    xhr.open("GET", src);
    xhr.onload = () => {
      try {
        const tiff = new window.Tiff({ buffer: xhr.response });

        const dataUrl = tiff.toDataURL();

        setFileUrl(dataUrl);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }
    };
    xhr.send();
  }, []);

  const onSetSelectionFile = useCallback(() => {
    setBufferSelection(targetFile);
  }, [setBufferSelection, targetFile]);

  useEffect(() => {
    isWillUnmountRef.current = false;
    return () => {
      isWillUnmountRef.current = true;
    };
  });

  useEffect(() => {
    const fileId = playlist[playlistPos]?.fileId;

    if (!isNullOrUndefined(fileId) && currentFileId !== fileId) {
      onChangeUrl(fileId);
    }
  }, [playlistPos, onChangeUrl, playlist, currentFileId]);

  useEffect(() => {
    return () => {
      if (isWillUnmountRef.current) onClose();
    };
  }, [onClose]);

  useEffect(() => {
    const currentFile = playlist[playlistPos];

    const tempCurrentFileId =
      playlist.length > 0
        ? playlist.find((file) => file.id === playlistPos)?.fileId
        : 0;

    const tempTargetFile = files.find((item) => item.id === tempCurrentFileId);

    if (tempTargetFile) setBufferSelection(tempTargetFile);

    const { src, title: CurrentFileTitle } = currentFile;

    const extension = getFileExtension(CurrentFileTitle);

    if (extension === ".tiff" || extension === ".tif") {
      fetchAndSetTiffDataURL(src);
    }
  }, [
    files,
    playlist,
    playlistPos,
    setBufferSelection,
    fetchAndSetTiffDataURL,
  ]);

  useEffect(() => {
    const { src, title: currentTitle, fileId } = playlist[playlistPos];
    const extension = getFileExtension(currentTitle);

    if (!src) return onEmptyPlaylistError();

    if (extension !== ".tif" && extension !== ".tiff") {
      TiffXMLHttpRequestRef.current?.abort();
      setFileUrl(src);
    }

    if (extension === ".tiff" || extension === ".tif") {
      setFileUrl(undefined);
      fetchAndSetTiffDataURL(src);
    }

    const foundFile = files.find((file) => file.id === fileId);

    if (!isNullOrUndefined(foundFile)) {
      setTargetFile(foundFile);
      setBufferSelection(foundFile);
    }

    setTitle(currentTitle);
  }, [
    files,
    playlist,
    playlistPos,
    setBufferSelection,
    onEmptyPlaylistError,
    fetchAndSetTiffDataURL,
  ]);

  useEffect(() => {
    document.addEventListener("keydown", onKeydown);

    return () => {
      document.removeEventListener("keydown", onKeydown);
      TiffXMLHttpRequestRef.current?.abort();
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
      isPreviewFile={isPreviewFile}
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
}

export default MediaViewer;
