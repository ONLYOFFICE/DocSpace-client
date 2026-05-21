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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { toastr } from "@docspace/ui-kit/components/toast";
import SocketHelper, { SocketCommands } from "@docspace/ui-kit/utils/socket";

import { EncryptionStatus } from "@docspace/shared/enums";

import { startEncryption } from "@docspace/shared/api/settings";

export const EncryptWarningDialog = ({
  encryptWarningDialogVisible,
  setEncryptWarningDialogVisible,
  isNotifyChecked,
  status,
}: {
  encryptWarningDialogVisible: boolean;
  setEncryptWarningDialogVisible: (visible: boolean) => void;
  isNotifyChecked: boolean;
  status: number;
}) => {
  const { t } = useTranslation(["Management", "Common"]);

  const onConfirm = async () => {
    try {
      await startEncryption(isNotifyChecked);
      SocketHelper?.emit(SocketCommands.StorageEncryption);
      setEncryptWarningDialogVisible(false);
      window.location.href = "/encryption-portal";
    } catch (error) {
      toastr.error(error!);
    }
  };

  const onClose = () => setEncryptWarningDialogVisible(false);

  return (
    <ModalDialog
      visible={encryptWarningDialogVisible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
      autoMaxHeight
    >
      <ModalDialog.Header>{t("Common:Confirmation")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>
          {status === EncryptionStatus.Decrypted
            ? t("EncryptWarningDialogContent")
            : t("DecryptWarningDialogContent")}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="CreateButton"
          label={t("Common:OKButton")}
          size={ButtonSize.normal}
          scale
          primary
          onClick={onConfirm}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
