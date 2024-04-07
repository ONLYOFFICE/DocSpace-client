// (c) Copyright Ascensio System SIA 2009-2024
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

import { TSelectorItem } from "../../components/selector";
import { TBreadCrumb } from "../../components/selector/Selector.types";
import {
  TFileSecurity,
  TFilesSettings,
  TFolder,
  TFolderSecurity,
} from "../../api/files/types";
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

  setIsInit: (value: boolean) => void;
  treeFolders?: TFolder[];
  isUserOnly?: boolean;
  setIsFirstLoad: (value: boolean) => void;
}

export interface UseLoadersHelperProps {}

export type UseSocketHelperProps = {
  socketHelper: SocketIOHelper;
  socketSubscribers: Set<string>;
  setItems: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
  setBreadCrumbs: React.Dispatch<React.SetStateAction<TBreadCrumb[]>>;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  disabledItems: (string | number)[];
  filterParam?: string;
  getIcon: (fileExst: string) => string;
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
  isInit: boolean;
  setIsInit: (value: boolean) => void;
  setIsFirstLoad: (value: boolean) => void;
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
  setIsInit: (value: boolean) => void;
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
  getIcon: (fileExst: string) => string;
  getFilesArchiveError: (name: string) => string;
  isInit: boolean;
  setIsFirstLoad: (value: boolean) => void;
};

export type TSelectedFileInfo = {
  id: number | string;
  title: string;
  path?: string[] | undefined;
  fileExst?: string | undefined;
  inPublic?: boolean | undefined;
} | null;

export type FilesSelectorProps = (
  | {
      getIcon: (size: number, fileExst: string) => string;
      filesSettings?: never;
    }
  | { getIcon?: never; filesSettings: TFilesSettings }
) & {
  socketHelper: SocketIOHelper;
  socketSubscribers: Set<string>;
  disabledItems: string[] | number[];
  filterParam?: string;
  withoutBackButton: boolean;
  withBreadCrumbs: boolean;
  withSearch: boolean;
  cancelButtonLabel: string;

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
  parentId?: number | string;
  rootFolderType: FolderType;
  onCancel: () => void;
  onSubmit: (
    selectedItemId: string | number | undefined,
    folderTitle: string,
    isPublic: boolean,
    breadCrumbs: TBreadCrumb[],
    fileName: string,
    isChecked: boolean,
    selectedTreeNode: TFolder,
    selectedFileInfo: TSelectedFileInfo,
  ) => void | Promise<void>;
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
  submitButtonLabel: string;
  withCancelButton: boolean;
  withFooterInput: boolean;
  withFooterCheckbox: boolean;
  footerInputHeader: string;
  currentFooterInputValue: string;
  footerCheckboxLabel: string;
  descriptionText: string;
  submitButtonId?: string;
  cancelButtonId?: string;
  embedded?: boolean;
  isPanelVisible: boolean;
  currentDeviceType: DeviceType;
  getFilesArchiveError: (name: string) => string;
};
