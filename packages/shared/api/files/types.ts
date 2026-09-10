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

import type { TFile as TFileBase } from "@docspace/ui-kit/types";

import type {
  TAvailableShareRights,
  TCreatedBy,
  TPathParts,
} from "../../types";
import type {
  DistributedTaskStatus,
  EmployeeActivationStatus,
  EmployeeStatus,
  FileFillingFormStatus,
  FileOperationStatus,
  FillingFormStatusHistory,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "../../enums";
import type { TUser } from "../people/types";
import type { TRoom } from "../rooms/types";

export type TFile = TFileBase & {
  encrypted?: boolean;
};

export type TFileEncryptionInfo = {
  userKeys: Array<{
    id: string;
    userId: string;
    publicKey: string;
    privateKeyEnc: string;
    date: string;
    cryptoEngineId: string;
  }>;
  fileKeys: Array<{
    userId: string;
    publicKeyId: string;
    privateKeyEnc: string;
    tenantId?: number;
    fileId?: number;
    createOn?: string;
  }>;
};

export type TFileViewAccessibility = {
  CanConvert: boolean;
  CoAuhtoring: boolean;
  ImageView: boolean;
  MediaView: boolean;
  MustConvert: boolean;
  WebComment: boolean;
  WebCustomFilterEditing: boolean;
  WebEdit: boolean;
  WebRestrictedEditing: boolean;
  WebReview: boolean;
  WebView: boolean;
};

export type TFileSecurity = {
  Convert: boolean;
  Copy: boolean;
  CustomFilter: boolean;
  Delete: boolean;
  Download: boolean;
  Duplicate: boolean;
  Edit: boolean;
  EditHistory: boolean;
  FillForms: boolean;
  Lock: boolean;
  Move: boolean;
  Read: boolean;
  ReadHistory: boolean;
  Rename: boolean;
  Review: boolean;
  SubmitToFormGallery: boolean;
  StopFilling?: boolean;
  ResetFilling?: boolean;
  StartFilling?: boolean;
  FillingStatus?: boolean;
  OpenForm?: boolean;
  EditForm: boolean;
  Comment: boolean;
  CreateRoomFrom: boolean;
  CopyLink: boolean;
  Embed: boolean;
  Vectorization: boolean;
  AskAi?: boolean;
  UpdateXlsx?: boolean;
};

export type TShareSettings = {
  ExternalLink?: number;
  PrimaryExternalLink?: number;
};

export type TOpenEditRequest = {
  documentType: string;
  editorUrl: string;
  token: string;
  type: string;
  file: TFile;
  errorMessage: string;
};

export type TGetReferenceData = {
  fileKey: number | string;
  instanceId: string;
  sourceFileId?: number;
  path?: string;
  link?: string;
};

export type TGetReferenceDataRequest = {
  referenceData: {
    FileKey: number;
    InstanceId: string;
  };
  error: string;
  path: string;
  url: string;
  fileType: string;
  key: string;
  link: string;
  token: string;
};

export type TFolderSecurity = {
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
  Reconnect: boolean;
  CreateRoomFrom: boolean;
  CopyLink: boolean;
  Embed: boolean;
  ChangeOwner: boolean;
  IndexExport: boolean;
  HistoryExport: boolean;
  UpdateXlsx?: boolean;
  AnalyzeResponses?: boolean;
};

export type TFolder = {
  parentId: number;
  filesCount: number;
  foldersCount: number;
  new: number;
  mute: boolean;
  pinned: boolean;
  private: boolean;
  id: number;
  rootFolderId: number;
  canShare: boolean;
  security: TFolderSecurity;
  title: string;
  access: ShareAccessRights;
  shared: boolean;
  created: string;
  createdBy: TCreatedBy;
  updated: string;
  updatedBy: TCreatedBy;
  sharedBy?: TCreatedBy;
  ownedBy?: TCreatedBy;
  rootFolderType: FolderType;
  isArchive?: boolean;
  roomType?: RoomsType;
  path?: TPathParts[];
  type?: FolderType;
  isFolder?: boolean;
  /** Present on folders returned inside rooms listings (`GET /files/{id}`
   * current); consumed by FilesStore (`data.current.inRoom`,
   * `setInRoomFolder`). */
  inRoom?: boolean;
  indexing: boolean;
  denyDownload: boolean;
  fileEntryType: number;
  parentShared?: boolean;
  parentRoomType?: FolderType;
  order?: string;
  isRoom?: boolean;
  rootRoomType?: RoomsType;
  shareSettings?: TShareSettings;
  availableShareRights?: TAvailableShareRights;
  isFavorite?: boolean;
  expirationDate?: string;
  sharedForUser?: boolean;
  isLinkExpired?: boolean;
  external?: boolean;
  originalFormId?: number;
};

export type TGetFolderPath = TFolder[];

export type TGetFolder = {
  files: TFile[];
  folders: TFolder[];
  current: TFolder;
  pathParts: TPathParts[];
  startIndex: number;
  count: number;
  total: number;
  new: number;
};

export type TGetRootFolder = {
  files: TFile[];
  folders: (TFolder | TRoom)[];
  current: TFolder;
  pathParts: TPathParts[];
  startIndex: number;
  count: number;
  total: number;
  new: number;
};

export type TOperation = {
  Operation: number;
  error: string;
  finished: boolean;
  id: string;
  processed: string;
  progress: number;
  status?: FileOperationStatus;
  url?: string;
  files?: TFile[];
};

export type TUploadOperation = {
  bytes_total: number;
  bytes_uploaded: number;
  created: Date;
  expired: Date;
  id: string;
  location: string;
  path: number[];
};

export type TThirdPartyCapabilities = string[][];

export type TThirdParty = {
  corporate: boolean;
  roomsStorage: boolean;
  customerTitle: string;
  providerId: string;
  providerKey: string;
  provider_id?: string;
  customer_title?: string;
  /** Snake-case variant returned by the providers endpoint; read by
   * FilesActionsStore.setThirdpartyInfo. */
  provider_key?: string;
};

export type TThirdParties = TThirdParty[];

export type TFilesSettings = {
  automaticallyCleanUp: {
    gap: number;
    isAutoCleanUp: boolean;
  };
  canSearchByContent: boolean;
  chunkUploadSize: number;
  maxUploadThreadCount: number;
  maxUploadFilesCount?: number;
  confirmDelete: boolean;
  convertNotify: boolean;
  defaultOrder: { is_asc: boolean; property: number };
  defaultSharingAccessRights: ShareAccessRights[];
  downloadTarGz: boolean;
  enableThirdParty: boolean;
  externalShare: boolean;
  externalShareSocialMedia: boolean;
  defaultShareLinkInternal: boolean;
  externalShareApplyToDocuments: boolean;
  externalShareApplyToRooms: boolean;
  blockExistingLinksOnRestrict: boolean;
  extsArchive: string[];
  extsAudio: string[];
  extsCoAuthoring: string[];
  extsConvertible: Record<string, string[]>;
  extsDocument: string[];
  extsDiagram: string[];
  extsImage: string[];
  extsImagePreviewed: string[];
  extsMediaPreviewed: string[];
  extsMustConvert: string[];
  extsPresentation: string[];
  extsSpreadsheet: string[];
  extsUploadable: string[];
  extsVideo: string[];
  extsWebCommented: string[];
  extsWebCustomFilterEditing: string[];
  extsWebEdited: string[];
  extsWebEncrypt: string[];
  extsWebPreviewed: string[];
  extsWebRestrictedEditing: string[];
  extsWebReviewed: string[];
  extsWebTemplate: string[];
  favoritesSection: boolean;
  fileDownloadUrlString: string;
  fileRedirectPreviewUrlString: string;
  fileThumbnailUrlString: string;
  fileWebEditorExternalUrlString: string;
  fileWebEditorUrlString: string;
  fileWebViewerExternalUrlString: string;
  fileWebViewerUrlString: string;
  forcesave: boolean;
  hideConfirmConvertOpen: boolean;
  hideConfirmConvertSave: boolean;
  internalFormats: {
    Document: string;
    Presentation: string;
    Spreadsheet: string;
    Pdf: string;
  };
  keepNewFileName: boolean;
  masterFormExtension: string;
  paramOutType: string;
  paramVersion: string;
  recentSection: boolean;
  storeForcesave: boolean;
  storeOriginalFiles: boolean;
  templatesSection: boolean;
  updateIfExist?: boolean;
  openEditorInSameTab: boolean;
  displayFileExtension: boolean;
  organizeRoomsGrouping: boolean;
  /** Whether the quick actions banner is shown (see PUT files/showquickactions). */
  showQuickActions: boolean;
  /** Whether the room lifetime confirmation dialog is hidden (see PUT files/hideconfirmroomlifetime). */
  hideConfirmRoomLifetime?: boolean;
  /** Whether the cancel-operation confirmation dialog is hidden (see PUT files/hideconfirmcanceloperation). */
  hideConfirmCancelOperation?: boolean;
  /** Extensions of files that can be vectorized (uploaded to AI rooms). */
  extsFilesVectorized?: string[];
};

export type TPresignedUri = {
  filetype: string;
  token: string;
  url: string;
};

export type TEditHistoryUser = {
  id: string;
  name: string;
};

export type TEditHistoryChanges = {
  created: string;
  user: TEditHistoryUser;
};

export type TEditHistory = {
  changes: TEditHistoryChanges[];
  changesHistory: string;
  created: string;
  id: number;
  key: string;
  serverVersion?: string;
  user: TEditHistoryUser;
  version: number;
  versionGroup: number;
};

export type TEditDiff = {
  changesUrl: string;
  fileType: string;
  key: string;
  previous: {
    fileType: string;
    key: string;
    url: string;
  };
  token: string;
  url: string;
  version: number;
};

export type TDocUser = {
  id: string;
  firstName: string;
  lastName: string;
  status: EmployeeStatus;
  activationStatus: EmployeeActivationStatus;
  workFromDate: Date;
  email: string;
  removed: boolean;
  lastModified: Date;
  tenantId: null;
  isActive: boolean;
  mobilePhoneActivationStatus: number;
  ldapQouta: number;
  createDate: Date;
  checkActivation: boolean;
};

export type TSharedUsers = {
  user: TDocUser;
  email: string;
  id: string;
  hasAccess: boolean;
  name: string;
};

export type TSendEditorNotify = {
  user: TUser;
  permissions: string;
};

export type TDocServiceLocation = {
  version: string;
  docServiceUrlApi: string;
  docServiceUrl: string;
  docServiceUrlInternal: string;
  docServicePortalUrl: string;
  docServiceSignatureHeader: string;
  docServiceSignatureSecret: string;
  isDefault: boolean;
  docServiceSslVerification: boolean;
  /** URL of the document server preload frame (returned by GET files/docservice). */
  docServicePreloadUrl?: string;
};

export type TFileLink = {
  access: ShareAccessRights;
  canEditAccess: boolean;
  canEditDenyDownload: boolean;
  canEditInternal: boolean;
  canRevoke: boolean;
  canEditExpirationDate: boolean;
  isLocked: boolean;
  isOwner: boolean;
  sharedTo: {
    denyDownload: boolean;
    id: string;
    isExpired: boolean;
    linkType: number;
    primary: boolean;
    requestToken: string;
    shareLink: string;
    title: string;
    expirationDate?: string | null;
    internal: boolean;
    password?: string;
    /** Whether the link is disabled (returned for room external links). */
    disabled?: boolean;
    /** Whether the link belongs to a room template (returned for room external links). */
    isTemplate?: boolean;
  };
  subjectType: number;
};

export type TFilesUsedSpace = {
  myDocumentsUsedSpace: {
    title: string;
    usedSpace: number;
  };
  trashUsedSpace: {
    title: string;
    usedSpace: number;
  };
  archiveUsedSpace: {
    title: string;
    usedSpace: number;
  };
  roomsUsedSpace: {
    title: string;
    usedSpace: number;
  };
};

export type TConnectingStorage = {
  name: string;
  key: string;
  connected: boolean;
  oauth: boolean;
  redirectUrl: string;
  clientId?: string;
  requiredConnectionUrl: boolean;
  providerKey?: string;
  isConnected?: boolean;
  id?: string;
  title?: string;
  oauthHref?: string;
  isOauth?: boolean;
};

export type TIndexItems = {
  order: string;
  entryType: number;
  entryId: number;
};

export type TConnectingStorages = TConnectingStorage[];

export type SettingsThirdPartyType = {
  id: string;
  title: string;
  providerId: string;
  providerKey: string;
};

export type TUploadBackup = {
  Message?: string;
  EndUpload: boolean;
  Success: boolean;
  ChunkSize: number;
};

export type TFormRoleMappingRequest = {
  formId: number;
  roles: {
    userId: string;
    roleName: string;
    roleColor: string;
    roomId: number;
  }[];
};

export type TFileFillingFormStatus = {
  user: TUser;
  stopedBy?: TUser;
  roleName: string;
  roleColor: string;
  roleStatus: FileFillingFormStatus;
  sequence: number;
  submitted: boolean;
  history?: Record<FillingFormStatusHistory, string>;
};

export type TShareToUser = {
  shareTo: string;
  access: ShareAccessRights;
};

export type TDefaultTemplate = {
  selectedFile?: number;
  fileExtension: string;
  lastModified?: string;
  fileTitle?: string;
  fileSize?: number;
  viewUrl?: string;
};

export type TFolderLogReportDateRange = {
  from: string;
  to: string;
};

export type TDocumentBuilderTask = {
  id: string;
  error: string;
  percentage: number;
  isCompleted: boolean;
  status: DistributedTaskStatus;
  resultFileId: number | string;
  resultFileName: string;
  resultFileUrl: string;
};

export type UpdateXlsxResponse = {
  form: TFile;
  isNewFile: boolean;
  task: {
    id: string;
    percentage: number;
    isCompleted: boolean;
    status: DistributedTaskStatus;
    error: string;
  };
};
