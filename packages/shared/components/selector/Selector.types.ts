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

import React from "react";
import {
  EmployeeStatus,
  EmployeeType,
  RoomsType,
  ShareAccessRights,
  FileType,
  FolderType,
} from "../../enums";
import { MergeTypes, Nullable, WithFlag } from "../../types";

import { TFileSecurity, TFolderSecurity } from "../../api/files/types";
import { TRoomSecurity, ICover } from "../../api/rooms/types";
import { TUserGroup } from "../../api/people/types";

import { AvatarRole } from "../avatar";
import { TTabItem } from "../tabs";

import { SelectorAccessRightsMode } from "./Selector.enums";

// header
type THeaderBackButton =
  | {
      onBackClick: () => void;
      withoutBackButton: false;
      withoutBorder: boolean;
    }
  | {
      onBackClick?: undefined;
      withoutBackButton?: undefined;
      withoutBorder?: undefined;
    };

export type TInfoBarData = {
  title: string;
  description: string;
  icon?: string;
  onClose?: VoidFunction;
};

export type TInfoBar = {
  withInfoBar?: boolean;
  infoBarData?: TInfoBarData;
};

export type InfoBarProps = {
  ref?: React.RefObject<HTMLDivElement | null>;
  visible: boolean;
  className?: string;
};

export type BreadCrumbsProps = {
  visible?: boolean;
};

export type HeaderProps = {
  headerLabel: string;
  onCloseClick: () => void;
  isCloseable?: boolean;
} & THeaderBackButton;

export type TSelectorHeader = WithFlag<
  "withHeader",
  {
    withHeader: true;
    headerProps: HeaderProps;
  }
>;

// bread crumbs
type TOnBreadCrumbClick = ({
  e,
  open,
  item,
}: {
  e: React.MouseEvent;
  open: boolean;
  item: TBreadCrumb;
}) => void;

export type TBreadCrumb = {
  id: string | number;
  label: string;
  isRoom?: boolean;
  minWidth?: string;
  roomType?: RoomsType;
  shared?: boolean;
  onClick?: TOnBreadCrumbClick;
  rootFolderType?: FolderType;
};

export type TDisplayedItem = {
  id: string | number;
  label: string;
  isArrow: boolean;
  isList: boolean;
  isRoom?: boolean;
  listItems?: TBreadCrumb[];
};

export type TSelectorBreadCrumbs = WithFlag<
  "withBreadCrumbs",
  {
    withBreadCrumbs: true;
    isBreadCrumbsLoading: boolean;
    breadCrumbs: TBreadCrumb[];
    breadCrumbsLoader: React.ReactNode;
    onSelectBreadCrumb: (item: TBreadCrumb) => void;
    bodyIsLoading: boolean;
  }
>;

// tabs
export type TSelectorTabs = WithFlag<
  "withTabs",
  {
    withTabs: true;
    tabsData: TTabItem[];
    activeTabId: string;
  }
>;

// select all
export type SelectAllProps = {
  show: boolean;
  isLoading: boolean;
  rowLoader: React.ReactNode;
};

export type TSelectorSelectAll = WithFlag<
  "withSelectAll",
  {
    withSelectAll: true;
    selectAllLabel: string;
    selectAllIcon: string;
    onSelectAll: () => void;
  }
>;
// search
export type SearchProps = {
  isSearch: boolean;
};

export type TSelectorSearch = WithFlag<
  "withSearch",
  {
    withSearch: true;
    searchLoader: React.ReactNode;
    isSearchLoading: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearch: (value: string, callback?: VoidFunction) => void;
    onClearSearch: (callback?: VoidFunction) => void;
  }
>;

// empty screen form room
export type EmptyScreenFormRoomProps = {
  onCreateClickAction: VoidFunction;
  createDefineRoomType: RoomsType;
};

// empty screen
export type EmptyScreenProps = {
  withSearch: boolean;

  items: TSelectorItem[];
  inputItemVisible: boolean;
};

