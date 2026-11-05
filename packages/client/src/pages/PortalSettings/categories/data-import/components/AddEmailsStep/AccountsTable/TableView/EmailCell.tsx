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

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import {
  EmailInput,
  type TValidate,
} from "@onlyoffice/apps-ui-kit/components/email-input";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { globalColors } from "@onlyoffice/apps-ui-kit/providers/theme/themes";
import { activateOnButtonKey } from "@onlyoffice/apps-ui-kit/utils/keyboard-activation";

import styles from "../../../../StyledDataImport.module.scss";

/** What a click on the row leaves alone: the email and its editor. */
export const EMAIL_CELL_CONTENT = ".user-email, .import-email-editor";

const NAMESPACES = ["SMTPSettings", "Settings", "Common", "PeopleTranslations"];

type TEmailEditorProps = {
  email: string;
  onSave: (email: string) => void;
  onCancel: () => void;
};

/** The email being typed: kept here until it is saved or dropped. */
const EmailEditor = ({ email, onSave, onCancel }: TEmailEditorProps) => {
  const { t } = useTranslation(NAMESPACES);
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

  // The icons' own clicks make them keyboard buttons; the box around each,
  // which takes the pointer's click, must not run it a second time.
  const handleSaveIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    save();
  };

  const handleCancelIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel();
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
          ariaLabel={t("Common:SaveButton")}
          onClick={handleSaveIconClick}
        />
      </div>

      <div className={styles.iconButtonWrapper} onClick={onCancel}>
        <IconButton
          className="import-clear-container-button"
          size={16}
          iconName={CrossSvgUrl}
          dataTestId="import_clear_button"
          ariaLabel={t("Common:CancelButton")}
          onClick={handleCancelIconClick}
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
  email,
  isOpen,
  onOpen,
  onSave,
  onCancel,
}: TEmailCellProps) => {
  const { t } = useTranslation(NAMESPACES);
  const emailTextId = useId();
  const changeEmailId = useId();
  const emailTextRef = useRef<HTMLSpanElement>(null);

  // Closed by its own save or cancel, the editor took the focus with it:
  // give it back to the email rather than leave it on the page's body.
  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;
    const lost =
      !document.activeElement || document.activeElement === document.body;
    if (wasOpen && !isOpen && lost) emailTextRef.current?.focus();
  }, [isOpen]);

  // The email to edit is a button to the keyboard.
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) =>
    activateOnButtonKey(e, onOpen);

  return isOpen ? (
    <EmailEditor email={email} onSave={onSave} onCancel={onCancel} />
  ) : (
    <span
      onClick={onOpen}
      role="button"
      tabIndex={0}
      // Named by the address it shows, then by what it does: the text
      // alone gave no hint that it edits, and a name that left the
      // visible address out could not be spoken to by voice control.
      aria-labelledby={`${emailTextId} ${changeEmailId}`}
      onKeyDown={handleEmailKeyDown}
      className="user-email"
      ref={emailTextRef}
    >
      <EditSvg />
      <Text
        id={emailTextId}
        color={globalColors.gray}
        className="user-email"
        truncate
      >
        {email !== "" ? email : t("Settings:NoEmail")}
      </Text>
      <span id={changeEmailId} hidden>
        {t("PeopleTranslations:EmailChangeButton")}
      </span>
    </span>
  );
};
