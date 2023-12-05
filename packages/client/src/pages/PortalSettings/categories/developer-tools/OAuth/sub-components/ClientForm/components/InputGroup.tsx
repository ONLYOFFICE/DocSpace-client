import React from "react";

import InputBlock from "@docspace/components/input-block";
import Button from "@docspace/components/button";
//@ts-ignore
import FieldContainer from "@docspace/components/field-container";
//@ts-ignore
import RectangleLoader from "@docspace/components/skeletons/rectangle";

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
  onButtonClick?: () => Promise<void>;

  withCopy?: boolean;
  onCopyClick?: (name: string) => void;
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

  const onButtonClickAction = React.useCallback(async () => {
    setIsRequestRunning(true);

    await onButtonClick?.();

    setTimeout(() => {
      setIsRequestRunning(false);
    }, 300);
  }, [onButtonClick]);

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
        {children ? (
          children
        ) : (
          <>
            {isRequestRunning ? (
              <RectangleLoader
                className={"loader"}
                width={"100%"}
                height={"32px"}
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
                iconName={withCopy ? CopyReactSvgUrl : null}
                onIconClick={withCopy && onCopyClick}
                type={isPassword ? "password" : "text"}
                onBlur={() => onBlur?.(name)}
              />
            )}
            {buttonLabel && (
              <Button
                //@ts-ignore
                label={buttonLabel}
                size={"small"}
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
