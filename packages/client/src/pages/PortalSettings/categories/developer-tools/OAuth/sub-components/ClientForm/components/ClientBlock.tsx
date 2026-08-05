/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { Trans } from "react-i18next";
import { TFunction } from "i18next";
import copy from "copy-to-clipboard";

import { toastr } from "@docspace/ui-kit/components/toast";
import { TTranslation } from "@docspace/shared/types";

import styles from "../ClientForm.styled.module.scss";

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
    <div className={styles.styledBlock}>
      <BlockHeader header={t("Client")} helpButtonText={helpButtonText} />
      <div className={styles.styledInputBlock}>
        <InputGroup
          label={t("ID")}
          name=""
          value={value.id}
          error=""
          onChange={onChange}
          withCopy
          onCopyClick={() => onCopyClick("id")}
          dataTestId="id_input_group"
        />
        <InputGroup
          label={t("Secret")}
          name=""
          value={value.secret}
          error=""
          onChange={onChange}
          withCopy
          isPassword
          buttonLabel={t("Common:Reset")}
          onButtonClick={onResetClick}
          onCopyClick={() => onCopyClick("secret")}
          dataTestId="secret_input_group"
        />
      </div>
    </div>
  );
};

export default ClientBlock;
