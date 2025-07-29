// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { Trans } from "react-i18next";
import { TFunction } from "i18next";
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

  const helpButtonText = (
    <Trans t={t as TFunction} i18nKey="ClientHelpButton" ns="OAuth" />
  );

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
          testId="id_input_group"
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
          testId="secret_input_group"
        />
      </StyledInputBlock>
    </StyledBlock>
  );
};

export default ClientBlock;
