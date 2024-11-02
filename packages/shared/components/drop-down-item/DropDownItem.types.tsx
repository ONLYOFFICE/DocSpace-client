// (c) Copyright Ascensio System SIA 2009-2024
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

export interface DropDownItemProps {
  /** Sets the dropdown item to display as a separator */
  isSeparator?: boolean;
  /** Sets the dropdown to display as a header */
  isHeader?: boolean;
  /** Enables header arrow icon */
  withHeaderArrow?: boolean;
  /** Sets an action that will be triggered when the header arrow is clicked */
  headerArrowAction?: () => void;
  /** Accepts tab-index */
  tabIndex?: number;
  /** Dropdown item text */
  label?: string | React.ReactNode;
  /** Sets the dropdown item to display as disabled */
  disabled?: boolean;
  /** Dropdown item icon */
  icon?: string;
  /** Disables default style hover effect */
  noHover?: boolean;
  /** Disables default style active effect */
  noActive?: boolean;
  /** Sets an action that will be triggered when the dropdown item is clicked */
  onClick?: (e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => void;
  /** Children elements */
  children?: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Accepts css text-overflow */
  textOverflow?: boolean;
  /** Indicates that component will fill selected item icon */
  fillIcon?: boolean;
  /** Enables the submenu */
  isSubMenu?: boolean;
  /**  Sets drop down item active  */
  isActive?: boolean;
  /** Disables the element icon */
  withoutIcon?: boolean;
  /** Sets the padding to the minimum value */
  isModern?: boolean;
  /** Facilitates highlighting a selected element with the keyboard */
  isActiveDescendant?: boolean;
  /** Facilitates selecting an element from the context menu */
  isSelected?: boolean;
  withToggle?: boolean;
  checked?: boolean;
  onClickSelectedItem?: () => void;
  isBeta?: boolean;
  additionalElement?: React.ReactNode;
  setOpen?: (open: boolean) => void;
  height?: number;
  heightTablet?: number;
}
