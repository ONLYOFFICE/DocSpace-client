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

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { TableRow, TableCell } from "@docspace/ui-kit/components/table";

import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { EmailInput, TValidate } from "@docspace/ui-kit/components/email-input";

import EditSvg from "PUBLIC_DIR/images/access.edit.react.svg";
import CrossSvgUrl from "PUBLIC_DIR/images/cross.edit.react.svg?url";
import CheckSvgUrl from "PUBLIC_DIR/images/check.edit.react.svg?url";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import {
  AddEmailTableRowProps,
  InjectedAddEmailTableRowProps,
} from "../../../../types";
import styles from "../../../../StyledDataImport.module.scss";

const UsersTableRow = (props: AddEmailTableRowProps) => {
  const {
    displayName,
    email,
    isChecked,
    toggleAccount,

    id,
    changeEmail,
    isEmailOpen,
    setOpenedEmailKey,
  } = props as InjectedAddEmailTableRowProps;

  const { t, ready } = useTranslation(["SMTPSettings", "Settings", "Common"]);

  const [prevEmail, setPrevEmail] = useState(email);
  const [tempEmail, setTempEmail] = useState(email);
  const [isEmailValid, setIsEmailValid] = useState(email.length > 0);
  const [isPrevEmailValid, setIsPrevEmailValid] = useState(email.length > 0);

  const [hasError, setHasError] = useState(false);

  const emailInputRef = useRef<HTMLDivElement>(null);
  const emailTextRef = useRef<HTMLSpanElement>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempEmail(e.target.value);
    if (hasError) {
      setHasError(false);
    }
  };

  const clearEmail = () => {
    setTempEmail(prevEmail);
    setOpenedEmailKey("");
    setHasError(false);
  };

  const openEmail = () => setOpenedEmailKey(id);

  const handleSaveEmail = () => {
    setPrevEmail(tempEmail);
    changeEmail(id, tempEmail);
    setOpenedEmailKey("");
    setIsPrevEmailValid(true);
    if (!isChecked) {
      toggleAccount();
    }
  };

  const handleAccountToggle = (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      isPrevEmailValid &&
      !(
        emailInputRef.current &&
        emailInputRef.current.contains(e.target as Node)
      ) &&
      !emailTextRef.current?.contains(e.target as Node)
    ) {
      toggleAccount();
    }
  };

  const onValidateEmail = (res: TValidate) => {
    setIsEmailValid(res.isValid);
    return { isValid: res.isValid, errors: res.errors || [] };
  };

  const handleSaveClick = () => {
    if (isEmailValid) {
      handleSaveEmail();
    } else {
      setHasError(true);
    }
  };

  const checkEmailValidity = () => {
    if (!isEmailValid) {
      setHasError(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (isEmailValid) {
        handleSaveEmail();
      } else {
        setHasError(true);
      }
    }
  };

  useEffect(() => {
    if (!isEmailOpen && prevEmail !== tempEmail) {
      setTempEmail(prevEmail);
      setHasError(false);
    }
  }, [isEmailOpen, prevEmail, tempEmail]);

  if (!ready) return;

  return (
    <TableRow className={styles.styledTableRowEmail} onClick={handleAccountToggle}>
      <TableCell className="checkboxWrapper">
        <Checkbox
          onChange={handleAccountToggle}
          isChecked={isChecked}
          isDisabled={!isPrevEmailValid}
          truncate
          label={displayName}
        />
      </TableCell>

      <TableCell>
        {isEmailOpen ? (
          <div className={styles.emailInputWrapper} ref={emailInputRef}>
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

            <div className={styles.iconButtonWrapper} onClick={handleSaveClick}>
              <IconButton
                className="import-check-container-button"
                size={16}
                iconName={CheckSvgUrl}
                dataTestId="import_check_button"
              />
            </div>

            <div className={styles.iconButtonWrapper} onClick={clearEmail}>
              <IconButton
                className="import-clear-container-button"
                size={16}
                iconName={CrossSvgUrl}
                dataTestId="import_clear_button"
              />
            </div>
          </div>
        ) : (
          <span onClick={openEmail} className="user-email" ref={emailTextRef}>
            <EditSvg />
            <Text color={globalColors.gray} className="user-email" truncate>
              {prevEmail !== "" ? prevEmail : t("Settings:NoEmail")}
            </Text>
          </span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default inject<TStore>(({ importAccountsStore }) => {
  const { changeEmail } = importAccountsStore;

  return {
    changeEmail,
  };
})(observer(UsersTableRow));

