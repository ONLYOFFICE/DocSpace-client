import React from "react";
import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import MultiInputGroup from "./MultiInputGroup";

interface OAuthBlockProps {
  t: any;

  redirectUrisValue: string[];
  // allowedOriginsValue: string[];

  changeValue: (name: string, value: string) => void;

  isEdit: boolean;
}

const OAuthBlock = ({
  t,
  redirectUrisValue,
  // allowedOriginsValue,

  changeValue,

  isEdit,
}: OAuthBlockProps) => {
  return (
    <StyledBlock>
      <BlockHeader header={t("OAuthHeaderBlock")} />
      <StyledInputBlock>
        <MultiInputGroup
          label={t("RedirectsURLS")}
          placeholder={t("EnterURL")}
          name={"redirect_uris"}
          onAdd={changeValue}
          currentValue={redirectUrisValue}
          helpButtonText={t("RedirectsURLSHelpButton")}
          isDisabled={isEdit}
        />
        {/* <MultiInputGroup
          label={t("AllowedOrigins")}
          placeholder={t("EnterURL")}
          name={"allowed_origins"}
          onAdd={changeValue}
          currentValue={allowedOriginsValue}
          helpButtonText={t("AllowedOriginsHelpButton")}
          isDisabled={isEdit}
        /> */}
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default OAuthBlock;
