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

import { TColorScheme } from "../../themes";
import { ButtonSize } from "./Button.enums";

export interface ButtonProps {
  /** Button text */
  label: string;
  title?: string;
  /** Sets the button primary */
  primary?: boolean;
  /** Size of the button.
   The normal size equals 36px and 40px in height on the Desktop and Touchcreen devices. */
  size?: ButtonSize;
  /** Scales the width of the button to 100% */
  scale?: boolean;
  /** Icon node element */
  icon?: React.ReactNode;
  /** Button tab index */
  tabIndex?: number;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts CSS style */
  style?: React.CSSProperties;
  /** Sets the button to show a hovered state */
  isHovered?: boolean;
  /** Disable hover effect */
  disableHover?: boolean;
  /** Sets the button to show a clicked state */
  isClicked?: boolean;
  /** Sets the button to show a disabled state */
  isDisabled?: boolean;
  /** Sets a button to show a loader icon */
  isLoading?: boolean;
  /** Sets the minimal button width */
  minWidth?: string;
  /** Sets the action initiated upon clicking the button */
  onClick?: (e: React.MouseEvent) => void;
  type?: HTMLButtonElement["type"];
}

export interface ButtonThemeProps extends ButtonProps {
  ref: React.LegacyRef<HTMLButtonElement>;
  $currentColorScheme?: TColorScheme;
}
