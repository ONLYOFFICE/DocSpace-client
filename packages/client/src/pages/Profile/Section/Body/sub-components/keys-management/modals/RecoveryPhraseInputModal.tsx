// (c) Copyright Ascensio System SIA 2009-2026
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
