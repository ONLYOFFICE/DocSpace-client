import { SelectorProps, TSelectorItem } from "../../components/selector";
import { AccessRight } from "../../components/selector/Selector.types";
import { TLogo } from "../../api/rooms/types";
import { RoomsType } from "../../enums";

export interface RoomSelectorProps extends SelectorProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;

  excludeItems?: number[];
  setIsDataReady: (value: boolean) => void;
  withHeader?: boolean;
  headerLabel: string;
  onBackClick?: () => void;

  searchPlaceholder?: string;
  onSearch?: (value: string, callback?: Function) => void;
  onClearSearch?: (callback?: Function) => void;

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
}

export type TItem = {
  id: number;
  label: string;
  icon: string;
  color: string | undefined;
  logo: TLogo;
  roomType: RoomsType;
};
