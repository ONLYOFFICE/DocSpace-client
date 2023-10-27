import React from "react";
import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import InputGroup from "./InputGroup";
import TextAreaGroup from "./TextAreaGroup";
import SelectGroup from "./SelectGroup";
import MultiInputGroup from "./MultiInputGroup";

interface OAuthBlockProps {
  t: any;

  redirectUrisValue: string[];
  allowedOriginsValue: string[];

  changeValue: (name: string, value: string) => void;
}

const OAuthBlock = ({
  t,
  redirectUrisValue,
  allowedOriginsValue,

  changeValue,
}: OAuthBlockProps) => {
  const [value, setValue] = React.useState<{ [key: string]: string[] }>({
    redirectUris: redirectUrisValue,
    allowedOrigins: allowedOriginsValue,
  });

  const onAdd = (name: string, value: string) => {
    setValue((v) => {
      v[name] = [...v[name], value];

      return { ...v };
    });
  };

  return (
    <StyledBlock>
      <BlockHeader header={"OAuth URLs"} />
      <StyledInputBlock>
        <MultiInputGroup
          label={"Redirect URLs"}
          placeholder={"Enter URL"}
          name={"redirectUris"}
          onAdd={onAdd}
          onRemove={onAdd}
          currentValue={value.redirect_uris}
          helpButtonText={"Redirect uris"}
        />
        <MultiInputGroup
          label={"Allowed origins"}
          placeholder={"Enter URL"}
          name={"allowedOrigins"}
          onAdd={onAdd}
          onRemove={onAdd}
          currentValue={value.allowed_origins}
          helpButtonText={"Allowed origins"}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default OAuthBlock;
