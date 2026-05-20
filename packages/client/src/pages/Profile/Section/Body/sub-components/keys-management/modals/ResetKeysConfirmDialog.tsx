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

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/ui-kit/components/text-input";

type ResetKeysConfirmDialogProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
};

export const ResetKeysConfirmDialog: React.FC<ResetKeysConfirmDialogProps> = ({
  visible,
  onConfirm,
  onCancel,
  isPending,
}) => {
  const { t } = useTranslation(["Common"]);
  const expectedToken = t("Common:ResetEncryptionKeysConfirmationToken");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!visible) setTyped("");
  }, [visible]);

  const matches = typed.trim().toUpperCase() === expectedToken.toUpperCase();

  return (
    <ModalDialog
      visible={visible}
      onClose={onCancel}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>
        {t("Common:ResetEncryptionKeysTitle")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontSize="13px" noSelect>
          {t("Common:ResetEncryptionKeysWarning")}
        </Text>
        <Text
          fontSize="13px"
          fontWeight="600"
          style={{ marginTop: "12px", marginBottom: "8px" }}
        >
          {t("Common:ResetEncryptionKeysConfirmation", {
            token: expectedToken,
          })}
        </Text>
        <TextInput
          type={InputType.text}
          size={InputSize.base}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={expectedToken}
          autoFocus
          scale
          isDisabled={isPending}
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          size={ButtonSize.normal}
          label={t("Common:ResetEncryptionKeysAction")}
          onClick={onConfirm}
          isDisabled={!matches || isPending}
          isLoading={isPending}
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          onClick={onCancel}
          isDisabled={isPending}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
