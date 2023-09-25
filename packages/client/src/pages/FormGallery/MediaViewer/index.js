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

  setMediaViewerData,

  userAccess,
  setCurrentId,

  oformFromFolderId,

  onCreateOform,
  onSuggestOformChanges,

  setBufferSelection,

  archiveRoomsId,
  getIcon,
  extsImagePreviewed,
  extsMediaPreviewed,
  isPreview,
  nextMedia,
  prevMedia,
  resetUrl,
  getFirstUrl,
  firstLoad,
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
    const url = `/form-gallery/${oformFromFolderId}/#preview/${id}`;
    setCurrentId(id);
    navigate(url);
  };

  const onDeleteMediaFile = (id) => {};

  const onDownloadMediaFile = (id) => {};

  const onMediaViewerClose = (e) => {
    if (isPreview) {
      resetUrl();
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
    window.addEventListener("popstate", onButtonBackHandler);
    return () => window.removeEventListener("popstate", onButtonBackHandler);
  }, [onButtonBackHandler]);

  return (
    visible && (
      <MediaViewer
        t={t}
        isFormGalleryViewer
        userAccess={userAccess}
        currentFileId={currentMediaFileId}
        visible={visible}
        playlist={playlist}
        playlistPos={currentPostionIndex}
        onDelete={onDeleteMediaFile}
        onDownload={onDownloadMediaFile}
        setBufferSelection={() => {}}
        archiveRoomsId={archiveRoomsId}
        files={files}
        onClickCreateOform={onCreateOform}
        onClickSuggestOformChanges={onSuggestOformChanges}
        onClickDownload={() => {}}
        onShowInfoPanel={() => {}}
        onClickDelete={() => {}}
        onClickRename={() => {}}
        onMoveAction={() => {}}
        onCopyAction={() => {}}
        onDuplicate={() => {}}
        onClickLinkEdit={() => {}}
        onPreviewClick={() => {}}
        onCopyLink={() => {}}
        onClickDownloadAs={() => {}}
        onClose={onMediaViewerClose}
        getIcon={getIcon}
        onEmptyPlaylistError={onMediaViewerClose}
        deleteDialogVisible={false}
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
    mediaFormViewerDataStore,
    settingsStore,
    dialogsStore,
    treeFoldersStore,
    clientLoadingStore,
    contextOptionsStore,
  }) => {
    const { firstLoad, setIsSectionFilterLoading } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    const {
      //   files,
      userAccess,
      setScrollToItem,
      setBufferSelection,
      isPreview,
      resetUrl,
      setAlreadyFetchingRooms,
    } = filesStore;

    const {
      visible,
      id: currentMediaFileId,
      currentPostionIndex,
      setMediaViewerData,
      getFirstUrl,
      playlist,
      setCurrentId,
      nextMedia,
      prevMedia,
    } = mediaFormViewerDataStore;

    const { onCreateOform, onSuggestOformChanges } = contextOptionsStore;

    const { getIcon, extsImagePreviewed, extsMediaPreviewed } = settingsStore;
    const { isFavoritesFolder, archiveRoomsId } = treeFoldersStore;

    const { oformFromFolderId } = oformsStore;

    const oformFiles = oformsStore.oformFiles;
    const files = !oformFiles
      ? []
      : oformFiles.map((oform) => ({
          id: oform.id,
          title: oform.attributes.name_form,
          security: {
            Read: true,
            Comment: false,
            FillForms: false,
            Review: false,
            Edit: false,
            Delete: false,
            CustomFilter: false,
            Rename: false,
            ReadHistory: false,
            Lock: false,
            EditHistory: false,
            Copy: false,
            Move: false,
            Duplicate: false,
            SubmitToFormGallery: false,
            Download: false,
            Convert: false,
          },
          viewAccessability: {
            ImageView: true,
            MediaView: false,
            WebView: false,
            WebEdit: false,
            WebReview: false,
            WebCustomFilterEditing: false,
            WebRestrictedEditing: false,
            WebComment: false,
            CoAuhtoring: false,
            Convert: false,
          },
        }));

    return {
      oformFromFolderId,
      files,
      playlist,
      currentPostionIndex,
      nextMedia,
      prevMedia,
      userAccess,
      visible: playlist.length > 0 && visible,
      currentMediaFileId,
      setMediaViewerData,
      extsImagePreviewed,
      extsMediaPreviewed,
      someDialogIsOpen: dialogsStore.someDialogIsOpen,
      setIsLoading,
      firstLoad,
      onCreateOform,
      onSuggestOformChanges,
      resetUrl,
      isPreview,
      setScrollToItem,
      setCurrentId,
      setBufferSelection,
      setAlreadyFetchingRooms,
      isFavoritesFolder,
      getIcon,
      archiveRoomsId,
      getFirstUrl,
    };
  }
)(withTranslation(["Files", "Translations"])(observer(FilesMediaViewer)));
