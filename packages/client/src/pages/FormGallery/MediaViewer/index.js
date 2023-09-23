import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import queryString from "query-string";
import MediaViewer from "@docspace/common/components/MediaViewer";

const FilesMediaViewer = ({
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

  fromFolderId,

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
  someDialogIsOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const onButtonBackHandler = () => {
    const hash = window.location.hash;
    const id = hash.slice(9);
    if (!id) {
      setMediaViewerData({ visible: false, id: null });
      return;
    }
    setMediaViewerData({ visible: true, id });
  };

  const onChangeUrl = (id) => {
    const url = `/form-gallery/${fromFolderId}/#preview/${id}`;
    setCurrentId(id);
    navigate(url);
  };

  const onDeleteMediaFile = (id) => {};

  const onDownloadMediaFile = (id) => {};

  const onMediaViewerClose = (e) => {
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
    if (!url) return;

    const targetFile = files.find((item) => item.id === currentMediaFileId);
    if (targetFile) setBufferSelection(targetFile);

    navigate(url, { replace: true });
  };

  useEffect(() => {
    const previewId = queryString.parse(location.search).preview;

    if (previewId) {
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.has("preview")) {
        queryParams.delete("preview");
        navigate(_, {
          search: queryParams.toString(),
        });
      }

      if (typeof +previewId !== "object") {
        const item = { visible: true, id: +previewId };
        setMediaViewerData(item);
      }
    }
  }, []);

  useEffect(() => {
    if (visible) setSelection([]);
  }, [visible]);

  useEffect(() => {
    if (previewFile)
      fetchFiles(previewFile.folderId).finally(() => {
        setIsLoading(false);
      });
  }, [previewFile]);

  useEffect(() => {
    window.addEventListener("popstate", onButtonBackHandler);
    return () => window.removeEventListener("popstate", onButtonBackHandler);
  }, [onButtonBackHandler]);

  return (
    visible && (
      <MediaViewer
        t={t}
        userAccess={userAccess}
        someDialogIsOpen={someDialogIsOpen}
        currentFileId={currentMediaFileId}
        visible={visible}
        playlist={playlist}
        playlistPos={currentPostionIndex}
        onDelete={onDeleteMediaFile}
        onDownload={onDownloadMediaFile}
        setBufferSelection={setBufferSelection}
        archiveRoomsId={archiveRoomsId}
        files={files}
        onClickDownload={onClickDownload}
        onShowInfoPanel={onShowInfoPanel}
        onClickDelete={onClickDelete}
        onClickRename={onClickRename}
        onMoveAction={onMoveAction}
        onCopyAction={onCopyAction}
        onDuplicate={onDuplicate}
        onClickLinkEdit={onClickLinkEdit}
        onPreviewClick={onPreviewClick}
        onCopyLink={onCopyLink}
        onClickDownloadAs={onClickDownloadAs}
        onClose={onMediaViewerClose}
        getIcon={getIcon}
        onEmptyPlaylistError={onMediaViewerClose}
        deleteDialogVisible={deleteDialogVisible}
        extsMediaPreviewed={extsMediaPreviewed}
        extsImagePreviewed={extsImagePreviewed}
        isPreviewFile={firstLoad}
        onChangeUrl={onChangeUrl}
        nextMedia={nextMedia}
        prevMedia={prevMedia}
      />
    )
  );
};

export default inject(
  ({
    oformsStore,
    filesStore,
    mediaViewerDataStore,
    filesActionsStore,
    settingsStore,
    dialogsStore,
    treeFoldersStore,
    contextOptionsStore,
    clientLoadingStore,
  }) => {
    const { firstLoad, setIsSectionFilterLoading } = clientLoadingStore;

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
    } = mediaViewerDataStore;

    const { deleteItemAction } = filesActionsStore;
    const { getIcon, extsImagePreviewed, extsMediaPreviewed } = settingsStore;
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

    const { fromFolderId } = oformsStore;

    return {
      fromFolderId,
      files,
      playlist,
      currentPostionIndex,
      nextMedia,
      prevMedia,
      userAccess,
      visible: playlist.length > 0 && visible,
      currentMediaFileId,
      deleteItemAction,
      setMediaViewerData,
      extsImagePreviewed,
      extsMediaPreviewed,
      setRemoveMediaItem: dialogsStore.setRemoveMediaItem,
      deleteDialogVisible: dialogsStore.deleteDialogVisible,
      someDialogIsOpen: dialogsStore.someDialogIsOpen,
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
    };
  }
)(withTranslation(["Files", "Translations"])(observer(FilesMediaViewer)));
