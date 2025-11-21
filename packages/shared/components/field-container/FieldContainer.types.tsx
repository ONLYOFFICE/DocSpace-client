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

import { ReactNode, CSSProperties } from "react";
import { TTooltipPlace } from "../tooltip";

export type FieldContainerProps = {
  /** Vertical or horizontal alignment */
  isVertical?: boolean;
  /** Remove default margin property */
  removeMargin?: boolean;
  /** CSS class name for custom styling */
  className?: string;
  /** Indicates that the field is required */
  isRequired?: boolean;
  /** Indicates that the field has an error state */
  hasError?: boolean;
  /** Controls visibility of the field label section */
  labelVisible?: boolean;
  /** Field label text or element */
  labelText?: string | ReactNode;
  /** Icon source URL */
  icon?: string;
  /** Renders the help button inline instead of in a separate div */
  inlineHelpButton?: boolean;
  /** Child elements */
  children: ReactNode;
  /** Content to display in the tooltip */
  tooltipContent?: string | ReactNode;
  /** Global position of the tooltip */
  place?: TTooltipPlace;
  /** Tooltip header content (displayed in aside) */
  helpButtonHeaderContent?: string;
  /** Maximum label width in horizontal alignment (e.g., "110px") */
  maxLabelWidth?: string;
  /** Error message to display when hasError is true */
  errorMessage?: string;
  /** Custom color for error text */
  errorColor?: string;
  /** Width of the error message container (e.g., "293px") */
  errorMessageWidth?: string;
  /** HTML id attribute */
  id?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
  /** Right offset in pixels */
  offsetRight?: number;
  /** Maximum width of the tooltip */
  tooltipMaxWidth?: string;
  /** Additional CSS class for tooltip */
  tooltipClass?: string;

  dataTestId?: string;
};
