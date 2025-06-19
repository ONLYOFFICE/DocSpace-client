// (c) Copyright Ascensio System SIA 2009-2025
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

import { InputType } from "../text-input";
import { InputBlockProps } from "../input-block/InputBlock.types";

export type TPasswordSettings = {
  /** Minimum length requirement for the password */
  minLength?: number;
  /** Requires uppercase characters in the password */
  upperCase?: boolean;
  /** Requires digits in the password */
  digits?: boolean;
  /** Requires special symbols in the password */
  specSymbols?: boolean;
  /** Regular expression for validating digits */
  digitsRegexStr?: string;
  /** Regular expression for validating uppercase characters */
  upperCaseRegexStr?: string;
  /** Regular expression for validating special symbols */
  specSymbolsRegexStr?: string;
  /** Regular expression for allowed characters */
  allowedCharactersRegexStr?: string;
};

export type TPasswordValidation = {
  /** Whether all characters are allowed */
  allowed: boolean;
  /** Whether digits requirement is met */
  digits: boolean;
  /** Whether capital letters requirement is met */
  capital: boolean;
  /** Whether special characters requirement is met */
  special: boolean;
  /** Whether length requirement is met */
  length: boolean;
};

export type TPasswordState = {
  /** Current input type (text/password) */
  type: InputType.text | InputType.password;
  /** Current input value */
  value?: string;
  /** Copy button label */
  copyLabel?: string;
  /** Whether copy action is disabled */
  disableCopyAction?: boolean;
  /** Whether tooltip is displayed */
  displayTooltip: boolean;
  /** Validation states */
  validLength: boolean;
  validDigits: boolean;
  validCapital: boolean;
  validSpecial: boolean;
};

export type PasswordInputHandle = {
  /** Generate password handler */
  onGeneratePassword: (e: MouseEvent) => void;
  /** Set component state */
  setState(state: TPasswordState): void;
  /** Current value */
  value?: string;
};

export type TPasswordTooltipProps = {
  /** Title for password requirements tooltip */
  tooltipPasswordTitle?: string;
  /** Prompt for minimum length requirement */
  tooltipPasswordLength?: string;
  /** Prompt for digits requirement */
  tooltipPasswordDigits?: string;
  /** Prompt for capital letters requirement */
  tooltipPasswordCapital?: string;
  /** Prompt for special characters requirement */
  tooltipPasswordSpecial?: string;
  /** Title for allowed characters tooltip */
  tooltipAllowedCharacters?: string;
  /** Allows to hide Tooltip */
  isDisableTooltip?: boolean;
  /** Title of the password generation button */
  generatePasswordTitle?: string;
};

type PasswordInputBaseProps = {
  ref?: React.RefObject<PasswordInputHandle | null>;
  /** Input value */
  inputValue?: string;
  /** Required to associate the password field with the email field */
  emailInputName?: string;
  /** Set of settings for password generator and validator */
  passwordSettings?: TPasswordSettings;
  /** Callback function triggered on validation */
  onValidateInput?: (
    progressScore: boolean,
    passwordValidation: TPasswordValidation,
  ) => void;
  /** Set of special characters for password generator */
  generatorSpecial?: string;
  /** Sets the password input view to simple */
  simpleView?: boolean;
  /** Setting display block for full width */
  isFullWidth?: boolean;
  /** Indicating the password type simulation */
  isSimulateType?: boolean;
  /** Sets simulate input symbol */
  simulateSymbol?: string;
  /** Prompts to copy the email and password data */
  clipActionResource?: string;
  /** Prompts that the data has been copied */
  clipCopiedResource?: string;
};

export type PasswordInputProps = Omit<
  InputBlockProps,
  | "type"
  | "value"
  | "onChange"
  | "children"
  | "iconName"
  | "iconButtonClassName"
  | "name"
  | "width"
> &
  PasswordInputBaseProps &
  TPasswordTooltipProps & {
    /** Input type override */
    inputType?: InputType.text | InputType.password;
    inputName?: string;
    inputWidth?: string;
    /** Callback function triggered on input change */
    onChange?: (e: React.ChangeEvent<HTMLInputElement>, value?: string) => void;
  };
