import React from "react";
import { Trans } from "react-i18next";
import copy from "copy-to-clipboard";

//@ts-ignore
import toastr from "@docspace/components/toast/toastr";

import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import InputGroup from "./InputGroup";

interface ClientBlockProps {
  t: any;

  idValue: string;
  secretValue: string;

  onResetClick: () => Promise<void>;
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

  const onCopyClick = (name: string) => {
    if (name === "id") {
      copy(value[name]);
      toastr.success(t("ClientCopy"));
    } else {
      copy(value[name]);
      toastr.success(t("SecretCopy"));
    }
  };

  const helpButtonText = <Trans t={t} i18nKey="ClientHelpButton" ns="OAuth" />;

  return (
    <StyledBlock>
      <BlockHeader header={t("Client")} helpButtonText={helpButtonText} />
      <StyledInputBlock>
        <InputGroup
          label={t("ID")}
          name={""}
          placeholder={""}
          value={value.id}
          error={""}
          onChange={onChange}
          withCopy
          onCopyClick={() => onCopyClick("id")}
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
          onCopyClick={() => onCopyClick("secret")}
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default ClientBlock;
