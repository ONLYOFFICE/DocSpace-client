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

import type { TSelectorItem } from "../../components/selector";
import {
  TBreadCrumb,
  TInfoBar,
  TSelectorHeader,
} from "../../components/selector/Selector.types";
import {
  TFile,
  TFileSecurity,
  TFilesSettings,
  TFolder,
  TFolderSecurity,
} from "../../api/files/types";
import {
  ApplyFilterOption,
  DeviceType,
  FolderType,
  RoomsType,
  FileType,
} from "../../enums";
import { TRoom, TRoomSecurity } from "../../api/rooms/types";
import { Nullable } from "../../types";

export type TCreateDefineRoom = {
  label: string;
  type: RoomsType;
};

export type FormPropsType = {
  message: string;
  isRoomFormAccessible: boolean;
};

export interface UseRootHelperProps {
  setBreadCrumbs: React.Dispatch<React.SetStateAction<TBreadCrumb[]>>;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  setItems: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;

  setHasNextPage: React.Dispatch<React.SetStateAction<boolean>>;

  setIsInit: (value: boolean) => void;
  treeFolders?: TFolder[];
  isUserOnly?: boolean;
}

export type UseSocketHelperProps = {
  setItems: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
  setBreadCrumbs: React.Dispatch<React.SetStateAction<TBreadCrumb[]>>;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  disabledItems: (string | number)[];
  filterParam?: string | number;
  withCreate: boolean;
};

export type UseRoomsHelperProps = {
  setBreadCrumbs: React.Dispatch<React.SetStateAction<TBreadCrumb[]>>;
  setHasNextPage: (value: boolean) => void;
  setTotal: (value: number) => void;
  setItems: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
  setIsRoot: (value: boolean) => void;
  searchValue?: string;
  isRoomsOnly: boolean;
  onSetBaseFolderPath?: (
    value: number | string | undefined | TBreadCrumb[],
  ) => void;
  isInit: boolean;
  setIsInit: (value: boolean) => void;
  withCreate: boolean;
  createDefineRoomLabel?: string;
  createDefineRoomType?: RoomsType;
  getRootData?: () => Promise<void>;
  setSelectedItemType: React.Dispatch<
    React.SetStateAction<"rooms" | "files" | undefined>
  >;
  setSelectedItemSecurity: React.Dispatch<
    React.SetStateAction<
      TRoomSecurity | TFileSecurity | TFolderSecurity | undefined
    >
  >;
  subscribe: (id: number) => void;
  withInit?: boolean;
};

export type UseFilesHelpersProps = {
  roomsFolderId?: number;
  setBreadCrumbs: React.Dispatch<React.SetStateAction<TBreadCrumb[]>>;
  setIsSelectedParentFolder: (value: boolean) => void;
  setHasNextPage: (value: boolean) => void;
  setTotal: (value: number) => void;
  setItems: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
  selectedItemId: string | number | undefined;
  setIsRoot: (value: boolean) => void;
  setIsInit: (value: boolean) => void;
  searchValue?: string;
  disabledItems: (string | number)[];
  setSelectedItemSecurity: (value: TFileSecurity | TFolderSecurity) => void;
  isThirdParty: boolean;
  setSelectedTreeNode: (treeNode: TFolder) => void;
  filterParam?: string | number;
  getRootData?: () => Promise<void>;
  onSetBaseFolderPath?: (
    value: number | string | undefined | TBreadCrumb[],
  ) => void;
  isRoomsOnly: boolean;
  isUserOnly?: boolean;
  rootThirdPartyId?: string;
  getRoomList?: (
    startIndex: number,
    search?: string | null,
    isInit?: boolean,
    isErrorPath?: boolean,
  ) => Promise<void>;

  getFilesArchiveError: (name: string) => string;
  isInit: boolean;
  withCreate: boolean;
  shareKey?: string;
  setSelectedItemId: (value: number | string) => void;
  setSelectedItemType: (value?: "rooms" | "files") => void;

  withInit?: boolean;

  applyFilterOption?: ApplyFilterOption;
};

export type TUseInputItemHelper = {
  withCreate: boolean;
  selectedItemId?: string | number | undefined;
  setItems: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
};

export type TSelectedFileInfo = {
  id: number | string;
  title: string;
  path?: string[] | undefined;
  fileExst?: string | undefined;
  fileType?: FileType | undefined;
  inPublic?: boolean | undefined;
} | null;

export type TGetIcon = (size: number, fileExst: string) => string;

export type TFilesSelectorInit =
  | {
      withInit: true;
      initTotal: number;
      initHasNextPage: boolean;
      initItems: TRoom[] | (TFolder | TFile)[];
      initBreadCrumbs: TBreadCrumb[];
      initSelectedItemType: "rooms" | "files";
      initSelectedItemId: string | number;
      initSearchValue?: Nullable<string>;
    }
  | {
      withInit?: never;
      initItems?: never;
      initTotal?: never;
      initHasNextPage?: never;
      initSearchValue?: never;
      initSelectedItemType?: never;
      initSelectedItemId?: never;
      initBreadCrumbs?: never;
    };

export type FilesSelectorProps = TSelectorHeader &
  TInfoBar &
  TFilesSelectorInit &
  (
    | {
        getIcon: TGetIcon;
        filesSettings?: TFilesSettings;
      }
    | { getIcon?: never; filesSettings: TFilesSettings }
  ) & {
    disabledItems: (string | number)[];
    filterParam?: string | number;
    withoutBackButton: boolean;
    withBreadCrumbs: boolean;
    withSearch: boolean;
    cancelButtonLabel: string;
    shareKey?: string;

    treeFolders?: TFolder[];
    onSetBaseFolderPath?: (
      value: number | string | undefined | TBreadCrumb[],
    ) => void;
    isUserOnly?: boolean;
    openRoot?: boolean;
    isRoomsOnly: boolean;
    isThirdParty: boolean;
    rootThirdPartyId?: string;
    roomsFolderId?: number;
    currentFolderId: number | string;
    parentId?: number | string;
    rootFolderType: FolderType;
    folderIsShared?: boolean;
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
      isDisabledFolder?: boolean,
    ) => boolean;
    setIsDataReady?: (value: boolean) => void;
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

    withCreate: boolean;
    createDefineRoomLabel?: string;
    createDefineRoomType?: RoomsType;
    formProps?: FormPropsType;
    withPadding?: boolean;
    checkCreating?: boolean;

    applyFilterOption?: ApplyFilterOption;
  };
