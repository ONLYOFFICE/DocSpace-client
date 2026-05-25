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
  useRef,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";
import { PasswordInput } from "@docspace/ui-kit/components/password-input";
import { InputSize } from "@docspace/ui-kit/components/text-input";

import {
  PASSPHRASE_MIN_LENGTH,
  checkPassphraseStrength,
  type PassphraseStrength,
} from "@docspace/shared/services/encryption/passphrase-strength";
import { getEncryptionErrorMessage } from "@docspace/shared/services/encryption/error-i18n";

import type {
  PassphraseDialogProps,
  PassphraseFormState,
} from "./PassphraseDialog.types";
import styles from "./PassphraseDialog.module.scss";

const DEFAULT_MIN_LENGTH = PASSPHRASE_MIN_LENGTH;

function getStrengthColor(strength: PassphraseStrength): string {
  switch (strength) {
    case "weak":
      return "var(--color-error)";
    case "fair":
      return "var(--color-warning)";
    case "good":
      return "var(--color-primary)";
    case "strong":
      return "var(--color-success)";
    default:
      return "var(--color-error)";
  }
}

function getStrengthLabelKey(
  strength: PassphraseStrength,
  t: (key: string) => string,
): string {
  switch (strength) {
    case "weak":
      return t("Common:StrengthWeak");
    case "fair":
      return t("Common:StrengthFair");
    case "good":
      return t("Common:StrengthGood");
    case "strong":
      return t("Common:StrengthStrong");
    default:
      return t("Common:StrengthWeak");
  }
}

