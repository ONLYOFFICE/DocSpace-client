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

import { TContextMenuValueTypeOnClick } from "../context-menu/ContextMenu.types";
import { ShareAccessRights } from "../../enums";
import { TColorScheme } from "../../themes";
import { TDirectionX, TDirectionY } from "../../types";
import { ComboBoxDisplayType, ComboBoxSize } from "./ComboBox.enums";

export type TCombobox = null | "badge" | "onlyIcon" | "descriptive";

export type TBaseOption = {
  key: string | number;
  icon?: string | React.ElementType | React.ReactElement;
  label?: string;
  color?: string;
  backgroundColor?: string;
  border?: string;
  default?: boolean;
  disabled?: boolean;
  type?: string;
  description?: string;
  quota?: "free" | "paid";
  isSelected?: boolean;
  isBeta?: boolean;
  internal?: boolean;
  access?: ShareAccessRights;
  className?: string;
  title?: string;
  dataTestId?: string;
  action?: unknown;
  onClick?: (opt: TContextMenuValueTypeOnClick) => void;
  pageNumber?: number;
  count?: number;
};

export type TRegularOption = TBaseOption & {
  label: string;
  isSeparator?: boolean;
};

export type TSeparatorOption = TBaseOption & {
  isSeparator?: true;
};

export type TOption = TRegularOption | TSeparatorOption;

export type TComboboxProps = {
  /** Displays advanced options */
  advancedOptions?: React.ReactElement<{ children?: React.ReactNode }>;
  /** Number of advanced options */
  advancedOptionsCount?: number;
  /** Children elements */
  children?: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Class name for dropdown container */
  dropDownClassName?: string;
  /** Icon for the combo button */
  comboIcon?: string;
  /** Disable icon click */
  disableIconClick?: boolean;
  /** Disable item click */
  disableItemClick?: boolean;
  /** Disable first level item click */
  disableItemClickFirstLevel?: boolean;
  /** X direction position */
  directionX?: TDirectionX;
  /** Y direction position */
  directionY?: TDirectionY;
  /** Component Display Type */
  displayType?: ComboBoxDisplayType;
  /** Display selected option */
  displaySelectedOption?: boolean;
  /** Display arrow */
  displayArrow?: boolean;
  /** Height of Dropdown */
  dropDownMaxHeight?: number;
  /** Test id for dropdown */
  dropDownTestId?: string;
  /** Shows disabled items when displayType !== toggle */
  showDisabledItems?: boolean;
  /** Fill icon */
  fillIcon?: boolean;
  /** Fixed direction */
  fixedDirection?: boolean;
  /** Value to display in the plus badge */
  plusBadgeValue?: number;
  /** Force close on click outside */
  forceCloseClickOutside?: boolean;
  /** Hide mobile view */
  hideMobileView?: boolean;
  /** Accepts id */
  id?: string;
  /** Accepts id for dropdown container */
  dropDownId?: string;
  /** Is aside */
  isAside?: boolean;
  /** Is disabled */
  isDisabled?: boolean;
  /** Is loading */
  isLoading?: boolean;
  /** Is default mode */
  isDefaultMode?: boolean;
  /** Is mobile view */
  isMobileView?: boolean;
  /** Is no fixed height options */
  isNoFixedHeightOptions?: boolean;
  /** Manual width */
  manualWidth?: string;
  /** Manual X position */
  manualX?: string;
  /** Manual Y position */
  manualY?: number | string;
  /** Modern view */
  modernView?: boolean;
  /** No border */
  noBorder?: boolean;
  /** Offset left */
  offsetX?: number;
  /** Opened state */
  opened?: boolean;
  /** List of options */
  options: TOption[];
  /** Option style */
  optionStyle?: React.CSSProperties;
  /** Placeholder for search option */
  searchPlaceholder?: string;
  /** Selected option */
  selectedOption: TOption;
  /** Scaled */
  scaled?: boolean;
  /** Scaled options */
  scaledOptions?: boolean;
  /** Set is open item access */
  setIsOpenItemAccess?: (isOpen: boolean) => void;
  /** Size */
  size?: `${ComboBoxSize}`;

  role?: string;
  /** Style */
  style?: React.CSSProperties;
  /** Tab index */
  tabIndex?: number;
  /** Text overflow */
  textOverflow?: boolean;
  /** Title */
  title?: string;
  /** Top space */
  topSpace?: number;
  /** Test id */
  testId?: string;
  /** Type */
  type?: TCombobox;
  /** Use portal backdrop */
  usePortalBackdrop?: boolean;
  /** With backdrop */
  withBackdrop?: boolean;
  /** With background */
  withBackground?: boolean;
  /** With blur */
  withBlur?: boolean;
  /** With label */
  withLabel?: boolean;
  /** Without background */
  withoutBackground?: boolean;
  /** Without padding */
  withoutPadding?: boolean;
  /** With search */
  withSearch?: boolean;
  /** On backdrop click */
  onBackdropClick?: (e: Event) => void;
  /** On click selected item */
  onClickSelectedItem?: (option: TOption) => void;
  /** On select */
  onSelect?: (option: TOption) => void;
  /** On toggle */
  onToggle?: (e: React.MouseEvent<HTMLDivElement>, isOpen: boolean) => void;

  /** Indicates if the backdrop should be shown */
  shouldShowBackdrop?: boolean;
  /** Data test id */
  dataTestId?: string;
  /** Disables text selection */
  noSelect?: boolean;
  /** Optional flag to use an image icon. */
  useImageIcon?: boolean;
};

