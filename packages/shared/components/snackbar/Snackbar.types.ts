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

import { TextAlignValue } from "../box/Box.types";

/**
 * Snackbar properties.
 *
 * @typedef {Object} SnackbarProps
 */
export type SnackbarProps = {
  /**
   * Specifies the Snackbar text.
   */
  text?: string | React.ReactNode;
  /**
   * Specifies the header text.
   */
  headerText?: string;
  /**
   * Specifies the button text.
   */
  btnText?: string;
  /**
   * Specifies the source of the image used as the Snackbar background.
   */
  backgroundImg?: string;
  /**
   * Specifies the background color.
   */
  backgroundColor?: string;
  /**
   * Specifies the text color.
   */
  textColor?: string;
  /**
   * Displays the icon.
   */
  showIcon?: boolean;
  /**
   * Sets a callback function that is triggered when the Snackbar is clicked.
   */
  onAction?: (e?: React.MouseEvent) => void;
  /**
   * Sets the font size.
   */
  fontSize?: string;
  /**
   * Sets the font weight.
   */
  fontWeight?: number;
  /**
   * Specifies the text alignment.
   */
  textAlign?: TextAlignValue | "match-parent";
  /**
   * Allows displaying content in HTML format.
   */
  htmlContent?: string;
  /**
   * Accepts css.
   */
  style?: React.CSSProperties;
  /**
   * Sets the countdown time.
   */
  countDownTime: number;
  /**
   * Sets the section width.
   */
  sectionWidth: number;
  /**
   * Required in case the snackbar is a campaign banner.
   */
  isCampaigns?: boolean;
  /**
   * Used as an indicator that a web page has fully loaded, including its content, images, style files, and external scripts.
   */
  onLoad?: () => void;
  /**
   * Required in case the snackbar is a notification banner.
   */
  isMaintenance?: boolean;
  /**
   * Sets opacity.
   */
  opacity?: number;
  /**
   * Callback when close button is clicked.
   */
  onClose?: () => void;
};

/**
 * Bar configuration.
 *
 * @typedef {Object} BarConfig
 */
export type BarConfig = SnackbarProps & {
  /**
   * Parent element ID.
   */
  parentElementId: string;
};
