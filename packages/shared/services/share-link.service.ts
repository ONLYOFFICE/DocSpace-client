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

import {
  addExternalFolderLink,
  addExternalLink,
  editExternalFolderLink,
  editExternalLink,
  getOrCreatePrimaryFolderLink,
  getPrimaryLinkIfNotExistCreate,
} from "../api/files";

import {
  getPrimaryLink as getRoomPrimaryLink,
  editExternalLink as editExternalRoomLink,
} from "../api/rooms";

import { FolderType, ShareAccessRights, ShareLinkType } from "../enums";
import { isFile, isRoom } from "../utils/typeGuards";

import type { TRoom } from "../api/rooms/types";
import type { TFile, TFileLink, TFolder } from "../api/files/types";

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
  public static getShareLinkAccessFile(file: TFile): ShareAccessRights {
    const { availableExternalRights: rights, isForm, parentRoomType } = file;

    if (!rights) {
      return ShareAccessRights.ReadOnly;
    }

    // Handle form files with special access rights logic
    if (isForm) {
      // Forms in FormRooms get FormFilling rights if available
      if (parentRoomType === FolderType.FormRoom && rights.FillForms) {
        return ShareAccessRights.FormFilling;
      }

      // Prioritize editing rights for forms when available
      if (rights.Editing) {
        return ShareAccessRights.Editing;
      }

      // Fall back to form filling if available
      if (rights.FillForms) {
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
  public static async getFilePrimaryLink(file: TFile): Promise<TFileLink> {
    return getPrimaryLinkIfNotExistCreate(
      file.id,
      this.getShareLinkAccessFile(file),
      this.DEFAULT_CREATE_LINK_SETTINGS.internal,
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
  ): Promise<TFileLink> {
    return getOrCreatePrimaryFolderLink(
      folder.id,
      this.getShareLinkAccessFolder(folder),
      this.DEFAULT_CREATE_LINK_SETTINGS.internal,
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
  ): Promise<TFileLink> => {
    if (isRoom(item)) {
      return this.getRoomPrimaryLink(item);
    }

    return isFile(item)
      ? this.getFilePrimaryLink(item)
      : this.getFolderPrimaryLink(item);
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

  public static addExternalFileLink = async (file: TFile) => {
    return addExternalLink(
      file.id,
      this.getShareLinkAccessFile(file),
      false,
      this.DEFAULT_CREATE_LINK_SETTINGS.internal,
      this.DEFAULT_CREATE_LINK_SETTINGS.diffExpirationDate,
    );
  };

  public static addExternalFolderLink = async (folder: TFolder) => {
    return addExternalFolderLink(
      folder.id,
      this.getShareLinkAccessFolder(folder),
      false,
      this.DEFAULT_CREATE_LINK_SETTINGS.internal,
      this.DEFAULT_CREATE_LINK_SETTINGS.diffExpirationDate,
    );
  };

  public static addExternalLink = async (item: TFile | TFolder) => {
    return isFile(item)
      ? this.addExternalFileLink(item)
      : this.addExternalFolderLink(item);
  };
}
