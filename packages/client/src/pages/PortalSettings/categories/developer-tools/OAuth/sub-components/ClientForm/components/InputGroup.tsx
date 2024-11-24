import React from "react";

import { InputBlock } from "@docspace/shared/components/input-block";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { RectangleSkeleton } from "@docspace/shared/skeletons/rectangle";
import { InputSize, InputType } from "@docspace/shared/components/text-input";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";

import { StyledInputGroup } from "../ClientForm.styled";

interface InputGroupProps {
  label: string;

  name: string;
  value: string;
  placeholder?: string;

  error: string;

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  helpButtonText?: string;

  buttonLabel?: string;
  onButtonClick?: () => void;

  withCopy?: boolean;
  onCopyClick?: (e: React.MouseEvent) => void;
  isPassword?: boolean;

  disabled?: boolean;
  isRequired?: boolean;
  isError?: boolean;
  children?: React.ReactNode;

  onBlur?: (name: string) => void;
}

const InputGroup = ({
  label,

  name,
  value,
  placeholder,

  error,

  onChange,
  onBlur,

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
  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const onButtonClickAction = async () => {
    setIsRequestRunning(true);

    onButtonClick?.();

    setTimeout(() => {
      setIsRequestRunning(false);
    });
  };

  return (
    <StyledInputGroup>
      <FieldContainer
        className={buttonLabel ? "input-block-with-button" : ""}
        isVertical
        isRequired={isRequired}
        labelVisible
        labelText={label}
        tooltipContent={helpButtonText}
        errorMessage={error}
        removeMargin
        hasError={isError}
      >
        {children || (
          <>
            {isRequestRunning ? (
              <RectangleSkeleton
                className="loader"
                width="100%"
                height="32px"
              />
            ) : (
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
                size={InputSize.base}
                iconName={withCopy ? CopyReactSvgUrl : ""}
                onIconClick={withCopy ? onCopyClick : undefined}
                type={isPassword ? InputType.password : InputType.text}
                onBlur={() => onBlur?.(name)}
                hasError={isError}
              />
            )}
            {buttonLabel && (
              <Button
                label={buttonLabel}
                size={ButtonSize.small}
                onClick={onButtonClickAction}
                isDisabled={isRequestRunning}
              />
            )}
          </>
        )}
      </FieldContainer>
    </StyledInputGroup>
  );
};

export default InputGroup;
