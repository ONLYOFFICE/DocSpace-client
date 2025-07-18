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
import { IndexRange } from "react-virtualized";

import { ContextMenuModel } from "../context-menu";

export interface TableContainerProps {
  forwardedRef: React.Ref<HTMLDivElement>;
  noSelect?: boolean;
  useReactWindow: boolean;
  children?: React.ReactNode;
  className?: string;
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
  isShort?: boolean;
  checkbox?: {
    value: boolean;
    isIndeterminate: boolean;
    onChange: (e?: React.ChangeEvent<HTMLInputElement>) => void;
  };
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
  isIndexEditingMode?: boolean;
  withoutWideColumn?: boolean;
  style?: React.CSSProperties;
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
  testId?: string;
}

export interface TableSettingsProps {
  columns: TTableColumn[];
  disableSettings?: boolean;
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
  isIndexEditingMode?: boolean;
}

export interface TableRowProps {
  fileContextClick?: (value?: boolean) => void;
  children: React.ReactNode;
  contextOptions?: ContextMenuModel[];
  onHideContextMenu?: () => void;
  selectionProp?: { className?: string; value?: string };
  className?: string;
  style?: React.CSSProperties;
  contextMenuCellStyle?: React.CSSProperties;
  title?: string;
  getContextModel?: () => ContextMenuModel[];
  badgeUrl?: string;
  isIndexEditingMode?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  forwardedRef?: React.ForwardedRef<HTMLDivElement>;
  hideColumns?: boolean;
  isActive?: boolean;
  checked?: boolean;
  dragging?: boolean;
}

export interface TableCellProps {
  className?: string;
  hasAccess?: boolean;
  checked?: boolean;
  forwardedRef?: React.ForwardedRef<HTMLDivElement>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  value?: string;
}

export type TGroupMenuItem = {
  label: string;
  disabled: boolean;
  onClick: (e: React.MouseEvent) => void;
  iconUrl: string;
  title: string;
  withDropDown?: boolean;
  options?: ContextMenuModel[];
  id: string;
};

interface TableGroupMenuBased {
  isChecked: boolean;
  isIndeterminate: boolean;
  headerMenu: TGroupMenuItem[];
  checkboxOptions?: React.ReactElement<{ children?: React.ReactNode }>;
  onClick?: () => void;
  onChange: (isChecked: boolean) => void;
  checkboxMargin?: string;
  withoutInfoPanelToggler: boolean;
  isInfoPanelVisible?: boolean;
  isMobileView?: boolean;
  isBlocked?: boolean;
  toggleInfoPanel?: () => void;
  withComboBox?: boolean;
  headerLabel?: string;
}
export type TableGroupMenuProps =
  | (TableGroupMenuBased & {
      isCloseable?: undefined;
      onCloseClick?: undefined;
    })
  | (TableGroupMenuBased & { isCloseable: boolean; onCloseClick: () => void });
