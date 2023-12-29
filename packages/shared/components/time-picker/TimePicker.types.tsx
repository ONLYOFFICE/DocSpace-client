import { Moment } from "moment";

export interface TimePickerProps {
  /** Default time */
  initialTime: object;
  /** Allows to set classname */
  className?: string;
  /** Allow you to handle changing events of component */
  onChange: (value: Moment) => void;
  /** Indicates error */
  hasError?: boolean;
  /** Triggers function on blur */
  onBlur?: () => void;
  /** Focus input on render */
  focusOnRender?: boolean;
  /** Passes ref to child component */
  forwardedRef?: React.RefObject<HTMLInputElement>;
  tabIndex?: number;
  classNameInput?: string;
}
