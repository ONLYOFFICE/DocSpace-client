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
  TFile,
  TFileSecurity,
  TFilesSettings,
  TFolder,
  TFolderSecurity,
  TGetReferenceData,
  TGetReferenceDataRequest,
  TSharedUsers,
} from "@docspace/shared/api/files/types";
import { TUser } from "@docspace/shared/api/people/types";
import { TSettings } from "@docspace/shared/api/settings/types";
import {
  HeaderProps,
  TBreadCrumb,
} from "@docspace/shared/components/selector/Selector.types";
import { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";
import type {
  ConflictResolveType,
  FilesSelectorFilterTypes,
  RoomsType,
  StartFillingMode,
} from "@docspace/shared/enums";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import { TTranslation } from "@docspace/shared/types";
import { TFrameConfig } from "@docspace/shared/types/Frame";

export type TGoBack = {
  requestClose: boolean;
  text?: string;
  blank?: boolean;
  url?: string;
};

export type ActionType = "view" | "edit" | "fill";

export type TDocumentInfoSharingSettings = {
  user: string;
  permissions: string;
};

export type SdkSearchParams = {
  locale?: string | null | undefined;
  theme?: string | undefined;
  editorGoBack?: boolean | "event";
  is_file?: boolean;
  isSDK?: boolean;
};

export type RootPageProps = {
  searchParams: Promise<
    Partial<{
      fileId: string;
      fileid: string;
      version: string;
      doc: string;
      action: ActionType;
      share: string;
      editorType: string;
      error?: string;
    }> &
      SdkSearchParams
  >;
};
export type TDocumentInfo = {
  favorite: boolean;
  folder: string;
  owner: string;
  sharingSettings: TDocumentInfoSharingSettings[];
  type: number;
  uploaded: string;
};

export type TDocumentPermissions = {
  changeHistory: boolean;
  comment: boolean;
  copy: boolean;
  download: boolean;
  edit: boolean;
  fillForms: boolean;
  modifyFilter: boolean;
  print: boolean;
  rename: boolean;
  review: boolean;
};

export type TDocument = {
  fileType: string;
  info: TDocumentInfo;
  isLinkedForMe: boolean;
  key: string;
  permissions: TDocumentPermissions;
  referenceData: {
    fileKey: string;
    instanceId: string;
    key: string;
    roomId: string;
    canEditRoom: boolean;
  };
  title: string;
  token: string;
  url: string;
};

export type TDocumentType = "word";

export type TEditorConfigCustomization = {
  about: boolean;
  customer: {
    address: string;
    logo: string;
    mail: string;
    name: string;
    www: string;
  };
  feedback: boolean;
  forcesave: boolean;
  goback: TGoBack;
  logo: {
    image: string;
    imageDark: string;
    url: string;
  };
  mentionShare: boolean;
  submitForm: boolean;
};

export type TEditorConfigMode = "edit" | "view";

export type TEditorConfigEmbedded = {
  fullscreenUrl: string;
  saveUrl: string;
  toolbarDocked: string;
  embedUrl?: string;
  shareUrl?: string;
};

export type TEditorConfig = {
  callbackUrl: string;
  canCoAuthoring: boolean;
  canHistoryClose: boolean;
  canHistoryRestore: boolean;
  canMakeActionLink: boolean;
  canRename: boolean;
  canRequestClose: boolean;
  canRequestCompareFile: boolean;
  canRequestCreateNew: boolean;
  canRequestEditRights: boolean;
  canRequestInsertImage: boolean;
  canRequestMailMergeRecipients: boolean;
  canRequestReferenceData: boolean;
  canRequestSaveAs: boolean;
  canRequestSendNotify: boolean;
  canRequestSharingSettings: boolean;
  canRequestUsers: boolean;
  canSendEmailAddresses: boolean;
  canUseHistory: boolean;
  createUrl: string;
  customization: TEditorConfigCustomization;
  embedded: TEditorConfigEmbedded;
  lang: string;
  mergeFolderUrl?: unknown;
  mode: TEditorConfigMode;
  modeWrite: boolean;
  plugins: {
    pluginsData: [];
  };
  recent: [];
  templates: [];
  user: { id: string; name: string };
  encryptionKeys?: { [key: string]: string | boolean };
};

export interface IInitialConfig {
  document: TDocument;
  documentType: TDocumentType;
  editorConfig: TEditorConfig;
  editorType: string;
  editorUrl: string;
  file: TFile;
  token: string;
  type: string;
  Error?: string;
  errorMessage?: string;
  message?: undefined;
  startFilling?: boolean;
  startFillingMode?: StartFillingMode;
  fillingSessionId?: string;
  fillingStatus?: boolean;
}

export type TError = {
  message?: "unauthorized" | "restore-backup" | string;
  status?: "not-found" | "access-denied" | number | string;
  type?: string;
  editorUrl?: string;
};

export type TResponse =
  | {
      config: IInitialConfig;

      user?: TUser;
      settings?: TSettings;
      successAuth: boolean;
      isSharingAccess: boolean;
      error?: TError;
      doc?: string;
      fileId?: string;
      hash?: string;
      shareKey?: string;
      deepLinkSettings?: number;
      baseSdkConfig?: TFrameConfig;
    }
  | {
      error: TError;
      config?: undefined;

      user?: undefined;
      settings?: undefined;
      successAuth?: undefined;
      isSharingAccess?: undefined;
      doc?: undefined;
      fileId?: string;
      hash?: string;
      shareKey?: string;
      deepLinkSettings?: number;
      baseSdkConfig?: TFrameConfig;
    };

export type EditorProps = {
  config?: IInitialConfig;
  successAuth?: boolean;
  user?: TUser;
  doc?: string;
  documentServerUrl: string;
  fileInfo?: TFile;
  sdkConfig?: TFrameConfig | null;
  isSharingAccess?: boolean;
  errorMessage?: string;
  isSkipError?: boolean;
  filesSettings?: TFilesSettings;
  organizationName?: string;
  shareKey?: string;

  onDownloadAs?: (obj: object) => void;
  openShareFormDialog?: () => void;
  onSDKRequestSharingSettings?: () => void;
  onSDKRequestSaveAs?: (event: object) => void;
  onSDKRequestInsertImage?: (event: object) => void;
  onSDKRequestSelectSpreadsheet?: (event: object) => void;
  onSDKRequestSelectDocument?: (event: object) => void;
  onSDKRequestReferenceSource?: (event: object) => void;
  onStartFillingVDRPanel?: (roles: TFormRole[]) => void;
  setFillingStatusDialogVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  onStartFilling?: VoidFunction;
};

export type TEventData = {
  title?: string;
  url?: string;
  fileType?: string;
  referenceData?: TGetReferenceData;
  windowName?: string;
  path?: string;
  actionLink?: string;
  message?: string;
  emails?: string[];
  c?: string;
  version?: number;
  link?: string;
};

export type TEvent = {
  data: TEventData;
};

export interface UseSelectFileDialogProps {
  instanceId: string;
}

export interface SelectFolderDialogProps {
  titleSelectorFolder: string;
  isVisible: boolean;
  getIsDisabled: (
    isFirstLoad: boolean,
    isSelectedParentFolder: boolean,
    selectedItemId: string | number | undefined,
    selectedItemType: "rooms" | "files" | undefined,
    isRoot: boolean,
    selectedItemSecurity:
      | TFileSecurity
      | TFolderSecurity
      | TRoomSecurity
      | undefined,
    selectedFileInfo: TSelectedFileInfo,
  ) => boolean;
  onClose: () => void;
  onSubmit: (
    selectedItemId: string | number | undefined,
    folderTitle: string,
    isPublic: boolean,
    breadCrumbs: TBreadCrumb[],
    fileName: string,
    isChecked: boolean,
    selectedTreeNode: TFolder,
    selectedFileInfo: TSelectedFileInfo,
  ) => Promise<void>;
  fileInfo: TFile;
  filesSettings: TFilesSettings;
  fileSaveAsExtension?: string;
  selectedFolderId?: string | number;
}

export interface SelectFileDialogProps {
  fileTypeDetection: {
    isSelect: boolean;
    filterParam: FilesSelectorFilterTypes;
  };
  shareKey?: string;
  getIsDisabled: (
    isFirstLoad: boolean,
    isSelectedParentFolder: boolean,
    selectedItemId: string | number | undefined,
    selectedItemType: "rooms" | "files" | undefined,
    isRoot: boolean,
    selectedItemSecurity:
      | TFileSecurity
      | TFolderSecurity
      | TRoomSecurity
      | undefined,
    selectedFileInfo: TSelectedFileInfo,
  ) => boolean;
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (
    selectedItemId: string | number | undefined,
    folderTitle: string,
    isPublic: boolean,
    breadCrumbs: TBreadCrumb[],
    fileName: string,
    isChecked: boolean,
    selectedTreeNode: TFolder,
    selectedFileInfo: TSelectedFileInfo,
  ) => Promise<void>;
  fileInfo: TFile;
  filesSettings: TFilesSettings;
  selectedFolderId?: string | number;
}

export interface UseSocketHelperProps {
  socketUrl: string;
  user?: TUser;
  shareKey?: string;
  standalone?: boolean;
}

export interface UseEventsProps {
  user?: TUser;
  successAuth?: boolean;
  fileInfo?: TFile;
  config?: IInitialConfig;
  doc?: string;
  errorMessage?: string;
  isSkipError?: boolean;
  openOnNewPage: boolean;
  t: TTranslation;

  sdkConfig?: TFrameConfig | null;
  organizationName: string;
  shareKey?: string;
  setFillingStatusDialogVisible?: React.Dispatch<React.SetStateAction<boolean>>;
  openShareFormDialog?: VoidFunction;
  onStartFillingVDRPanel?: (roles: TFormRole[]) => void;
}

export interface UseInitProps {
  config?: IInitialConfig;
  successAuth?: boolean;
  fileInfo?: TFile;
  user?: TUser;
  t: TTranslation;

  setDocTitle: (value: string) => void;
  documentReady: boolean;
  organizationName: string;
}

export type THistoryData =
  | {
      url: string;
      version: string | number;
      key: string;
      fileType: string;
      changesUrl?: string;
      previous?: { fileType: string; key: string; url: string };
      token?: string;
    }
  | { error: string; version: string | number };

export type TDocEditor = {
  setReferenceData?: (data: TGetReferenceDataRequest) => void;
  showMessage?: (data: string) => void;
  refreshHistory?: ({
    currentVersion,
    history,
  }: {
    currentVersion?: number;
    history?: object;
    error?: string;
  }) => void;
  setHistoryData?: (obj: THistoryData) => void;
  setActionLink: (link: string) => void;
  setUsers?: ({ c, users }: { c: string; users: TSharedUsers[] }) => void;
  startFilling?: VoidFunction;
  requestRoles?: VoidFunction;
  setFavorite?: (favorite: boolean) => void;
};

export type TCatchError =
  | {
      response: {
        data: {
          status?: number | string;
          statusCode?: number | string;
          error: {
            message: string;
          };
        };
      };
    }
  | { statusText: string }
  | { message: string }
  | string;

export type StartFillingSelectorDialogProps = {
  fileInfo: TFile;
  isVisible: boolean;
  onClose: VoidFunction;
  header: HeaderProps;

  getIsDisabled: (
    isFirstLoad: boolean,
    isSelectedParentFolder: boolean,
    selectedItemId: string | number | undefined,
    selectedItemType: "rooms" | "files" | undefined,
    isRoot: boolean,
    selectedItemSecurity:
      | TFileSecurity
      | TFolderSecurity
      | TRoomSecurity
      | undefined,
    selectedFileInfo: TSelectedFileInfo,
  ) => boolean;

  onSubmit: (
    selectedItemId: string | number | undefined,
    folderTitle: string,
    isPublic: boolean,
    breadCrumbs: TBreadCrumb[],
    fileName: string,
    isChecked: boolean,
    selectedTreeNode: TFolder,
    selectedFileInfo: TSelectedFileInfo,
  ) => Promise<void>;

  filesSettings: TFilesSettings;
  createDefineRoomType: RoomsType;
};

export type ConflictStateType = {
  visible: boolean;
  resolve: (
    value: ConflictResolveType | PromiseLike<ConflictResolveType>,
  ) => void;
  reject: (reason?: unknown) => void;
  fileName: string;
  folderName: string;
};

export type TFormRole = {
  name: string;
  color: string;
};
