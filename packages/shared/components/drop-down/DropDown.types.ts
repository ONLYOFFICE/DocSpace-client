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

import type { JSX } from "react";
import { TDirectionX, TDirectionY } from "../../types";

export interface DropDownProps {
  /** Children elements */
  children?: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Required for determining a click outside DropDown with the withBackdrop parameter */
  clickOutsideAction?: (e: Event, open: boolean) => void;
  disableOnClickOutside?: boolean;
  enableOnClickOutside?: () => void;
  /** Sets the opening direction relative to the parent */
  directionX?: TDirectionX;
  /** Sets the opening direction relative to the parent */
  directionY?: TDirectionY;
  /** Accepts id */
  id?: string;
  /** Required for specifying the exact width of the component; for example; 100% */
  manualWidth?: string;
  /** Required for specifying the exact distance from the parent component */
  manualX?: string;
  /** Required for specifying the exact distance from the parent component */
  manualY?: string;
  /** Required if the scrollbar is displayed */
  maxHeight?: number;
  /** Sets the dropdown to be opened */
  open?: boolean;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Used to display backdrop */
  withBackdrop?: boolean;
  /** Count of columns */
  columnCount?: number;
  /** Sets the disabled items to display */
  showDisabledItems?: boolean;
  forwardedRef?: React.RefObject<HTMLElement | null>;
  /** Sets the operation mode of the component. The default option is set to portal mode */
  isDefaultMode?: boolean;
  /** Disables check position. Used to set the direction explicitly */
  fixedDirection?: boolean;
  /** Enables blur for backdrop */
  withBlur?: boolean;
  /** Specifies the horizontal offset */
  offsetX?: number;
  /** Test id */
  dataTestId?: string;

  isMobileView?: boolean;
  isNoFixedHeightOptions?: boolean;
  enableKeyboardEvents?: boolean;
  appendTo?: HTMLElement;
  isAside?: boolean;
  withBackground?: boolean;
  eventTypes?: string[] | string;
  forceCloseClickOutside?: boolean;
  withoutBackground?: boolean;
  zIndex?: number;
  topSpace?: number;
  usePortalBackdrop?: boolean;
  backDrop?: JSX.Element | null;
  shouldShowBackdrop?: boolean;
}

export interface VirtualListProps {
  /** Width of the list */
  width: number;
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Number of items in the list */
  itemCount: number;
  /** Maximum height of the list */
  maxHeight?: number;
  /** Calculated height based on items and maxHeight */
  calculatedHeight: number;
  /** Whether to use fixed height options */
  isNoFixedHeightOptions: boolean;
  /** Clean children elements */
  cleanChildren?: React.ReactNode;
  /** Children elements */
  children: React.ReactElement | React.ReactNode;
  /** Row component */
  Row: React.MemoExoticComponent<
    ({ data, index, style }: RowProps) => JSX.Element
  >;
  /** Whether to enable keyboard events */
  enableKeyboardEvents: boolean;
  /** Function to get item size */
  getItemSize: (index: number) => number;
}

export interface RowProps {
  /** Row data */
  data: {
    /** Children elements */
    children?: React.ReactNode;
    /** Currently active index */
    activeIndex?: number;
    /** Currently selected index */
    activedescendant?: number;
    /** Mouse move handler */
    handleMouseMove?: (index: number) => void;
  };
  /** Row index */
  index: number;
  /** Row style */
  style: React.CSSProperties;
}
