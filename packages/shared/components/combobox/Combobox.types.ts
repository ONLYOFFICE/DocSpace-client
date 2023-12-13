import { TColorScheme } from "../../themes";
import { TDirectionX, TDirectionY } from "../../types";
import { ComboBoxDisplayType, ComboBoxSize } from "./Combobox.enums";

export type TCombobox = null | "badge";

export type TOption = {
  key: string | number;
  icon?: string;
  label: string;
  color?: string;
  backgroundColor?: string;
  border?: string;
  default?: boolean;
  disabled?: boolean;
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
  onSelect: (option?: TOption) => void;
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
  setIsOpenItemAccess?: (value: boolean) => void;
  onClickSelectedItem?: (option: TOption) => void;
  withoutBackground?: boolean;
  forceCloseClickOutside?: boolean;
  hideMobileView?: boolean;
  isNoFixedHeightOptions?: boolean;
  isMobileView?: boolean;
  withBackground?: boolean;
  isAside?: boolean;
  withBlur?: boolean;
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
