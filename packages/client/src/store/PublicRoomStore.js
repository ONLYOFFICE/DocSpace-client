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

import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { isPublicRoom as isPublicRoomUtil } from "@docspace/shared/utils/common";

import { LinkType } from "SRC_DIR/helpers/constants";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";

import { ValidationStatus } from "@docspace/shared/enums";
import {
  PUBLIC_STORAGE_KEY,
  CategoryType,
  TOAST_FOLDER_PUBLIC_KEY,
} from "@docspace/shared/constants";

class PublicRoomStore {
  externalLinks = [];

  roomTitle = null;

  roomId = null;

  roomStatus = null;

  roomType = null;

  publicRoomKey = null;

  isLoaded = false;

  isLoading = false;

  windowIsOpen = false;

  clientLoadingStore;

  filesStore;

  /**
   * @type {import("@docspace/shared/api/rooms/types").TValidateShareRoom | null}
   */
  validationData = null;

  constructor(clientLoadingStore, filesStore) {
    this.clientLoadingStore = clientLoadingStore;
    this.filesStore = filesStore;
    makeAutoObservable(this);
  }

  setIsSectionLoading = (param) => {
    this.clientLoadingStore?.setIsSectionFilterLoading(param);
    this.clientLoadingStore?.setIsSectionBodyLoading(param);
  };

  setIsLoading = (isLoading) => {
    this.isLoading = isLoading;
  };

  setRoomData = (data) => {
    const { id, roomType, status, title } = data;

    this.roomTitle = title;
    this.roomId = id;
    this.roomStatus = status;
    this.roomType = roomType;
    this.validationData = data;

    if (status === ValidationStatus.Ok) this.isLoaded = true;
  };

  fetchPublicRoom = (fetchFiles) => {
    const filterObj = FilesFilter.getFilter(window.location);

    if (!filterObj) return;

    if (filterObj.folder === "@my") {
      filterObj.folder = this.roomId;
    }

    this.setIsSectionLoading(true);

    let dataObj = { filter: filterObj };

    if (filterObj && filterObj.authorType) {
      const authorType = filterObj.authorType;
      const indexOfUnderscore = authorType.indexOf("_");
      const type = authorType.slice(0, indexOfUnderscore);
      const itemId = authorType.slice(indexOfUnderscore + 1);

      if (itemId) {
        dataObj = {
          type,
          itemId,
          filter: filterObj,
        };
      } else {
        filterObj.authorType = null;
        dataObj = { filter: filterObj };
      }
    }

    if (!dataObj) return;

    const { filter } = dataObj;
    const newFilter = filter ? filter.clone() : FilesFilter.getDefault();
    const requests = [Promise.resolve(newFilter)];

    return axios
      .all(requests)
      .catch((err) => {
        console.log(err);
        Promise.resolve(FilesFilter.getDefault());
      })
      .then((data) => {
        const resolvedFilter = data[0];

        if (resolvedFilter) {
          const folderId = resolvedFilter.folder;
          return fetchFiles(folderId, resolvedFilter).catch((error) => {
            if (error?.response?.status === 403) {
              window.location.replace(
                combineUrl(window.ClientConfig?.proxy?.url, "/login"),
              );
            }
          });
        }

        return Promise.resolve();
      })
      .finally(() => {
        this.setIsSectionLoading(false);
      });
  };

  fetchExternalLinks = (roomId) => {
    const type = 1;
    return api.rooms.getExternalLinks(roomId, type);
  };

  getExternalLinks = async (roomId) => {
    const externalLinks = await this.fetchExternalLinks(roomId);
    this.externalLinks = externalLinks;
  };

  deleteExternalLink = (link, linkId) => {
    let externalLinks = JSON.parse(JSON.stringify(this.externalLinks));

    if (link) {
      const linkIndex = externalLinks.findIndex(
        (l) => l.sharedTo.id === linkId,
      );
      externalLinks[linkIndex] = link;
    } else {
      externalLinks = externalLinks.filter((l) => l.sharedTo.id !== linkId);
    }

    this.externalLinks = externalLinks;
  };

  setPublicRoomKey = (key) => {
    this.publicRoomKey = key;
  };

  setExternalLink = (link, searchParams, setSearchParams, isCustomRoom) => {
    const linkIndex = this.externalLinks.findIndex(
      (l) => l.sharedTo.id === link.sharedTo.id,
    );
    const externalLinks = this.externalLinks;

    if (linkIndex === -1) {
      externalLinks.push(link);
      this.externalLinks = externalLinks;
    } else {
      externalLinks[linkIndex] = link;
    }

    if (isCustomRoom && searchParams && setSearchParams) {
      this.updateUrlKeyForCustomRoom(searchParams, setSearchParams);
    }
  };

