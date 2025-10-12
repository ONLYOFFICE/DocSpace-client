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

import { makeAutoObservable, runInAction } from "mobx";

import {
  MEDIA_VIEW_URL,
  PUBLIC_MEDIA_VIEW_URL,
  thumbnailStatuses,
} from "@docspace/shared/constants";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { isNullOrUndefined } from "@docspace/shared/utils/typeGuards";
import FilesFilter from "@docspace/shared/api/files/filter";
import { toastr } from "@docspace/shared/components/toast";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";

import {
  findNearestIndex,
  isVideo,
} from "@docspace/shared/components/media-viewer/MediaViewer.utils";

class MediaViewerDataStore {
  filesStore;

  publicRoomStore;

  filesActionsStore;

  autoPlay = true;

  id = null;

  visible = false;

  previewFile = null;

  currentItem = null;

  prevPostionIndex = 0;

  constructor(filesStore, publicRoomStore, filesActionsStore) {
    makeAutoObservable(this);
    this.filesStore = filesStore;
    this.publicRoomStore = publicRoomStore;
    this.filesActionsStore = filesActionsStore;
  }

  setAutoPlay = (value) => {
    this.autoPlay = value;
  };

  setMediaViewerData = (mediaData) => {
    this.id = mediaData.id;
    this.visible = mediaData.visible;
    this.setAutoPlay(true);

    if (!mediaData.visible) this.setCurrentItem(null);
  };

  fetchPreviewMediaFile = (id, fetchDefaultFiles) => {
    const isMediaViewer = window.location.pathname.includes(
      PUBLIC_MEDIA_VIEW_URL,
    );
    const isEmptyPlaylist = this.playlist.length === 0;

    if (isEmptyPlaylist && isMediaViewer && !this.visible) {
      this.filesStore
        .getFileInfo(id)
        .then((data) => {
          const canOpenPlayer =
            data.viewAccessibility.ImageView ||
            data.viewAccessibility.MediaView;
          const file = { ...data, canOpenPlayer };
          this.setToPreviewFile(file, true);
          this.filesStore.setIsPreview(true);
        })
        .catch((err) => {
          toastr.error(err);
          fetchDefaultFiles();
        });
      return true;
    }

    return false;
  };

  setToPreviewFile = (file, visible) => {
    if (file === null) {
      this.previewFile = null;
      this.id = null;
      this.visible = false;
      return;
    }

    if (
      !file.canOpenPlayer &&
      !file.fileExst === ".pdf" &&
      window.ClientConfig?.pdfViewer
    )
      return;

    this.setAutoPlay(false);
    this.previewFile = file;
    this.id = file.id;
    this.visible = visible;
  };

  setCurrentItem = (item) => {
    this.currentItem = item;
  };

  setCurrentId = (id) => {
    this.id = id;
  };

  getUrl = (id) => {
    if (this.publicRoomStore.isPublicRoom) {
      const key = this.publicRoomStore.publicRoomKey;
      const filterObj = FilesFilter.getFilter(window.location);

      if (!filterObj.key) {
        filterObj.key = key;
      }

      return `${combineUrl("/rooms/share", MEDIA_VIEW_URL, id)}?${filterObj.toUrlParams()}`;
    }

    return combineUrl(MEDIA_VIEW_URL, id);
  };

  getFirstUrl = () => {
    if (this.publicRoomStore.isPublicRoom) {
      const key = this.publicRoomStore.publicRoomKey;
      const filterObj = FilesFilter.getFilter(window.location);

      if (!filterObj.key) {
        filterObj.key = key;
      }

      const url = `${combineUrl("/rooms/share")}?${filterObj.toUrlParams()}`;

      return url;
    }

    const filter = this.filesStore.filter;

    const queryParams = filter.toUrlParams();

    const url = getCategoryUrl(this.filesStore.categoryType, filter.folder);

    const pathname = `${url}?${queryParams}`;

    return pathname;
  };

  changeUrl = (id) => {
    const url = this.getUrl(id);
    window.history.pushState("", "", url);
  };

