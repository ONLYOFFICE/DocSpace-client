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

import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@onlyoffice/apps-ui-kit/components/button";
import { ModalDialog, ModalDialogType } from "@onlyoffice/apps-ui-kit/components/modal-dialog";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

type DeleteAgentDialogProps = {
  agentName: string;
  /** Deletes the agent; the dialog stays, its buttons locked, until it settles. */
  onDelete: () => Promise<void>;
  onClose: () => void;
};

/** Asks before the agent picked in the chat panel is deleted for good. */
const DeleteAgentDialog = ({ agentName, onDelete, onClose }: DeleteAgentDialogProps) => {
  const { t } = useTranslation(["Common"]);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const onConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ModalDialog visible displayType={ModalDialogType.modal} onClose={isDeleting ? undefined : onClose}>
      <ModalDialog.Header>{t("Common:DeleteAIAgentTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>
          <Trans
            t={t}
            i18nKey="Common:DeleteAIAgentDescription"
            values={{ agentName }}
            components={{ 1: <strong /> }}
          />
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          scale
          size={ButtonSize.normal}
          label={t("Common:Delete")}
          isLoading={isDeleting}
          onClick={onConfirm}
          testId="delete_ai_agent_confirm"
        />
        <Button
          scale
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          isDisabled={isDeleting}
          onClick={onClose}
          testId="delete_ai_agent_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default DeleteAgentDialog;
