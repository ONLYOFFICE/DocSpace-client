export interface CodeInputProps {
  /** Sets a callback function that is triggered when the enter is pressed */
  onSubmit: (code: string) => void;
  /** Sets a callback function that is triggered on the onChange event */
  onChange?: () => void;
  /** Sets the code input to present a disabled state */
  isDisabled?: boolean;
  /** Accepts class */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
}
