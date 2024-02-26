export interface ColorPickerProps {
  /** Class name */
  className?: string;
  /** Used as HTML `id` property  */
  id?: string;
  /** Triggers function on color picker close */
  onClose: () => void;
  /** Hides controls */
  isPickerOnly: boolean;
  /** Triggers function on color apply */
  onApply: (color: string) => void;
  /** Selected color */
  appliedColor: string;
  /** Apply button text */
  applyButtonLabel: string;
  /** Cancel button text */
  cancelButtonLabel: string;
  /** Allows handling the changing values of the component */
  handleChange?: (color: string) => void;
  /** Hex code text */
  hexCodeLabel?: string;
}
