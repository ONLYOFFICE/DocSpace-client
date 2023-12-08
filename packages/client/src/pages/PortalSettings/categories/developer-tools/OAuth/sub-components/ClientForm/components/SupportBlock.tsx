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
  onBlur?: (name: string) => void;
}

const SupportBlock = ({
  t,
  policyUrlValue,
  termsUrlValue,

  changeValue,

  isEdit,
  errorFields,
  onBlur,
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
          error={`${t("ErrorWrongURL")}: ${window.location.origin}`}
          onChange={onChange}
          helpButtonText={t("PrivacyPolicyURLHelpButton")}
          disabled={isEdit}
          isRequired
          isError={errorFields.includes("policy_url")}
          onBlur={onBlur}
        />
        <InputGroup
          label={t("TermsOfServiceURL")}
          name={"terms_url"}
          placeholder={t("EnterURL")}
          value={termsUrlValue}
          error={`${t("ErrorWrongURL")}: ${window.location.origin}`}
          onChange={onChange}
          helpButtonText={t("TermsOfServiceURLHelpButton")}
          disabled={isEdit}
          isRequired
          isError={errorFields.includes("terms_url")}
          onBlur={onBlur}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default SupportBlock;
