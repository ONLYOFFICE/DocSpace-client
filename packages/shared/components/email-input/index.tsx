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

import React from "react";
import { isIOS, isMobile } from "react-device-detect";
import { parseAddress } from "../../utils";
import { InputType, TextInput } from "../text-input";
import type { EmailInputProps, TValidate } from "./EmailInput.types";
import styles from "./EmailInput.module.scss";

export type { EmailInputProps, TValidate };

export const EmailInput = ({
  onValidateInput,
  customValidate,
  emailSettings,
  value = "",
  isAutoFocussed,
  autoComplete = "email",
  hasError,
  handleAnimationStart,
  onChange,
  onBlur,
  dataTestId,
  ...rest
}: EmailInputProps) => {
  const [inputValue, setInputValue] = React.useState(value);
  const [validationState, setValidationState] = React.useState<TValidate>({
    value: "",
    isValid: true,
    errors: [],
  });

  const validateEmail = React.useCallback(
    (emailValue: string): TValidate => {
      if (customValidate) return customValidate(emailValue);

      const emailObj = parseAddress(emailValue, emailSettings);
      const isValid = emailObj.isValid();
      const errors =
        emailObj.parseErrors?.map(
          (error: { errorKey: string }) => error.errorKey,
        ) ?? [];

      return { value: emailValue, isValid, errors };
    },
    [customValidate, emailSettings],
  );

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const validation = validateEmail(newValue);

      setInputValue(newValue);
      setValidationState(validation);

      onChange?.(e);
      onValidateInput?.(validation);
    },
    [onChange, onValidateInput, validateEmail],
  );

  React.useEffect(() => {
    setInputValue(value);
    setValidationState(validateEmail(value));
  }, [value, validateEmail]);

  const computedHasError =
    hasError ?? Boolean(inputValue && !validationState.isValid);

  return (
    <TextInput
      {...rest}
      className={styles.emailInput}
      type={InputType.text}
      value={inputValue}
      hasError={computedHasError}
      autoComplete={autoComplete}
      isAutoFocussed={isMobile && isIOS ? false : isAutoFocussed}
      onChange={handleChange}
      onBlur={onBlur}
      onAnimationStart={handleAnimationStart}
      testId={dataTestId ?? "email-input"}
    />
  );
};
