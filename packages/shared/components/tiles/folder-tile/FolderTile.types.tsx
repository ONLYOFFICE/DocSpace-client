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

import { ContextMenuModel } from "../../context-menu/ContextMenu.types";
import { TileItem } from "../tile-container/TileContainer.types";

export interface FolderItem extends TileItem {
  title: string;
  contextOptions?: string[];
  logo?: {
    small?: string;
    color?: string;
    cover?: string;
  };
}

export type FolderTileProps = {
  /** Folder data object */
  item: FolderItem;
  /** Indicates if the folder is selected */
  checked?: boolean;
  /** Flag to show hotkey border */
  showHotkeyBorder?: boolean;
  /** Indicates if folder is in progress state */
  inProgress?: boolean;
  /** Callback when folder is selected */
  onSelect?: (checked: boolean, item: FolderItem) => void;
  /** Callback when thumbnail is clicked */
  thumbnailClick?: (e: React.MouseEvent) => void;
  /** Function to get context menu model */
  getContextModel?: () => ContextMenuModel[];
  /** Function to set selected items */
  setSelection?: (items: FolderItem[]) => void;
  /** Handler for Ctrl + Click selection */
  withCtrlSelect?: (item: FolderItem) => void;
  /** Handler for Shift + Click selection */
  withShiftSelect?: (item: FolderItem) => void;
  /** Additional React element */
  element?: React.ReactNode;
  /** Child elements */
  children?: React.ReactNode;
  /** Callback to hide context menu */
  hideContextMenu?: () => void;
  /** Custom header for context menu */
  contextMenuHeader?: React.ReactNode;
  /** Callback when context menu is clicked */
  tileContextClick?: (isRightClick?: boolean) => void;
  /** Folder badges */
  badges?: React.ReactNode;
  /** Context menu options */
  contextOptions: ContextMenuModel[];
  /** Checkbox indeterminate state flag */
  indeterminate?: boolean;
  /** Indicates if folder is being dragged */
  isDragging?: boolean;
  /** Alternative flag for drag state */
  dragging?: boolean;
  /** Indicates if folder is in active state */
  isActive?: boolean;
  /** Flag for edit mode */
  isEdit?: boolean;
  forwardRef?: React.RefObject<HTMLDivElement | null>;
  /** Data test id for the tile */
  dataTestId?: string;
};

export type FolderChildProps = {
  item: {
    title?: string;
    icon?: string;
    logo?: {
      original?: string;
      large?: string;
      medium?: string;
      small?: string;
      color?: string;
      cover?: string | { data: string; id: string };
    };
    displayName?: string;
  };
};
