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

import type {
  TAvailableExternalRights,
  TFile,
  TFolder,
  TShareSettings,
} from "../files/types";
import {
  ExportRoomIndexTaskStatus,
  FolderType,
  LinkSharingEntityType,
  RoomsType,
  ShareAccessRights,
  ValidationStatus,
} from "../../enums";
import type {
  TAvailableShareRights,
  TCreatedBy,
  TPathParts,
} from "../../types";
import { TUser } from "../people/types";
import { TGroup } from "../groups/types";

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
  isRoom?: boolean;
  shareSettings?: TShareSettings;
  /** @deprecated use availableShareRights instead */
  availableExternalRights?: TAvailableExternalRights;
  availableShareRights?: TAvailableShareRights;
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

export type TValidateShareRoom = {
  id: string;
  isAuthenticated: boolean;
  linkId: string;
  shared: boolean;
  status: number;
  tenantId: number;
  title: string;

  isRoom: boolean;
  type: LinkSharingEntityType;

  entityId?: string;
  entityTitle?: string;
  entityType?: LinkSharingEntityType;
  isRoomMember?: boolean;
};

export type RoomMember = {
  access: number;
  oldAccess?: number;
  canEditAccess: boolean;
  isLocked: boolean;
  isOwner: boolean;
  subjectType: number;
  sharedTo: TUser | TGroup;
};

export type TGetRoomMembers = {
  total: number;
  items: RoomMember[];
};

type TAccessibility = {
  ImageView: boolean;
  MediaView: boolean;
  WebView: boolean;
  WebEdit: boolean;
  WebReview: boolean;
  WebCustomFilterEditing: boolean;
  WebRestrictedEditing: boolean;
  WebComment: boolean;
  CoAuhtoring: boolean;
  CanConvert: boolean;
  MustConvert: boolean;
};

export interface TFeedData {
  accessibility?: TAccessibility;
  parentId: number;
  toFolderId: number;
  parentTitle: string;
  parentType: number;
  fromParentType: number;
  fromParentTitle: string;
  fromFolderId?: number;
  id: string | number;
  title?: string;
  newTitle?: string;
  oldTitle?: string;
  oldIndex?: number;
  newIndex?: number;
  viewUrl?: string;
  version?: number;
  lifeTime?: {
    value: number;
    period: number;
  };
  group?: {
    id: string;
    name: string;
    isSystem?: boolean;
  };
  tags?: string[];
  sharedTo?: {
    title: string;
    shareLink: string;
    requestToken: string;
    primary: boolean;
    linkType: number;
    isExpired: boolean;
    internal: boolean;
    id: string;
    denyDownload: boolean;
  };
}

interface Initiator {
  id: string | number;
  avatar: string;
  avatarSmall: string;
  avatarMedium: string;
  avatarMax: string;
  avatarOriginal: string;
  displayName: string;
  hasAvatar: boolean;
  isAnonim: boolean;
  profileUrl: string;
  email?: string;
}

export enum FeedAction {
  Create = "create",
  Upload = "upload",
  Update = "update",
  Convert = "convert",
  Delete = "delete",
  Rename = "rename",
  Move = "move",
  Copy = "copy",
  Revoke = "revoke",
  Change = "changeIndex",
  Reorder = "reorderIndex",
  Submitted = "submitted",
  StartedFilling = "startedFilling",
  Locked = "locked",
  Unlocked = "unlocked",
  Archived = "archived",
  Unarchived = "unarchived",
  Export = "export",
  Invite = "invite",
  CHANGE_COLOR = "changeColor",
  CHANGE_COVER = "changeCover",
  DeleteVersion = "deleteVersion",
  FormStartedToFill = "formStartedToFill",
  FormPartiallyFilled = "formPartiallyFilled",
  FormCompletelyFilled = "formCompletelyFilled",
  FormStopped = "formStopped",
  CustomFilterDisabled = "customFilterDisabled",
  CustomFilterEnabled = "customFilterEnabled",
}

