import React from "react";
import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import InputGroup from "./InputGroup";

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
  const [error, setError] = React.useState({
    policyUrl: "",
    termsUrl: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;

    changeValue(target.name, target.value);
  };

  return (
    <StyledBlock>
      <BlockHeader header={"Support & Legal info"} />
      <StyledInputBlock>
        <InputGroup
          label={"Privacy policy URL"}
          name={"policy_url"}
          placeholder={"Enter URL"}
          value={policyUrlValue}
          error={error.policyUrl}
          onChange={onChange}
          helpButtonText={
            "Provide a URL link to your Privacy Policy that must comply with applicable laws and regulations and that make clear how you collect, use, share, retain and otherwise process personal information."
          }
        />
        <InputGroup
          label={"Terms of Service URL"}
          name={"terms_url"}
          placeholder={"Enter URL"}
          value={termsUrlValue}
          error={error.termsUrl}
          onChange={onChange}
          helpButtonText={"Terms of service help"}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default SupportBlock;
