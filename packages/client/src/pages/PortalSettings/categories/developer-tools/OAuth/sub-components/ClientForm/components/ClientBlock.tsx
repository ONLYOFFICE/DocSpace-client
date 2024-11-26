import React from "react";
import { Trans } from "react-i18next";
import copy from "copy-to-clipboard";

import { toastr } from "@docspace/shared/components/toast";
import { TTranslation } from "@docspace/shared/types";

import { StyledBlock, StyledInputBlock } from "../ClientForm.styled";

import BlockHeader from "./BlockHeader";
import InputGroup from "./InputGroup";

interface ClientBlockProps {
  t: TTranslation;

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

  const onChange = () => {};

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
          name=""
          value={value.id}
          error=""
          onChange={onChange}
          withCopy
          onCopyClick={() => onCopyClick("id")}
        />
        <InputGroup
          label={t("Secret")}
          name=""
          value={value.secret}
          error=""
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
