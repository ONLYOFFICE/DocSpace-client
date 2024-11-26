import React from "react";

import { Text } from "@docspace/shared/components/text";
import { Textarea } from "@docspace/shared/components/textarea";

import { StyledInputGroup } from "../ClientForm.styled";

interface TextAreaProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  increaseHeight: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextAreaGroup = ({
  label,

  name,
  value,
  placeholder,
  increaseHeight,

  onChange,
}: TextAreaProps) => {
  return (
    <StyledInputGroup>
      <div className="label">
        <Text
          fontSize="13px"
          fontWeight={600}
          lineHeight="20px"
          title={label}
          tag=""
          as="p"
          color=""
          textAlign=""
        >
          {label}
        </Text>
      </div>
      <Textarea
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        tabIndex={0}
        heightTextArea={increaseHeight ? 81 : 60}
        maxLength={255}
      />
    </StyledInputGroup>
  );
};

export default TextAreaGroup;
