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

export type DropDownItemProps = {
  // Display and Layout Props
  /** Whether to render the item as a separator line instead of content */
  isSeparator?: boolean;
  /** Whether to render the item as a header with special styling */
  isHeader?: boolean;
  /** Custom height of the dropdown item in pixels */
  height?: number;
  /** Custom height of the dropdown item for tablet devices in pixels */
  heightTablet?: number;
  /** Whether to use modern compact styling with minimal padding */
  isModern?: boolean;
  /** Whether text content should be truncated with ellipsis when it overflows */
  textOverflow?: boolean;

  // Icon Related Props
  /** URL or path to the icon to display at the start of the item */
  icon?: string | React.ReactElement | React.ElementType;
  /** Whether the icon should be filled with the current text color. If false, uses original icon colors */
  fillIcon?: boolean;
  /** Whether to hide the icon element even when an icon prop is provided */
  withoutIcon?: boolean;
  /** Whether to show a back arrow icon when item is a header */
  withHeaderArrow?: boolean;
  /** Callback function triggered when the header's back arrow is clicked */
  headerArrowAction?: () => void;

  // Content Props
  /** Primary text content or React node to display in the item */
  label?: string | React.ReactNode;
  /** Additional React nodes to render after the label */
  children?: React.ReactNode;
  /** Additional element to render at the end of the item, after all other content */
  additionalElement?: React.ReactNode;

  // State and Interaction Props
  /** Whether the item is in a disabled state and cannot be interacted with */
  disabled?: boolean;
  /** Whether the item is in an active/pressed state */
  isActive?: boolean;
  /** Whether the item is currently selected in a menu context */
  isSelected?: boolean;
  /** Whether the item is the current active descendant for keyboard navigation */
  isActiveDescendant?: boolean;
  /** Whether to disable the hover state styling */
  noHover?: boolean;
  /** Whether to disable the active/pressed state styling */
  noActive?: boolean;
  /** Whether this item opens a submenu when clicked */
  isSubMenu?: boolean;
  /** Whether to show a beta badge next to the item */
  isBeta?: boolean;
  /** Whether to show a paid badge next to the item */
  isPaidBadge?: boolean;
  /** Sets paid badge label */
  badgeLabel?: string;

  // Toggle Props
  /** Whether to show a toggle switch at the end of the item */
  withToggle?: boolean;
  /** Whether the toggle switch is in a checked state */
  checked?: boolean;

  // Event Handlers
  /** Callback function triggered when the item is clicked */
  onClick?: (
    e: React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>,
  ) => void;
  /** Callback function triggered on mouse down */
  onMouseDown?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Callback function triggered when a selected item is clicked */
  onClickSelectedItem?: () => void;
  /** Callback function to control the open state of a parent dropdown */
  setOpen?: (open: boolean) => void;

  // Styling Props
  /** CSS class name to apply to the root element for custom styling */
  className?: string;
  /** Inline CSS styles to apply to the root element */
  style?: React.CSSProperties;
  /** HTML ID attribute for the root element */
  id?: string;
  /** Tab index for keyboard navigation order */
  tabIndex?: number;
  /** Sets minimum width for the root element */
  minWidth?: string;

  testId?: string;
};
