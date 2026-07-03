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

import type {
  FileFillingFormStatus,
  FileStatus,
  FileType,
  FolderType,
  RoomsProviderType,
  RoomsType,
  ShareAccessRights,
  VectorizationStatus,
} from "@docspace/shared/enums";
import type {
  Nullable,
  TAvailableShareRights,
  TCreatedBy,
  TPathParts,
} from "@docspace/shared/types";
import type {
  TFileSecurity,
  TFileViewAccessibility,
  TFolderSecurity,
  TShareSettings,
} from "@docspace/shared/api/files/types";
import type {
  TAIRoomChatSettings,
  TRoomLifetime,
  TRoomSecurity,
  TWatermark,
} from "@docspace/shared/api/rooms/types";
import type { TLogo } from "@docspace/ui-kit/types";

// FABLE5-REVIEW: `pdfViewer` exists in public/scripts/config.json but is
// missing from the duplicated Window.ClientConfig declarations
// (packages/shared/types/index.ts and the libs/ui-kit submodule); both must
// be updated in sync (TS2717) and ui-kit is a separate submodule, so a local
// cast type is used here (same approach as MediaViewerDataStore).
export type TClientConfigWithPdfViewer = NonNullable<Window["ClientConfig"]> & {
  pdfViewer?: boolean;
};

// FABLE5-REVIEW: FilesStore.js reads `security.security?.X` in the AI
// knowledge/result branch of fetchFiles — the nested member never exists at
// runtime (always undefined); it is typed here so the read stays legal
// without call-site casts. Candidate for cleanup.
export type TItemSecurity = Partial<
  TFileSecurity & TFolderSecurity & TRoomSecurity
> & {
  security?: Partial<TFileSecurity & TFolderSecurity & TRoomSecurity>;
};

// FABLE5-REVIEW: this store mixes three API entity families (files,
// folders, rooms) and its own filesList view-models in the same collections.
// TItem is an explicit structural merge of those shapes (every member
// optional, conflicting `security` widened to TItemSecurity) plus the
// view-model fields produced by getFilesListItems, so raw TFile/TFolder/
// TRoom/TAgent entities and list items are all assignable to it. It is
// deliberately written out field-by-field (not as a Partial<TFile & TFolder
// & TRoom> intersection): Biome's type-aware noMisusedPromises rule
// stack-overflows evaluating the large intersection across this file.
export type TItem = {
  security?: TItemSecurity;
  /** Third-party provider entries carry string ids at runtime. */
  id?: number | string;
  access?: ShareAccessRights;
  autoDelete?: string;
  originTitle?: string;
  comment?: string;
  contentLength?: string;
  created?: string;
  createdBy?: TCreatedBy;
  encrypted?: boolean;
  fileExst?: string;
  filesCount?: number;
  fileStatus?: FileStatus;
  fileType?: FileType;
  folderId?: number;
  foldersCount?: number;
  logo?: TLogo;
  locked?: boolean;
  lockedBy?: string;
  private?: boolean;
  originId?: number;
  originFolderId?: number | string;
  originRoomId?: number | string;
  originRoomTitle?: string;
  parentId?: number;
  pureContentLength?: number;
  rootFolderType?: FolderType;
  rootFolderId?: number;
  shared?: boolean;
  sharedBy?: TCreatedBy;
  ownedBy?: TCreatedBy;
  sharedForUser?: boolean;
  title?: string;
  type?: FolderType;
  hasDraft?: boolean;
  updated?: string;
  updatedBy?: TCreatedBy;
  version?: number;
  versionGroup?: number;
  viewUrl?: string;
  webUrl?: string;
  shortWebUrl?: string;
  providerKey?: string;
  providerId?: number;
  providerItem?: boolean;
  thumbnailUrl?: string;
  thumbnailStatus?: number;
  canShare?: boolean;
  canEdit?: boolean;
  roomType?: RoomsType;
  rootRoomType?: RoomsType;
  isArchive?: boolean;
  tags?: string[];
  pinned?: boolean;
  viewAccessibility?: TFileViewAccessibility;
  mute?: boolean;
  inRoom?: boolean;
  requestToken?: string;
  indexing?: boolean;
  lifetime?: TRoomLifetime;
  denyDownload?: boolean;
  denySharing?: boolean;
  lastOpened?: string;
  quotaLimit?: number;
  usedSpace?: number;
  isCustomQuota?: boolean;
  order?: string;
  startFilling?: boolean;
  draftLocation?: unknown;
  expired?: string;
  expirationDate?: string;
  external?: boolean;
  isLinkExpired?: boolean;
  passwordProtected?: boolean;
  watermark?: TWatermark;
  formFillingStatus?: FileFillingFormStatus;
  customFilterEnabled?: boolean;
  customFilterEnabledBy?: string;
  chatSettings?: TAIRoomChatSettings;
  location?: unknown;
  new?: number;
  isFolder?: boolean;
  isRoom?: boolean;
  isFile?: boolean;
  isForm?: boolean;
  isPDFForm?: boolean;
  isFavorite?: boolean;
  isTemplate?: boolean;
  isAvailable?: boolean;
  vectorizationStatus?: VectorizationStatus;
  activeEditors?: Record<string, string>;
  editingBy?: Record<string, string>;
  fileEntryType?: number;
  parentShared?: boolean;
  parentRoomType?: FolderType;
  path?: TPathParts[];
  shareSettings?: TShareSettings;
  availableShareRights?: TAvailableShareRights;
  originalFormId?: number;
  sendFormToExternalDB?: boolean;
  saveFormAsXLSX?: boolean;
  // view-model fields produced by getFilesListItems
  daysRemaining?: string;
  contextOptions?: string[];
  icon?: string;
  defaultRoomIcon?: string;
  isPrivateRoom?: boolean;
  canOpenPlayer?: boolean;
  previewUrl?: Nullable<string>;
  folderUrl?: Nullable<string> | false;
  href?: Nullable<string> | false;
  isThirdPartyFolder?: boolean | string;
  isEditing?: boolean;
  isAIAgent?: boolean;
  thirdPartyIcon?: string;
  providerType?: RoomsProviderType;
  fileTypeName?: string;
  isPlugin?: boolean;
  fileTileIcon?: string;
  // set by the sortedFiles getter on cloned selection items
  checked?: boolean;
  format?: Nullable<string>;
};

export type TActiveItem = {
  id: number | string;
  destFolderId?: number | string | null;
};

export type THighlightFile = {
  id?: number | string;
  isExst?: boolean;
};

export type TCreatedItem = Nullable<{
  id: number | string;
  type?: string;
}>;

// FABLE5-REVIEW: FillingFormsRoom/ReviewRoom/ReadOnlyRoom were removed from
// the ui-kit RoomsType enum ("TODO: Restore when certs will be done") — the
// lookups below evaluate to undefined at runtime (producing "room-undefined"
// switch keys), preserved verbatim via this cast type.
export type TRemovedRoomsTypes = {
  FillingFormsRoom?: RoomsType;
  ReviewRoom?: RoomsType;
  ReadOnlyRoom?: RoomsType;
};

// FABLE5-REVIEW: window.DocSpace.location.state is `unknown` in the shared
// Window declaration; only the members read by this store are asserted.
export type THighlightState = {
  highlightFileId?: number | string;
  isFileHasExst?: boolean;
};
