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

import axios from "axios";
import { makeAutoObservable } from "mobx";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import {
  frameCallCommand,
  isPublicRoom as isPublicRoomUtil,
} from "@docspace/shared/utils/common";

import { CategoryType } from "SRC_DIR/helpers/constants";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";

import { LinkType, ValidationStatus } from "../helpers/constants";

class PublicRoomStore {
  externalLinks = [];
  roomTitle = null;
  roomId = null;
  roomStatus = null;
  roomType = null;
  publicRoomKey = null;

  isLoaded = false;
  isLoading = false;

  clientLoadingStore;

  constructor(clientLoadingStore) {
    this.clientLoadingStore = clientLoadingStore;
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

    if (status === ValidationStatus.Ok) this.isLoaded = true;
  };

  fetchPublicRoom = (fetchFiles) => {
    let filterObj = FilesFilter.getFilter(window.location);

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
        Promise.resolve(FilesFilter.getDefault());
      })
      .then((data) => {
        const filter = data[0];

        if (filter) {
          const folderId = filter.folder;
          return fetchFiles(folderId, filter);
        }

        return Promise.resolve();
      })
      .finally(() => {
        this.setIsSectionLoading(false);

        frameCallCommand("setIsLoaded");
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

  setExternalLink = (link) => {
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
  };

  setExternalLinks = (links) => {
    const externalLinks = links.filter((t) => t.sharedTo.shareLink); // shareLink

    this.externalLinks = externalLinks;
  };

  editExternalLink = (roomId, link) => {
    const linkType = LinkType.External;

    const { id, title, expirationDate, password, disabled, denyDownload } =
      link.sharedTo;

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
    );
  };

  validatePublicRoomKey = (key) => {
    this.setIsLoading(true);
    api.rooms
      .validatePublicRoomKey(key)
      .then((res) => {
        if (res?.shared) {
          const filter = FilesFilter.getDefault();
          const url = getCategoryUrl(CategoryType.Shared);
          filter.folder = res.id;

          return window.location.replace(`${url}?${filter.toUrlParams()}`);
        }

        this.publicRoomKey = key;
        this.setRoomData(res);
      })
      .finally(() => this.setIsLoading(false));
  };

  validatePublicRoomPassword = (key, passwordHash) => {
    return api.rooms.validatePublicRoomPassword(key, passwordHash);
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
    } else {
      return [];
    }
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