export enum FeedTarget {
  File = "file",
  Folder = "folder",
  Room = "room",
  RoomTag = "roomTag",
  RoomLogo = "roomLogo",
  RoomExternalLink = "roomExternalLink",
  User = "user",
  Group = "group",
}

export enum FeedActionKeys {
  FileCreated = "FileCreated",
  FileUploaded = "FileUploaded",
  UserFileUpdated = "UserFileUpdated",
  FileConverted = "FileConverted",
  FileRenamed = "FileRenamed",
  FileMoved = "FileMoved",
  FileMovedToTrash = "FileMovedToTrash",
  FileCopied = "FileCopied",
  FileDeleted = "FileDeleted",
  FileIndexChanged = "FileIndexChanged",
  FormSubmit = "FormSubmit",
  FormOpenedForFilling = "FormOpenedForFilling",
  FileLocked = "FileLocked",
  FileUnlocked = "FileUnlocked",
  FileVersionRemoved = "FileVersionRemoved",
  FormStartedToFill = "FormStartedToFill",
  FormPartiallyFilled = "FormPartiallyFilled",
  FormCompletelyFilled = "FormCompletelyFilled",
  FormStopped = "FormStopped",
  FileCustomFilterDisabled = "FileCustomFilterDisabled",
  FileCustomFilterEnabled = "FileCustomFilterEnabled",
  FolderCreated = "FolderCreated",
  FolderRenamed = "FolderRenamed",
  FolderLocked = "FolderLocked",
  FolderUnlocked = "FolderUnlocked",
  FolderMoved = "FolderMoved",
  FolderMovedToTrash = "FolderMovedToTrash",
  FolderCopied = "FolderCopied",
  FolderDeleted = "FolderDeleted",
  FolderIndexChanged = "FolderIndexChanged",
  FolderIndexReordered = "FolderIndexReordered",
  RoomCreated = "RoomCreated",
  RoomRenamed = "RoomRenamed",
  RoomCopied = "RoomCopied",
  RoomWatermarkSet = "RoomWatermarkSet",
  RoomWatermarkDisabled = "RoomWatermarkDisabled",
  RoomIndexingEnabled = "RoomIndexingEnabled",
  RoomIndexingDisabled = "RoomIndexingDisabled",
  RoomLifeTimeSet = "RoomLifeTimeSet",
  RoomLifeTimeDisabled = "RoomLifeTimeDisabled",
  RoomDenyDownloadEnabled = "RoomDenyDownloadEnabled",
  RoomDenyDownloadDisabled = "RoomDenyDownloadDisabled",
  RoomArchived = "RoomArchived",
  RoomUnarchived = "RoomUnarchived",
  RoomIndexExportSaved = "RoomIndexExportSaved",
  AddedRoomTags = "AddedRoomTags",
  DeletedRoomTags = "DeletedRoomTags",
  RoomLogoCreated = "RoomLogoCreated",
  RoomLogoDeleted = "RoomLogoDeleted",
  RoomColorChanged = "RoomColorChanged",
  RoomCoverChanged = "RoomCoverChanged",
  RoomExternalLinkCreated = "RoomExternalLinkCreated",
  RoomExternalLinkRenamed = "RoomExternalLinkRenamed",
  RoomExternalLinkDeleted = "RoomExternalLinkDeleted",
  RoomExternalLinkRevoked = "RoomExternalLinkRevoked",
  RoomCreateUser = "RoomCreateUser",
  RoomUpdateAccessForUser = "RoomUpdateAccessForUser",
  RoomRemoveUser = "RoomRemoveUser",
  RoomInviteResend = "RoomInviteResend",
  RoomGroupAdded = "RoomGroupAdded",
  RoomUpdateAccessForGroup = "RoomUpdateAccessForGroup",
  RoomGroupRemove = "RoomGroupRemove",
}

export type CapitalizedFeedAction = Capitalize<FeedAction>;

export type TFeedAction<T = TFeedData> = {
  action: {
    id: number;
    key: FeedActionKeys;
  };
  data: T;
  date: string;
  initiator: Initiator;
  related: Omit<TFeedAction<T>, "related">[];
};

export type TFeed = {
  total: number;
  items: TFeedAction[];
};
