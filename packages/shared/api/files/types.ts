import { TCreatedBy, TPathParts } from "../../types";
import { TUser } from "../people/types";
import {
  EmployeeActivationStatus,
  EmployeeStatus,
  FileStatus,
  FileType,
  FolderType,
  RoomsType,
  ShareAccessRights,
} from "../../enums";

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
};

export type TFile = {
  access: ShareAccessRights;
  canShare: boolean;
  comment: string;
  contentLength: string;
  created: Date;
  createdBy: TCreatedBy;
  denyDownload: boolean;
  denySharing: boolean;
  fileExst: string;
  fileStatus: FileStatus;
  fileType: FileType;
  folderId: number;
  id: number;
  mute: boolean;
  pureContentLength: number;
  rootFolderId: number;
  rootFolderType: FolderType;
  security: TFileSecurity;
  shared: boolean;
  thumbnailStatus: number;
  title: string;
  updated: Date;
  updatedBy: TCreatedBy;
  version: number;
  versionGroup: number;
  viewAccessibility: TFileViewAccessibility;
  viewUrl: string;
  webUrl: string;
};

export type TOpenEditRequest = {
  documentType: string;
  editorUrl: string;
  token: string;
  type: string;
  file: TFile;
  errorMessage: string;
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
  created: Date;
  createdBy: TCreatedBy;
  updated: Date;
  updatedBy: TCreatedBy;
  rootFolderType: FolderType;
  isArchive?: boolean;
  roomType?: RoomsType;
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

export type TOperation = {
  Operation: number;
  error: string;
  finished: boolean;
  id: string;
  processed: string;
  progress: number;
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

export type TFilesSettings = {
  automaticallyCleanUp: {
    gap: number;
    isAutoCleanUp: boolean;
  };
  canSearchByContent: boolean;
  chunkUploadSize: number;
  chunkUploadCount: number;
  confirmDelete: boolean;
  convertNotify: boolean;
  defaultOrder: { is_asc: boolean; property: 1 };
  defaultSharingAccessRights: ShareAccessRights[];
  downloadTarGz: boolean;
  enableThirdParty: boolean;
  externalShare: boolean;
  externalShareSocialMedia: boolean;
  extsArchive: string[];
  extsAudio: string[];
  extsCoAuthoring: string[];
  extsConvertible: string[];
  extsDocument: string[];
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
  };
  keepNewFileName: boolean;
  masterFormExtension: string;
  paramOutType: string;
  paramVersion: string;
  recentSection: boolean;
  storeForcesave: boolean;
  storeOriginalFiles: boolean;
  templatesSection: boolean;
  updateIfExist: boolean;
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
  created: Date;
  user: TEditHistoryUser;
};

export type TEditHistory = {
  changes: TEditHistoryChanges[];
  changesHistory: string;
  created: Date;
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
  isDefault: boolean;
};

export type TFileLink = {
  access: ShareAccessRights;
  canEditAccess: boolean;
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
  };
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
