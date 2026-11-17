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
  useId,
} from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { KEY_DIALOG_DISPLAY_TYPE } from "../key-dialog-display";
import { useKeyDialogCloseGuard } from "../key-dialog-close-guard";
import { activateAsButton, submitOnEnter } from "../key-dialog-keys";
import { useRefocusAfterFailure } from "../key-dialog-refocus";
import { KeyDialogAnnouncement } from "../key-dialog-announcement";
import UnsavedChangesDialog from "../unsaved-changes-dialog";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { Checkbox } from "@onlyoffice/apps-ui-kit/components/checkbox";
import { PasswordInput } from "@onlyoffice/apps-ui-kit/components/password-input";
import { InputSize } from "@onlyoffice/apps-ui-kit/components/text-input";
import { FieldContainer } from "@onlyoffice/apps-ui-kit/components/field-container";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import {
  PASSPHRASE_MIN_LENGTH,
  PASSPHRASE_SETTINGS,
  isPassphraseAcceptable,
} from "@docspace/shared/services/encryption/passphrase-strength";

import {
  PassphraseCreationFields,
  RULES_TOOLTIP_PLACE,
} from "./PassphraseCreationFields";
import styles from "./PassphraseModal.module.scss";

export { PASSPHRASE_SETTINGS, RULES_TOOLTIP_PLACE };

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
  const titleId = useId();

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

  const { requestClose, confirming, confirmation } = useKeyDialogCloseGuard({
    visible,
    dirty: isNew && (passphrase !== "" || confirmPassphrase !== ""),
    onCancel: handleCancel,
  });

  const isValid = isNew
    ? rulesPassed &&
      isPassphraseAcceptable(passphrase) &&
      passphrase === confirmPassphrase
    : passphrase.length >= MIN_LENGTH;

  const isDisabled = !isValid || isLoading;

  const handleKeyDown = useMemo(
    () => submitOnEnter(handleSubmit, !isDisabled && !confirming),
    [handleSubmit, isDisabled, confirming],
  );

  useRefocusAfterFailure(
    "passphrase",
    visible && !isLoading && !!externalError,
  );

  const displayedError = externalError || error;

  const passphraseHasError = !!displayedError;

  const confirmMismatch = !!confirmPassphrase && passphrase !== confirmPassphrase;
  const announcedError =
    displayedError || (confirmMismatch ? t("Common:PassphraseMismatch") : "");

  return (
    <>
      <ModalDialog
        zIndex={410}
        visible={visible}
        onClose={requestClose}
        displayType={ModalDialogType.modal}
        displayTypeDetailed={KEY_DIALOG_DISPLAY_TYPE}
        closeOnBackdropClick={false}
        aria-labelledby={titleId}
        isLoading={!ready}
        autoMaxHeight
      >
        <ModalDialog.Header>
          <span id={titleId}>
            {title ??
              (isNew
                ? t("Common:CreatePassphrase")
                : t("Common:EnterPassphrase"))}
          </span>
        </ModalDialog.Header>

        <ModalDialog.Body>
          <div className={styles.container}>
            <Text className={styles.description}>
              {description ??
                (isNew
                  ? t("Common:CreatePassphraseHint")
                  : t("Common:PassphraseHint"))}
            </Text>

            {isNew ? (
              <PassphraseCreationFields
                passphrase={passphrase}
                confirmPassphrase={confirmPassphrase}
                onPassphraseChange={(value, generated) => {
                  setPassphrase(value);
                  if (generated) setConfirmPassphrase(value);
                  setError("");
                }}
                onConfirmPassphraseChange={(value) => {
                  setConfirmPassphrase(value);
                  setError("");
                }}
                onRulesPassedChange={setRulesPassed}
                error={displayedError ?? ""}
                rulesPassed={rulesPassed}
                isLoading={isLoading}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <div className={styles.passphraseField}>
                <FieldContainer
                  isVertical
                  labelVisible
                  labelText={t("Common:Passphrase")}
                  labelFor="passphrase"
                  removeMargin
                  hasError={passphraseHasError}
                  errorMessage={displayedError ?? ""}
                  errorMessageWidth="100%"
                  className={styles.inputWrapper}
                >
                  <PasswordInput
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
                    simpleView
                    isFullWidth
                    isDisabled={isLoading}
                    hasError={passphraseHasError}
                    isAutoFocussed
                    autoComplete="new-password"
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                  />
                </FieldContainer>

                {/* Spec: private-rooms/key-management, "Remember this device" */}
                {showRememberDevice ? (
                  <div className={styles.rememberRow}>
                    <Checkbox
                      id="rememberDevice"
                      isChecked={rememberDevice}
                      isDisabled={isLoading}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      label={t("Common:RememberDeviceLabel")}
                    />
                    <Text
                      fontSize="12px"
                      color="var(--text-secondary)"
                      className={styles.rememberHint}
                    >
                      {t("Common:RememberDeviceHint")}
                    </Text>
                  </div>
                ) : null}

                {/* Spec: private-rooms/key-management, "Forgot passphrase link" */}
                {onForgotPassphrase ? (
                  <div className={styles.forgotRow}>
                    <Link
                      type={LinkType.action}
                      role="button"
                      tabIndex={0}
                      fontWeight="600"
                      fontSize="12px"
                      isHovered
                      onClick={onForgotPassphrase}
                      onKeyDown={activateAsButton}
                      dataTestId="forgot_passphrase_link"
                    >
                      {t("Common:ForgotPassphrase")}
                    </Link>
                  </div>
                ) : null}

                {onPasskeyUnlock ? (
                  <div className={styles.passkeyRow}>
                    <Link
                      type={LinkType.action}
                      role="button"
                      tabIndex={0}
                      fontWeight="600"
                      fontSize="12px"
                      isHovered
                      onClick={() => {
                        if (!isLoading && !isPasskeyUnlocking) onPasskeyUnlock();
                      }}
                      onKeyDown={activateAsButton}
                      dataTestId="passkey_unlock_link"
                    >
                      {t("Common:PasskeyUnlockButton")}
                    </Link>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <KeyDialogAnnouncement text={announcedError} />
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            scale
            primary
            key="SubmitButton"
            onClick={handleSubmit}
            size={ButtonSize.normal}
            label={
              submitLabel ??
              // Spec: private-rooms/key-management, "Unlock with the passphrase"
              (isNew ? t("Common:ContinueButton") : t("Common:UnlockKey"))
            }
            isDisabled={isDisabled}
            isLoading={isLoading}
          />
          <Button
            scale
            key="CancelButton"
            onClick={handleCancel}
            size={ButtonSize.normal}
            label={t("Common:CancelButton")}
            isDisabled={isLoading}
          />
        </ModalDialog.Footer>
      </ModalDialog>
      <UnsavedChangesDialog {...confirmation} />
    </>
  );
};

export default PassphraseModal;

