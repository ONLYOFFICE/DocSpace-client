import React from "react";
import { RoomsType } from "../../enums";
import { AvatarRole } from "../avatar";

export type AccessRight = {
  key: string;
  label: string;
  description?: string;
  access: string | number;
};

export interface SelectorProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  withHeader?: boolean;
  headerLabel: string;
  withoutBackButton?: boolean;
  onBackClick?: () => void;
  withSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string, callback?: Function) => void;
  onClearSearch?: (callback?: Function) => void;
  items?: TSelectorItem[];
  onSelect?: (item: TSelectorItem) => void;
  isMultiSelect?: boolean;
  selectedItems?: TSelectorItem[];
  acceptButtonLabel?: string;
  onAccept: (
    selectedItems: TSelectorItem[],
    access: AccessRight | null,
    fileName: string,
    isFooterCheckboxChecked: boolean,
  ) => void;
  withSelectAll?: boolean;
  selectAllLabel?: string;
  selectAllIcon?: string;
  onSelectAll?: () => void;
  withAccessRights?: boolean;
  accessRights?: AccessRight[];
  selectedAccessRight?: AccessRight;
  onAccessRightsChange?: (access: AccessRight) => void;
  withCancelButton?: boolean;
  cancelButtonLabel?: string;
  onCancel?: () => void;
  emptyScreenImage?: string;
  emptyScreenHeader?: string;
  emptyScreenDescription?: string;
  searchEmptyScreenImage?: string;
  searchEmptyScreenHeader?: string;
  searchEmptyScreenDescription?: string;
  hasNextPage?: boolean;
  isNextPageLoading?: boolean;
  loadNextPage?:
    | ((
        startIndex: number,
        search?: string,
        ...rest: unknown[]
      ) => Promise<void>)
    | null;
  totalItems?: number;
  isLoading?: boolean;
  searchLoader?: React.ReactNode;
  rowLoader?: React.ReactNode;
  withBreadCrumbs?: boolean;
  breadCrumbs?: TBreadCrumb[];
  onSelectBreadCrumb?: (item: TBreadCrumb) => void;
  breadCrumbsLoader?: React.ReactNode;
  isBreadCrumbsLoading?: boolean;
  isSearchLoading?: boolean;
  withFooterInput?: boolean;
  withFooterCheckbox?: boolean;
  footerInputHeader?: string;
  currentFooterInputValue?: string;
  footerCheckboxLabel?: string;
  alwaysShowFooter?: boolean;
  disableAcceptButton?: boolean;

  descriptionText?: string;

  acceptButtonId?: string;
  cancelButtonId?: string;
  isChecked?: boolean;
  setIsChecked?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface HeaderProps {
  onBackClickAction?: () => void;
  withoutBackButton?: boolean;
  headerLabel: string;
}

export interface BodyProps {
  footerVisible: boolean;
  withHeader?: boolean;
  isSearch: boolean;
  isAllIndeterminate?: boolean;
  isAllChecked?: boolean;
  placeholder?: string;
  value?: string;
  withSearch?: boolean;
  onSearch: (value: string) => void;
  onClearSearch: () => void;
  items: TSelectorItem[];
  onSelect?: (item: TSelectorItem) => void;
  isMultiSelect?: boolean;
  withSelectAll?: boolean;
  selectAllLabel?: string;
  selectAllIcon?: string;
  onSelectAll?: () => void;
  emptyScreenImage?: string;
  emptyScreenHeader?: string;
  emptyScreenDescription?: string;
  searchEmptyScreenImage?: string;
  searchEmptyScreenHeader?: string;
  searchEmptyScreenDescription?: string;
  loadMoreItems: (startIndex: number) => void;
  hasNextPage?: boolean;
  isNextPageLoading?: boolean;
  totalItems: number;
  isLoading?: boolean;
  searchLoader: React.ReactNode;
  rowLoader: React.ReactNode;
  withBreadCrumbs?: boolean;
  breadCrumbs?: TBreadCrumb[];
  onSelectBreadCrumb?: (item: TBreadCrumb) => void;
  breadCrumbsLoader?: React.ReactNode;
  isBreadCrumbsLoading?: boolean;
  isSearchLoading?: boolean;

  withFooterInput?: boolean;
  withFooterCheckbox?: boolean;

  descriptionText?: string;
}

export interface FooterProps {
  isMultiSelect?: boolean;
  acceptButtonLabel: string;
  selectedItemsCount: number;
  withCancelButton?: boolean;
  cancelButtonLabel?: string;
  withAccessRights?: boolean;
  accessRights?: AccessRight[];
  selectedAccessRight?: AccessRight | null;
  disableAcceptButton?: boolean;
  onAccept?: () => void;
  onCancel?: () => void;
  onChangeAccessRights?: (access: AccessRight) => void;

  withFooterInput?: boolean;
  withFooterCheckbox?: boolean;
  footerInputHeader?: string;
  currentFooterInputValue?: string;
  footerCheckboxLabel?: string;
  setNewFooterInputValue?: (value: string) => void;
  isFooterCheckboxChecked?: boolean;
  setIsFooterCheckboxChecked?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsChecked?: React.Dispatch<React.SetStateAction<boolean>>;

  acceptButtonId?: string;
  cancelButtonId?: string;
}

export type TSelectorItem = {
  key?: string;
  id?: string | number;
  label: string;
  avatar?: string;
  icon?: string;
  role?: AvatarRole;
  isSelected?: boolean;
  email?: string;
  isDisabled?: boolean;
  color?: string;
  fileExst?: string;
  isGroup?: boolean;
  roomType?: RoomsType;
};

export interface SearchProps {
  placeholder?: string;
  value?: string;
  onSearch: (value: string) => void;
  onClearSearch: () => void;
}

export type Data = {
  items: TSelectorItem[];
  onSelect?: (item: TSelectorItem) => void;
  isMultiSelect: boolean;
  isItemLoaded: (index: number) => boolean;
  rowLoader: React.ReactNode;
};

export interface SelectAllProps {
  label?: string;
  icon?: string;
  onSelectAll?: () => void;
  isChecked?: boolean;
  isIndeterminate?: boolean;
  isLoading?: boolean;
  rowLoader: React.ReactNode;
}

export interface ItemProps {
  index: number;
  style: React.CSSProperties;
  data: Data;
}

export interface EmptyScreenProps {
  image?: string;
  header?: string;
  description?: string;
  searchImage?: string;
  searchHeader?: string;
  searchDescription?: string;
  withSearch: boolean;
}

export type TBreadCrumb = {
  id: string | number;
  label: string;
  isRoom?: boolean;
  minWidth?: string;
  onClick?: (e: React.MouseEvent, open: boolean, item: TBreadCrumb) => void;
};

export type TDisplayedItem = {
  id: string | number;
  label: string;
  isArrow: boolean;
  isList: boolean;
  isRoom?: boolean;
  listItems?: TBreadCrumb[];
};

export interface BreadCrumbsProps {
  breadCrumbs?: TBreadCrumb[];
  onSelectBreadCrumb?: (item: TBreadCrumb) => void;
  isLoading?: boolean;
}