const PassphraseDialog: React.FC<PassphraseDialogProps> = ({
  visible,
  onSubmit,
  onCancel,
  isNewPassphrase = false,
  title,
  description,
  error: externalError,
  isLoading = false,
  minLength = DEFAULT_MIN_LENGTH,
  requireStrong = true,
  onForgotPassphrase,
}) => {
  const { t, ready } = useTranslation(["Common"]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<PassphraseFormState>({
    passphrase: "",
    confirmPassphrase: "",
    localError: "",
  });

  const strengthResult = useMemo(() => {
    if (!isNewPassphrase || !state.passphrase) return null;
    return checkPassphraseStrength(state.passphrase, minLength);
  }, [isNewPassphrase, state.passphrase, minLength]);

  useEffect(() => {
    if (visible) {
      setState({
        passphrase: "",
        confirmPassphrase: "",
        localError: "",
      });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  const validatePassphrase = useCallback((): string | null => {
    const { passphrase, confirmPassphrase } = state;

    if (passphrase.length < minLength) {
      return t("Common:PassphraseTooShort", { length: minLength });
    }

    if (isNewPassphrase && passphrase !== confirmPassphrase) {
      return t("Common:PassphraseMismatch");
    }

    if (isNewPassphrase && requireStrong && strengthResult) {
      if (strengthResult.strength === "weak") {
        return t("Common:PassphraseWeak");
      }
    }

    return null;
  }, [state, minLength, isNewPassphrase, requireStrong, strengthResult, t]);

  const handleSubmit = useCallback(async () => {
    const validationError = validatePassphrase();

    if (validationError) {
      setState((prev: PassphraseFormState) => ({
        ...prev,
        localError: validationError,
      }));
      return;
    }

    setState((prev: PassphraseFormState) => ({ ...prev, localError: "" }));

    try {
      await onSubmit(state.passphrase);
    } catch (error) {
      setState((prev: PassphraseFormState) => ({
        ...prev,
        localError: getEncryptionErrorMessage(t, error),
      }));
    }
  }, [state.passphrase, validatePassphrase, onSubmit, t]);

  const handlePassphraseChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev: PassphraseFormState) => ({
        ...prev,
        passphrase: e.target.value,
        localError: "",
      }));
    },
    [],
  );

  const handleConfirmChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev: PassphraseFormState) => ({
        ...prev,
        confirmPassphrase: e.target.value,
        localError: "",
      }));
    },
    [],
  );

  const handleCancel = useCallback(() => {
    setState({
      passphrase: "",
      confirmPassphrase: "",
      localError: "",
    });
    onCancel();
  }, [onCancel]);

  const dialogTitle =
    title ||
    (isNewPassphrase
      ? t("Common:CreatePassphrase")
      : t("Common:EnterPassphrase"));

  const dialogDescription =
    description ||
    (isNewPassphrase
      ? t("Common:CreatePassphraseHint")
      : t("Common:PassphraseHint"));

  const errorMessage = externalError || state.localError;

  const strengthGate =
    isNewPassphrase && requireStrong
      ? strengthResult !== null && strengthResult.strength !== "weak"
      : true;

  const isValid =
    state.passphrase.length >= minLength &&
    (!isNewPassphrase || state.passphrase === state.confirmPassphrase) &&
    strengthGate;

  const isDisabled = !isValid || isLoading;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isDisabled) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [isDisabled, handleSubmit],
  );

  return (
    <ModalDialog
      zIndex={1010}
      visible={visible}
      onClose={handleCancel}
      displayType={ModalDialogType.modal}
      isLoading={!ready}
      autoMaxHeight
    >
      <ModalDialog.Header>{dialogTitle}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.container} onKeyDown={handleKeyDown}>
          <Text className={styles.description}>{dialogDescription}</Text>

          <FieldContainer
            isVertical
            labelVisible={false}
            removeMargin
            hasError={!!errorMessage}
            errorMessage={errorMessage ?? ""}
            errorMessageWidth="100%"
            className={styles.inputWrapper}
          >
            <PasswordInput
              id="passphrase"
              inputName="passphrase"
              inputValue={state.passphrase}
              onChange={handlePassphraseChange}
              placeholder={t("Common:Passphrase")}
              scale
              size={InputSize.base}
              simpleView
              isDisabled={isLoading}
              hasError={!!errorMessage}
              autoComplete="new-password"
              tabIndex={1}
            />
          </FieldContainer>

          {!isNewPassphrase && onForgotPassphrase && externalError ? (
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

          {isNewPassphrase && strengthResult && (
            <div className={styles.strengthContainer}>
              <div className={styles.strengthBar}>
                <div
                  className={styles.strengthFill}
                  style={{
                    width: `${strengthResult.score}%`,
                    backgroundColor: getStrengthColor(strengthResult.strength),
                  }}
                />
              </div>
              <Text
                fontSize="12px"
                color={getStrengthColor(strengthResult.strength)}
              >
                {getStrengthLabelKey(strengthResult.strength, t)}
              </Text>
              {strengthResult.suggestions.length > 0 && (
                <ul className={styles.suggestions}>
                  {strengthResult.suggestions.map((s) => (
                    <li key={s}>
                      <Text fontSize="12px" color="var(--color-text-tertiary)">
                        {s}
                      </Text>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {isNewPassphrase && (
            <FieldContainer
              isVertical
              labelVisible={false}
              removeMargin
              hasError={
                !!state.confirmPassphrase &&
                state.passphrase !== state.confirmPassphrase
              }
              errorMessage={
                !!state.confirmPassphrase &&
                state.passphrase !== state.confirmPassphrase
                  ? t("Common:PassphraseMismatch")
                  : ""
              }
              errorMessageWidth="100%"
              className={styles.inputWrapper}
            >
              <PasswordInput
                id="confirmPassphrase"
                inputName="confirmPassphrase"
                inputValue={state.confirmPassphrase}
                onChange={handleConfirmChange}
                placeholder={t("Common:ConfirmPassphrase")}
                scale
                size={InputSize.base}
                simpleView
                isDisabled={isLoading}
                hasError={
                  !!state.confirmPassphrase &&
                  state.passphrase !== state.confirmPassphrase
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
          label={isNewPassphrase ? t("Common:Create") : t("Common:Confirm")}
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

export default PassphraseDialog;
