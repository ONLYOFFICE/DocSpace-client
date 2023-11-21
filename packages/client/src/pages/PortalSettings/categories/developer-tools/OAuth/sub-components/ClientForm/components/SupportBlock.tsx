import React from "react";
import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import InputGroup from "./InputGroup";

interface SupportBlockProps {
  t: any;

  policyUrlValue: string;
  termsUrlValue: string;

  changeValue: (name: string, value: string) => void;

  isEdit: boolean;
  errorFields: string[];
}

const SupportBlock = ({
  t,
  policyUrlValue,
  termsUrlValue,

  changeValue,

  isEdit,
  errorFields,
}: SupportBlockProps) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;

    changeValue(target.name, target.value);
  };

  return (
    <StyledBlock>
      <BlockHeader header={t("SupportAndLegalInfo")} />
      <StyledInputBlock>
        <InputGroup
          label={t("PrivacyPolicyURL")}
          name={"policy_url"}
          placeholder={t("EnterURL")}
          value={policyUrlValue}
          error={t("ErrorWrongURL")}
          onChange={onChange}
          helpButtonText={t("PrivacyPolicyURLHelpButton")}
          disabled={isEdit}
          isRequired
          isError={errorFields.includes("policy_url")}
        />
        <InputGroup
          label={t("TermsOfServiceURL")}
          name={"terms_url"}
          placeholder={t("EnterURL")}
          value={termsUrlValue}
          error={t("ErrorWrongURL")}
          onChange={onChange}
          helpButtonText={t("TermsOfServiceURLHelpButton")}
          disabled={isEdit}
          isRequired
          isError={errorFields.includes("terms_url")}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default SupportBlock;
