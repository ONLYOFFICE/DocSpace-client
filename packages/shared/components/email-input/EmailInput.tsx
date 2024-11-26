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

import React from "react";
import { isIOS, isMobile } from "react-device-detect";

import { EmailSettings, parseAddress } from "../../utils";
import { InputSize, InputType, TextInputProps } from "../text-input";

import StyledEmailInput from "./EmailInput.styled";
import { EmailInputProps, TValidate } from "./EmailInput.types";

const TextInputWrapper = ({
  onValidateInput,
  isValidEmail,
  emailSettings,
  customValidate,
  ...props
}: EmailInputProps & TextInputProps & { isValidEmail?: boolean }) => {
  return <StyledEmailInput {...props} data-testid="email-input" />;
};

const EmailInput = ({
  onValidateInput,
  customValidate,

  onBlur,
  onChange,

  isAutoFocussed,
  autoComplete = "email",
  className = "",
  hasError = undefined,
  id = "",
  isDisabled = false,
  isReadOnly = false,
  maxLength = 255,
  name = "",
  placeholder = "",
  scale = false,
  size = InputSize.base,
  title = "",
  withBorder = true,
  value = "",
  emailSettings,
  handleAnimationStart,
  ...rest
}: EmailInputProps & TextInputProps) => {
  const [inputValue, setInputValue] = React.useState(value);
  const [isValidEmail, setIsValidEmail] = React.useState<TValidate>(
    {} as TValidate,
  );

  const checkEmail = React.useCallback(
    (v: string) => {
      if (customValidate) {
        return customValidate(v);
      }

      const emailObj = parseAddress(v, emailSettings ?? new EmailSettings());
      const isValid = emailObj.isValid();
      const parsedErrors = emailObj.parseErrors;
      const errors = parsedErrors
        ? parsedErrors.map((error: { errorKey: string }) => error.errorKey)
        : [];
      return {
        value: v,
        isValid,
        errors,
      };
    },
    [customValidate, emailSettings],
  );

  //   const validate = React.useCallback(
  //     (v: string) => {
  //       const validEmail = checkEmail(v);
  //       setInputValue(v);
  //       setIsValidEmail(validEmail);
  //       onValidateInput?.(validEmail);
  //     },
  //     [checkEmail, onValidateInput],
  //   );

  const onChangeAction = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);

      const validEmail = checkEmail(e.target.value);

      setIsValidEmail(validEmail);
      setInputValue(e.target.value);

      onValidateInput?.(validEmail);
    },
    [onChange, onValidateInput, checkEmail],
  );

  const onBlurAction = React.useCallback(
    (e: React.FocusEvent<HTMLInputElement, Element>) => {
      onBlur?.(e);
    },
    [onBlur],
  );

  React.useEffect(() => {
    const validEmail = checkEmail(value);
    setIsValidEmail(validEmail);
  }, [checkEmail, value]);

  const isError =
    typeof hasError === "boolean"
      ? hasError
      : Boolean(inputValue && !isValidEmail.isValid);

  return (
    <TextInputWrapper
      {...rest}
      className={className}
      autoComplete={autoComplete}
      id={id}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      maxLength={maxLength}
      name={name}
      placeholder={placeholder}
      scale={scale}
      size={size}
      title={title}
      withBorder={withBorder}
      isAutoFocussed={isMobile && isIOS ? false : isAutoFocussed}
      hasError={isError}
      value={inputValue}
      onChange={onChangeAction}
      type={InputType.text}
      onValidateInput={onValidateInput}
      onBlur={onBlurAction}
      onAnimationStart={handleAnimationStart}
    />
  );
};

export { EmailInput };
