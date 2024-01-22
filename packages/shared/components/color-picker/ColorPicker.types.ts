export interface ColorPickerProps {
  /** Class name */
  className?: string;
  /** Used as HTML `id` property  */
  id?: string;
  /** Triggers function on color picker close */
  onClose?: () => void;
  /** Triggers function on color apply */
  onApply: (color: string) => void;
  /** Default color */
  appliedColor?: string;
  /** Apply button text */
  applyButtonLabel: string;
  /** Cancel button text */
  cancelButtonLabel: string;
}
