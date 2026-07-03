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

import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { isPublicRoom as isPublicRoomUtil } from "@docspace/shared/utils/common";

import { LinkType } from "SRC_DIR/helpers/constants";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";

import { FolderType, ValidationStatus } from "@docspace/shared/enums";
import {
  CategoryType,
  TOAST_FOLDER_PUBLIC_KEY,
} from "@docspace/shared/constants";

import type { TFileLink } from "@docspace/shared/api/files/types";
import type { TValidateShareRoom } from "@docspace/shared/api/rooms/types";
import type { RoomsType } from "@docspace/shared/enums";

import {
  PersistenceKeys,
  hasPersisted,
  removePersisted,
} from "./utils/persistence";
import { match } from "ts-pattern";

import type ClientLoadingStore from "./ClientLoadingStore";

class PublicRoomStore {
  externalLinks: TFileLink[] = [];

  roomTitle: string | null = null;

  roomId: string | null = null;

  roomStatus: ValidationStatus | null = null;

  // FABLE5-REVIEW: `roomType` is read from the validate-share response in
  // setRoomData, but TValidateShareRoom does not declare it — verify whether
  // the server DTO actually returns it (it may always be undefined at runtime).
  roomType: RoomsType | null | undefined = null;

  publicRoomKey: string | null = null;

  isLoaded = false;

  isLoading = false;

  windowIsOpen = false;

  clientLoadingStore: ClientLoadingStore;

  validationData: TValidateShareRoom | null = null;

  constructor(clientLoadingStore: ClientLoadingStore) {
    this.clientLoadingStore = clientLoadingStore;
    makeAutoObservable(this);
  }

  setIsSectionLoading = (param: boolean) => {
    this.clientLoadingStore?.setIsSectionFilterLoading(param);
    this.clientLoadingStore?.setIsSectionBodyLoading(param);
  };

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setRoomData = (data: TValidateShareRoom) => {
    // FABLE5-REVIEW: `roomType` is not declared on TValidateShareRoom (see
    // the field note above) — cast keeps the original destructuring intact.
    const { id, roomType, status, title } = data as TValidateShareRoom & {
      roomType?: RoomsType;
    };

    this.roomTitle = title;
    this.roomId = id;
    this.roomStatus = status;
    this.roomType = roomType;
    this.validationData = data;

    if (status === ValidationStatus.Ok) this.isLoaded = true;
  };

