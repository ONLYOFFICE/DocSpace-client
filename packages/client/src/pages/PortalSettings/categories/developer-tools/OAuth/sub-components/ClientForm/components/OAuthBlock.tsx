import React from "react";
import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import MultiInputGroup from "./MultiInputGroup";

interface OAuthBlockProps {
  t: any;

  redirectUrisValue: string[];
  allowedOriginsValue: string[];

  changeValue: (name: string, value: string) => void;

  isEdit: boolean;
}

const OAuthBlock = ({
  t,
  redirectUrisValue,
  allowedOriginsValue,

  changeValue,

  isEdit,
}: OAuthBlockProps) => {
  return (
    <StyledBlock>
      <BlockHeader header={"OAuth URLs"} />
      <StyledInputBlock>
        <MultiInputGroup
          label={"Redirect URLs"}
          placeholder={"Enter URL"}
          name={"redirect_uris"}
          onAdd={changeValue}
          currentValue={redirectUrisValue}
          helpButtonText={"Redirect uris"}
          isDisabled={isEdit}
        />
        <MultiInputGroup
          label={"Allowed origins"}
          placeholder={"Enter URL"}
          name={"allowed_origins"}
          onAdd={changeValue}
          currentValue={allowedOriginsValue}
          helpButtonText={"Allowed origins"}
          isDisabled={isEdit}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default OAuthBlock;
