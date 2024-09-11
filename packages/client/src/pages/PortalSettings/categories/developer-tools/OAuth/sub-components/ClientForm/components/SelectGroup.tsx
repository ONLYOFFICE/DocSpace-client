import React from "react";

import { Text } from "@docspace/shared/components/text";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { globalColors } from "@docspace/shared/themes";

import { StyledInputGroup } from "../ClientForm.styled";

interface SelectGroupProps {
  label: string;
  selectLabel: string;

  value: string;

  description: string;

  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SelectGroup = ({
  label,
  selectLabel,

  value,

  description,

  onSelect,
}: SelectGroupProps) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const onInputClick = () => {
    if (inputRef.current) {
      inputRef.current.value = "";

      inputRef.current.files = null;
    }
  };

  return (
    <StyledInputGroup>
      <div className="label">
        <Text
          fontSize="13px"
          fontWeight={600}
          lineHeight="20px"
          tag=""
          as="p"
          color=""
          textAlign=""
        >
          {label}{" "}
          <span style={{ color: globalColors.lightErrorStatus }}> *</span>
        </Text>
      </div>
      <div className="select">
        <img
          className="client-logo"
          style={{ display: value ? "block" : "none" }}
          alt="img"
          src={value}
        />
        <SelectorAddButton onClick={onClick} />
        <Text
          fontSize="13px"
          fontWeight={600}
          lineHeight="20px"
          title=""
          tag=""
          as="p"
          color=""
          textAlign=""
        >
          {selectLabel}
        </Text>
      </div>
      <Text
        fontSize="12px"
        fontWeight={600}
        lineHeight="16px"
        tag=""
        as="p"
        color=""
        textAlign=""
        className="description"
      >
        {description}
      </Text>
      <input
        ref={inputRef}
        id="customFileInput"
        className="custom-file-input"
        multiple
        type="file"
        onChange={onSelect}
        onClick={onInputClick}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, svg"
      />
    </StyledInputGroup>
  );
};

export default SelectGroup;
