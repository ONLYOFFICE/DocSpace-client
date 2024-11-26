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

import type { TColorScheme } from "../../themes";
import { ButtonSize } from "./Button.enums";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text content displayed inside the button */
  label: string;
  /** Tooltip text shown on hover */
  title?: string;
  /** When true, applies primary button styling with brand colors */
  primary?: boolean;
  /** Controls the button dimensions. Normal size is 36px height on Desktop and 40px on Touchscreen */
  size?: ButtonSize;
  /** When true, button width expands to fill its container (width: 100%) */
  scale?: boolean;
  /** Optional icon element rendered before the label */
  icon?: React.ReactNode;
  /** Overrides the default tab order of the button */
  tabIndex?: number;
  /** Additional CSS classes to apply to the button */
  className?: string;
  /** HTML id attribute for the button element */
  id?: string;
  /** Custom inline styles to apply to the button */
  style?: React.CSSProperties;
  /** Forces the button to display its hover state */
  isHovered?: boolean;
  /** When true, hover effects are not applied even on mouse hover */
  disableHover?: boolean;
  /** Forces the button to display its active/clicked state */
  isClicked?: boolean;
  /** Disables button interactions and applies disabled styling */
  isDisabled?: boolean;
  /** Shows a loading spinner and disables the button */
  isLoading?: boolean;
  /** Sets a minimum width for the button (CSS value) */
  minWidth?: string;
  /** Click event handler function */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** HTML button type attribute (submit, button, reset) */
  type?: HTMLButtonElement["type"];
}

export interface ButtonThemeProps extends ButtonProps {
  ref: React.LegacyRef<HTMLButtonElement>;
  $currentColorScheme?: TColorScheme;
}