  nextMedia = () => {
    const { setBufferSelection, files } = this.filesStore;

    const postionIndex = (this.currentPostionIndex + 1) % this.playlist.length;

    if (postionIndex === 0) {
      return;
    }

    this.setAutoPlay(false);

    const currentFileId = this.playlist[postionIndex].fileId;

    const targetFile = files.find((item) => item.id === currentFileId);

    if (!isNullOrUndefined(targetFile)) setBufferSelection(targetFile);

    const fileId = this.playlist[postionIndex].fileId;
    this.setCurrentId(fileId);
    this.changeUrl(fileId);
  };

  prevMedia = () => {
    const { setBufferSelection, files } = this.filesStore;

    const currentPlaylistPos = this.currentPostionIndex - 1;

    if (currentPlaylistPos === -1) {
      return;
    }

    this.setAutoPlay(false);

    const currentFileId = this.playlist[currentPlaylistPos].fileId;

    const targetFile = files.find((item) => item.id === currentFileId);

    if (!isNullOrUndefined(targetFile)) setBufferSelection(targetFile);

    const fileId = this.playlist[currentPlaylistPos].fileId;
    this.setCurrentId(fileId);
    this.changeUrl(fileId);
  };

  get isViewerOpen() {
    return this.visible && this.playlist.length > 0;
  }

  get currentPostionIndex() {
    if (this.playlist.length === 0) {
      return 0;
    }

    let index = this.playlist.find((file) => file.fileId === this.id)?.id;

    if (isNullOrUndefined(index)) {
      index = findNearestIndex(this.playlist, this.prevPostionIndex);
    }

    runInAction(() => {
      this.prevPostionIndex = index;
    });

    return index;
  }

  get playlist() {
    const { files } = this.filesStore;

    const filesList = [...files];
    const playlist = [];
    const itemsWithoutThumb = [];
    let id = 0;

    if (this.currentItem) {
      playlist.push({
        id,
        fileId: this.currentItem.fileId,
        src: this.currentItem.fileInfo.viewUrl,
        title: this.currentItem.fileInfo.title,
        fileExst: this.currentItem.fileInfo.fileExst,
        fileStatus: this.currentItem.fileInfo.fileStatus,
        canShare: this.currentItem.fileInfo.canShare,
      });

      return playlist;
    }

    if (filesList.length > 0) {
      filesList.forEach((file) => {
        const canOpenPlayer =
          file.viewAccessibility?.ImageView ||
          file.viewAccessibility?.MediaView ||
          (file.fileExst === ".pdf" && window.ClientConfig?.pdfViewer);

        if (canOpenPlayer) {
          playlist.push({
            id,
            fileId: file.id,
            src: file.viewUrl,
            title: file.title,
            fileExst: file.fileExst,
            fileStatus: file.fileStatus,
            canShare: file.canShare,
            version: file.version,
            thumbnailUrl: file.thumbnailUrl,
          });

          const thumbnailIsNotCreated =
            file.thumbnailStatus === thumbnailStatuses.WAITING;

          const isVideoOrImage =
            file.viewAccessibility?.ImageView || isVideo(file.fileExst);

          if (thumbnailIsNotCreated && isVideoOrImage)
            itemsWithoutThumb.push(file);

          id++;
        }
      });
      if (this.previewFile) {
        runInAction(() => {
          this.previewFile = null;
        });
      }
    } else if (this.previewFile) {
      playlist.push({
        ...this.previewFile,
        id,
        fileId: this.previewFile.id,
        src: this.previewFile.viewUrl,
        version: this.previewFile.version,
        thumbnailUrl: this.previewFile.thumbnailUrl,
      });

      if (this.previewFile.viewAccessibility.ImageView) {
        itemsWithoutThumb.push(this.previewFile);
      }
    }

    if (itemsWithoutThumb.length > 0) {
      this.filesStore.createThumbnails(itemsWithoutThumb);
    }

    return playlist;
  }
}

export default MediaViewerDataStore;
