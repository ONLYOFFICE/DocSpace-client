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

export type ButtonOption = {
  /** Unique identifier for the button option */
  key: string;
  /** Display text for the button */
  label: string;
  /** Icon URL or component for the button */
  icon?: string;
  /** Click handler for the button */
  onClick?: () => void;
  /** Indicates if the button is in error state */
  error?: boolean;
  /** Optional HTML id attribute */
  id?: string;
  /** If true, renders as a separator instead of a button */
  isSeparator?: boolean;
  /** Nested button options for submenu */
  items?: ButtonOption[];
};

export type ProgressOption = {
  /** Controls visibility of the progress item */
  open?: boolean;
  /** Unique identifier for the progress option */
  key: string;
  /** Display text for the progress item */
  label: string;
  /** Additional CSS classes */
  className?: string;
  /** Icon URL or component */
  icon?: string;
  /** Progress completion percentage */
  percent?: number;
  /** Status text to display */
  status?: string;
  /** Handler for canceling the operation */
  onCancel?: () => void;
  /** Click handler for the progress item */
  onClick?: () => void;
  /** Indicates if the progress is in error state */
  error?: boolean;
};

export type ActionOption = {
  /** Action identifier */
  action?: string;
  /** Unique identifier for the action */
  key: string;
  /** Display text for the action */
  label: string;
  /** Additional CSS classes */
  className?: string;
  /** If true, renders as a separator */
  isSeparator?: boolean;
  /** Icon URL or component */
  icon?: string;
  /** Optional HTML id attribute */
  id?: string;
  /** Click handler for the action */
  onClick?: ({ action }: { action?: string }) => void;
  /** Nested action options for submenu */
  items?: ActionOption[];
  /** If true, hides the icon */
  withoutIcon?: boolean;
  /** If true, submenu is open by default */
  openByDefault?: boolean;
};

export type MainButtonMobileProps = {
  /** Ref to access the DOM element or React component instance */
  ref?: React.RefObject<MainButtonMobileRef>;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Drop down items options */
  actionOptions?: ActionOption[];
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
  /** If you need open upload panel when clicking on alert button */
  onAlertClick?: () => void;
  /** Enables alert click */
  withAlertClick?: boolean;
  /** Enables the submenu */
  withMenu?: boolean;
  /** If true, hides the main button */
  withoutButton?: boolean;
  /** Shows alert indicator on the button */
  alert?: boolean;
  /** Click handler for the main button */
  onClick?: (e: React.MouseEvent) => void;
  /** Custom styles for the dropdown */
  dropdownStyle?: React.CSSProperties;
  /** Main button ref, used for guidance */
  mainButtonRef?: React.RefObject<HTMLDivElement | null>;
};

export type SubmenuItemProps = {
  /** Action option configuration */
  option: ActionOption;
  /** Function to toggle submenu visibility */
  toggle: (value: boolean) => void;
  /** Disables hover effects if true */
  noHover: boolean;
  /** Function to recalculate submenu height */
  recalculateHeight: () => void;
  /** Key of the currently opened submenu */
  openedSubmenuKey: string;
  /** Function to set the opened submenu key */
  setOpenedSubmenuKey: (value: string) => void;
  /** If true, submenu is open by default */
  openByDefault: boolean;
};

export interface MainButtonMobileRef {
  /** Checks if the given target element is contained within the main button component */
  contains: (target: HTMLElement) => boolean;
  /** Returns the ref object pointing to the main button DOM element */
  getButtonElement: () => React.RefObject<HTMLDivElement | null>;
}
