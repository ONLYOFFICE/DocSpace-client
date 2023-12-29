import { TColorScheme, TTheme } from "../../themes";

export type ButtonOption = {
  key?: string;
  label?: string;
  icon?: string;
  onClick?: () => void;
  error?: boolean;
  id?: string;
  isSeparator?: boolean;
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
}

export interface ProgressBarMobileDefaultStyles {
  $currentColorScheme?: TColorScheme;
  interfaceDirection?: string;
  theme: TTheme;
  error?: boolean;
}
