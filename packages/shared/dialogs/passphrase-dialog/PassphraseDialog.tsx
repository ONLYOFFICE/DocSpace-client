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

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";

import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import { Button, ButtonSize } from "../../components/button";
import { Text } from "../../components/text";
import { PasswordInput } from "../../components/password-input";
import { InputSize } from "../../components/text-input";

import type {
  PassphraseDialogProps,
  PassphraseFormState,
  PassphraseStrength,
  StrengthCheckResult,
} from "./PassphraseDialog.types";
import styles from "./PassphraseDialog.module.scss";

const DEFAULT_MIN_LENGTH = 8;

function checkPassphraseStrength(
  passphrase: string,
  minLength: number,
): StrengthCheckResult {
  const suggestions: string[] = [];
  let score = 0;

  if (passphrase.length >= minLength) score += 25;
  else suggestions.push("Use at least 8 characters");

  if (passphrase.length >= 12) score += 10;
  if (passphrase.length >= 16) score += 10;

  if (/[a-z]/.test(passphrase)) score += 15;
  else suggestions.push("Add lowercase letters");

  if (/[A-Z]/.test(passphrase)) score += 15;
  else suggestions.push("Add uppercase letters");

  if (/\d/.test(passphrase)) score += 15;
  else suggestions.push("Add numbers");

  if (/[!@#$%^&*()_+\-=[\]{}|;:'",.<>?/`~]/.test(passphrase)) score += 10;
  else suggestions.push("Add special characters");

  let strength: PassphraseStrength;
  if (score >= 80) strength = "strong";
  else if (score >= 60) strength = "good";
  else if (score >= 40) strength = "fair";
  else strength = "weak";

  return { strength, score: Math.min(score, 100), suggestions };
}

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
  requireStrong = false,
}) => {
  const { t, ready } = useTranslation(["Common"]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<PassphraseFormState>({
    passphrase: "",
    confirmPassphrase: "",
    localError: "",
    showPassword: false,
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
        showPassword: false,
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
        localError:
          error instanceof Error ? error.message : t("Common:UnknownError"),
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
      showPassword: false,
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

  const isValid =
    state.passphrase.length >= minLength &&
    (!isNewPassphrase || state.passphrase === state.confirmPassphrase);

  const isDisabled = !isValid || isLoading;

  return (
    <ModalDialog
      zIndex={410}
      visible={visible}
      onClose={handleCancel}
      displayType={ModalDialogType.modal}
      isLoading={!ready}
      autoMaxHeight
    >
      <ModalDialog.Header>{dialogTitle}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.container}>
          <Text className={styles.description}>{dialogDescription}</Text>

          {errorMessage && (
            <div className={styles.errorBox}>
              <Text fontSize="13px" fontWeight={600} color="var(--color-error)">
                {errorMessage}
              </Text>
            </div>
          )}

          <div className={styles.inputWrapper}>
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
              autoComplete="current-password"
              tabIndex={1}
            />
          </div>

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
                {getStrengthLabelKey(strengthResult.strength)}
              </Text>
            </div>
          )}

          {isNewPassphrase && (
            <div className={styles.inputWrapper}>
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
            </div>
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
