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

import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Textarea } from "@docspace/ui-kit/components/textarea";
import { Text } from "@docspace/ui-kit/components/text";
import {
  normalizeMnemonic,
  validateMnemonic,
} from "@docspace/shared/services/encryption/recovery";

import styles from "./RecoveryPhraseInputModal.module.scss";

type RecoveryPhraseInputModalProps = {
  visible: boolean;
  onSubmit: (mnemonic: string) => void;
  onCancel: () => void;
  error?: string | null;
  isLoading?: boolean;
};

export const RecoveryPhraseInputModal: React.FC<
  RecoveryPhraseInputModalProps
> = ({ visible, onSubmit, onCancel, error: externalError, isLoading = false }) => {
  const { t, ready } = useTranslation(["Common"]);

  const [phrase, setPhrase] = useState("");
  const [localError, setLocalError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (visible) {
      setPhrase("");
      setLocalError("");
    }
  }, [visible]);

  const error = externalError || localError;

  const handleSubmit = useCallback(async () => {
    setLocalError("");
    const normalized = normalizeMnemonic(phrase);
    const wordCount = normalized.length === 0 ? 0 : normalized.split(" ").length;

    if (wordCount !== 24) {
      setLocalError(t("Common:RecoveryPhraseRequired"));
      return;
    }

    setIsValidating(true);
    try {
      const ok = await validateMnemonic(normalized);
      if (!ok) {
        setLocalError(t("Common:InvalidRecoveryPhrase"));
        return;
      }
      onSubmit(normalized);
    } catch (e) {
      console.error("Recovery phrase validation failed:", e);
      setLocalError(t("Common:InvalidRecoveryPhrase"));
    } finally {
      setIsValidating(false);
    }
  }, [phrase, onSubmit, t]);

  const handleCancel = useCallback(() => {
    setPhrase("");
    setLocalError("");
    onCancel();
  }, [onCancel]);

  const isDisabled = phrase.trim().length === 0 || isLoading || isValidating;

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
        {t("Common:UseRecoveryPhrase")}
      </ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.container}>
          <Text className={styles.description}>
            {t("Common:RecoveryPhraseInputHint")}
          </Text>

          {error ? (
            <div className={styles.errorBox}>
              <Text fontSize="13px" fontWeight={600} color="var(--color-error)">
                {error}
              </Text>
            </div>
          ) : null}

          <Textarea
            id="recoveryPhraseInput"
            name="recoveryPhraseInput"
            value={phrase}
            onChange={(e) => {
              setPhrase(e.target.value);
              setLocalError("");
            }}
            placeholder={t("Common:RecoveryPhrasePlaceholder")}
            heightTextArea="120px"
            isDisabled={isLoading || isValidating}
            hasError={!!error}
            autoFocus
            fontSize={13}
            tabIndex={1}
          />
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
          isLoading={isLoading || isValidating}
          tabIndex={2}
        />
        <Button
          scale
          key="CancelButton"
          onClick={handleCancel}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          isDisabled={isLoading || isValidating}
          tabIndex={3}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
