import { InputSize } from "../text-input/TextInput.enums";

export interface ColorInputProps {
  /** Class name */
  className?: string;
  /** Used as HTML `id` property  */
  id?: string;
  /** Default color */
  defaultColor?: string;
  /** Allows handling the changing values of the component */
  handleChange?: (color: string) => void;
  /** Supported size of the input fields. */
  size?: InputSize;
  /** Indicates the input field has scale */
  scale?: boolean;
  /** Indicates that the field cannot be used */
  isDisabled?: boolean;
  /** Indicates the input field has an error */
  hasError?: boolean;
  /** Indicates the input field has a warning */
  hasWarning?: boolean;
}
