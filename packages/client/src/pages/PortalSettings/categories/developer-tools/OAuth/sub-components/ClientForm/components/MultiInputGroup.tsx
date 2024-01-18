import React from "react";

import { InputBlock } from "@docspace/shared/components/input-block";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { SelectedItem } from "@docspace/shared/components/selected-item";

import {
  StyledChipsContainer,
  StyledInputGroup,
  StyledInputRow,
} from "../ClientForm.styled";
import InputGroup from "./InputGroup";
import { isValidUrl } from "..";
import { InputSize, InputType } from "@docspace/shared/components/text-input";

interface MultiInputGroupProps {
  t: any;
  label: string;

  name: string;
  placeholder: string;
  currentValue: string[];
  hasError?: boolean;
  onAdd: (name: string, value: string, remove?: boolean) => void;

  helpButtonText?: string;

  isDisabled?: boolean;
}

const MultiInputGroup = ({
  t,
  label,
  name,
  placeholder,
  currentValue,
  onAdd,
  hasError,
  helpButtonText,
  isDisabled,
}: MultiInputGroupProps) => {
  const [value, setValue] = React.useState("");

  const [isError, setIsError] = React.useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setValue(value);
  };

  const onBlur = () => {
    if (value) {
      if (isValidUrl(value)) {
        setIsError(false);
      } else {
        setIsError(true);
      }
    } else {
      setIsError(false);
    }
  };

  return (
    <StyledInputGroup>
      <InputGroup
        label={label}
        helpButtonText={helpButtonText}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        error={
          isError
            ? `${t("ErrorWrongURL")}: ${window.location.origin}`
            : t("ThisRequiredField")
        }
        isRequired
        isError={isError || hasError}
      >
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
            onBlur={onBlur}
            hasError={isError || hasError}
            size={InputSize.base}
            type={InputType.text}
          />
          <SelectorAddButton
            onClick={() => {
              if (isDisabled || isError) return;
              onAdd(name, value);
              setValue("");
            }}
            isDisabled={isDisabled || isError}
          />
        </StyledInputRow>
      </InputGroup>

      <StyledChipsContainer>
        {currentValue.map((v, index) => (
          <SelectedItem
            key={`${v}-${index}`}
            propKey={v}
            isInline
            label={v}
            isDisabled={isDisabled}
            hideCross={isDisabled}
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