export type TSelectorEmptyScreen = {
  emptyScreenImage: string;
  emptyScreenHeader: string;
  emptyScreenDescription: string;

  searchEmptyScreenImage: string;
  searchEmptyScreenHeader: string;
  searchEmptyScreenDescription: string;
};

// Pagination

type TSelectorPagination = {
  items: TSelectorItem[];
  rowLoader: React.ReactNode;
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  totalItems: number;
  isLoading: boolean;
};

// NewItem
export type NewItemProps = {
  label: string;
  style: React.CSSProperties;
  dropDownItems?: React.ReactElement[];
  onCreateClick?: VoidFunction;
  hotkey?: string;
  inputItemVisible?: boolean;
  listHeight: number;
};

// NewItemDropDown
export type NewItemDropDownProps = {
  dropDownItems: React.ReactElement[];
  isEmpty?: boolean;
  onCloseDropDown: (e?: MouseEvent) => void;
  listHeight?: number;
};

// InputItem
type TBaseInputProps = {
  style: React.CSSProperties;
  placeholder?: string;
  color?: string;
  icon?: string;
};

export type InputItemProps = TBaseInputProps & {
  defaultInputValue: string;
  onAcceptInput: (value: string) => void;
  onCancelInput: VoidFunction;
  roomType?: RoomsType;
  cover?: ICover;
  setInputItemVisible: (value: boolean) => void;
  setSavedInputValue: (value: Nullable<string>) => void;
};

// submit button
export type TOnSubmit = (
  selectedItems: TSelectorItem[],
  access: TAccessRight | null,
  fileName: string,
  isFooterCheckboxChecked: boolean,
) => void | Promise<void>;

export type TSelectorSubmitButton = {
  submitButtonLabel: string;
  disableSubmitButton: boolean;
  onSubmit: TOnSubmit;
  submitButtonId?: string;
};

type TSelectorFooterSubmitButton = Omit<TSelectorSubmitButton, "onSubmit"> & {
  onSubmit: (item?: TSelectorItem | React.MouseEvent) => Promise<void>;
};

// cancel button

export type TSelectorCancelButton = WithFlag<
  "withCancelButton",
  {
    withCancelButton: true;
    cancelButtonLabel: string;
    onCancel: () => void;
    cancelButtonId?: string;
  }
>;

// access rights

export type TAccessRight = {
  key: string;
  label: string;
  description?: string;
  access: string | number;
  isSeparator?: boolean;
};

type TWithAccessRightsProps = {
  withAccessRights: true;
  accessRights: TAccessRight[];
  selectedAccessRight: TAccessRight | null;
  onAccessRightsChange: (access: TAccessRight) => void;
  accessRightsMode?: SelectorAccessRightsMode;
};

export type TSelectorWithAside = WithFlag<
  "useAside",
  {
    useAside: true;
    onClose: VoidFunction;
    withoutBackground?: boolean;
    withBlur?: boolean;
  }
>;

export type TSelectorAccessRights = WithFlag<
  "withAccessRights",
  TWithAccessRightsProps
>;

export type AccessSelectorProps = Omit<
  TWithAccessRightsProps,
  "withAccessRights"
> & {
  footerRef: React.RefObject<HTMLDivElement | null>;
};

// footer input

export type TSelectorInput = WithFlag<
  "withFooterInput",
  {
    withFooterInput: true;
    footerInputHeader: string;
    currentFooterInputValue: string;
  }
>;

export type TSelectorFooterInput = TSelectorInput & {
  setNewFooterInputValue: React.Dispatch<React.SetStateAction<string>>;
};

// footer checkbox

export type TSelectorCheckbox = WithFlag<
  "withFooterCheckbox",
  {
    withFooterCheckbox: true;
    footerCheckboxLabel: string;
    isChecked: boolean;
  }
>;

export type TSelectorFooterCheckbox = TSelectorCheckbox & {
  setIsFooterCheckboxChecked: React.Dispatch<React.SetStateAction<boolean>>;
};

