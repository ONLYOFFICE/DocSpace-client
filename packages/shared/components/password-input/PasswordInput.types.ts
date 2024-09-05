// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React, { MouseEvent } from "react";
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

export type PasswordInputHandle = {
  onGeneratePassword: (e: MouseEvent) => void;
  setState(state: TState): void;
  value?: string;
};

export type TState = {
  type: InputType.text | InputType.password;
  value?: string;
  copyLabel?: string;
  disableCopyAction?: boolean;
  displayTooltip: boolean;
  validLength: boolean;
  validDigits: boolean;
  validCapital: boolean;
  validSpecial: boolean;
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
  /** Title that indicates that the tooltip must contain allowed characters */
  tooltipAllowedCharacters?: string;
  /** Setting display block to set element to full width */
  isFullWidth?: boolean;
  /** Focus the input field on initial render */
  isAutoFocussed?: boolean;
}
