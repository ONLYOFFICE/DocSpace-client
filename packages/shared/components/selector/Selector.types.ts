import React from "react";
import { RoomsType } from "../../enums";
import { AvatarRole } from "../avatar";

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

type TSelectorHeader =
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
export interface SearchProps {
  placeholder?: string;
  value?: string;
  onSearch: (value: string, callback?: Function) => void;
  onClearSearch: (callback?: Function) => void;
  setIsSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

type TSelectorSearch =
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
  isAllIndeterminate: boolean;
  isAllChecked: boolean;
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

// submit button
type TSelectorSubmitButton = {
  submitButtonLabel: string;
  disableSubmitButton: boolean;
  onSubmit: (
    selectedItems: TSelectorItem[],
    access: TAccessRight | null,
    fileName: string,
    isFooterCheckboxChecked: boolean,
  ) => void;
  submitButtonId?: string;
};

type TSelectorFooterSubmitButton = TSelectorSubmitButton & {
  onSubmit: () => void;
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
      isChecked: boolean;
      setIsChecked?: undefined;
    };

export type TSelectorFooterCheckbox = TSelectorCheckbox & {
  setIsFooterCheckboxChecked: React.Dispatch<React.SetStateAction<boolean>>;
};

export type SelectorProps = TSelectorHeader &
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
    onSelect?: (item: TSelectorItem) => void;

    isMultiSelect: boolean;
    selectedItems?: TSelectorItem[];

    withAccessRights?: boolean;
    accessRights?: TAccessRight[];
    selectedAccessRight?: TAccessRight;
    onAccessRightsChange?: (access: TAccessRight) => void;

    loadNextPage:
      | ((
          startIndex: number,
          search?: string,
          ...rest: unknown[]
        ) => Promise<void>)
      | null;
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    totalItems: number;
    isLoading: boolean;

    rowLoader: React.ReactNode;

    renderCustomItem?: (...args: unknown[]) => React.ReactNode | null;

    alwaysShowFooter?: boolean;
    descriptionText?: string;
  };

export type BodyProps = TSelectorBreadCrumbs &
  TSelectorBodySearch &
  TSelectorSelectAll &
  TSelectorEmptyScreen &
  TSelectorBreadCrumbs & {
    footerVisible: boolean;
    withHeader?: boolean;

    value?: string;

    isMultiSelect: boolean;

    items: TSelectorItem[];
    renderCustomItem?: (...args: unknown[]) => React.ReactNode | null;
    onSelect: (item: TSelectorItem) => void;

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
  };

type TSelectorItemLogo =
  | {
      color?: undefined;
      icon?: undefined;
      avatar: string;
      role?: AvatarRole;
    }
  | { color: string; icon: undefined; avatar?: string; role?: undefined }
  | { color?: undefined; icon: string; avatar?: undefined; role?: undefined };

type TSelectorItemType =
  | {
      email: string;
      fileExst?: undefined;
      roomType?: undefined;
      shared?: undefined;
    }
  | {
      email?: undefined;
      fileExst: string;
      roomType?: undefined;
      shared?: boolean;
    }
  | {
      email?: undefined;
      fileExst?: undefined;
      roomType: RoomsType;
      shared?: boolean;
    }
  | {
      email?: undefined;
      fileExst?: undefined;
      roomType?: undefined;
      shared?: boolean;
    };

export type TSelectorItem = TSelectorItemLogo &
  TSelectorItemType & {
    key?: string;
    id?: string | number;
    label: string;

    isSelected?: boolean;

    isDisabled?: boolean;
  };

export type Data = {
  items: TSelectorItem[];
  onSelect?: (item: TSelectorItem) => void;
  isMultiSelect: boolean;
  isItemLoaded: (index: number) => boolean;
  rowLoader: React.ReactNode;
  renderCustomItem?: (...args: unknown[]) => React.ReactNode | null;
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
