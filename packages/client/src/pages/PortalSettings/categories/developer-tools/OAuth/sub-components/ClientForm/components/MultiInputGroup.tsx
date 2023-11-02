import React from "react";

import Text from "@docspace/components/text";
import InputBlock from "@docspace/components/input-block";
//@ts-ignore
import HelpButton from "@docspace/components/help-button";
//@ts-ignore
import SelectorAddButton from "@docspace/components/selector-add-button";
//@ts-ignore
import SelectedItem from "@docspace/components/selected-item";

import {
  StyledChipsContainer,
  StyledHeaderRow,
  StyledInputGroup,
  StyledInputRow,
} from "../ClientForm.styled";

interface MultiInputGroupProps {
  label: string;

  name: string;
  placeholder: string;
  currentValue: string[];

  onAdd: (name: string, value: string, remove?: boolean) => void;

  helpButtonText?: string;

  isDisabled?: boolean;
}

const MultiInputGroup = ({
  label,
  name,
  placeholder,
  currentValue,
  onAdd,

  helpButtonText,
  isDisabled,
}: MultiInputGroupProps) => {
  const [value, setValue] = React.useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setValue(value);
  };

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
          isDisabled={isDisabled}
        />
        <SelectorAddButton
          onClick={() => {
            if (isDisabled) return;
            onAdd(name, value);
            setValue("");
          }}
          isDisabled={isDisabled}
        />
      </StyledInputRow>
      <StyledChipsContainer>
        {currentValue.map((v, index) => (
          <SelectedItem
            key={`${v}-${index}`}
            isInline
            label={v}
            onClose={() => {
              !isDisabled && onAdd(name, v);
            }}
          />
        ))}
      </StyledChipsContainer>
    </StyledInputGroup>
  );
};

export default MultiInputGroup;
