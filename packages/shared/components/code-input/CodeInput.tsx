import React, { useRef, useEffect } from "react";

import InputWrapper from "./CodeInput.styled";
import { CodeInputProps } from "./CodeInput.types";

const CodeInput = (props: CodeInputProps) => {
  const { onSubmit, onChange, isDisabled, ...rest } = props;

  const inputsRef = useRef<HTMLInputElement[]>([]);
  const characters = 6;
  const allowed = "^[A-Za-z0-9]*$";

  useEffect(() => {
    if (inputsRef.current) inputsRef.current[0].focus();
  }, []);

  const onEnter = () => {
    if (inputsRef.current) {
      const code = inputsRef.current.map((input) => input.value).join("");
      if (code.length === characters) {
        onSubmit?.(code);
      }
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.match(allowed)) {
      onChange?.();
      if (e.target.nextElementSibling !== null) {
        if (e.target.nextElementSibling.nodeName === "HR") {
          (
            e.target.nextElementSibling.nextElementSibling as HTMLInputElement
          ).focus();
        }
        (e.target.nextElementSibling as HTMLInputElement).focus();
      }
    } else {
      e.target.value = "";
    }
    onEnter();
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = e;
    const target = e.target as HTMLInputElement;

    if (key === "Backspace") {
      onChange?.();
      if (target.value === "" && target.previousElementSibling !== null) {
        if (target.previousElementSibling !== null) {
          if (target.previousElementSibling.nodeName === "HR") {
            const prev = target.previousElementSibling
              .previousElementSibling as HTMLInputElement;

            prev?.focus();
          }
          (target.previousElementSibling as HTMLInputElement).focus();
          e.preventDefault();
        }
      } else {
        target.value = "";
      }
    }
  };

  const handleOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleOnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const value = e.clipboardData.getData("Text");
    if (value.match(allowed)) {
      for (let i = 0; i < characters && i < value.length; i += 1) {
        if (inputsRef.current) {
          inputsRef.current[i].value = value.charAt(i);

          if (inputsRef.current[i].nextElementSibling !== null) {
            (
              inputsRef.current[i].nextElementSibling as HTMLInputElement
            ).focus();
          }
        }
      }
    }
    onEnter();
    e.preventDefault();
  };

  const elements = [];
  for (let i = 0; i < characters; i += 1) {
    if (i === 3) elements.push(<hr key="InputCode-line" />);
    elements.push(
      <input
        key={`InputCode-${i}`}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
        onFocus={handleOnFocus}
        onPaste={handleOnPaste}
        ref={(el) => {
          if (el) inputsRef.current[i] = el;
        }}
        maxLength={1}
        disabled={isDisabled}
      />,
    );
  }

  return (
    <InputWrapper {...rest} data-testid="code-input">
      {elements}
    </InputWrapper>
  );
};

CodeInput.defaultProps = {
  isDisabled: false,
};

export { CodeInput };
