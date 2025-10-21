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

import type { TileItem } from "../tile-container/TileContainer.types";
import { ContextMenuModel } from "../../context-menu/ContextMenu.types";

export type BaseTileProps = {
  /** Indicates if the room is selected */
  checked?: boolean;
  /** Indicates if the room is in active state */
  isActive?: boolean;
  /** Indicates if the room is in a blocking operation state */
  isBlockingOperation?: boolean;
  /** Room data object */
  item: TileItem;
  /** Callback when room is selected */
  onSelect?: (checked: boolean, item: TileItem) => void;
  /** Callback when thumbnail is clicked */
  thumbnailClick?: (e: React.MouseEvent) => void;
  /** Function to get context menu model */
  getContextModel?: () => ContextMenuModel[];
  /** Checkbox indeterminate state flag */
  indeterminate?: boolean;
  /** Additional React element */
  element?: React.ReactNode;
  /** Context menu options */
  contextOptions: ContextMenuModel[];
  /** Callback when context menu is clicked */
  tileContextClick?: (isRightClick?: boolean) => void;
  /** Callback to hide context menu */
  hideContextMenu?: () => void;
  /** Indicates if room is in progress state */
  inProgress?: boolean;
  /** Flag to show hotkey border */
  showHotkeyBorder?: boolean;
  /** Flag for edit mode */
  isEdit?: boolean;
  topContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
  isHovered?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  className?: string;
  onRoomClick?: (e: React.MouseEvent) => void;
  checkboxContainerRef?: React.RefObject<HTMLDivElement | null>;
  forwardRef?: React.RefObject<HTMLDivElement | null>;
  /** Data test id for the tile */
  dataTestId?: string;
  badgeUrl?: string;
};

export type ItemProps = {
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

export type TileChildProps = {
  item: ItemProps;
};
