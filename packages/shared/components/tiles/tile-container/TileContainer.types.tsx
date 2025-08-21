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

/** Base tile item data structure */
export type TileItem = {
  /** Indicates if the item is a folder */
  isFolder?: boolean;
  /** Indicates if the item is a room */
  isRoom?: boolean;
  /** File extension */
  fileExst?: string;
  /** Unique identifier for the item */
  id: number | string;
  isTemplate?: boolean;
};

/** Common properties for tile items */
export interface CommonTileProps {
  /** Indicates if the tile is selected */
  checked?: boolean;
  /** Indicates if the tile is in active state */
  isActive?: boolean;
  /** Indicates if the tile is in a blocking operation state */
  isBlockingOperation?: boolean;
  /** Child elements */
  children?: React.ReactNode;
  /** Checkbox indeterminate state flag */
  indeterminate?: boolean;
  /** Additional React element */
  element?: React.ReactNode;
  /** Badges to display */
  badges?: React.ReactNode;
  /** Click handler for the thumbnail */
  thumbnailClick?: (e: React.MouseEvent) => void;
  /** Selection handler */
  onSelect?: (checked: boolean) => void;
  /** Class name for styling */
  className?: string;
  /** Style object for inline styling */
  style?: React.CSSProperties;
}

/** Props for individual tile items */
export type TileItemProps = CommonTileProps & {
  /** The tile item data */
  item: TileItem;
};

export type TileContainerProps = {
  /** Child elements to be rendered within the container */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Container's HTML id attribute */
  id?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
  /** Flag to enable React Window for virtualization */
  useReactWindow?: boolean;
  /** Component for rendering infinite grid layout */
  infiniteGrid?: React.ComponentType<{
    children: React.ReactNode;
    isRooms?: boolean;
    isTemplates?: boolean;
  }>;
  /** Custom heading for folders section */
  headingFolders?: React.ReactNode;
  /** Custom heading for files section */
  headingFiles?: React.ReactNode;
  /** Flag to indicate descending order */
  isDesc?: boolean;
  /** Disables text selection */
  noSelect?: boolean;
};
