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

import {
  addExternalFolderLink,
  addExternalLink,
  editExternalFolderLink,
  editExternalLink,
  getOrCreatePrimaryFolderLink,
  getPrimaryLinkIfNotExistCreate,
  getFileSharedUsers,
  getFolderSharedUsers,
  shareFileToUsers,
  shareFolderToUsers,
} from "../api/files";

import {
  getPrimaryLink as getRoomPrimaryLink,
  editExternalLink as editExternalRoomLink,
} from "../api/rooms";

import {
  FolderType,
  ShareAccessRights,
  ShareLinkType,
  ShareRights,
} from "../enums";
import { isFile, isRoom } from "../utils/typeGuards";

import type { TRoom } from "../api/rooms/types";
import type {
  TFile,
  TFileLink,
  TFolder,
  TShareToUser,
} from "../api/files/types";
import { SHARED_MEMBERS_COUNT } from "../constants";

/**
 * Service for managing document sharing links
 */
export class ShareLinkService {
  private static readonly DEFAULT_CREATE_LINK_SETTINGS = {
    access: ShareAccessRights.ReadOnly,
    internal: false,
    diffExpirationDate: null,
  };

  /**
   * Determines the appropriate access rights for a file based on its properties
   * @param file - The file to determine access rights for
   * @returns The appropriate ShareAccessRights value
   */
  public static getShareLinkAccessFile(
    file: TFile,
    isPrimary = false,
  ): ShareAccessRights {
    const { availableShareRights, isForm, parentRoomType } = file;

    const rights =
      (isPrimary
        ? availableShareRights?.PrimaryExternalLink
        : availableShareRights?.ExternalLink) || [];

    if (!rights) {
      return ShareAccessRights.ReadOnly;
    }

    // Handle form files with special access rights logic
    if (isForm) {
      // Forms in FormRooms get FormFilling rights if available
      if (
        parentRoomType === FolderType.FormRoom &&
        rights.includes(ShareRights.FillForms)
      ) {
        return ShareAccessRights.FormFilling;
      }

      // Prioritize editing rights for forms when available
      if (rights.includes(ShareRights.Editing)) {
        return ShareAccessRights.Editing;
      }

      // Fall back to form filling if available
      if (rights.includes(ShareRights.FillForms)) {
        return ShareAccessRights.FormFilling;
      }
    }

    // Default to read-only access when available
    return ShareAccessRights.ReadOnly;
  }

  /**
   * Determines the appropriate access rights for a folder based on its properties
   * @param folder - The folder to determine access rights for
   * @returns The appropriate ShareAccessRights value
   */
  public static getShareLinkAccessFolder(folder: TFolder): ShareAccessRights {
    // Form rooms get form filling access
    if (folder.parentRoomType === FolderType.FormRoom) {
      return ShareAccessRights.FormFilling;
    }

    // Default to read-only access for all other folders
    return ShareAccessRights.ReadOnly;
  }

  /**
   * Gets or creates a primary link for a file
   * @param file - The file to get/create a link for
   * @returns Promise resolving to the file link
   */
  public static async getFilePrimaryLink(
    file: TFile,
    internal = false,
  ): Promise<TFileLink> {
    return getPrimaryLinkIfNotExistCreate(
      file.id,
      this.getShareLinkAccessFile(file, true),
      internal,
      this.DEFAULT_CREATE_LINK_SETTINGS.diffExpirationDate,
    );
  }

  /**
   * Gets or creates a primary link for a folder
   * @param folder - The folder to get/create a link for
   * @returns Promise resolving to the folder link
   */
  public static async getFolderPrimaryLink(
    folder: TFolder,
    internal = false,
  ): Promise<TFileLink> {
    return getOrCreatePrimaryFolderLink(
      folder.id,
      this.getShareLinkAccessFolder(folder),
      internal,
      this.DEFAULT_CREATE_LINK_SETTINGS.diffExpirationDate,
    );
  }

  public static getRoomPrimaryLink = async (
    room: TRoom,
  ): Promise<TFileLink> => {
    return getRoomPrimaryLink(room.id);
  };

  public static getPrimaryLink = async (
    item: TFile | TFolder | TRoom,
    internal = false,
  ): Promise<TFileLink> => {
    if (isRoom(item)) {
      return this.getRoomPrimaryLink(item);
    }

    return isFile(item)
      ? this.getFilePrimaryLink(item, internal)
      : this.getFolderPrimaryLink(item, internal);
  };

  public static editLink = async (
    item: TFile | TFolder | TRoom,
    link: TFileLink,
  ): Promise<TFileLink> => {
    if (isRoom(item)) {
      return editExternalRoomLink(
        item.id,
        link.sharedTo.id,
        link.sharedTo.title,
        link.access,
        link.sharedTo.expirationDate ?? null,
        ShareLinkType.External,
        link.sharedTo.password,
        false,
        link.sharedTo.denyDownload,
        link.sharedTo.internal,
      )!;
    }

    const editApi = isFile(item) ? editExternalLink : editExternalFolderLink;

    return editApi(
      item.id,
      link.sharedTo.id,
      link.access,
      link.sharedTo.primary,
      link.sharedTo.internal,
      link.sharedTo.expirationDate ?? null,
      link.sharedTo.title,
      link.sharedTo.password,
      link.sharedTo.denyDownload,
    );
  };

  public static addExternalFileLink = async (
    file: TFile,
    internal = false,
  ) => {
    return addExternalLink(
      file.id,
      this.getShareLinkAccessFile(file),
      false,
      internal,
      this.DEFAULT_CREATE_LINK_SETTINGS.diffExpirationDate,
    );
  };

  public static addExternalFolderLink = async (
    folder: TFolder,
    internal = false,
  ) => {
    return addExternalFolderLink(
      folder.id,
      this.getShareLinkAccessFolder(folder),
      false,
      internal,
      this.DEFAULT_CREATE_LINK_SETTINGS.diffExpirationDate,
    );
  };

  public static addExternalLink = async (
    item: TFile | TFolder,
    internal = false,
  ) => {
    return isFile(item)
      ? this.addExternalFileLink(item, internal)
      : this.addExternalFolderLink(item, internal);
  };

  public static getShareFile = (
    id: string | number,
    startIndex = 0,
    count = SHARED_MEMBERS_COUNT,
    signal?: AbortSignal,
  ) => {
    return getFileSharedUsers(id, startIndex, count, signal);
  };

  public static getShareFolder = (
    id: string | number,
    startIndex = 0,
    count = SHARED_MEMBERS_COUNT,
    signal?: AbortSignal,
  ) => {
    return getFolderSharedUsers(id, startIndex, count, signal);
  };

  public static getShare = (
    item: TFile | TFolder,
    filter: {
      count?: number;
      startIndex?: number;
    },
    signal?: AbortSignal,
  ) => {
    const getShare = isFile(item) ? this.getShareFile : this.getShareFolder;

    return getShare(item.id, filter.startIndex, filter.count, signal);
  };

  public static shareItemToUser = async (
    share: TShareToUser[],
    item: TFile | TFolder,
  ) => {
    return isFile(item)
      ? shareFileToUsers(item.id, share)
      : shareFolderToUsers(item.id, share);
  };
}
