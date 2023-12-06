import React from "react";

import { EmailSettings, parseAddress } from "../../utils";
import StyledEmailInput from "./EmailInput.styled";
import { EmailInputProps, TValidate } from "./EmailInput.types";
import { InputSize, InputType, TextInputProps } from "../text-input";

const TextInputWrapper = ({
  onValidateInput,
  isValidEmail,
  emailSettings,
  customValidate,
  ...props
}: EmailInputProps & TextInputProps & { isValidEmail?: boolean }) => (
  <StyledEmailInput {...props} data-testid="email-input" />
);

const EmailInput = ({
  value,
  onValidateInput,
  customValidate,
  emailSettings,
  onBlur,
  onChange,
  hasError,
  ...rest
}: EmailInputProps) => {
  const [inputValue, setInputValue] = React.useState(value);
  const [isValidEmail, setIsValidEmail] = React.useState<TValidate>(
    {} as TValidate,
  );

  const checkEmail = React.useCallback(
    (v: string) => {
      if (customValidate) {
        return customValidate(v);
      }

      const emailObj = parseAddress(v, emailSettings);
      const isValid = emailObj.isValid();
      const parsedErrors = emailObj.parseErrors;
      const errors = parsedErrors
        ? parsedErrors.map((error: { errorKey: string }) => error.errorKey)
        : [];
      return {
        value,
        isValid,
        errors,
      };
    },
    [customValidate, emailSettings, value],
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

  React.useEffect(() => {}, []);

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
      hasError={isError}
      value={inputValue}
      onChange={onChangeAction}
      type={InputType.text}
      onValidateInput={onValidateInput}
      onBlur={onBlurAction}
    />
  );
};

EmailInput.defaultProps = {
  autoComplete: "email",
  className: "",
  hasError: undefined,
  id: "",
  isDisabled: false,
  isReadOnly: false,
  maxLength: 255,
  name: "",
  placeholder: "",
  scale: false,
  size: InputSize.base,
  title: "",
  value: "",
  withBorder: true,
  emailSettings: new EmailSettings(),
};

export { EmailInput };
