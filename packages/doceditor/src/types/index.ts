import {
  TDocServiceLocation,
  TFile,
  TFolder,
} from "@docspace/shared/api/files/types";
import { TUser } from "@docspace/shared/api/people/types";
import { TSettings } from "@docspace/shared/api/settings/types";
import { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import { TSelectedFileInfo } from "@docspace/shared/selectors/Files/FilesSelector.types";
import SocketIOHelper from "@docspace/shared/utils/socket";
import { ConflictResolveType } from "@docspace/shared/enums";

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
  goback: {
    url: string;
  };
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
}

export interface IResponse {
  config: IInitialConfig;
  editorUrl: TDocServiceLocation;
  user: TUser;
  settings: TSettings;
  successAuth: boolean;
  isSharingAccess: boolean;
  error?: unknown;
}

export interface EditorProps extends IResponse {}

export type TSaveAsEventData = {
  title: string;
  url: string;
  fileType: string;
};

export interface UseSelectFolderDialogProps {}

export interface SelectFolderDialogProps {
  socketHelper: SocketIOHelper;
  titleSelectorFolder: string;
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
}

export interface UseSocketHelperProps {
  socketUrl: string;
}

export interface UseI18NProps {
  settings: TSettings;
  user: TUser;
}

export interface UseThemeProps {
  user: TUser;
}
