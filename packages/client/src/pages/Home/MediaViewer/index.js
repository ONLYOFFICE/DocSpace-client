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

import React, { useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import queryString from "query-string";

import { PluginFileType } from "SRC_DIR/helpers/plugins/enums";
import { UrlActionType } from "@docspace/shared/enums";

import MediaViewer from "@docspace/shared/components/media-viewer/MediaViewer";

const FilesMediaViewer = (props) => {
  const {
    t,
    files,
    playlist,
    currentPostionIndex,
    visible,
    currentMediaFileId,
    deleteItemAction,
    setMediaViewerData,

    setRemoveMediaItem,
    userAccess,
    deleteDialogVisible,
    previewFile,
    fetchFiles,
    setIsLoading,

    setToPreviewFile,
    setScrollToItem,
    setCurrentId,

    setBufferSelection,

    archiveRoomsId,

    onShowInfoPanel,
    onClickDownload,

    onClickLinkEdit,
    onPreviewClick,
    onCopyLink,
    onClickRename,
    onClickDelete,
    onMoveAction,
    onCopyAction,
    getIcon,
    onDuplicate,
    extsImagePreviewed,
    extsMediaPreviewed,
    setIsPreview,
    isPreview,
    nextMedia,
    prevMedia,
    resetUrl,
    getFirstUrl,
    firstLoad,
    setSelection,
    activeFiles,
    activeFolders,
    onClickDownloadAs,
    setActiveFiles,
    pluginContextMenuItems,
    isOpenMediaViewer,
    someDialogIsOpen,
    currentDeviceType,
    changeUrl,
    fetchPublicRoom,
    isPublicRoom,
    openUrl,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (visible) {
      resetSelection();
    }
  }, [visible]);

  useEffect(() => {
    const previewId = queryString.parse(location.search).preview;

    if (previewId) {
      removeQuery("preview");
      onMediaFileClick(+previewId);
    }
  }, [removeQuery, onMediaFileClick]);

  useEffect(() => {
    if (previewFile) {
      // fetch file after preview with

      if (isPublicRoom) {
        fetchPublicRoom(fetchFiles);
        return;
      }

      fetchFiles(previewFile.folderId).finally(() => {
        setIsLoading(false);
      });
    }
  }, [previewFile]);

  useEffect(() => {
    window.addEventListener("popstate", onButtonBackHandler);

    return () => window.removeEventListener("popstate", onButtonBackHandler);
  }, [onButtonBackHandler]);

  const onButtonBackHandler = () => {
    const hash = window.location.hash;
    const id = hash.slice(9);
    if (!id) {
      setMediaViewerData({ visible: false, id: null });
      return;
    }
    setMediaViewerData({ visible: true, id });
  };

  const onChangeUrl = useCallback(
    (id) => {
      changeUrl(id);
      setCurrentId(id);
    },
    [setCurrentId, changeUrl],
  );

  const resetSelection = () => {
    setSelection([]);
  };

  const removeQuery = (queryName) => {
    const queryParams = new URLSearchParams(location.search);

    if (queryParams.has(queryName)) {
      queryParams.delete(queryName);
      navigate(_, {
        search: queryParams.toString(),
      });
    }
  };

  const onMediaFileClick = (id) => {
    //const itemId = typeof id !== "object" ? id : this.props.selection[0].id; TODO:

    if (typeof id !== "object") {
      const item = { visible: true, id };
      setMediaViewerData(item);
    }
  };

  const onDeleteMediaFile = useCallback(
    (id) => {
      const translations = {
        deleteOperation: t("Translations:DeleteOperation"),
        successRemoveFolder: t("Files:FolderRemoved"),
        successRemoveFile: t("Files:FileRemoved"),
      };

      if (files.length > 0) {
        let file = files.find((file) => file.id === id);
        if (file) {
          // try to fix with one check later (see deleteAction)
          const isActiveFile = activeFiles.find((elem) => elem.id === file.id);
          const isActiveFolder = activeFolders.find(
            (elem) => elem.id === file.id,
          );

          if (isActiveFile || isActiveFolder) return;

          setRemoveMediaItem(file);
          deleteItemAction(file.id, translations, true, file.providerKey);
        }
      }
    },
    [
      files,
      t,
      activeFiles,
      activeFolders,
      setRemoveMediaItem,
      deleteItemAction,
    ],
  );

  const onDownloadMediaFile = useCallback(
    (id) => {
      if (playlist.length > 0) {
        let viewUrlFile = playlist.find((file) => file.fileId === id).src;
        return openUrl(viewUrlFile, UrlActionType.Download);
      }
    },
    [playlist],
  );

  const onMediaViewerClose = useCallback(
    (e) => {
      if (isPreview) {
        setIsPreview(false);
        resetUrl();
        if (previewFile) {
          setScrollToItem({ id: previewFile.id, type: "file" });
          setBufferSelection(previewFile);
        }
        setToPreviewFile(null);
      }

      setMediaViewerData({ visible: false, id: null });
      const url = getFirstUrl();

      if (!url) {
        return;
      }

      const targetFile = files.find((item) => item.id === currentMediaFileId);
      if (targetFile) {
        setBufferSelection(targetFile);
        setScrollToItem({ id: targetFile.id, type: "file" });
      }

      navigate(url, {
        state: {
          ...location.state,
          fromMediaViewer: true,
        },
      });
    },
    [
      files,
      isPreview,
      previewFile,

      resetUrl,
      navigate,
      getFirstUrl,
      setIsPreview,
      setScrollToItem,
      setToPreviewFile,
      setMediaViewerData,
      setBufferSelection,
    ],
  );
  useEffect(() => {
    if (playlist.length === 0 && isOpenMediaViewer) onMediaViewerClose();
  }, [isOpenMediaViewer, onMediaViewerClose, playlist.length]);

  return (
    visible && (
      <MediaViewer
        t={t}
        files={files}
        getIcon={getIcon}
        visible={visible}
        playlist={playlist}
        prevMedia={prevMedia}
        nextMedia={nextMedia}
        onCopyLink={onCopyLink}
        userAccess={userAccess}
        onChangeUrl={onChangeUrl}
        isPreviewFile={firstLoad}
        onDuplicate={onDuplicate}
        onMoveAction={onMoveAction}
        onCopyAction={onCopyAction}
        onClose={onMediaViewerClose}
        onDelete={onDeleteMediaFile}
        onClickRename={onClickRename}
        onClickDelete={onClickDelete}
        setActiveFiles={setActiveFiles}
        archiveRoomsId={archiveRoomsId}
        onPreviewClick={onPreviewClick}
        onDownload={onDownloadMediaFile}
        onClickLinkEdit={onClickLinkEdit}
        onClickDownload={onClickDownload}
        onShowInfoPanel={onShowInfoPanel}
        playlistPos={currentPostionIndex}
        currentFileId={currentMediaFileId}
        onClickDownloadAs={onClickDownloadAs}
        currentDeviceType={currentDeviceType}
        extsImagePreviewed={extsImagePreviewed}
        setBufferSelection={setBufferSelection}
        onEmptyPlaylistError={onMediaViewerClose}
        deleteDialogVisible={deleteDialogVisible}
        pluginContextMenuItems={pluginContextMenuItems}
      />
    )
  );
};

