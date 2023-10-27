import React from "react";
import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import InputGroup from "./InputGroup";
import TextAreaGroup from "./TextAreaGroup";
import SelectGroup from "./SelectGroup";

interface SupportBlockProps {
  t: any;

  policyUrlValue: string;
  termsUrlValue: string;

  changeValue: (name: string, value: string) => void;
}

const SupportBlock = ({
  t,
  policyUrlValue,
  termsUrlValue,

  changeValue,
}: SupportBlockProps) => {
  const [value, setValue] = React.useState<{ [key: string]: string }>({
    policyUrl: policyUrlValue,
    termsUrl: termsUrlValue,
  });

  const [error, setError] = React.useState({
    policyUrl: "",
    termsUrl: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;

    setValue((value) => {
      value[target.name] = target.value;

      return { ...value };
    });
  };

  return (
    <StyledBlock>
      <BlockHeader header={"Basic info"} />
      <StyledInputBlock>
        <InputGroup
          label={"Privacy policy URL"}
          name={"policyUrl"}
          placeholder={"Enter URL"}
          value={value.policyUrl}
          error={error.policyUrl}
          onChange={onChange}
          helpButtonText={
            "Provide a URL link to your Privacy Policy that must comply with applicable laws and regulations and that make clear how you collect, use, share, retain and otherwise process personal information."
          }
        />
        <InputGroup
          label={"Terms of Service URL"}
          name={"termsUrl"}
          placeholder={"Enter URL"}
          value={value.termsUrl}
          error={error.termsUrl}
          onChange={onChange}
          helpButtonText={"Terms of service help"}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default SupportBlock;
