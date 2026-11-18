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

import React, { useEffect, useState, useCallback, useId } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { KEY_DIALOG_DISPLAY_TYPE } from "../key-dialog-display";
import { useKeyDialogCloseGuard } from "../key-dialog-close-guard";
import UnsavedChangesDialog from "../unsaved-changes-dialog";
import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";

import { RecoveryPhraseContent } from "./RecoveryPhraseContent";

type RecoveryPhraseDisplayModalProps = {
  visible: boolean;
  mnemonic: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  accountLabel?: string;
};

export const RecoveryPhraseDisplayModal: React.FC<
  RecoveryPhraseDisplayModalProps
> = ({
  visible,
  mnemonic,
  onConfirm,
  onCancel,
  isLoading = false,
  accountLabel,
}) => {
  const { t, ready } = useTranslation(["Common"]);
  const titleId = useId();
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (visible) {
      setAcknowledged(false);
    }
  }, [visible]);

  const handleCancel = useCallback(() => {
    setAcknowledged(false);
    onCancel();
  }, [onCancel]);

  const { requestClose, confirmation } = useKeyDialogCloseGuard({
    visible,
    dirty: !acknowledged,
    onCancel: handleCancel,
  });

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
        isLarge
      >
        <ModalDialog.Header>
          <span id={titleId}>{t("Common:RecoveryPhraseTitle")}</span>
        </ModalDialog.Header>

        <ModalDialog.Body>
          <RecoveryPhraseContent
            mnemonic={mnemonic}
            acknowledged={acknowledged}
            onAcknowledgedChange={setAcknowledged}
            isLoading={isLoading}
            accountLabel={accountLabel}
          />
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <Button
            scale
            primary
            key="ContinueButton"
            onClick={onConfirm}
            size={ButtonSize.normal}
            label={t("Common:ContinueButton")}
            isDisabled={!acknowledged || isLoading}
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

export default RecoveryPhraseDisplayModal;
