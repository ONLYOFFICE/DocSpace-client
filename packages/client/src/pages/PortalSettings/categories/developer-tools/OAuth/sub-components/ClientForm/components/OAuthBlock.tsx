import React from "react";

import { TTranslation } from "@docspace/shared/types";
import { IClientReqDTO } from "@docspace/shared/utils/oauth/types";

import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import MultiInputGroup from "./MultiInputGroup";

interface OAuthBlockProps {
  t: TTranslation;

  redirectUrisValue: string[];
  allowedOriginsValue: string[];

  changeValue: (
    name: keyof IClientReqDTO,
    value: string,
    remove?: boolean,
  ) => void;
  requiredErrorFields: string[];

  isEdit: boolean;
}

const OAuthBlock = ({
  t,
  redirectUrisValue,
  allowedOriginsValue,

  changeValue,
  requiredErrorFields,
  isEdit,
}: OAuthBlockProps) => {
  return (
    <StyledBlock>
      <BlockHeader header={t("OAuthHeaderBlock")} />
      <StyledInputBlock>
        <MultiInputGroup
          t={t}
          label={t("RedirectsURLS")}
          placeholder={t("EnterURL")}
          name="redirect_uris"
          onAdd={changeValue}
          currentValue={redirectUrisValue}
          helpButtonText={t("RedirectsURLSHelpButton")}
          isDisabled={isEdit}
          hasError={requiredErrorFields.includes("redirect_uris")}
        />
        <MultiInputGroup
          t={t}
          label={t("AllowedOrigins")}
          placeholder={t("EnterURL")}
          name="allowed_origins"
          onAdd={changeValue}
          currentValue={allowedOriginsValue}
          helpButtonText={t("AllowedOriginsHelpButton")}
          hasError={requiredErrorFields.includes("allowed_origins")}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default OAuthBlock;
