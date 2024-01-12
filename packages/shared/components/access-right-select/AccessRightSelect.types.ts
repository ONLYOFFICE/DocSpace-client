import { TDirectionX } from "../../types";
import { ComboBoxSize, TOption } from "../combobox";

export interface AccessRightSelectProps {
  /** Accepts class */
  className: string;
  /** Indicates that component`s options are scaled by ComboButton */
  scaledOptions: boolean;
  /** Sets the component's width from the default settings */
  size: ComboBoxSize;
  /** Dropdown manual width */
  manualWidth: string;
  /** Indicates that component is scaled by parent */
  scaled: boolean;
  /** Will be triggered when the AccessRightSelect is a selected option */
  onSelect: (option: TOption) => void;
  /** List of advanced options */
  advancedOptions: React.ReactNode[];
  /** List of access options */
  accessOptions: TOption[];
  /** The option that is selected by default */
  selectedOption: TOption;
  directionX?: TDirectionX;
}
