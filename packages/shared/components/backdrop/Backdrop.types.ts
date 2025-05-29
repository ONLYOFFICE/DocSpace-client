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

export interface BackdropProps {
  /** Sets visible or hidden */
  visible: boolean;

  /**
   * Sets the z-index CSS property for stacking context
   * @default 203
   */
  zIndex?: number;

  /**
   * Custom CSS class name(s) to apply to the backdrop
   * Can be a single string or an array of strings
   */
  className?: string | string[];

  /** HTML id attribute for the backdrop element */
  id?: string;

  /** Custom inline styles to apply to the backdrop */
  style?: React.CSSProperties;

  /**
   * Enables background visibility for the backdrop
   * Note: Background is not displayed if viewport width > 1024px
   * @default false
   */
  withBackground?: boolean;

  /**
   * Indicates if the backdrop is being used with an Aside component
   * Affects backdrop stacking and background behavior
   * @default false
   */
  isAside?: boolean;

  /**
   * Disables the blur effect, typically used with context menus
   * @default false
   */
  withoutBlur?: boolean;

  /**
   * Forces the backdrop to render without a background
   * Takes precedence over withBackground
   * @default false
   */
  withoutBackground?: boolean;

  /**
   * Indicates if the backdrop is being used with a modal dialog
   * Affects touch event handling
   * @default false
   */
  isModalDialog?: boolean;

  /**
   * Click event handler for the backdrop
   * @param e - React mouse event
   */
  onClick?: (e: React.MouseEvent) => void;

  /**
   * Indicates if the backdrop should be shown
   * @default false
   */
  shouldShowBackdrop?: boolean;
}