export type TSelectorInfo = WithFlag<
  "withInfo",
  {
    withInfo: true;
    infoText: string;
    withInfoBadge?: boolean;
  }
>;

export type TRenderCustomItem = (
  label: string,
  role?: string,
  email?: string,
  isGroup?: boolean,
  status?: EmployeeStatus,
) => React.ReactNode | null;

export type SelectorProps = TSelectorHeader &
  TInfoBar &
  TSelectorInfo &
  TSelectorTabs &
  TSelectorSelectAll &
  TSelectorEmptyScreen &
  TSelectorSearch &
  TSelectorBreadCrumbs &
  TSelectorSubmitButton &
  TSelectorCancelButton &
  TSelectorAccessRights &
  TSelectorInput &
  TSelectorCheckbox &
  TSelectorWithAside &
  TSelectorPagination & {
    id?: string;
    className?: string;
    style?: React.CSSProperties;

    onSelect?: (
      item: TSelectorItem,
      isDoubleClick: boolean,
      doubleClickCallback: () => Promise<void>,
    ) => void;

    isMultiSelect: boolean;
    selectedItems?: TSelectorItem[];

    disableFirstFetch?: boolean;
    loadNextPage: (startIndex: number) => Promise<void>;

    renderCustomItem?: TRenderCustomItem;

    alwaysShowFooter?: boolean;
    descriptionText?: string;

    withPadding?: boolean;
    injectedElement?: React.ReactElement;

    isSSR?: boolean;
    selectedItem?: TSelectorItem | null; // no multiSelect only
  };

export type BodyProps = TSelectorInfo &
  TSelectorPagination & {
    footerVisible: boolean;
    withHeader?: boolean;
    withPadding?: boolean;

    value?: string;

    isMultiSelect: boolean;

    inputItemVisible: boolean;
    setInputItemVisible: (value: boolean) => void;

    renderCustomItem?: TRenderCustomItem;
    onSelect: (item: TSelectorItem, isDoubleClick: boolean) => void;

    loadMoreItems: (startIndex: number) => void;

    withFooterInput?: boolean;
    withFooterCheckbox?: boolean;
    descriptionText?: string;
    withInfoBadge?: boolean;
    injectedElement?: React.ReactElement;

    isSSR?: boolean;
  };

export type FooterProps = TSelectorFooterSubmitButton &
  TSelectorCancelButton &
  TSelectorAccessRights &
  TSelectorFooterInput &
  TSelectorFooterCheckbox & {
    isMultiSelect: boolean;
    selectedItemsCount: number;
    requestRunning?: boolean;
  };

type TSelectorItemEmpty = {
  avatar?: undefined;
  color?: undefined;
  hasAvatar?: undefined;
  icon?: undefined;
  iconOriginal?: undefined;
  role?: undefined;
  email?: undefined;
  groups?: undefined;
  isOwner?: undefined;
  isAdmin?: undefined;
  isVisitor?: undefined;
  isCollaborator?: undefined;
  isRoomAdmin?: undefined;
  status?: undefined;
  access?: undefined;
  fileExst?: undefined;
  fileType?: undefined;
  shared?: undefined;
  parentId?: undefined;
  rootFolderType?: undefined;
  security?: undefined;
  isFolder?: undefined;
  filesCount?: undefined;
  foldersCount?: undefined;
  roomType?: undefined;
  isGroup?: undefined;
  name?: undefined;
  isCreateNewItem?: undefined;
  onCreateClick?: undefined;
  hotkey?: undefined;
  onBackClick?: undefined;
  dropDownItems?: undefined;
  isInputItem?: undefined;
  defaultInputValue?: undefined;
  onAcceptInput?: undefined;
  onCancelInput?: undefined;
  placeholder?: undefined;
  cover?: undefined;
  userType?: undefined;

  isRoomsOnly?: undefined;
  createDefineRoomType?: undefined;
};

