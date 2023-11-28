import React from "react";

import Text from "@docspace/components/text";
import InputBlock from "@docspace/components/input-block";
import Button from "@docspace/components/button";
//@ts-ignore
import HelpButton from "@docspace/components/help-button";
//@ts-ignore
import FieldContainer from "@docspace/components/field-container";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";

import { StyledInputGroup } from "../ClientForm.styled";

interface InputGroupProps {
  label: string;

  name: string;
  value: string;
  placeholder: string;

  error: string;

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  helpButtonText?: string;

  buttonLabel?: string;
  onButtonClick?: () => void;

  withCopy?: boolean;
  onCopyClick?: (name: string) => void;
  isPassword?: boolean;

  disabled?: boolean;
  isRequired?: boolean;
  isError?: boolean;
  children?: React.ReactNode;
}

const InputGroup = ({
  label,

  name,
  value,
  placeholder,

  error,

  onChange,

  helpButtonText,

  buttonLabel,
  onButtonClick,

  withCopy,
  onCopyClick,
  isPassword,
  disabled,
  isRequired,
  isError,
  children,
}: InputGroupProps) => {
  return (
    <StyledInputGroup>
      <FieldContainer
        isVertical
        isRequired={isRequired}
        labelVisible
        labelText={label}
        tooltipContent={helpButtonText}
        errorMessage={error}
        removeMargin
        hasError={isError}
      >
        {children ? (
          children
        ) : (
          <>
            <InputBlock
              name={name}
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              scale
              tabIndex={0}
              maxLength={255}
              isReadOnly={withCopy}
              isDisabled={disabled}
              iconName={withCopy ? CopyReactSvgUrl : null}
              onIconClick={withCopy && onCopyClick}
              type={isPassword ? "password" : "text"}
            />
            {buttonLabel && (
              <Button
                //@ts-ignore
                label={buttonLabel}
                size={"small"}
                onClick={onButtonClick}
              />
            )}
          </>
        )}
      </FieldContainer>
    </StyledInputGroup>
  );
};

export default InputGroup;
