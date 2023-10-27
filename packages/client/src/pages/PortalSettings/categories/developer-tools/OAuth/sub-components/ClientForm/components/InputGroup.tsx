import React from "react";

import Text from "@docspace/components/text";
import InputBlock from "@docspace/components/input-block";
import Button from "@docspace/components/button";
//@ts-ignore
import HelpButton from "@docspace/components/help-button";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";

import {
  StyledHeaderRow,
  StyledInputGroup,
  StyledInputRow,
} from "../ClientForm.styled";

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
}: InputGroupProps) => {
  return (
    <StyledInputGroup>
      <StyledHeaderRow>
        <Text
          fontSize={"13px"}
          fontWeight={600}
          lineHeight={"20px"}
          title={""}
          tag={""}
          as={"p"}
          color={""}
          textAlign={""}
        >
          {label}
        </Text>
        {helpButtonText && <HelpButton tooltipContent={helpButtonText} />}
      </StyledHeaderRow>
      <StyledInputRow>
        <InputBlock
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          scale
          tabIndex={0}
          maxLength={255}
          isReadOnly={withCopy}
          isDisabled={withCopy}
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
      </StyledInputRow>
    </StyledInputGroup>
  );
};

export default InputGroup;