export type TComboButtonProps = {
  /** Indicates if the button has no border */
  noBorder?: boolean;
  /** Indicates if the button is disabled */
  isDisabled?: boolean;
  /** Selected option */
  selectedOption: TOption;
  /** Indicates if the button has options */
  withOptions?: boolean;
  /** Length of options */
  optionsLength?: number;
  /** Indicates if the button has advanced options */
  withAdvancedOptions?: boolean;
  /** Inner container content */
  innerContainer?: React.ReactNode;
  /** Inner container class name */
  innerContainerClassName?: string;
  /** Indicates if the dropdown is open */
  isOpen?: boolean;
  /** Size of the button */
  size?: ComboBoxSize;
  /** Indicates if the button is scaled */
  scaled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Icon for the combo button */
  comboIcon?: string;
  /** Indicates if the icon should be filled */
  fillIcon?: boolean;
  /** Indicates if modern view should be used */
  modernView?: boolean;
  /** Tab index */
  tabIndex?: number;
  /** Indicates if the button is loading */
  isLoading?: boolean;
  /** Type of the combo box */
  type?: TCombobox;
  /** Value for plus badge */
  plusBadgeValue?: number;
  /** Indicates if arrow should be displayed */
  displayArrow?: boolean;
  /** Disables text selection */
  noSelect?: boolean;
  /** Icon image */
  imageIcon?: string | React.ElementType | React.ReactElement;
  /** Image alt */
  imageAlt?: string;
};

export interface TComboButtonThemeProps {
  /** Current color scheme */
  $currentColorScheme?: TColorScheme;
  /** Interface direction */
  interfaceDirection?: string;
  /** Number of options */
  containOptions?: number;
  /** Indicates if option is selected */
  isSelected?: boolean;
  /** Class name */
  className?: string;
  /** Indicates if arrow should be displayed */
  displayArrow?: boolean;
  /** Children elements */
  children?: React.ReactNode;
  /** Indicates if dropdown is open */
  isOpen?: boolean;
  /** Indicates if button is disabled */
  isDisabled?: boolean;
  /** Indicates if button has no border */
  noBorder?: boolean;
  /** Indicates if button has advanced options */
  withAdvancedOptions?: boolean;
  /** Indicates if button is scaled */
  scaled?: boolean;
  /** Size of the button */
  size?: ComboBoxSize;
  /** Indicates if modern view should be used */
  modernView?: boolean;
  /** Indicates if button is loading */
  isLoading?: boolean;
  /** Type of the combo box */
  type?: TCombobox;
  /** Selected option */
  selectedOption?: TOption;
  /** Value for plus badge */
  plusBadgeValue?: number;
  /** Click handler */
  onClick?: () => void;
  tabIndex?: number;
  role?: string;
  "aria-disabled"?: boolean;
  "aria-expanded"?: boolean;
  "aria-pressed"?: boolean;
  "aria-haspopup"?:
    | boolean
    | "dialog"
    | "grid"
    | "listbox"
    | "menu"
    | "tree"
    | "true"
    | "false";
  "data-test-id"?: string;
}
