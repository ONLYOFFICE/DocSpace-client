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

import { TFile, TFolder } from "../files/types";
import {
  ExportRoomIndexTaskStatus,
  FolderType,
  RoomsType,
  ShareAccessRights,
  ValidationStatus,
} from "../../enums";
import { TCreatedBy, TPathParts } from "../../types";

export type ICover = {
  data: string;
  id: string;
};

export type TLogo = {
  cover?: ICover;
  original: string;
  large: string;
  medium: string;
  small: string;
  color?: string;
};

export type TRoomSecurity = {
  ChangeOwner: boolean;
  CopyLink: boolean;
  CreateRoomFrom: boolean;
  Embed: boolean;
  IndexExport: boolean;
  Reconnect: boolean;
  Read: boolean;
  Create: boolean;
  Delete: boolean;
  EditRoom: boolean;
  Rename: boolean;
  CopyTo: boolean;
  Copy: boolean;
  MoveTo: boolean;
  Move: boolean;
  Pin: boolean;
  Mute: boolean;
  EditAccess: boolean;
  Duplicate: boolean;
  Download: boolean;
  CopySharedLink: boolean;
};

export type TRoomLifetime = {
  deletePermanently: boolean;
  period: number;
  value: number;
};

export type TWatermark = {
  additions: number;
  imageHeight: number;
  imageScale: number;
  imageWidth: number;
  rotate: number;
  imageUrl?: string;
};
export type TRoom = {
  parentId: number;
  filesCount: number;
  foldersCount: number;
  new: number;
  mute: boolean;
  tags: string[];
  logo: TLogo;
  pinned: boolean;
  roomType: RoomsType;
  private: boolean;
  inRoom: boolean;
  id: number;
  usedSpace?: number;
  fileEntryType: number;
  rootFolderId: number;
  canShare: boolean;
  title: string;
  access: ShareAccessRights;
  shared: boolean;
  created: string;
  createdBy: TCreatedBy;
  updated: string;
  rootFolderType: FolderType;
  updatedBy: TCreatedBy;
  isArchive?: boolean;
  security: TRoomSecurity;
  lifetime?: TRoomLifetime;
  external?: boolean;
  passwordProtected?: boolean;
  requestToken?: string;
  expired?: boolean;
  indexing?: boolean;
  denyDownload?: boolean;
  watermark?: TWatermark;
  providerKey?: string;
  quotaLimit?: number;
  isTemplate?: boolean;
  isAvailable?: boolean;
};

export type TGetRooms = {
  files: TFile[];
  folders: TRoom[];
  current: TFolder;
  pathParts: TPathParts[];
  startIndex: number;
  count: number;
  total: number;
  new: number;
};

export type TExportRoomIndexTask = {
  id: string;
  error: string;
  percentage: number;
  isCompleted: boolean;
  status: ExportRoomIndexTaskStatus;
  resultFileId: number;
  resultFileName: string;
  resultFileUrl: string;
};

export type TPublicRoomPassword = {
  id: string;
  linkId: string;
  shared: boolean;
  status: ValidationStatus;
  tenantId: string | number;
};

export type TNewFilesItem = TFile[] | { room: TRoom; items: TFile[] };

export type TNewFiles = {
  date: string;
  items: TNewFilesItem[];
};

export type TValidateShareRoom =
  | {
      id: string;
      isAuthenticated: boolean;
      linkId: string;
      shared: boolean;
      status: number;
      tenantId: number;
      title: string;
    }
  | {
      isAuthenticated: boolean;
      linkId: string;
      shared: boolean;
      status: number;
      tenantId: number;
    };
