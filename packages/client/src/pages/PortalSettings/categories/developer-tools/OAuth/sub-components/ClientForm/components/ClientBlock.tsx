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

  React.useEffect(() => {
    setValue({ id: idValue, secret: secretValue });
  }, [idValue, secretValue]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {};

  return (
    <StyledBlock>
      <BlockHeader
        header={t("Client")}
        helpButtonText={t("ClientHelpButton")}
      />
      <StyledInputBlock>
        <InputGroup
          label={t("ID")}
          name={""}
          placeholder={""}
          value={value.id}
          error={""}
          onChange={onChange}
          withCopy
        />
        <InputGroup
          label={t("Secret")}
          name={""}
          placeholder={""}
          value={value.secret}
          error={""}
          onChange={onChange}
          withCopy
          isPassword
          buttonLabel={t("Reset")}
          onButtonClick={onResetClick}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default ClientBlock;
