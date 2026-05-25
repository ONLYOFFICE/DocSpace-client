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

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  PasswordInput,
  type PasswordInputHandle,
} from "@docspace/ui-kit/components/password-input";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";

import {
  PASSPHRASE_MIN_LENGTH,
  isPassphraseAcceptable,
} from "@docspace/shared/services/encryption/passphrase-strength";

import styles from "./PassphraseModal.module.scss";

type PassphraseModalProps = {
  visible: boolean;
  onSubmit: (passphrase: string) => void;
  onCancel: () => void;
  isNew: boolean;
  isLoading?: boolean;
  externalError?: string | null;
  onForgotPassphrase?: () => void;
};

const MIN_LENGTH = PASSPHRASE_MIN_LENGTH;

const PASSPHRASE_SETTINGS = {
  minLength: MIN_LENGTH,
  upperCase: true,
  digits: true,
  specSymbols: true,
  digitsRegexStr: "(?=.*\\d)",
  upperCaseRegexStr: "(?=.*[A-Z])",
  specSymbolsRegexStr: "(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E])",
} as const;

export const PassphraseModal: React.FC<PassphraseModalProps> = ({
  visible,
  onSubmit,
  onCancel,
  isNew,
  isLoading = false,
  externalError,
  onForgotPassphrase,
}) => {
  const { t, ready } = useTranslation(["Common"]);
  const inputRef = useRef<PasswordInputHandle>(null);

  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [error, setError] = useState("");
  const [rulesPassed, setRulesPassed] = useState(false);

  useEffect(() => {
    if (visible) {
      setPassphrase("");
      setConfirmPassphrase("");
      setError("");
      setRulesPassed(false);
    }
  }, [visible]);

  const handleGeneratePassword = useCallback(
    (e: React.MouseEvent) => {
      inputRef.current?.onGeneratePassword(e);
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (isNew && !isPassphraseAcceptable(passphrase)) {
      setError(t("Common:PassphraseWeak"));
      return;
    }

    onSubmit(passphrase);
  }, [passphrase, isNew, onSubmit, t]);

  const handleCancel = useCallback(() => {
    setPassphrase("");
    setConfirmPassphrase("");
    setError("");
    onCancel();
  }, [onCancel]);

  const isValid = isNew
    ? rulesPassed && passphrase === confirmPassphrase
    : passphrase.length >= MIN_LENGTH;

  const isDisabled = !isValid || isLoading;

  const displayedError = externalError || error;

  const passphraseHasError =
    !!displayedError ||
    (isNew && passphrase.length >= MIN_LENGTH && !rulesPassed);

  return (
    <ModalDialog
      zIndex={410}
      visible={visible}
      onClose={handleCancel}
      displayType={ModalDialogType.modal}
      isLoading={!ready}
      autoMaxHeight
    >
      <ModalDialog.Header>
        {isNew ? t("Common:CreatePassphrase") : t("Common:EnterPassphrase")}
      </ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.container}>
          <Text className={styles.description}>
            {isNew
              ? t("Common:CreatePassphraseHint")
              : t("Common:PassphraseHint")}
          </Text>

          <div className={styles.passphraseField}>
            {isNew ? (
              <div className={styles.generateRow}>
                <Link
                  type={LinkType.action}
                  fontWeight="600"
                  fontSize="13px"
                  isHovered
                  onClick={handleGeneratePassword}
                  dataTestId="generate_passphrase_link"
                >
                  {t("Common:GenerateLogoButton")}
                </Link>
              </div>
            ) : null}

            <FieldContainer
              isVertical
              labelVisible={false}
              removeMargin
              hasError={passphraseHasError}
              errorMessage={displayedError ?? ""}
              errorMessageWidth="100%"
              className={styles.inputWrapper}
            >
              <PasswordInput
                ref={inputRef}
                id="passphrase"
                inputName="passphrase"
                inputValue={passphrase}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const next = e.target.value;
                  const isBulkChange =
                    Math.abs(next.length - passphrase.length) > 1;
                  setPassphrase(next);
                  if (isNew && isBulkChange && next.length >= MIN_LENGTH) {
                    setConfirmPassphrase(next);
                  }
                  setError("");
                }}
                placeholder={t("Common:Passphrase")}
                scale
                size={InputSize.base}
                simpleView={!isNew}
                isFullWidth
                passwordSettings={PASSPHRASE_SETTINGS}
                onValidateInput={(progressScore) =>
                  setRulesPassed(progressScore)
                }
                tooltipPasswordTitle={`${t("Common:PassphraseLimitMessage")}:`}
                tooltipPasswordLength={`${t(
                  "Common:PasswordMinimumLength",
                )}: ${MIN_LENGTH}`}
                tooltipPasswordDigits={t("Common:PasswordLimitDigits")}
                tooltipPasswordCapital={t("Common:PasswordLimitUpperCase")}
                tooltipPasswordSpecial={t("Common:PasswordLimitSpecialSymbols")}
                isDisabled={isLoading}
                hasError={passphraseHasError}
                autoComplete="new-password"
                tabIndex={1}
              />
            </FieldContainer>

            {onForgotPassphrase && externalError ? (
              <div className={styles.forgotRow}>
                <Link
                  type={LinkType.action}
                  fontWeight="600"
                  fontSize="12px"
                  isHovered
                  onClick={onForgotPassphrase}
                  dataTestId="forgot_passphrase_link"
                >
                  {t("Common:ForgotPassphrase")}
                </Link>
              </div>
            ) : null}
          </div>

          {isNew && (
            <FieldContainer
              isVertical
              labelVisible={false}
              removeMargin
              hasError={
                !!confirmPassphrase && passphrase !== confirmPassphrase
              }
              errorMessage={
                !!confirmPassphrase && passphrase !== confirmPassphrase
                  ? t("Common:PassphraseMismatch")
                  : ""
              }
              errorMessageWidth="100%"
              className={styles.inputWrapper}
            >
              <PasswordInput
                id="confirmPassphrase"
                inputName="confirmPassphrase"
                inputValue={confirmPassphrase}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirmPassphrase(e.target.value);
                  setError("");
                }}
                placeholder={t("Common:ConfirmPassphrase")}
                scale
                size={InputSize.base}
                simpleView
                isDisabled={isLoading}
                hasError={
                  !!confirmPassphrase && passphrase !== confirmPassphrase
                }
                autoComplete="new-password"
                tabIndex={2}
              />
            </FieldContainer>
          )}
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          scale
          primary
          key="SubmitButton"
          onClick={handleSubmit}
          size={ButtonSize.normal}
          label={t("Common:ContinueButton")}
          isDisabled={isDisabled}
          isLoading={isLoading}
          tabIndex={3}
        />
        <Button
          scale
          key="CancelButton"
          onClick={handleCancel}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          isDisabled={isLoading}
          tabIndex={4}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
