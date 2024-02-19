import {
  TDocServiceLocation,
  TFile,
  TFileSecurity,
  TFolder,
  TFolderSecurity,
  TGetReferenceData,
  TGetReferenceDataRequest,
  TSharedUsers,
} from "@docspace/shared/api/files/types";
import { TUser } from "@docspace/shared/api/people/types";
import { TSettings } from "@docspace/shared/api/settings/types";
import { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";
import SocketIOHelper from "@docspace/shared/utils/socket";
import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import { Nullable, TPathParts, TTranslation } from "@docspace/shared/types";
import { TTheme } from "@docspace/shared/themes";
import { i18n } from "i18next";

export type TGoBack = {
  requestClose: boolean;
  text?: string;
  blank?: boolean;
  url?: string;
};

export type TDocumentInfoSharingSettings = {
  user: string;
  permissions: string;
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
  editorType: number;
  editorUrl: string;
  file: TFile;
  token: string;
  type: string;
  Error?: string;
  errorMessage?: string;
}

export type TError = {
  message: "unauthorized" | "restore-backup" | string;
  status?: number | string;
};

export type TResponse =
  | {
      config: IInitialConfig;
      editorUrl: TDocServiceLocation;
      user: TUser;
      settings: TSettings;
      successAuth: boolean;
      isSharingAccess: boolean;
      error?: TError;
      doc?: string;
    }
  | {
      error: TError;
      config?: undefined;
      editorUrl?: undefined;
      user?: undefined;
      settings?: undefined;
      successAuth?: undefined;
      isSharingAccess?: undefined;
      doc?: undefined;
    };

export type EditorProps = {
  config: IInitialConfig;
  successAuth: boolean;
  user: TUser;
  view: boolean;
  doc?: string;
  documentserverUrl: string;
  fileInfo: TFile;
  t: TTranslation | null;
  onSDKRequestSaveAs: (event: object) => void;
  onSDKRequestInsertImage: (event: object) => void;
  onSDKRequestSelectSpreadsheet: (event: object) => void;
  onSDKRequestSelectDocument: (event: object) => void;
  onSDKRequestReferenceSource: (event: object) => void;
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
};

export type TEvent = {
  data: TEventData;
};

export interface UseSelectFolderDialogProps {}

export interface UseSelectFileDialogProps {
  instanceId: string;
}

export interface SelectFolderDialogProps {
  socketHelper: SocketIOHelper;
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
  t: TTranslation | null;
  i18n: i18n;
}

export interface SelectFileDialogProps {
  socketHelper: SocketIOHelper;
  fileTypeDetection: {
    isSelect: boolean;
    filterParam: FilesSelectorFilterTypes;
  };
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
  t: TTranslation | null;
  i18n: i18n;
}

export interface UseSocketHelperProps {
  socketUrl: string;
}

export interface UseEventsProps {
  user: TUser;
  successAuth: boolean;
  fileInfo: TFile;
  config: IInitialConfig;
  doc?: string;
  t?: Nullable<TTranslation>;
}

export interface UseInitProps {
  config: IInitialConfig;
  successAuth: boolean;
  fileInfo: TFile;
  user: TUser;
  t: Nullable<TTranslation>;

  setDocTitle: (value: string) => void;
  documentReady: boolean;
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
    history?: {};
    error?: string;
  }) => void;
  setHistoryData?: (obj: THistoryData) => void;
  setActionLink: (link: string) => void;
  setUsers?: ({ c, users }: { c: string; users: TSharedUsers[] }) => void;
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
