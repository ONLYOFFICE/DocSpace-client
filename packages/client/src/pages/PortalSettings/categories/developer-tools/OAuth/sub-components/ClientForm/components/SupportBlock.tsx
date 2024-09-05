import React from "react";

import { TTranslation } from "@docspace/shared/types";
import { IClientReqDTO } from "@docspace/shared/utils/oauth/types";

import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import InputGroup from "./InputGroup";

interface SupportBlockProps {
  t: TTranslation;

  policyUrlValue: string;
  termsUrlValue: string;

  changeValue: (name: keyof IClientReqDTO, value: string) => void;

  isEdit: boolean;
  errorFields: string[];
  onBlur?: (name: string) => void;
  requiredErrorFields: string[];
}

const SupportBlock = ({
  t,
  policyUrlValue,
  termsUrlValue,

  changeValue,

  isEdit,
  errorFields,
  onBlur,
  requiredErrorFields,
}: SupportBlockProps) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;

    changeValue(target.name as keyof IClientReqDTO, target.value);
  };

  const policyRequiredError = requiredErrorFields.includes("policy_url");
  const termsRequiredError = requiredErrorFields.includes("terms_url");
  const policyError = errorFields.includes("policy_url");
  const termsError = errorFields.includes("terms_url");

  return (
    <StyledBlock>
      <BlockHeader header={t("SupportAndLegalInfo")} />
      <StyledInputBlock>
        <InputGroup
          label={t("PrivacyPolicyURL")}
          name="policy_url"
          placeholder={t("EnterURL")}
          value={policyUrlValue}
          error={
            policyError
              ? `${t("ErrorWrongURL")}: ${window.location.origin}`
              : t("ThisRequiredField")
          }
          onChange={onChange}
          helpButtonText={t("PrivacyPolicyURLHelpButton")}
          disabled={isEdit}
          isRequired
          isError={policyError || policyRequiredError}
          onBlur={onBlur}
        />
        <InputGroup
          label={t("TermsOfServiceURL")}
          name="terms_url"
          placeholder={t("EnterURL")}
          value={termsUrlValue}
          error={
            termsError
              ? `${t("ErrorWrongURL")}: ${window.location.origin}`
              : t("ThisRequiredField")
          }
          onChange={onChange}
          helpButtonText={t("TermsOfServiceURLHelpButton")}
          disabled={isEdit}
          isRequired
          isError={termsError || termsRequiredError}
          onBlur={onBlur}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default SupportBlock;
