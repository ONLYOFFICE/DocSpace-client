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
}

const SupportBlock = ({
  t,
  policyUrlValue,
  termsUrlValue,

  changeValue,

  isEdit,
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
      <BlockHeader header={t("SupportAndLegalInfo")} />
      <StyledInputBlock>
        <InputGroup
          label={t("PrivacyPolicyURL")}
          name={"policy_url"}
          placeholder={t("EnterURL")}
          value={policyUrlValue}
          error={error.policyUrl}
          onChange={onChange}
          helpButtonText={t("PrivacyPolicyURLHelpButton")}
          disabled={isEdit}
        />
        <InputGroup
          label={t("TermsOfServiceURL")}
          name={"terms_url"}
          placeholder={t("EnterURL")}
          value={termsUrlValue}
          error={error.termsUrl}
          onChange={onChange}
          helpButtonText={t("TermsOfServiceURLHelpButton")}
          disabled={isEdit}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default SupportBlock;
