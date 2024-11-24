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

import React from "react";
import {
  EmployeeStatus,
  EmployeeType,
  RoomsType,
  ShareAccessRights,
} from "../../enums";
import { MergeTypes, Nullable } from "../../types";

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
  visible: boolean;
};

export type BreadCrumbsProps = {
  visible?: boolean;
};

export type HeaderProps = {
  headerLabel: string;
  onCloseClick: () => void;
  isCloseable?: boolean;
} & THeaderBackButton;

export type TSelectorHeader =
  | {
      withHeader: true;
      headerProps: HeaderProps;
    }
  | { withHeader?: undefined; headerProps?: undefined };

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
};

export type TDisplayedItem = {
  id: string | number;
  label: string;
  isArrow: boolean;
  isList: boolean;
  isRoom?: boolean;
  listItems?: TBreadCrumb[];
};

export type TSelectorBreadCrumbs =
  | {
      withBreadCrumbs: true;
      isBreadCrumbsLoading: boolean;
      breadCrumbs: TBreadCrumb[];
      breadCrumbsLoader: React.ReactNode;

      onSelectBreadCrumb: (item: TBreadCrumb) => void;
    }
  | {
      withBreadCrumbs?: undefined;
      isBreadCrumbsLoading?: undefined;
      breadCrumbs?: undefined;
      breadCrumbsLoader?: undefined;

      onSelectBreadCrumb?: undefined;
    };

// tabs
export type TSelectorTabs =
  | { withTabs: true; tabsData: TTabItem[]; activeTabId: string }
  | { withTabs?: undefined; tabsData?: undefined; activeTabId?: undefined };

// select all
export type TSelectorSelectAll =
  | {
      withSelectAll: true;
      selectAllLabel: string;
      selectAllIcon: string;
      onSelectAll: () => void;
    }
  | {
      withSelectAll?: undefined;
      selectAllLabel?: undefined;
      selectAllIcon?: undefined;
      onSelectAll?: undefined;
    };

// search

export type TSelectorSearch =
  | {
      withSearch: true;
      searchLoader: React.ReactNode;
      isSearchLoading: boolean;
      searchPlaceholder?: string;
      searchValue?: string;
      onSearch: (value: string, callback?: VoidFunction) => void;
      onClearSearch: (callback?: VoidFunction) => void;
    }
  | {
      withSearch?: undefined;
      searchLoader?: undefined;
      isSearchLoading?: undefined;
      searchPlaceholder?: string;
      searchValue?: string;
      onSearch?: undefined;
      onClearSearch?: undefined;
    };

// empty screen
export interface EmptyScreenProps {
  withSearch: boolean;

  items: TSelectorItem[];
  inputItemVisible: boolean;
}

export type TSelectorEmptyScreen = {
  emptyScreenImage: string;
  emptyScreenHeader: string;
  emptyScreenDescription: string;

  searchEmptyScreenImage: string;
  searchEmptyScreenHeader: string;
  searchEmptyScreenDescription: string;
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

export type TSelectorCancelButton =
  | {
      withCancelButton: true;
      cancelButtonLabel: string;
      onCancel: () => void;
      cancelButtonId?: string;
    }
  | {
      withCancelButton?: undefined;
      cancelButtonLabel?: undefined;
      onCancel?: undefined;
      cancelButtonId?: undefined;
    };

// access rights

export type TAccessRight = {
  key: string;
  label: string;
  description?: string;
  access: string | number;
};

type TWithAccessRightsProps = {
  withAccessRights: true;
  accessRights: TAccessRight[];
  selectedAccessRight: TAccessRight | null;
  onAccessRightsChange: (access: TAccessRight) => void;
  accessRightsMode?: SelectorAccessRightsMode;
};

type TWithoutAccessRightsProps = {
  withAccessRights?: undefined;
  accessRights?: undefined;
  selectedAccessRight?: undefined;
  onAccessRightsChange?: undefined;
  accessRightsMode?: undefined;
};

export type TSelectorWithAside =
  | {
      useAside: true;
      onClose: VoidFunction;
      withoutBackground?: boolean;
      withBlur?: boolean;
    }
  | {
      useAside?: undefined;
      onClose?: undefined;
      withoutBackground?: undefined;
      withBlur?: undefined;
    };

export type TSelectorAccessRights =
  | TWithAccessRightsProps
  | TWithoutAccessRightsProps;

export type AccessSelectorProps = Omit<
  TWithAccessRightsProps,
  "withAccessRights"
> & {
  footerRef: React.RefObject<HTMLDivElement>;
};

// footer input

export type TSelectorInput =
  | {
      withFooterInput: true;
      footerInputHeader: string;
      currentFooterInputValue: string;
    }
  | {
      withFooterInput?: undefined;
      footerInputHeader?: undefined;
      currentFooterInputValue?: undefined;
    };

export type TSelectorFooterInput = TSelectorInput & {
  setNewFooterInputValue: React.Dispatch<React.SetStateAction<string>>;
};

// footer checkbox

export type TSelectorCheckbox =
  | {
      withFooterCheckbox: true;
      footerCheckboxLabel: string;
      isChecked: boolean;
    }
  | {
      withFooterCheckbox?: undefined;
      footerCheckboxLabel?: undefined;
      isChecked?: boolean;
    };

export type TSelectorFooterCheckbox = TSelectorCheckbox & {
  setIsFooterCheckboxChecked: React.Dispatch<React.SetStateAction<boolean>>;
};

export type TSelectorInfo =
  | { withInfo: true; infoText: string }
  | { withInfo?: undefined; infoText?: undefined };

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
  TSelectorWithAside & {
    id?: string;
    className?: string;
    style?: React.CSSProperties;

    items: TSelectorItem[];
    onSelect?: (
      item: TSelectorItem,
      isDoubleClick: boolean,
      doubleClickCallback: () => Promise<void>,
    ) => void;

    isMultiSelect: boolean;
    selectedItems?: TSelectorItem[];

    disableFirstFetch?: boolean;
    loadNextPage: (startIndex: number) => Promise<void>;
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    totalItems: number;
    isLoading: boolean;

    rowLoader: React.ReactNode;

    renderCustomItem?: TRenderCustomItem;

    alwaysShowFooter?: boolean;
    descriptionText?: string;
  };

export type BodyProps = TSelectorInfo & {
  footerVisible: boolean;
  withHeader?: boolean;

  value?: string;

  isMultiSelect: boolean;

  inputItemVisible: boolean;
  setInputItemVisible: (value: boolean) => void;

  items: TSelectorItem[];
  renderCustomItem?: TRenderCustomItem;
  onSelect: (item: TSelectorItem, isDoubleClick: boolean) => void;

  loadMoreItems: (startIndex: number) => void;
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  totalItems: number;
  isLoading: boolean;

  rowLoader: React.ReactNode;

  withFooterInput?: boolean;
  withFooterCheckbox?: boolean;
  descriptionText?: string;
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
