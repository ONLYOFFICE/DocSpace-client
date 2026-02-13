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

import styles from "./PassphraseModal.module.scss";

type PassphraseModalProps = {
  visible: boolean;
  onSubmit: (passphrase: string) => void;
  onCancel: () => void;
  isNew: boolean;
  isLoading?: boolean;
};

const MIN_LENGTH = 8;

export const PassphraseModal: React.FC<PassphraseModalProps> = ({
  visible,
  onSubmit,
  onCancel,
  isNew,
  isLoading = false,
}) => {
  const { t, ready } = useTranslation(["Common"]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [error, setError] = useState("");

  // Reset form and focus when dialog opens
  useEffect(() => {
    if (visible) {
      setPassphrase("");
      setConfirmPassphrase("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  const handleSubmit = useCallback(() => {
    if (passphrase.length < MIN_LENGTH) {
      setError(t("Common:PassphraseTooShort", { length: MIN_LENGTH }));
      return;
    }

    if (isNew && passphrase !== confirmPassphrase) {
      setError(t("Common:PassphraseMismatch"));
      return;
    }

    onSubmit(passphrase);
    setPassphrase("");
    setConfirmPassphrase("");
    setError("");
  }, [passphrase, confirmPassphrase, isNew, onSubmit, t]);

  const handleCancel = useCallback(() => {
    setPassphrase("");
    setConfirmPassphrase("");
    setError("");
    onCancel();
  }, [onCancel]);

  const isValid =
    passphrase.length >= MIN_LENGTH &&
    (!isNew || passphrase === confirmPassphrase);

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

          {error && (
            <div className={styles.errorBox}>
              <Text fontSize="13px" fontWeight={600} color="var(--color-error)">
                {error}
              </Text>
            </div>
          )}

          <div className={styles.inputWrapper}>
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
              isDisabled={isLoading}
              hasError={!!error}
              autoComplete="new-password"
              tabIndex={1}
            />
          </div>

          {isNew && (
            <div className={styles.inputWrapper}>
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
