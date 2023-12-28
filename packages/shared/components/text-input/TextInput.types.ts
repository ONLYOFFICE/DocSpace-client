import { Mask } from "react-text-mask";

import { InputSize, InputType } from "./TextInput.enums";

export interface TextInputProps {
  /** Used as HTML `id` property */
  id?: string;
  /** Forwarded ref */
  forwardedRef?: React.Ref<HTMLInputElement>;
  /** Used as HTML `name` property */
  name?: string;
  /** Supported type of the input fields. */
  type: InputType;
  /** Value of the input */
  value: string;
  /** Default maxLength value of the input */
  maxLength?: number;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Used as HTML `tabindex` property */
  tabIndex?: number;
  /** input text mask */
  mask?: Mask | ((value: string) => Mask);
  /** Allows to add or delete characters without changing the positions of the existing characters. */
  keepCharPositions?: boolean;
  /** When guide is true, Text Mask always shows both placeholder characters and non-placeholder mask characters. */
  guide?: boolean;
  /** Supported size of the input fields. */
  size: InputSize;
  /** Indicates the input field has scale */
  scale?: boolean;
  /** Called with the new value. Required when input is not read only. Parent should pass it back as `value` */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Called when field is blurred */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Called when field is focused */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLInputElement>) => void;
  /** Focus the input field on initial render */
  isAutoFocussed?: boolean;
  /** Indicates that the field cannot be used (e.g not authorised, or changes not saved) */
  isDisabled?: boolean;
  /** Indicates that the field is displaying read-only content */
  isReadOnly?: boolean;
  /** Indicates the input field has an error */
  hasError?: boolean;
  /** Indicates the input field has a warning */
  hasWarning?: boolean;
  /** Used as HTML `autocomplete` property */
  autoComplete?: string;
  /** Accepts class */
  className?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Sets the font weight */
  fontWeight?: number | string;
  /** Sets font weight value to 600 */
  isBold?: boolean;
  /** Indicates that component contain border */
  withBorder?: boolean;
  dir?: string;
  inputMode?: string;
}
