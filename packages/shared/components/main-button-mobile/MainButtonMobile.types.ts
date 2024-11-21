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

import { TColorScheme, TTheme } from "../../themes";

export type ButtonOption = {
  key: string;
  label: string;
  icon?: string;
  onClick?: () => void;
  error?: boolean;
  id?: string;
  isSeparator?: boolean;
  items?: ButtonOption[];
};
export type ProgressOption = {
  open?: boolean;
  key: string;
  label: string;
  className?: string;
  icon?: string;
  percent?: number;
  status?: string;
  onCancel?: () => void;
  onClick?: () => void;
  error?: boolean;
};
export type ActionOption = {
  action?: string;
  key: string;
  label: string;
  className?: string;
  isSeparator?: boolean;
  icon?: string;
  id?: string;
  onClick?: ({ action }: { action?: string }) => void;
  items?: ActionOption[];
  withoutIcon?: boolean;
  openByDefault?: boolean;
};

export interface MainButtonMobileProps {
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Drop down items options */
  actionOptions?: ActionOption[];
  /** Displays progress bar components */
  progressOptions?: ProgressOption[];
  /** Menu that opens by clicking on the button */
  buttonOptions?: ButtonOption[];
  /** The function called after the button is clicked */
  onUploadClick?: () => void;
  /** Displays button inside the drop down */
  withButton?: boolean;
  /** Opens a menu on clicking the button. Used with buttonOptions */
  isOpenButton?: boolean;
  /** The button name in the drop down */
  title?: string;
  /** Loading indicator */
  percent?: number;
  /** Width section */
  sectionWidth?: number;
  /** Specifies the exact width of the drop down component */
  manualWidth?: string;
  /** Accepts class */
  className?: string;
  /** Sets the dropdown to open */
  opened?: boolean;
  /** Closes the drop down */
  onClose?: () => void;
  /** If you need open upload panel when clicking on alert button  */
  onAlertClick?: () => void;
  /** Enables alert click  */
  withAlertClick?: boolean;
  /** Enables the submenu */
  withMenu?: boolean;
  withoutButton?: boolean;
  alert?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  dropdownStyle?: React.CSSProperties;
}

export interface ProgressBarMobileProps {
  label?: string;
  status?: string;
  percent: number;
  open: boolean;
  onCancel?: () => void;
  icon: string;
  /** The function called after the progress header is clicked  */
  onClickAction?: () => void;
  /** The function that facilitates hiding the button */
  hideButton?: () => void;
  /** Changes the progress bar color, if set to true */
  error?: boolean;
  className?: string;
}

export interface SubmenuItemProps {
  option: ActionOption;
  toggle: (value: boolean) => void;
  noHover: boolean;
  recalculateHeight: () => void;
  openedSubmenuKey: string;
  setOpenedSubmenuKey: (value: string) => void;
  openByDefault: boolean;
}

export interface ProgressBarMobileDefaultStyles {
  $currentColorScheme?: TColorScheme;
  interfaceDirection?: string;
  theme: TTheme;
  error?: boolean;
}
