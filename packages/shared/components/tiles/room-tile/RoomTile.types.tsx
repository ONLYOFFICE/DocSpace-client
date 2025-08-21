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

import { TFunction } from "i18next";
import { ContextMenuModel } from "../../context-menu/ContextMenu.types";
import { TagType } from "../../tags/Tags.types";
import { TileItem } from "../tile-container/TileContainer.types";

export interface RoomItem extends TileItem {
  title: string;
  roomType: string;
  providerType?: string;
  providerKey?: string;
  thirdPartyIcon?: string;
  tags?: Array<TagType | string>;
  contextOptions?: ContextMenuModel[];
  logo?: {
    small?: string;
    color?: string;
    cover?: string;
  };
}

export interface SelectOption {
  option: "typeProvider" | "defaultTypeRoom";
  value: string;
}

export type RoomTileProps = {
  /** Indicates if the room is selected */
  checked?: boolean;
  /** Indicates if the room is in active state */
  isActive?: boolean;
  /** Indicates if the room is in a blocking operation state */
  isBlockingOperation?: boolean;
  /** Room data object */
  item: RoomItem;
  /** Callback when room is selected */
  onSelect?: (checked: boolean, item: RoomItem) => void;
  /** Callback when thumbnail is clicked */
  thumbnailClick?: (e: React.MouseEvent) => void;
  /** Function to get context menu model */
  getContextModel?: () => ContextMenuModel[];
  /** Child elements */
  children?: React.ReactNode;
  /** Checkbox indeterminate state flag */
  indeterminate?: boolean;
  /** Additional React element */
  element?: React.ReactNode;
  /** Context menu options */
  contextOptions: ContextMenuModel[];
  /** Column count for tags layout */
  columnCount: number;
  /** Callback for tag selection */
  selectTag: (tag: Array<TagType | string> | undefined) => void;
  /** Callback for option selection */
  selectOption: (option: SelectOption) => void;
  /** Function to get room type name */
  getRoomTypeName: (type: string, t: TFunction) => string;
  /** Room badges */
  badges?: React.ReactNode;
  /** Indicates if room is in progress state */
  inProgress?: boolean;
  /** Flag to show hotkey border */
  showHotkeyBorder?: boolean;
  /** Flag for edit mode */
  isEdit?: boolean;
  /** Data test id for the tile */
  dataTestId?: string;
};