export type TSelectorItemUser = MergeTypes<
  TSelectorItemEmpty,
  {
    email: string;
    isOwner: boolean;
    isAdmin: boolean;
    isVisitor: boolean;
    isCollaborator: boolean;
    isRoomAdmin: boolean;
    avatar: string;
    avatarSmall?: string;
    userName?: string;
    hasAvatar: boolean;
    role: AvatarRole;
    userType: EmployeeType;
    groups?: TUserGroup[];
    status: EmployeeStatus;
    access?: ShareAccessRights | string | number;
  }
>;

export type TSelectorItemFile = MergeTypes<
  TSelectorItemEmpty,
  {
    fileExst: string;
    fileType: FileType;
    parentId: string | number;
    rootFolderType: string | number;
    security: TFileSecurity;
    icon: string;
  }
>;

export type TSelectorItemFolder = MergeTypes<
  TSelectorItemEmpty,
  {
    isFolder: boolean;
    parentId: string | number;
    rootFolderType: string | number;
    filesCount: number;
    foldersCount: number;
    security: TFolderSecurity;
    icon?: string;
    avatar?: string;
  }
>;

export type TSelectorItemRoom = MergeTypes<
  TSelectorItemEmpty,
  {
    isFolder: boolean;
    roomType: RoomsType;
    shared: boolean;
    parentId: string | number;
    rootFolderType: string | number;
    filesCount: number;
    foldersCount: number;
    security: TRoomSecurity;
    icon?: string;
    color?: string;
    iconOriginal?: string;
    cover?: ICover;
    tags?: string[];
    title?: string;
  }
>;

export type TSelectorItemGroup = MergeTypes<
  TSelectorItemEmpty,
  {
    isGroup: boolean;
    name: string;
  }
>;

export type TSelectorItemNew = MergeTypes<
  TSelectorItemEmpty,
  {
    isCreateNewItem: boolean;
    hotkey?: string;
    dropDownItems?: React.ReactElement[];
    onCreateClick?: VoidFunction;
    onBackClick: VoidFunction;

    isRoomsOnly?: boolean;
    createDefineRoomType?: RoomsType;
  }
>;

export type TSelectorItemInput = MergeTypes<
  TSelectorItemEmpty,
  {
    isInputItem: boolean;
    defaultInputValue: string;
    icon?: string;
    color?: string;
    roomType?: RoomsType;
    cover?: ICover;
    placeholder?: string;

    onAcceptInput: (value: string) => void;
    onCancelInput: VoidFunction;
  }
>;

type TSelectorItemType =
  | TSelectorItemUser
  | TSelectorItemFile
  | TSelectorItemFolder
  | TSelectorItemRoom
  | TSelectorItemGroup
  | TSelectorItemNew
  | TSelectorItemInput;

export type TSelectorItem = TSelectorItemType & {
  label: string;

  key?: string;
  id?: string | number;
  displayName?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  disabledText?: string;
  lifetimeTooltip?: string | null;
  viewUrl?: string;
  isTemplate?: boolean;
  templateAccess?: ShareAccessRights;
  templateIsOwner?: boolean;
  disableMultiSelect?: boolean;
};

export type Data = {
  items: TSelectorItem[];
  onSelect?: (item: TSelectorItem, isDoubleClick: boolean) => void;
  isMultiSelect: boolean;
  isItemLoaded: (index: number) => boolean;
  rowLoader: React.ReactNode;
  renderCustomItem?: TRenderCustomItem;
  setInputItemVisible: (value: boolean) => void;
  inputItemVisible: boolean;
  savedInputValue: Nullable<string>;
  setSavedInputValue: (value: Nullable<string>) => void;
  listHeight: number;
};

export interface ItemProps {
  index: number;
  style: React.CSSProperties;
  data: Data;
}

export type ProvidersProps = {
  emptyScreenProps: TSelectorEmptyScreen;
  breadCrumbsProps: TSelectorBreadCrumbs;
  infoBarProps: TInfoBar;
  searchProps: TSelectorSearch;
  selectAllProps: TSelectorSelectAll & {
    isAllChecked: boolean;
    isAllIndeterminate: boolean;
  };
  tabsProps: TSelectorTabs;
};
