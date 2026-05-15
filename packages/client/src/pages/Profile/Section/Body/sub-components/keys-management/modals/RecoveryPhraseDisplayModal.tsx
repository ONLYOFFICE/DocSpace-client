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

import React, { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import { splitMnemonicForDisplay } from "@docspace/shared/services/encryption/recovery";

import styles from "./RecoveryPhraseDisplayModal.module.scss";

type RecoveryPhraseDisplayModalProps = {
  visible: boolean;
  mnemonic: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export const RecoveryPhraseDisplayModal: React.FC<
  RecoveryPhraseDisplayModalProps
> = ({ visible, mnemonic, onConfirm, onCancel, isLoading = false }) => {
  const { t, ready } = useTranslation(["Common"]);
  const [acknowledged, setAcknowledged] = useState(false);

  const groups = useMemo(() => splitMnemonicForDisplay(mnemonic, 4), [mnemonic]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      toastr.success(t("Common:Copied"));
    } catch {
      toastr.error(t("Common:CopyFailed"));
    }
  }, [mnemonic, t]);

  const handleCancel = useCallback(() => {
    setAcknowledged(false);
    onCancel();
  }, [onCancel]);

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
        {t("Common:RecoveryPhraseTitle")}
      </ModalDialog.Header>

      <ModalDialog.Body>
        <div className={styles.container}>
          <Text className={styles.description}>
            {t("Common:RecoveryPhraseHint")}
          </Text>

          <div className={styles.warningBox}>
            <Text fontSize="13px" fontWeight={600}>
              {t("Common:RecoveryPhraseWarning")}
            </Text>
          </div>

          <div className={styles.wordsGrid}>
            {groups.map((group, rowIdx) => (
              <div key={`row-${rowIdx}`} className={styles.wordsRow}>
                {group.map((word, colIdx) => {
                  const number = rowIdx * 4 + colIdx + 1;
                  return (
                    <div key={`word-${number}`} className={styles.wordCell}>
                      <span className={styles.wordIndex}>{number}.</span>
                      <span className={styles.wordText}>{word}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <Button
            scale
            size={ButtonSize.small}
            onClick={handleCopy}
            label={t("Common:CopyToClipboard")}
            isDisabled={isLoading}
          />

          <div className={styles.checkboxRow}>
            <Checkbox
              id="recoveryPhraseAcknowledged"
              isChecked={acknowledged}
              isDisabled={isLoading}
              onChange={(e) => setAcknowledged(e.target.checked)}
              label={t("Common:RecoveryPhraseAcknowledge")}
              tabIndex={1}
            />
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          scale
          primary
          key="ConfirmButton"
          onClick={onConfirm}
          size={ButtonSize.normal}
          label={t("Common:ContinueButton")}
          isDisabled={!acknowledged || isLoading}
          isLoading={isLoading}
          tabIndex={2}
        />
        <Button
          scale
          key="CancelButton"
          onClick={handleCancel}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          isDisabled={isLoading}
          tabIndex={3}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
