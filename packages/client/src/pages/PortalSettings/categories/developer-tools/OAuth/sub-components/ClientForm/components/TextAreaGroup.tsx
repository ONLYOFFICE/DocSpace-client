import React from "react";

import Text from "@docspace/components/text";
//@ts-ignore
import Textarea from "@docspace/components/textarea";

import { StyledInputGroup } from "../ClientForm.styled";

interface TextAreaProps {
  label: string;

  name: string;
  value: string;
  placeholder: string;

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextAreaGroup = ({
  label,

  name,
  value,
  placeholder,

  onChange,
}: TextAreaProps) => {
  return (
    <StyledInputGroup>
      <div className="label">
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
      </div>
      <Textarea
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        scale
        tabIndex={0}
        heightTextArea={60}
        maxLength={255}
      />
    </StyledInputGroup>
  );
};

export default TextAreaGroup;
