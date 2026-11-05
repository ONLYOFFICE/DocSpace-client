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

import EditSvg from "PUBLIC_DIR/images/access.edit.react.svg";
import CrossSvgUrl from "PUBLIC_DIR/images/cross.edit.react.svg?url";
import CheckSvgUrl from "PUBLIC_DIR/images/check.edit.react.svg?url";

import { useState } from "react";
import type { TFunction } from "i18next";
import classNames from "classnames";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import {
  EmailInput,
  type TValidate,
} from "@onlyoffice/apps-ui-kit/components/email-input";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { globalColors } from "@onlyoffice/apps-ui-kit/providers/theme/themes";

import styles from "../../../../StyledDataImport.module.scss";

/** What a click on the row leaves alone: the email and its editor. */
export const EMAIL_CELL_CONTENT = ".user-email, .import-email-editor";

type TEmailEditorProps = {
  t: TFunction;
  email: string;
  onSave: (email: string) => void;
  onCancel: () => void;
};

/** The email being typed: kept here until it is saved or dropped. */
const EmailEditor = ({ t, email, onSave, onCancel }: TEmailEditorProps) => {
  const [tempEmail, setTempEmail] = useState(email);
  const [isEmailValid, setIsEmailValid] = useState(email.length > 0);
  const [hasError, setHasError] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempEmail(e.target.value);
    if (hasError) setHasError(false);
  };

  const onValidateEmail = (res: TValidate) => {
    setIsEmailValid(res.isValid);
    return { isValid: res.isValid, errors: res.errors || [] };
  };

  const save = () => {
    if (isEmailValid) onSave(tempEmail);
    else setHasError(true);
  };

  const checkEmailValidity = () => {
    if (!isEmailValid) setHasError(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") save();
  };

  return (
    <div
      className={classNames(styles.emailInputWrapper, "import-email-editor")}
    >
      <EmailInput
        placeholder={t("Common:EnterEmail")}
        className="import-email-input"
        value={tempEmail}
        onChange={handleEmailChange}
        onValidateInput={onValidateEmail}
        onKeyDown={handleKeyDown}
        hasError={hasError}
        onBlur={checkEmailValidity}
        isAutoFocussed
      />

      <div className={styles.iconButtonWrapper} onClick={save}>
        <IconButton
          className="import-check-container-button"
          size={16}
          iconName={CheckSvgUrl}
          dataTestId="import_check_button"
        />
      </div>

      <div className={styles.iconButtonWrapper} onClick={onCancel}>
        <IconButton
          className="import-clear-container-button"
          size={16}
          iconName={CrossSvgUrl}
          dataTestId="import_clear_button"
        />
      </div>
    </div>
  );
};

type TEmailCellProps = TEmailEditorProps & {
  isOpen: boolean;
  onOpen: () => void;
};

/** The account's email, or the editor for it while it is open. */
export const EmailCell = ({
  t,
  email,
  isOpen,
  onOpen,
  onSave,
  onCancel,
}: TEmailCellProps) =>
  isOpen ? (
    <EmailEditor t={t} email={email} onSave={onSave} onCancel={onCancel} />
  ) : (
    <span onClick={onOpen} className="user-email">
      <EditSvg />
      <Text color={globalColors.gray} className="user-email" truncate>
        {email !== "" ? email : t("Settings:NoEmail")}
      </Text>
    </span>
  );
