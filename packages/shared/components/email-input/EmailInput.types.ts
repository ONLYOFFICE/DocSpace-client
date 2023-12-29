import { InputSize } from "../text-input";
import { EmailSettings } from "../../utils";

export type TValidate = { value: string; isValid: boolean; errors?: string[] };

export interface EmailInputProps {
  /** Accepts class */
  className?: string;
  /** Function for custom validation of the input value. Function must return object with following parameters: `value`: string value of input, `isValid`: boolean result of validating, `errors`(optional): array of errors */
  customValidate?: (value: string) => TValidate;
  /** { allowDomainPunycode: false, allowLocalPartPunycode: false, allowDomainIp: false, allowStrictLocalPart: true, allowSpaces: false, allowName: false, allowLocalDomainName: false } | Settings for validating email  */
  emailSettings?: EmailSettings;
  /** Used in custom validation  */
  hasError?: boolean;
  /** Supported size of the input fields.  */
  size: InputSize;
  /** Accepts id  */
  id?: string;
  /** Function for custom handling of input changes  */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Event that is triggered when the focused item is lost  */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Function that validates the value, and returns the object with following parameters: `isValid`: boolean result of validating, `errors`: array of errors */
  onValidateInput?: (
    data: TValidate,
  ) => { isValid: boolean; errors: string[] } | undefined;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Value of the input */
  value: string;
  /** Used as HTML `autocomplete` property */
  autoComplete?: string;
  /** Indicates that the field cannot be used (e.g not authorised, or changes not saved)  */
  isDisabled?: boolean;
  /** Indicates that the field is displaying read-only content */
  isReadOnly?: boolean;
  /** Used as HTML `name` property  */
  name?: string;
  /** Placeholder text for the input  */
  placeholder?: string;
  /** Indicates that the input field has scale */
  scale?: boolean;
}
