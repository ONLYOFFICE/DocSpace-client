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
import { RoomsType, ShareAccessRights } from "../../enums";
import { AvatarRole } from "../avatar";
import { TFileSecurity, TFolderSecurity } from "../../api/files/types";
import { TRoomSecurity } from "../../api/rooms/types";
import { TSubmenuItem } from "../submenu";

// header

type THeaderBackButton = {
  onBackClick: () => void;
  withoutBackButton: false;
};

type THeaderNonBackButton = {
  onBackClick?: undefined;
  withoutBackButton?: undefined;
};

export type HeaderProps = {
  headerLabel: string;
} & (THeaderBackButton | THeaderNonBackButton);

export type TSelectorHeader =
  | {
      withHeader: true;
      headerProps: HeaderProps;
    }
  | { withHeader?: undefined; headerProps?: undefined };

// bread crumbs

export type TBreadCrumb = {
  id: string | number;
  label: string;
  isRoom?: boolean;
  minWidth?: string;
  onClick?: (e: React.MouseEvent, open: boolean, item: TBreadCrumb) => void;
  roomType?: RoomsType;
};

export interface BreadCrumbsProps {
  breadCrumbs: TBreadCrumb[];
  onSelectBreadCrumb: (item: TBreadCrumb) => void;
  isLoading: boolean;
}

export type TSelectorBreadCrumbs =
  | {
      withBreadCrumbs: true;
      breadCrumbs: TBreadCrumb[];
      onSelectBreadCrumb: (item: TBreadCrumb) => void;
      breadCrumbsLoader: React.ReactNode;
      isBreadCrumbsLoading: boolean;
    }
  | {
      withBreadCrumbs?: undefined;
      breadCrumbs?: undefined;
      onSelectBreadCrumb?: undefined;
      breadCrumbsLoader?: undefined;
      isBreadCrumbsLoading?: undefined;
    };

// tabs

export type TWithTabs =
  | { withTabs: true; tabsData: TSubmenuItem[]; activeTabId: string }
  | { withTabs?: undefined; tabsData?: undefined; activeTabId?: undefined };

// select all

export interface SelectAllProps {
  label: string;
  icon: string;
  onSelectAll: () => void;
  isChecked: boolean;
  isIndeterminate: boolean;
  isLoading: boolean;
  rowLoader: React.ReactNode;
}

export type TSelectorSelectAll = {
  isAllIndeterminate?: boolean;
  isAllChecked?: boolean;
} & (
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
    }
);

