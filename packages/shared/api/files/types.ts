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

import type { TCreatedBy, TPathParts } from "../../types";
import type {
  EmployeeActivationStatus,
  EmployeeStatus,
  FileFillingFormStatus,
  FileStatus,
  FileType,
  FillingFormStatusHistory,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "../../enums";
import type { TUser } from "../people/types";
import type { TRoom } from "../rooms/types";

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
  EditForm: boolean;
  Comment: boolean;
  CreateRoomFrom: boolean;
  CopyLink: boolean;
  Embed: boolean;
};

export type TAvailableExternalRights = {
  Comment: boolean;
  CustomFilter: boolean;
  Editing: boolean;
  None: boolean;
  Read: boolean;
  Restrict: boolean;
  Review: boolean;
  FillForms: boolean;
};

export type TShareSettings = {
  ExternalLink?: number;
  PrimaryExternalLink?: number;
};

export type TFile = {
  isFile?: boolean;
  access: ShareAccessRights;
  canShare: boolean;
  comment: string;
  contentLength: string;
  created: string;
  createdBy: TCreatedBy;
  denyDownload?: boolean;
  denySharing?: boolean;
  fileExst: string;
  fileStatus: FileStatus;
  fileType: FileType;
  folderId: number;
  id: number;
  parentRoomType?: FolderType;
  shareSettings?: TShareSettings;
  mute: boolean;
  parentShared?: boolean;
  pureContentLength: number;
  rootFolderId: number;
  rootFolderType: FolderType;
  security: TFileSecurity;
  shared: boolean;
  thumbnailStatus: number;
  title: string;
  updated: string;
  updatedBy: TCreatedBy;
  version: number;
  versionGroup: number;
  viewAccessibility: TFileViewAccessibility;
  viewUrl: string;
  webUrl: string;
  shortWebUrl: string;
  availableExternalRights?: TAvailableExternalRights;
  providerId?: number;
  providerKey?: string;
  providerItem?: boolean;
  thumbnailUrl?: string;
  expired?: string;
  isForm?: boolean;
  isFolder?: boolean;
  formFillingStatus?: FileFillingFormStatus;
  startFilling?: boolean;
  fileEntryType: number;
  hasDraft?: boolean;
  order?: string;
  lockedBy?: string;
  originId?: number;
  originRoomId?: number;
  originRoomTitle?: string;
  originTitle?: string;
  requestToken?: string;
  isFavorite?: boolean;
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
  rootFolderType: FolderType;
  isArchive?: boolean;
  roomType?: RoomsType;
  path?: TPathParts[];
  type?: FolderType;
  isFolder?: boolean;
  indexing: boolean;
  denyDownload: boolean;
  fileEntryType: number;
  parentShared?: boolean;
  parentRoomType?: FolderType;
  order?: string;
  isRoom?: false;
  shareSettings?: TShareSettings;
  availableExternalRights?: TAvailableExternalRights;
  isFavorite?: boolean;
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
};

export type TFileLink = {
  access: ShareAccessRights;
  canEditAccess: boolean;
  canEditDenyDownload: boolean;
  canEditInternal: boolean;
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