  fetchPublicRoom = (
    fetchFiles: (folderId: string, filter: FilesFilter) => Promise<unknown>,
  ) => {
    const filterObj = FilesFilter.getFilter(window.location);

    if (!filterObj) return;

    if (filterObj.folder === "@my") {
      // FABLE5-REVIEW: `roomId` may still be null here; the original .js
      // assigned it regardless — the assertion keeps the same runtime.
      filterObj.folder = this.roomId!;
    }

    this.setIsSectionLoading(true);

    let dataObj: {
      filter: FilesFilter;
      type?: string;
      itemId?: string;
    } = { filter: filterObj };

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
        // FABLE5-REVIEW: if the catch above ran, `data` is undefined and the
        // original .js crashed here — the assertion keeps the same runtime.
        const resolvedFilter = data![0];

        if (resolvedFilter) {
          const folderId = resolvedFilter.folder;
          return fetchFiles(folderId, resolvedFilter).catch(
            (error: unknown) => {
              if (
                (error as { response?: { status?: number } })?.response
                  ?.status === 403
              ) {
                window.location.replace(
                  combineUrl(window.ClientConfig?.proxy?.url, "/login"),
                );
              }
            },
          );
        }

        return Promise.resolve();
      })
      .finally(() => {
        this.setIsSectionLoading(false);
      });
  };

  fetchExternalLinks = (roomId: number | string) => {
    const type = 1;
    // FABLE5-REVIEW: getExternalLinks is untyped in shared/api/rooms (bare
    // `request(...)`) — cast until it gets a proper return type.
    return api.rooms.getExternalLinks(roomId, type) as Promise<TFileLink[]>;
  };

  getExternalLinks = async (roomId: number | string) => {
    const externalLinks = await this.fetchExternalLinks(roomId);
    this.externalLinks = externalLinks;
  };

  deleteExternalLink = (link: TFileLink | null, linkId: string) => {
    let externalLinks = JSON.parse(
      JSON.stringify(this.externalLinks),
    ) as TFileLink[];

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

  setExternalLink = (link: TFileLink) => {
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

  setExternalLinks = (links: TFileLink[]) => {
    const externalLinks = links.filter((t) => t.sharedTo.shareLink); // shareLink

    this.externalLinks = externalLinks;
  };

  editExternalLink = (roomId: number | string, link: TFileLink) => {
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

    // FABLE5-REVIEW: `expirationDate` and `disabled` are optional on
    // TFileLink.sharedTo; the original .js passed them through as-is
    // (possibly undefined) — the casts keep the same runtime.
    return api.rooms.editExternalLink(
      roomId,
      id,
      title,
      link.access,
      expirationDate as string | null,
      linkType,
      password,
      disabled as boolean,
      denyDownload,
      internal,
    );
  };

  // FABLE5-REVIEW: validatePublicRoomKey calls `gotoFolder(res, key)` with a
  // second argument the original .js function never declared or used — the
  // unused optional param keeps that call site type-correct without changing
  // runtime behavior.
  gotoFolder = async (res: TValidateShareRoom, _key?: string) => {
    const categoryType = await match(res)
      .when(
        (res) => res.isRoom || res.isRoomMember,
        async () => CategoryType.Shared,
      )
      .otherwise(async () => {
        try {
          const folder = await api.files.getFolderInfo(res.id, true);

          if (!folder) return CategoryType.SharedWithMe;

          if (folder.rootFolderType === FolderType.USER) {
            return CategoryType.Personal;
          }

          if (folder.rootFolderType === FolderType.Rooms) {
            return CategoryType.Shared;
          }

          return CategoryType.SharedWithMe;
        } catch (error) {
          console.error(error);
          return CategoryType.SharedWithMe;
        }
      });

    if (categoryType === CategoryType.SharedWithMe) {
      sessionStorage.setItem(
        TOAST_FOLDER_PUBLIC_KEY,
        res.entityId?.toString() ?? res.id.toString(),
      );
    }
    const urlParams = new URLSearchParams(window.location.search);
    const publicRoomKey = urlParams.get("key") || urlParams.get("share");

    const filter = FilesFilter.getDefault();

    const subFolder = new URLSearchParams(window.location.search).get("folder");

    const url = getCategoryUrl(categoryType);

    filter.folder = subFolder || res.id;
    filter.key = publicRoomKey;

    window.location.replace(`${url}?${filter.toUrlParams()}`);
  };

  validatePublicRoomKey = (key: string) => {
    this.setIsLoading(true);

    const searchParams = new URLSearchParams(window.location.search);

    const fileId = searchParams.get("fileId");
    const folderId = searchParams.get("folderId") ?? searchParams.get("folder");

    const params = new URLSearchParams();

    if (fileId) params.set("fileId", fileId);
    if (folderId) params.set("folderId", folderId);

    // FABLE5-REVIEW: request() in shared/api is typed `Promise<T> | undefined`;
    // the original .js chained `.then` unconditionally (crashing if it were
    // ever undefined) — the cast keeps the same runtime.
    (
      api.rooms.validatePublicRoomKey(key, params) as Promise<
        TValidateShareRoom
      >
    )
      .then((res) => {
        const needPassword = res.status === ValidationStatus.Password;

        if (res?.shared && !needPassword) {
          return this.gotoFolder(res);
        }

        if (res?.isAuthenticated && !needPassword) {
          return this.gotoFolder(res, key);
        }

        runInAction(() => {
          this.publicRoomKey = key;
        });
        this.setRoomData(res);
      })
      .finally(() => this.setIsLoading(false));
  };

  validatePublicRoomPassword = (key: string, passwordHash: string) => {
    return api.rooms.validatePublicRoomPassword(key, passwordHash);
  };

  getAuthWindow = () => {
    return new Promise<Window>((res, rej) => {
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

    const isAuth = hasPersisted(PersistenceKeys.publicAuth);

    if (isAuth) {
      removePersisted(PersistenceKeys.publicAuth);
      window.location.reload();
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

  get hasExternalLinks() {
    return this.roomLinks.some((l) => !l.sharedTo.internal);
  }
}

export default PublicRoomStore;
