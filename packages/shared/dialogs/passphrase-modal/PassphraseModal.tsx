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

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
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
  checkPassphraseStrength,
  isPassphraseAcceptable,
  type PassphraseStrength,
} from "@docspace/shared/services/encryption/passphrase-strength";

import styles from "./PassphraseModal.module.scss";

type PassphraseModalProps = {
  visible: boolean;
  onSubmit: (passphrase: string, rememberDevice?: boolean) => void;
  onCancel: () => void;
  isNew: boolean;
  isLoading?: boolean;
  externalError?: string | null;
  onForgotPassphrase?: () => void;
  submitLabel?: string;
  showRememberDevice?: boolean;
  onPasskeyUnlock?: () => void;
  isPasskeyUnlocking?: boolean;
  title?: string;
  description?: string;
};

const MIN_LENGTH = PASSPHRASE_MIN_LENGTH;

const STRENGTH_COLOR: Record<PassphraseStrength, string> = {
  weak: "var(--status-error)",
  fair: "var(--status-warning)",
  good: "var(--status-icon-color-positive)",
  strong: "var(--status-icon-color-positive)",
};

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
  submitLabel,
  showRememberDevice = false,
  onPasskeyUnlock,
  isPasskeyUnlocking = false,
  title,
  description,
}) => {
  const { t, ready } = useTranslation(["Common"]);
  const inputRef = useRef<PasswordInputHandle>(null);

  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [error, setError] = useState("");
  const [rulesPassed, setRulesPassed] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  useEffect(() => {
    if (visible) {
      setPassphrase("");
      setConfirmPassphrase("");
      setError("");
      setRulesPassed(false);
      setRememberDevice(false);
    }
  }, [visible]);

  const passkeyAutoTriedRef = useRef(false);
  useEffect(() => {
    if (!visible) {
      passkeyAutoTriedRef.current = false;
      return;
    }
    if (isNew || !onPasskeyUnlock || passkeyAutoTriedRef.current) return;
    passkeyAutoTriedRef.current = true;
    onPasskeyUnlock();
  }, [visible, isNew, onPasskeyUnlock]);

  const handleGeneratePassword = useCallback((e: React.MouseEvent) => {
    inputRef.current?.onGeneratePassword(e);
  }, []);

  const handleSubmit = useCallback(() => {
    if (isNew && !isPassphraseAcceptable(passphrase)) {
      setError(t("Common:PassphraseWeak"));
      return;
    }

    onSubmit(passphrase, showRememberDevice ? rememberDevice : undefined);
  }, [passphrase, isNew, onSubmit, showRememberDevice, rememberDevice, t]);

  const handleCancel = useCallback(() => {
    setPassphrase("");
    setConfirmPassphrase("");
    setError("");
    onCancel();
  }, [onCancel]);

  const strengthResult = useMemo(
    () => (isNew && passphrase ? checkPassphraseStrength(passphrase) : null),
    [isNew, passphrase],
  );

  const strengthLabel = (strength: PassphraseStrength): string => {
    switch (strength) {
      case "weak":
        return t("Common:PassphraseStrengthWeak");
      case "fair":
        return t("Common:PassphraseStrengthFair");
      case "good":
        return t("Common:PassphraseStrengthGood");
      case "strong":
        return t("Common:PassphraseStrengthStrong");
      default:
        return "";
    }
  };

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
        {title ??
          (isNew ? t("Common:CreatePassphrase") : t("Common:EnterPassphrase"))}
      </ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.container}>
          <Text className={styles.description}>
            {description ??
              (isNew
                ? t("Common:CreatePassphraseHint")
                : t("Common:PassphraseHint"))}
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
                  tabIndex={1}
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
                  setPassphrase(e.target.value);
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
                isAutoFocussed
                autoComplete="new-password"
                tabIndex={2}
              />
            </FieldContainer>

            {strengthResult ? (
              <div className={styles.strengthRow}>
                <Text fontSize="12px" color="var(--text-secondary)">
                  {t("Common:PassphraseStrengthLabel")}:{" "}
                </Text>
                <Text
                  fontSize="12px"
                  fontWeight={600}
                  color={STRENGTH_COLOR[strengthResult.strength]}
                >
                  {strengthLabel(strengthResult.strength)}
                </Text>
              </div>
            ) : null}
            {strengthResult?.containsCommonPattern ? (
              <Text fontSize="12px" color="var(--status-error)">
                {t("Common:PassphraseCommonPattern")}
              </Text>
            ) : null}

            {onForgotPassphrase && externalError ? (
              <div className={styles.forgotRow}>
                <Link
                  type={LinkType.action}
                  fontWeight="600"
                  fontSize="12px"
                  isHovered
                  onClick={onForgotPassphrase}
                  dataTestId="forgot_passphrase_link"
                  tabIndex={3}
                >
                  {t("Common:ForgotPassphrase")}
                </Link>
              </div>
            ) : null}

            {showRememberDevice && !isNew ? (
              <div className={styles.rememberRow}>
                <Checkbox
                  id="rememberDevice"
                  isChecked={rememberDevice}
                  isDisabled={isLoading}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  label={t("Common:RememberDeviceLabel")}
                  tabIndex={4}
                />
              </div>
            ) : null}

            {onPasskeyUnlock && !isNew ? (
              <div className={styles.passkeyRow}>
                <Link
                  type={LinkType.action}
                  fontWeight="600"
                  fontSize="12px"
                  isHovered
                  onClick={() => {
                    if (!isLoading && !isPasskeyUnlocking) onPasskeyUnlock();
                  }}
                  dataTestId="passkey_unlock_link"
                  tabIndex={2}
                >
                  {t("Common:PasskeyUnlockButton")}
                </Link>
              </div>
            ) : null}
          </div>

          {isNew && (
            <FieldContainer
              isVertical
              labelVisible={false}
              removeMargin
              hasError={!!confirmPassphrase && passphrase !== confirmPassphrase}
              errorMessage={
                confirmPassphrase && passphrase !== confirmPassphrase
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
                isFullWidth
                size={InputSize.base}
                simpleView
                isDisabled={isLoading}
                hasError={
                  !!confirmPassphrase && passphrase !== confirmPassphrase
                }
                autoComplete="new-password"
                tabIndex={3}
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
          label={submitLabel ?? t("Common:ContinueButton")}
          isDisabled={isDisabled}
          isLoading={isLoading}
          tabIndex={4}
        />
        <Button
          scale
          key="CancelButton"
          onClick={handleCancel}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          isDisabled={isLoading}
          tabIndex={5}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default PassphraseModal;

