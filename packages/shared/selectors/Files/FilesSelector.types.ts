import { TSelectorItem } from "../../components/selector";
import { TBreadCrumb } from "../../components/selector/Selector.types";
import { TFileSecurity, TFolder, TFolderSecurity } from "../../api/files/types";
import SocketIOHelper from "../../utils/socket";
import { DeviceType, FolderType } from "../../enums";
import { TRoomSecurity } from "../../api/rooms/types";

export interface UseRootHelperProps {
  setBreadCrumbs: React.Dispatch<React.SetStateAction<TBreadCrumb[]>>;
  setIsBreadCrumbsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  setItems: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;

  setIsNextPageLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setHasNextPage: React.Dispatch<React.SetStateAction<boolean>>;

  treeFolders?: TFolder[];
  isUserOnly?: boolean;
}

export interface UseLoadersHelperProps {
  items: TSelectorItem[] | null;
}

export type UseSocketHelperProps = {
  socketHelper: SocketIOHelper;
  socketSubscribers: Set<string>;
  setItems: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
  setBreadCrumbs: React.Dispatch<React.SetStateAction<TBreadCrumb[]>>;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  disabledItems: string[] | number[];
  filterParam?: string;
  getIcon: (size: number, fileExst: string) => string;
};

export type UseRoomsHelperProps = {
  setBreadCrumbs: (items: TBreadCrumb[]) => void;
  setIsBreadCrumbsLoading: (value: boolean) => void;
  setIsNextPageLoading: (value: boolean) => void;
  setHasNextPage: (value: boolean) => void;
  setTotal: (value: number) => void;
  setItems: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
  isFirstLoad: boolean;
  setIsRoot: (value: boolean) => void;
  searchValue?: string;
  isRoomsOnly: boolean;
  onSetBaseFolderPath?: (
    value: number | string | undefined | TBreadCrumb[],
  ) => void;
};

export type UseFilesHelpersProps = {
  roomsFolderId?: number;
  setBreadCrumbs: (items: TBreadCrumb[]) => void;
  setIsBreadCrumbsLoading: (value: boolean) => void;
  setIsSelectedParentFolder: (value: boolean) => void;
  setIsNextPageLoading: (value: boolean) => void;
  setHasNextPage: (value: boolean) => void;
  setTotal: (value: number) => void;
  setItems: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
  isFirstLoad: boolean;
  selectedItemId: string | number | undefined;
  setIsRoot: (value: boolean) => void;
  searchValue?: string;
  disabledItems: string[] | number[];
  setSelectedItemSecurity: (value: TFileSecurity | TFolderSecurity) => void;
  isThirdParty: boolean;
  setSelectedTreeNode: (treeNode: TFolder) => void;
  filterParam?: string;
  getRootData?: () => Promise<void>;
  onSetBaseFolderPath?: (
    value: number | string | undefined | TBreadCrumb[],
  ) => void;
  isRoomsOnly: boolean;
  rootThirdPartyId?: string;
  getRoomList?: (
    startIndex: number,
    search?: string | null,
    isInit?: boolean,
    isErrorPath?: boolean,
  ) => Promise<void>;
  getIcon: (size: number, fileExst: string) => string;
  getFilesArchiveError: (name: string) => string;
};

export type TSelectedFileInfo = {
  id: number | string;
  title: string;
  path?: string[] | undefined;
  fileExst?: string | undefined;
  inPublic?: boolean | undefined;
} | null;

export interface FilesSelectorProps {
  socketHelper: SocketIOHelper;
  socketSubscribers: Set<string>;
  disabledItems: string[] | number[];
  filterParam?: string;
  getIcon: (size: number, fileExst: string) => string;
  treeFolders?: TFolder[];
  onSetBaseFolderPath?: (
    value: number | string | undefined | TBreadCrumb[],
  ) => void;
  isUserOnly?: boolean;
  isRoomsOnly: boolean;
  isThirdParty: boolean;
  rootThirdPartyId?: string;
  roomsFolderId?: number;
  currentFolderId: number | string;
  parentId: number | string;
  rootFolderType: FolderType;

  onClose: () => void;
  onAccept: (
    selectedItemId: string | number | undefined,
    folderTitle: string,
    isPublic: boolean,
    breadCrumbs: TBreadCrumb[],
    fileName: string,
    isChecked: boolean,
    selectedTreeNode: TFolder,
    selectedFileInfo: TSelectedFileInfo,
  ) => void;

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
  setIsDataReady?: (value: boolean) => void;
  withHeader: boolean;
  headerLabel: string;
  searchPlaceholder: string;
  acceptButtonLabel: string;
  withCancelButton: boolean;
  cancelButtonLabel: string;
  onCloseAction: () => void;
  emptyScreenHeader: string;
  emptyScreenDescription: string;
  searchEmptyScreenHeader: string;
  searchEmptyScreenDescription: string;
  withFooterInput: boolean;
  withFooterCheckbox: boolean;
  footerInputHeader: string;
  currentFooterInputValue: string;
  footerCheckboxLabel: string;
  descriptionText: string;
  acceptButtonId?: string;
  cancelButtonId?: string;
  embedded?: boolean;
  isPanelVisible: boolean;
  currentDeviceType: DeviceType;
  getFilesArchiveError: (name: string) => string;
}
