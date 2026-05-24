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
import { PasswordInput } from "@docspace/ui-kit/components/password-input";
import { InputSize } from "@docspace/ui-kit/components/text-input";
import { Text } from "@docspace/ui-kit/components/text";

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
