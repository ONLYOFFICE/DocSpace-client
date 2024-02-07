import { IndexRange } from "react-virtualized";

import { ContextMenuModel } from "../context-menu";
import { TTheme } from "../../themes";

export interface TableContainerProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>;
  useReactWindow: boolean;
  children?: React.ReactNode;
}

export type TTableColumn = {
  key: string;
  title: string;
  enable?: boolean;
  active?: boolean;
  minWidth?: number;
  withTagRef?: boolean;
  sortBy?: string;
  onClick?: (sortBy: string, e: React.MouseEvent) => void;
  onIconClick?: () => void;
  onChange?: (key: string, e?: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  defaultSize?: number;
  default?: boolean;
  resizable?: boolean;
};

export interface TableHeaderProps {
  containerRef: { current: HTMLDivElement | null };
  columns: TTableColumn[];
  sortBy?: string;
  sorted?: boolean;
  columnStorageName: string;
  sectionWidth: number;
  onClick?: () => void;
  resetColumnsSize?: boolean;
  isLengthenHeader?: boolean;
  sortingVisible?: boolean;
  infoPanelVisible?: boolean;
  useReactWindow: boolean;
  showSettings: boolean;
  setHideColumns?: (value: boolean) => void;
  columnInfoPanelStorageName?: string;
  settingsTitle?: string;
  tagRef?:
    | React.ForwardedRef<HTMLDivElement>
    | ((node: HTMLDivElement) => void);
  theme: TTheme;
}

export interface TableHeaderCellProps {
  column: TTableColumn;
  index: number;
  onMouseDown: (event: React.MouseEvent) => void;
  resizable?: boolean;
  sorted: boolean;
  sortBy: string;
  defaultSize?: number;
  sortingVisible: boolean;
  tagRef?:
    | React.ForwardedRef<HTMLDivElement>
    | ((node: HTMLDivElement) => void);
}

export interface TableSettingsProps {
  columns: TTableColumn[];
  disableSettings: boolean;
}

export interface TableBodyProps {
  columnStorageName: string;
  columnInfoPanelStorageName?: string;
  fetchMoreFiles: (params: IndexRange) => Promise<void>;
  children: React.ReactNode[];
  filesLength: number;
  hasMoreFiles: boolean;
  itemCount: number;
  itemHeight: number;
  useReactWindow: boolean;
  onScroll?: () => void;
  infoPanelVisible?: boolean;
}

export interface TableRowProps {
  fileContextClick?: (value?: boolean) => void;
  children: React.ReactNode;
  contextOptions?: ContextMenuModel[];
  onHideContextMenu?: () => void;
  selectionProp?: { className: string };
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  getContextModel: () => ContextMenuModel[];
  onClick?: (e: React.MouseEvent) => void;
  badgeUrl?: string;
}

export interface TableCellProps {
  className: string;
  forwardedRef?: React.ForwardedRef<HTMLDivElement>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export type TGroupMenuItem = {
  label: string;
  disabled: boolean;
  onClick: (e: React.MouseEvent) => void;
  iconUrl: string;
  title: string;
  withDropDown: boolean;
  options: ContextMenuModel[];
  id: string;
};

export interface TableGroupMenuProps {
  isChecked: boolean;
  isIndeterminate: boolean;
  headerMenu: TGroupMenuItem[];
  checkboxOptions: React.ReactNode[];
  onClick: () => void;
  onChange: (isChecked: boolean) => void;
  checkboxMargin: string;
  withoutInfoPanelToggler: boolean;
  isInfoPanelVisible?: boolean;
  isMobileView?: boolean;
  isBlocked?: boolean;
  toggleInfoPanel: () => void;
}