// search
export interface SearchProps {
  placeholder?: string;
  value?: string;
  onSearch: (value: string, callback?: Function) => void;
  onClearSearch: (callback?: Function) => void;
  setIsSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

export type TSelectorSearch =
  | {
      withSearch: true;
      searchLoader: React.ReactNode;
      isSearchLoading: boolean;
      searchPlaceholder?: string;
      searchValue?: string;
      onSearch: (value: string, callback?: Function) => void;
      onClearSearch: (callback?: Function) => void;
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

export type TSelectorBodySearch = TSelectorSearch & {
  isSearch: boolean;
  setIsSearch: React.Dispatch<React.SetStateAction<boolean>>;
};

// empty screen
export interface EmptyScreenProps {
  image: string;
  header: string;
  description: string;
  searchImage: string;
  searchHeader: string;
  searchDescription: string;
  withSearch: boolean;
}

type TSelectorEmptyScreen = {
  emptyScreenImage: string;
  emptyScreenHeader: string;
  emptyScreenDescription: string;

  searchEmptyScreenImage: string;
  searchEmptyScreenHeader: string;
  searchEmptyScreenDescription: string;
};

type TOnSubmit = (
  selectedItems: TSelectorItem[],
  access: TAccessRight | null,
  fileName: string,
  isFooterCheckboxChecked: boolean,
) => void | Promise<void>;

// submit button
export type TSelectorSubmitButton = {
  submitButtonLabel: string;
  disableSubmitButton: boolean;
  onSubmit: TOnSubmit;
  submitButtonId?: string;
};

type TSelectorFooterSubmitButton = Omit<TSelectorSubmitButton, "onSubmit"> & {
  onSubmit: (item?: TSelectorItem) => Promise<void>;
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

export type TSelectorAccessRights =
  | {
      withAccessRights: true;
      accessRights: TAccessRight[];
      selectedAccessRight: TAccessRight | null;
      onAccessRightsChange: (access: TAccessRight) => void;
    }
  | {
      withAccessRights?: undefined;
      accessRights?: undefined;
      selectedAccessRight?: undefined;
      onAccessRightsChange?: undefined;
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
      setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
    }
  | {
      withFooterCheckbox?: undefined;
      footerCheckboxLabel?: undefined;
      isChecked?: boolean;
      setIsChecked?: undefined;
    };

export type TSelectorFooterCheckbox = TSelectorCheckbox & {
  setIsFooterCheckboxChecked: React.Dispatch<React.SetStateAction<boolean>>;
};

export type SelectorProps = TSelectorHeader &
  TWithTabs &
  TSelectorSelectAll &
  TSelectorEmptyScreen &
  TSelectorSearch &
  TSelectorBreadCrumbs &
  TSelectorSubmitButton &
  TSelectorCancelButton &
  TSelectorAccessRights &
  TSelectorInput &
  TSelectorCheckbox & {
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

    renderCustomItem?: (
      label: string,
      role?: string,
      email?: string,
      isGroup?: boolean,
    ) => React.ReactNode | null;

    alwaysShowFooter?: boolean;
    descriptionText?: string;
  };

export type BodyProps = TSelectorBreadCrumbs &
  TWithTabs &
  TSelectorBodySearch &
  TSelectorSelectAll &
  TSelectorEmptyScreen &
  TSelectorBreadCrumbs & {
    footerVisible: boolean;
    withHeader?: boolean;

    value?: string;

    isMultiSelect: boolean;

    items: TSelectorItem[];
    renderCustomItem?: (
      label: string,
      role?: string,
      email?: string,
    ) => React.ReactNode | null;
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

type TSelectorItemLogo =
  | {
      color?: undefined;
      icon?: undefined;
      avatar: string;
      role?: AvatarRole;
      hasAvatar?: boolean;
    }
  | {
      hasAvatar?: undefined;
      color: string;
      icon?: undefined;
      avatar?: undefined;
      role?: undefined;
    }
  | {
      hasAvatar?: undefined;
      color?: undefined;
      icon: string;
      avatar?: undefined;
      role?: undefined;
    };

type TSelectorItemType =
  | {
      email: string;
      fileExst?: undefined;
      roomType?: undefined;
      shared?: undefined;
      isOwner: boolean;
      isAdmin: boolean;
      isVisitor: boolean;
      isCollaborator: boolean;
      access?: ShareAccessRights | string | number;
      isFolder?: undefined;
      parentId?: undefined;
      rootFolderType?: undefined;
      filesCount?: undefined;
      foldersCount?: undefined;
      security?: undefined;
      isGroup?: undefined;
      name?: undefined;
    }
  | {
      email?: undefined;
      fileExst: string;
      roomType?: undefined;
      shared?: boolean;
      isOwner?: undefined;
      isAdmin?: undefined;
      isVisitor?: undefined;
      isCollaborator?: undefined;
      access?: undefined;
      isFolder?: undefined;
      parentId?: string | number;
      rootFolderType?: string | number;
      filesCount?: undefined;
      foldersCount?: undefined;
      security?: TFileSecurity;
      isGroup?: undefined;
      name?: undefined;
    }
  | {
      email?: undefined;
      fileExst?: undefined;
      roomType: RoomsType;
      shared?: boolean;
      isOwner?: undefined;
      isAdmin?: undefined;
      isVisitor?: undefined;
      isCollaborator?: undefined;
      access?: undefined;
      isFolder: boolean;
      parentId?: string | number;
      rootFolderType?: string | number;
      filesCount?: number;
      foldersCount?: number;
      security?: TRoomSecurity;
      isGroup?: undefined;
      name?: undefined;
    }
  | {
      email?: undefined;
      fileExst?: undefined;
      roomType?: undefined;
      shared?: boolean;
      isOwner?: undefined;
      isAdmin?: undefined;
      isVisitor?: undefined;
      isCollaborator?: undefined;
      access?: undefined;
      isFolder: boolean;
      parentId?: string | number;
      rootFolderType?: string | number;
      filesCount?: number;
      foldersCount?: number;
      security?: TFolderSecurity;
      isGroup?: undefined;
      name?: undefined;
    }
  | {
      email?: undefined;
      fileExst?: undefined;
      roomType?: undefined;
      shared?: boolean;
      isOwner?: undefined;
      isAdmin?: undefined;
      isVisitor?: undefined;
      isCollaborator?: undefined;
      access?: undefined;
      isFolder?: undefined;
      parentId?: string | number;
      rootFolderType?: string | number;
      filesCount?: number;
      foldersCount?: number;
      security?: TFolderSecurity;
      isGroup: true;
      name: string;
    };

export type TSelectorItem = TSelectorItemLogo &
  TSelectorItemType & {
    key?: string;
    id?: string | number;
    label: string;
    displayName?: string;

    isSelected?: boolean;
    isDisabled?: boolean;
  };

export type Data = {
  items: TSelectorItem[];
  onSelect?: (item: TSelectorItem, isDoubleClick: boolean) => void;
  isMultiSelect: boolean;
  isItemLoaded: (index: number) => boolean;
  rowLoader: React.ReactNode;
  renderCustomItem?: (
    label: string,
    role?: string,
    email?: string,
    isGroup?: boolean,
  ) => React.ReactNode | null;
};

export interface ItemProps {
  index: number;
  style: React.CSSProperties;
  data: Data;
}

export type TDisplayedItem = {
  id: string | number;
  label: string;
  isArrow: boolean;
  isList: boolean;
  isRoom?: boolean;
  listItems?: TBreadCrumb[];
};
