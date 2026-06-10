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

// PARITY-SOURCE: packages/client/src/components/dialogs/RemoveUserConfirmationDialog/index.tsx
// PARITY-REVIEW: Required when source changes. Last reviewed: 2026-05-27 by Ilya Oleshko
// NOTE: Slim port — drops MobX inject, hard-codes isEncryptedRoom=true since
// every private-room removal is encrypted. Confirmation copy still pulls from
// the shared Common namespace so wording stays in sync with main client.

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";

export type RemoveUserConfirmationDialogProps = {
  visible: boolean;
  displayName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

const RemoveUserConfirmationDialog: React.FC<
  RemoveUserConfirmationDialogProps
> = ({ visible, displayName, onConfirm, onClose }) => {
  const { t, ready } = useTranslation(["People", "Common"]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClose = React.useCallback(() => {
    if (isLoading) return;
    onClose();
  }, [isLoading, onClose]);

  const handleDelete = React.useCallback(async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      toastr.error(error as Error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  }, [onConfirm, onClose]);

  return (
    <ModalDialog isLoading={!ready} visible={visible} onClose={handleClose}>
      <ModalDialog.Header>{t("People:RemoveUser")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>
          {t("Common:RemoveUserFromEncryptedRoomWarning", { displayName })}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OKButton"
          label={t("Common:Remove")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={handleDelete}
          isLoading={isLoading}
          testId="private_remove_user_confirmation_ok"
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={handleClose}
          isLoading={isLoading}
          testId="private_remove_user_confirmation_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RemoveUserConfirmationDialog;
