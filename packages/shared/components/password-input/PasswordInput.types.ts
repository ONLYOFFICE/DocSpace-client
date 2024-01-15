import React from "react";
import { InputSize, InputType } from "../text-input";

export type TPasswordSettings = {
  minLength?: number;
  upperCase?: boolean;
  digits?: boolean;
  specSymbols?: boolean;
  digitsRegexStr?: string;
  upperCaseRegexStr?: string;
  specSymbolsRegexStr?: string;
  allowedCharactersRegexStr?: string;
};

export type TPasswordValidation = {
  allowed: boolean;
  digits: boolean;
  capital: boolean;
  special: boolean;
  length: boolean;
};

export interface PasswordInputProps {
  /** Allows setting the component id  */
  id?: string;
  /** Allows setting the component auto-complete */
  autoComplete?: string;
  /** Facilitates the correct display of values inside the input */
  inputType: InputType.text | InputType.password;
  /** Input name */
  inputName?: string;
  /** Required to associate the password field with the email field */
  emailInputName?: string;
  /** Input value */
  inputValue?: string;
  /** Sets a callback function that is triggered on PasswordInput */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Default event that is triggered when the button is already pressed but not released */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Event that is triggered when the focused item is lost  */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Sets the input width manually */
  inputWidth?: string;
  /** Notifies if the error occurs */
  hasError?: boolean;
  /** Notifies if the warning occurs */
  hasWarning?: boolean;
  /** Default placeholder input */
  placeholder?: string;
  /** Tab index input */
  tabIndex?: number;
  /** Default maxLength input */
  maxLength?: number;
  /** Accepts class */
  className?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Forwarded ref */
  forwardedRef?: React.Ref<HTMLInputElement>;
  /** Sets the input disabled */
  isDisabled?: boolean;
  size: InputSize;
  /** Indicates that the input field has scale  */
  scale?: boolean;
  /** Allows to hide Tooltip */
  isDisableTooltip?: boolean;
  /** Allows to show Tooltip text */
  isTextTooltipVisible?: boolean;
  /** Prompts to copy the email and password data to clipboard */
  clipActionResource?: string;
  /** Prompts to copy the email data to clipboard */
  clipEmailResource?: string;
  /** Prompts to copy the password data to clipboard */
  clipPasswordResource?: string;
  /** Prompts that the data has been copied to clipboard */
  clipCopiedResource?: string;
  /** Title that indicates that the tooltip must contain a password */
  tooltipPasswordTitle?: string;
  /** Prompt that indicates the minimal password length  */
  tooltipPasswordLength?: string;
  /** Prompt that instructs to include digits into the password */
  tooltipPasswordDigits?: string;
  /** Prompt that indicates that capital letters are allowed */
  tooltipPasswordCapital?: string;
  /** Prompt that indicates that special characters are allowed */
  tooltipPasswordSpecial?: string;
  /** Set of special characters for password generator and validator */
  generatorSpecial?: string;
  /** Set of settings for password generator and validator */
  passwordSettings?: TPasswordSettings;
  /** Sets a callback function that is triggered on PasswordInput. Returns boolean value */
  onValidateInput?: (
    progressScore: boolean,
    passwordValidation: TPasswordValidation,
  ) => void;
  /** Sets a callback function that is triggered when the copy button is clicked. Returns formatted value */
  onCopyToClipboard?: (value: string) => string;
  /** Sets the tooltip offset to the left */
  tooltipOffsetLeft?: number;
  /** Sets the tooltip offset to the top */
  tooltipOffsetTop?: number;
  /** Sets the password input view to simple (without tooltips, password progress bar and several additional buttons (copy and generate password) */
  simpleView?: boolean;
  /** Sets a title of the password generation button */
  generatePasswordTitle?: string;
  /** Setting display block to set element to full width */
  isFullWidth?: boolean;
}