export default inject(
  ({
    filesStore,
    mediaViewerDataStore,
    filesActionsStore,
    filesSettingsStore,
    dialogsStore,
    treeFoldersStore,
    contextOptionsStore,
    clientLoadingStore,
    pluginStore,
    settingsStore,
    publicRoomStore,
  }) => {
    const { currentDeviceType, openUrl } = settingsStore;
    const {
      firstLoad,

      setIsSectionFilterLoading,
    } = clientLoadingStore;

    const { fetchPublicRoom, isPublicRoom } = publicRoomStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    const {
      files,
      userAccess,
      fetchFiles,

      setScrollToItem,
      setBufferSelection,
      setIsPreview,
      isPreview,
      resetUrl,
      setSelection,
      setAlreadyFetchingRooms,
      activeFiles,
      activeFolders,

      setActiveFiles,
    } = filesStore;
    const {
      visible,
      id: currentMediaFileId,
      currentPostionIndex,
      setMediaViewerData,
      getFirstUrl,
      playlist,
      previewFile,
      setToPreviewFile,
      setCurrentId,
      nextMedia,
      prevMedia,
      changeUrl,
    } = mediaViewerDataStore;
    const { deleteItemAction } = filesActionsStore;
    const { getIcon, extsImagePreviewed, extsMediaPreviewed } =
      filesSettingsStore;
    const { isFavoritesFolder, archiveRoomsId } = treeFoldersStore;

    const {
      onClickFavorite,
      onShowInfoPanel,
      onClickDownloadAs,
      onClickDownload,
      onClickRename,
      onClickDelete,
      onMoveAction,
      onCopyAction,
      onDuplicate,
      onClickLinkEdit,
      onPreviewClick,
      onCopyLink,
    } = contextOptionsStore;

    const { contextMenuItemsList, getContextMenuKeysByType } = pluginStore;

    const item = playlist.find((p) => p.fileId === currentMediaFileId);

    const fileExst = item?.fileExst;

    const pluginContextMenuKeys = [
      ...(getContextMenuKeysByType() || []),
      ...(getContextMenuKeysByType(PluginFileType.Image, fileExst) || []),
      ...(getContextMenuKeysByType(PluginFileType.Video, fileExst) || []),
    ];

    const pluginContextMenuItems =
      contextMenuItemsList?.filter((i) => {
        if (pluginContextMenuKeys.includes(i.key)) {
          return true;
        }

        return false;
      }) || [];

    return {
      files,
      playlist,
      currentPostionIndex,
      nextMedia,
      prevMedia,
      userAccess,
      isOpenMediaViewer: visible,
      visible: playlist.length > 0 && visible,
      currentMediaFileId,
      deleteItemAction,
      setMediaViewerData,
      extsImagePreviewed,
      extsMediaPreviewed,
      setRemoveMediaItem: dialogsStore.setRemoveMediaItem,
      deleteDialogVisible: dialogsStore.deleteDialogVisible,
      fetchFiles,
      previewFile,
      setIsLoading,
      firstLoad,

      setToPreviewFile,
      setIsPreview,
      resetUrl,
      isPreview,
      setScrollToItem,
      setCurrentId,
      setBufferSelection,
      setAlreadyFetchingRooms,
      isFavoritesFolder,
      onClickFavorite,
      onClickDownloadAs,
      onClickDelete,
      onClickDownload,
      onShowInfoPanel,
      onClickLinkEdit,
      onPreviewClick,
      onCopyLink,
      onClickRename,
      onMoveAction,
      getIcon,
      onCopyAction,
      onDuplicate,
      archiveRoomsId,
      setSelection,
      getFirstUrl,
      activeFiles,
      activeFolders,
      setActiveFiles,
      pluginContextMenuItems,
      currentDeviceType,
      changeUrl,
      fetchPublicRoom,
      isPublicRoom,
      openUrl,
    };
  },
)(withTranslation(["Files", "Translations"])(observer(FilesMediaViewer)));
