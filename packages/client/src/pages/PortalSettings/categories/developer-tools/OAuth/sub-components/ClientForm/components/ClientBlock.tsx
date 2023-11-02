import React from "react";
import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import InputGroup from "./InputGroup";

interface ClientBlockProps {
  t: any;

  idValue: string;
  secretValue: string;

  onResetClick: () => void;
}

const ClientBlock = ({
  t,
  idValue,
  secretValue,
  onResetClick,
}: ClientBlockProps) => {
  const [value, setValue] = React.useState<{ [key: string]: string }>({
    id: idValue,
    secret: secretValue,
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {};

  return (
    <StyledBlock>
      <BlockHeader
        header={"Client"}
        helpButtonText="Credentials for using OAth 2.0 as your Authentication type.
Note: Any enterprise admin who knows the app's client ID will be able to retrieve information about the app including app name, authentication type, app scopes and redirect URI."
      />
      <StyledInputBlock>
        <InputGroup
          label={"ID"}
          name={""}
          placeholder={""}
          value={value.id}
          error={""}
          onChange={onChange}
          withCopy
        />
        <InputGroup
          label={"Secret"}
          name={""}
          placeholder={""}
          value={value.secret}
          error={""}
          onChange={onChange}
          withCopy
          isPassword
          buttonLabel={"Reset"}
          onButtonClick={onResetClick}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default ClientBlock;
