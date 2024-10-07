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

import { ShareAccessRights } from "../../enums";
import { TColorScheme } from "../../themes";
import { TDirectionX, TDirectionY } from "../../types";
import { ComboBoxDisplayType, ComboBoxSize } from "./Combobox.enums";

export type TCombobox = null | "badge" | "onlyIcon";

export type TOption =
  | {
      key: string | number;
      icon?: string;
      label: string;
      color?: string;
      backgroundColor?: string;
      border?: string;
      default?: boolean;
      disabled?: boolean;
      description?: string;
      quota?: "free" | "paid";
      isSeparator?: boolean;
      isSelected?: boolean;
      internal?: boolean;
      access?: ShareAccessRights;
      className?: string;
      title?: string;
      action?: unknown;
    }
  | {
      key: string | number;
      icon?: undefined;
      label?: undefined;
      color?: undefined;
      backgroundColor?: undefined;
      border?: undefined;
      default?: undefined;
      disabled?: undefined;
      description?: undefined;
      quota?: undefined;
      isSeparator: true;
      isSelected?: undefined;
      internal?: undefined;
      access?: ShareAccessRights;
      className?: string;
      title?: string;
      action?: unknown;
    };

export interface ComboboxProps {
  /** Displays advanced options */
  advancedOptions?: React.ReactNode;
  /** Children elements */
  children?: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** X direction position */
  directionX?: TDirectionX;
  /** Y direction position */
  directionY?: TDirectionY;
  /** Component Display Type */
  displayType?: ComboBoxDisplayType;
  /** Height of Dropdown */
  dropDownMaxHeight?: number;
  /** Displays disabled items when displayType !== toggle */
  showDisabledItems?: boolean;
  /** Accepts id */
  id?: string;
  /** Accepts id for dropdown container */
  dropDownId?: string;
  /** Indicates that component contains a backdrop */
  withBackdrop?: boolean;
  /** Indicates that component is disabled */
  isDisabled?: boolean;
  /** Indicates that component is displayed without borders */
  noBorder?: boolean;
  /** Is triggered whenever ComboBox is a selected option */
  onSelect: (option: TOption) => void;
  /** Sets the component open */
  opened?: boolean;
  /** Combo box options */
  options: TOption[];
  /** Indicates that component is scaled by parent */
  scaled?: boolean;
  /** Indicates that component`s options are scaled by ComboButton */
  scaledOptions?: boolean;
  /** Selected option */
  selectedOption: TOption;
  /** Sets the component's width from the default settings */
  size?: ComboBoxSize;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** The event is triggered by clicking on a component when `displayType: toggle` */
  onToggle?: (e: Event | React.MouseEvent, isOpen: boolean) => void;
  /** Accepts css text-overflow */
  textOverflow?: boolean;
  /** Disables clicking on the icon */
  disableIconClick?: boolean;
  /** Sets the operation mode of the component. The default option is set to portal mode */
  isDefaultMode?: boolean;
  /** Y offset */
  offsetDropDownY?: string;
  /** Sets an icon that is displayed in the combo button */
  comboIcon?: string;
  /** Sets the precise distance from the parent */
  manualY?: string;
  /** Sets the precise distance from the parent */
  manualX?: string;
  /** Dropdown manual width */
  manualWidth?: string;
  /** Displays the selected option */
  displaySelectedOption?: boolean;
  /** Disables position checking. Used for explicit direction setting */
  fixedDirection?: boolean;
  /** Disables clicking on the item */
  disableItemClick?: boolean;
  /** Indicates that component will fill selected item icon */
  fillIcon?: boolean;
  /** Sets the left offset for the dropdown */
  offsetLeft?: number;
  /** Sets the combo-box to be displayed in modern view */
  modernView?: boolean;
  /** Count of advanced options  */
  advancedOptionsCount?: number;
  /** Accepts css tab-index style */
  tabIndex?: number;
  /** Disables the combo box padding */
  withoutPadding?: boolean;
  /** Indicates when the component is loading */
  isLoading?: boolean;
  /** Type ComboBox */
  type?: TCombobox;
  /** Accepts css style */
  optionStyle?: React.CSSProperties;
  setIsOpenItemAccess?: (value: boolean) => void;
  onClickSelectedItem?: (option: TOption) => void;
  withoutBackground?: boolean;
  forceCloseClickOutside?: boolean;
  /** The event is triggered by clicking outside the component when `withBackdrop === true` */
  onBackdropClick?: (e?: Event | React.MouseEvent) => void;
  hideMobileView?: boolean;
  isNoFixedHeightOptions?: boolean;
  isMobileView?: boolean;
  withBackground?: boolean;
  isAside?: boolean;
  withBlur?: boolean;
  title?: string;
  plusBadgeValue?: number;
  withLabel?: boolean;
  displayArrow?: boolean;
}

export interface ComboButtonProps {
  noBorder?: boolean;
  isDisabled?: boolean;
  selectedOption: TOption;
  withOptions?: boolean;
  optionsLength?: number;
  withAdvancedOptions?: boolean;
  innerContainer?: React.ReactNode;
  innerContainerClassName?: string;
  isOpen?: boolean;
  size?: ComboBoxSize;
  scaled?: boolean;
  onClick?: () => void;
  comboIcon?: string;
  fillIcon?: boolean;
  modernView?: boolean;
  tabIndex?: number;
  isLoading?: boolean;
  type?: TCombobox;
  plusBadgeValue?: number;
  displayArrow?: boolean;
}

export interface ComboButtonThemeProps extends ComboButtonProps {
  ref: React.LegacyRef<HTMLDivElement>;
  $currentColorScheme?: TColorScheme;
  interfaceDirection?: string;
  containOptions?: number;
  isSelected?: boolean;
  className?: string;
  displayArrow?: boolean;
  children?: React.ReactNode;
}
