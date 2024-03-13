import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";
import { DeviceType } from "@docspace/shared/enums";
import { TTheme } from "@docspace/shared/themes";
import SocketIOHelper from "@docspace/shared/utils/socket";

export type FilesSelectorProps = {
  isPanelVisible: boolean;
  // withoutImmediatelyClose: boolean;
  isThirdParty: boolean;
  rootThirdPartyId?: string;
  isRoomsOnly: boolean;
  isUserOnly: boolean;
  isRoomBackup: boolean;
  isEditorDialog: boolean;
  setMoveToPublicRoomVisible: (visible: boolean, operationData: object) => void;
  setBackupToPublicRoomVisible: (visible: boolean, data: object) => void;
  getIcon: (size: number, fileExst: string) => string;

  onClose?: () => void;

  id?: string | number;
  withSearch: boolean;
  withBreadCrumbs: boolean;
  withSubtitle: boolean;

  isMove?: boolean;
  isCopy?: boolean;
  isRestore: boolean;
  isRestoreAll?: boolean;
  isSelect?: boolean;
  isFormRoom?: boolean;

  filterParam?: string;

  currentFolderId: number;
  fromFolderId?: number;
  parentId: number;
  rootFolderType: number;

  treeFolders?: TFolder[];

  theme: TTheme;

  selection: (TFolder | TFile)[];
  disabledItems: string[] | number[];
  setMoveToPanelVisible: (value: boolean) => void;
  setRestorePanelVisible: (value: boolean) => void;
  setCopyPanelVisible: (value: boolean) => void;
  setRestoreAllPanelVisible: (value: boolean) => void;
  setMovingInProgress: (value: boolean) => void;
  setIsDataReady?: (value: boolean) => void;
  setSelected: (selected: "close" | "none", clearBuffer?: boolean) => void;
  setConflictDialogData: (conflicts: unknown, operationData: unknown) => void;
  itemOperationToFolder: (operationData: unknown) => Promise<void>;
  clearActiveOperations: (
    folderIds: string[] | number[],
    fileIds: string[] | number[],
  ) => void;
  checkFileConflicts: (
    selectedItemId: string | number | undefined,
    folderIds: string[] | number[],
    fileIds: string[] | number[],
  ) => Promise<unknown>;

  onSetBaseFolderPath?: (
    value: number | string | undefined | TBreadCrumb[],
  ) => void;
  onSetNewFolderPath?: (value: number | string | undefined) => void;
  onSelectFolder?: (
    value: number | string | undefined,
    breadCrumbs: TBreadCrumb[],
  ) => void;
  onSelectTreeNode?: (treeNode: TFolder) => void;
  onSave?: (
    e: unknown,
    folderId: string | number,
    fileTitle: string,
    openNewTab: boolean,
  ) => void;
  onSelectFile?: (
    fileInfo: {
      id: string | number;
      title: string;
      path?: string[];
      fileExst?: string;
      inPublic?: boolean;
    },
    breadCrumbs: TBreadCrumb[],
  ) => void;

  setInfoPanelIsMobileHidden: (arg: boolean) => void;

  withFooterInput: boolean;
  withFooterCheckbox: boolean;
  footerInputHeader?: string;
  currentFooterInputValue?: string;
  footerCheckboxLabel?: string;

  descriptionText?: string;
  setSelectedItems: () => void;

  includeFolder?: boolean;

  socketHelper: SocketIOHelper;
  socketSubscribers: Set<string>;
  currentDeviceType: DeviceType;

  embedded: boolean;
  withHeader: boolean;
  withCancelButton: boolean;
  cancelButtonLabel: string;
  acceptButtonLabel: string;
  settings: unknown;

  roomsFolderId?: number;
};
