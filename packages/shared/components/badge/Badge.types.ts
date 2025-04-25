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
import { TextProps } from "../text/Text.types";

export type BadgeProps = TextProps & {
  /** Content to be displayed inside the badge. Can be a number (e.g., notification count) or text */
  label?: string | number;
  /** Custom border radius to adjust badge corners. Accepts CSS size values */
  borderRadius?: string;
  /** Custom padding to adjust badge spacing. Accepts CSS padding values */
  padding?: string;
  /** Maximum width of the badge. Useful for text truncation. Accepts CSS size values */
  maxWidth?: string;
  /** Mouse leave event handler */
  onMouseLeave?: (e: React.MouseEvent) => void;
  /** Mouse over event handler */
  onMouseOver?: (e: React.MouseEvent) => void;
  /** Disable hover effect */
  noHover?: boolean;
  /** Sets badge type to high priority. Changes visual appearance */
  type?: "high";
  /** When true, applies compact styling for smaller badge display */
  compact?: boolean;
  /** Custom border style for the badge. Accepts CSS border values */
  border?: string;
  /** Custom height for the badge. Accepts CSS size values */
  height?: string;
  /** When true, applies version badge specific styling. Used for displaying version numbers */
  isVersionBadge?: boolean;
  /** When true, applies muted styling for less prominent notifications or inactive states */
  isMutedBadge?: boolean;
  /** When true, applies special styling for paid/premium features */
  isPaidBadge?: boolean;
  /** Handler for mouse over events. Used for hover state management and interactions */
  /** When true, applies custom hover styles */
  isHovered?: boolean;
};
