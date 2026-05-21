/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { makeAutoObservable, runInAction } from "mobx";

import {
  MEDIA_VIEW_URL,
  PUBLIC_MEDIA_VIEW_URL,
  thumbnailStatuses,
} from "@docspace/shared/constants";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { isNullOrUndefined } from "@docspace/shared/utils/typeGuards";
import FilesFilter from "@docspace/shared/api/files/filter";
import { toastr } from "@docspace/ui-kit/components/toast";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";

import {
  findNearestIndex,
  isVideo,
} from "@docspace/shared/components/media-viewer/MediaViewer.utils";

class MediaViewerDataStore {
  filesStore;

  publicRoomStore;

  filesActionsStore;

  pluginStore;

  autoPlay = true;

  id = null;

  visible = false;

  previewFile = null;

  currentItem = null;

  prevPostionIndex = 0;

  constructor(filesStore, publicRoomStore, filesActionsStore, pluginStore) {
    makeAutoObservable(this);
    this.filesStore = filesStore;
    this.publicRoomStore = publicRoomStore;
    this.filesActionsStore = filesActionsStore;
    this.pluginStore = pluginStore;
  }

  setMediaViewerVisible = (value) => {
    this.visible = value;
  };

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
    if (this.isPluginViewerActive) return;

    const url = this.getUrl(id);
    window.history.pushState("", "", url);
  };

  nextMedia = async () => {
    const { setBufferSelection, files } = this.filesStore;

    const postionIndex = (this.currentPostionIndex + 1) % this.playlist.length;

    if (postionIndex === 0) {
      return;
    }

    // Call plugin navigation callback if plugin viewer is active
    if (this.isPluginViewerActive) {
      const { pluginMediaViewerProps, dispatchMessage } = this.pluginStore;

      if (pluginMediaViewerProps?.navigation?.onNext) {
        const pluginName = pluginMediaViewerProps.pluginName;
        const message = await pluginMediaViewerProps.navigation.onNext();
        dispatchMessage({ message, pluginName });
      }
    }

    this.setAutoPlay(false);

    const currentFileId = this.playlist[postionIndex].fileId;

    const targetFile = files.find((item) => item.id === currentFileId);

    if (!isNullOrUndefined(targetFile)) setBufferSelection(targetFile);

    const fileId = this.playlist[postionIndex].fileId;

    // Call plugin file change callback if plugin viewer is active
    if (this.isPluginViewerActive) {
      const { pluginMediaViewerProps, dispatchMessage } = this.pluginStore;

      if (pluginMediaViewerProps?.navigation?.onFileChange) {
        const pluginName = pluginMediaViewerProps.pluginName;
        const message = await pluginMediaViewerProps.navigation.onFileChange({
          fileId,
        });

        dispatchMessage({ message, pluginName });
      }
    }

    this.setCurrentId(fileId);
    this.changeUrl(fileId);
  };

  prevMedia = async () => {
    const { setBufferSelection, files } = this.filesStore;

    const currentPlaylistPos = this.currentPostionIndex - 1;

    if (currentPlaylistPos === -1) {
      return;
    }

    // Call plugin navigation callback if plugin viewer is active
    if (this.isPluginViewerActive) {
      const { pluginMediaViewerProps, dispatchMessage } = this.pluginStore;

      if (pluginMediaViewerProps?.navigation?.onPrevious) {
        const pluginName = pluginMediaViewerProps.pluginName;
        const message = await pluginMediaViewerProps.navigation.onPrevious();

        dispatchMessage({ message, pluginName });
      }
    }

    this.setAutoPlay(false);

    const currentFileId = this.playlist[currentPlaylistPos].fileId;

    const targetFile = files.find((item) => item.id === currentFileId);

    if (!isNullOrUndefined(targetFile)) setBufferSelection(targetFile);

    const fileId = this.playlist[currentPlaylistPos].fileId;

    // Call plugin file change callback if plugin viewer is active
    if (this.isPluginViewerActive) {
      const { pluginMediaViewerProps, dispatchMessage } = this.pluginStore;

      if (pluginMediaViewerProps?.navigation?.onFileChange) {
        const pluginName = pluginMediaViewerProps.pluginName;
        const message = await pluginMediaViewerProps.navigation.onFileChange({
          fileId,
        });

        dispatchMessage({ message, pluginName });
      }
    }

    this.setCurrentId(fileId);
    this.changeUrl(fileId);
  };

  get isViewerOpen() {
    return this.visible && this.playlist.length > 0;
  }

  get isPluginViewerActive() {
    return (
      this.pluginStore?.pluginMediaViewerVisible &&
      !!this.pluginStore?.pluginMediaViewerProps
    );
  }

  filterFilesByPluginCriteria = (files) => {
    if (!this.isPluginViewerActive) return files;

    const { pluginMediaViewerProps, getCurrentDevice, getUserRole } =
      this.pluginStore;

    const playlistFilter = pluginMediaViewerProps?.playlistFilter;

    if (!playlistFilter) return files;

    const { filesExsts, filesSecurity, usersTypes, devices } = playlistFilter;

    return files.filter((file) => {
      // Check extension filter
      if (filesExsts && filesExsts.length > 0) {
        const normalizedAllowed = filesExsts.map((ext) =>
          ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`,
        );

        if (!normalizedAllowed.includes(file.fileExst.toLowerCase())) {
          return false;
        }
      }

      // Check security filter
      if (filesSecurity && filesSecurity.length > 0 && file.security) {
        if (!filesSecurity.every((key) => file.security[key])) return false;
      }

      // Check device type
      if (devices && devices.length > 0) {
        const currentDevice = getCurrentDevice();
        if (!devices.includes(currentDevice)) {
          return false;
        }
      }

      // Check user type
      if (usersTypes && usersTypes.length > 0) {
        const currentUserType = getUserRole();
        if (!usersTypes.includes(currentUserType)) {
          return false;
        }
      }

      return true;
    });
  };

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

    // Apply plugin filter if plugin viewer is active
    if (this.isPluginViewerActive) {
      const pluginPlaylist = this.filterFilesByPluginCriteria(filesList);

      return pluginPlaylist.map((file, index) => {
        return {
          id: index,
          fileId: file.id,
          src: file.viewUrl,
          title: file.title,
          fileExst: file.fileExst,
          fileStatus: file.fileStatus,
          canShare: file.canShare,
          version: file.version,
        };
      });
    }

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
          (file.viewAccessibility?.ImageView ||
            file.viewAccessibility?.MediaView ||
            (file.fileExst === ".pdf" && window.ClientConfig?.pdfViewer)) &&
          !file.isLinkExpired;

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
            thumbnailUrl:
              !file.providerItem && file.thumbnailUrl ? file.thumbnailUrl : "",
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
        thumbnailUrl:
          !this.previewFile.providerItem && this.previewFile.thumbnailUrl
            ? this.previewFile.thumbnailUrl
            : "",
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