  setExternalLinks = (links) => {
    const externalLinks = links.filter((t) => t.sharedTo.shareLink); // shareLink

    this.externalLinks = externalLinks;
  };

  editExternalLink = (roomId, link) => {
    const linkType = LinkType.External;

    const {
      id,
      title,
      expirationDate,
      password,
      disabled,
      denyDownload,
      internal,
    } = link.sharedTo;

    return api.rooms.editExternalLink(
      roomId,
      id,
      title,
      link.access,
      expirationDate,
      linkType,
      password,
      disabled,
      denyDownload,
      internal,
    );
  };

  gotoFolder = (res, key) => {
    const categoryType =
      res.isRoom || res.isRoomMember
        ? CategoryType.Shared
        : CategoryType.SharedWithMe;

    if (categoryType === CategoryType.SharedWithMe) {
      sessionStorage.setItem(TOAST_FOLDER_PUBLIC_KEY, res.entityId.toString());
    }

    const filter = FilesFilter.getDefault();

    const subFolder = new URLSearchParams(window.location.search).get("folder");

    const url = getCategoryUrl(categoryType);

    filter.folder = subFolder || res.id;
    filter.key = key;

    window.location.replace(`${url}?${filter.toUrlParams()}`);
  };

  validatePublicRoomKey = (key) => {
    this.setIsLoading(true);

    const searchParams = new URLSearchParams(window.location.search);

    const fileId = searchParams.get("fileId");
    const folderId = searchParams.get("folderId") ?? searchParams.get("folder");

    const params = new URLSearchParams();

    if (fileId) params.set("fileId", fileId);
    if (folderId) params.set("folderId", folderId);

    api.rooms
      .validatePublicRoomKey(key, params)
      .then((res) => {
        runInAction(() => {
          this.publicRoomKey = key;
        });

        const needPassword = res.status === ValidationStatus.Password;

        const currentUrl = window.location.href;

        const isNotRoomsSection = !currentUrl.includes("/rooms/shared");

        if (
          !needPassword &&
          isNotRoomsSection &&
          (res?.shared || res?.isAuthenticated)
        ) {
          return this.gotoFolder(res, key);
        }

        this.setRoomData(res);
      })
      .finally(() => this.setIsLoading(false));
  };

  validatePublicRoomPassword = (key, passwordHash) => {
    return api.rooms.validatePublicRoomPassword(key, passwordHash);
  };

  getAuthWindow = () => {
    return new Promise((res, rej) => {
      try {
        const path = combineUrl(
          window.ClientConfig?.proxy?.url,
          "/login?publicAuth=true",
        );

        const authModal = window.open(path, "_blank", "height=800, width=866");

        const checkConnect = setInterval(() => {
          if (!authModal || !authModal.closed) {
            return;
          }

          clearInterval(checkConnect);

          res(authModal);
        }, 500);
      } catch (error) {
        rej(error);
      }
    });
  };

  onOpenSignInWindow = async () => {
    if (this.windowIsOpen) return;

    this.windowIsOpen = true;
    await this.getAuthWindow();
    this.windowIsOpen = false;

    const isAuth = localStorage.getItem(PUBLIC_STORAGE_KEY);

    if (isAuth) {
      localStorage.removeItem(PUBLIC_STORAGE_KEY);
      window.location.reload();
    }
  };

  updateUrlKeyForCustomRoom = (searchParams, setSearchParams) => {
    const primaryLink = this.primaryLink;

    if (primaryLink) {
      this.setPublicRoomKey(primaryLink.sharedTo.requestToken);
      setSearchParams((prev) => {
        prev.set("key", primaryLink.sharedTo.requestToken);
        return prev;
      });
    } else if (this.roomLinks.length > 0) {
      const firstAvailableLink = this.roomLinks[0];
      this.setPublicRoomKey(firstAvailableLink.sharedTo.requestToken);
      setSearchParams((prev) => {
        prev.set("key", firstAvailableLink.sharedTo.requestToken);
        return prev;
      });
    } else {
      this.setPublicRoomKey(null);
      searchParams.delete("key");
      setSearchParams(searchParams);
    }
  };

  get isPublicRoom() {
    return this.isLoaded && isPublicRoomUtil();
  }

  get roomLinks() {
    if (this.externalLinks && this.externalLinks.length) {
      return this.externalLinks.filter(
        (l) =>
          l.sharedTo.shareLink &&
          !l.sharedTo.isTemplate &&
          l.sharedTo.linkType === LinkType.External,
      );
    }
    return [];
  }

  get primaryLink() {
    return this.roomLinks.find((l) => l.sharedTo.primary);
  }

  get additionalLinks() {
    const additionalLinks = this.roomLinks.filter((l) => !l.sharedTo.primary);
    return additionalLinks;
  }
}

export default PublicRoomStore;
