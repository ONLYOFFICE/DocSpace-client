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

import { ContextMenuModel } from "../context-menu";

export type TData = { contextOptions: ContextMenuModel[] };
export type TMode = "modern" | "default";

export interface RowProps {
  /** Required for hosting the Checkbox component. Its location is always fixed in the first position.
   * If there is no value, the occupied space is distributed among the other child elements. */
  checked: boolean;
  /** Displays the child elements */
  children?: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Required for displaying a certain element in the row */
  contentElement?: React.ReactNode;
  /** Sets the width of the ContextMenuButton component. */
  contextButtonSpacerWidth?: string;
  /** Required for hosting the ContextMenuButton component. It is always located near the right border of the container,
   * regardless of the contents of the child elements. If there is no value, the occupied space is distributed among the other child elements. */
  contextOptions?: ContextMenuModel[];
  /** Current row item information. */
  data?: TData;
  /** In case Checkbox component is specified, it is located in a fixed order,
   * otherwise it is located in the first position. If there is no value, the occupied space is distributed among the other child elements. */
  element?: React.ReactElement;
  /** Accepts id  */
  id?: string;
  /** If true, this state is shown as a rectangle in the checkbox */
  indeterminate?: boolean;
  /** Sets a callback function that is triggered when a row element is selected. Returns data value. */
  onSelect?: (checked: boolean, data?: TData) => void;
  /** Sets a callback function that is triggered when any element except the checkbox and context menu is clicked. */
  onRowClick: () => void;
  /** Function that is invoked on clicking the icon button in the context-menu */
  onContextClick?: (value?: boolean) => void;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** Displays the loader */
  inProgress?: boolean;
  /** Function that returns an object containing the elements of the context menu */
  getContextModel?: () => ContextMenuModel[];
  /** Changes the row mode */
  mode?: TMode;
  /** Removes the borders */
  withoutBorder?: boolean;
  isRoom?: boolean;
  contextTitle?: string;
  badgesComponent?: React.ReactNode;
  isArchive?: boolean;
  rowContextClose?: () => void;
  badgeUrl?: string;
  /** Disables checkbox */
  isDisabled?: boolean;
}
