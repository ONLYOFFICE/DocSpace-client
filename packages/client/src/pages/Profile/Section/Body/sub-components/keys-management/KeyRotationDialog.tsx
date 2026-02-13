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

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { PasswordInput } from "@docspace/shared/components/password-input";
import { InputSize } from "@docspace/shared/components/text-input";
import { Text } from "@docspace/shared/components/text";

import styles from "./KeyRotationDialog.module.scss";

type KeyRotationDialogProps = {
  visible: boolean;
  onSubmit: (oldPassphrase: string, newPassphrase: string) => Promise<void>;
  onCancel: () => void;
  error?: string | null;
  isLoading?: boolean;
};

const MIN_LENGTH = 8;

export const KeyRotationDialog: React.FC<KeyRotationDialogProps> = ({
  visible,
  onSubmit,
  onCancel,
  error: externalError,
  isLoading = false,
}) => {
  const { t, ready } = useTranslation(["Common"]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentPassphrase, setCurrentPassphrase] = useState("");
  const [newPassphrase, setNewPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (visible) {
      setCurrentPassphrase("");
      setNewPassphrase("");
      setConfirmPassphrase("");
      setLocalError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  const error = externalError || localError;

  const handleSubmit = useCallback(async () => {
    setLocalError("");

    if (!currentPassphrase) {
      setLocalError(t("Common:CurrentPassphraseRequired"));
      return;
    }

    if (newPassphrase.length < MIN_LENGTH) {
      setLocalError(t("Common:PassphraseTooShort", { length: MIN_LENGTH }));
      return;
    }

    if (newPassphrase !== confirmPassphrase) {
      setLocalError(t("Common:PassphraseMismatch"));
      return;
    }

    if (currentPassphrase === newPassphrase) {
      setLocalError(t("Common:PassphraseMustBeDifferent"));
      return;
    }

    await onSubmit(currentPassphrase, newPassphrase);
  }, [currentPassphrase, newPassphrase, confirmPassphrase, onSubmit, t]);

  const handleCancel = useCallback(() => {
    setCurrentPassphrase("");
    setNewPassphrase("");
    setConfirmPassphrase("");
    setLocalError("");
    onCancel();
  }, [onCancel]);

  const isValid =
    currentPassphrase.length > 0 &&
    newPassphrase.length >= MIN_LENGTH &&
    newPassphrase === confirmPassphrase &&
    currentPassphrase !== newPassphrase;

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
      <ModalDialog.Header>{t("Common:ChangePassphrase")}</ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.container}>
          <Text className={styles.description}>
            {t("Common:ChangePassphraseHint")}
          </Text>

          {error && (
            <div className={styles.errorBox}>
              <Text fontSize="13px" fontWeight={600} color="var(--color-error)">
                {error}
              </Text>
            </div>
          )}

          {/* Current Passphrase */}
          <div className={styles.inputGroup}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:CurrentPassphrase")}
            </Text>
            <div className={styles.inputWrapper}>
              <PasswordInput
                id="currentPassphrase"
                inputName="currentPassphrase"
                inputValue={currentPassphrase}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCurrentPassphrase(e.target.value);
                  setLocalError("");
                }}
                placeholder={t("Common:EnterCurrentPassphrase")}
                scale
                size={InputSize.base}
                simpleView
                isDisabled={isLoading}
                hasError={!!error && !currentPassphrase}
                autoComplete="new-password"
                tabIndex={1}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:NewPassphrase")}
            </Text>
            <div className={styles.inputWrapper}>
              <PasswordInput
                id="newPassphrase"
                inputName="newPassphrase"
                inputValue={newPassphrase}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewPassphrase(e.target.value);
                  setLocalError("");
                }}
                placeholder={t("Common:EnterNewPassphrase")}
                scale
                size={InputSize.base}
                simpleView
                isDisabled={isLoading}
                hasError={
                  !!error &&
                  newPassphrase.length > 0 &&
                  newPassphrase.length < MIN_LENGTH
                }
                autoComplete="new-password"
                tabIndex={2}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:ConfirmNewPassphrase")}
            </Text>
            <div className={styles.inputWrapper}>
              <PasswordInput
                id="confirmNewPassphrase"
                inputName="confirmNewPassphrase"
                inputValue={confirmPassphrase}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirmPassphrase(e.target.value);
                  setLocalError("");
                }}
                placeholder={t("Common:ConfirmNewPassphrase")}
                scale
                size={InputSize.base}
                simpleView
                isDisabled={isLoading}
                hasError={
                  !!confirmPassphrase && newPassphrase !== confirmPassphrase
                }
                autoComplete="new-password"
                tabIndex={3}
              />
            </div>
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          scale
          primary
          key="SubmitButton"
          onClick={handleSubmit}
          size={ButtonSize.normal}
          label={t("Common:ChangePassphrase")}
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
