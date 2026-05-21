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

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";

type Phase = "confirm" | "deleting" | "failed";

type ResetPanelDialogProps = {
  visible: boolean;
  expertCount: number;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function ResetPanelDialog({
  visible,
  expertCount,
  onCancel,
  onConfirm,
}: ResetPanelDialogProps) {
  const { t } = useTranslation(["Common"]);
  const [phase, setPhase] = React.useState<Phase>("confirm");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!visible) {
      setPhase("confirm");
      setError(null);
    }
  }, [visible]);

  const handleConfirm = async () => {
    setPhase("deleting");
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("failed");
    }
  };

  const handleClose = () => {
    if (phase === "deleting") return;
    onCancel();
  };

  return (
    <ModalDialog visible={visible} onClose={handleClose} autoMaxHeight>
      <ModalDialog.Header>Reset AI Arbiter configuration</ModalDialog.Header>
      <ModalDialog.Body>
        {phase === "confirm" ? (
          <Text as="p">
            {`This will delete your ${expertCount} expert agent${
              expertCount === 1 ? "" : "s"
            } and arbiter, then start a new setup conversation. The setup wizard itself will be preserved. This cannot be undone.`}
          </Text>
        ) : null}
        {phase === "deleting" ? <Text as="p">Removing agents...</Text> : null}
        {phase === "failed" ? (
          <Text as="p">
            {`Failed to reset: ${error ?? "unknown error"}`}
          </Text>
        ) : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        {phase === "confirm" ? (
          <>
            <Button
              primary
              scale
              size={ButtonSize.normal}
              label={t("Common:ArbiterYesResetEverything")}
              onClick={handleConfirm}
            />
            <Button
              scale
              size={ButtonSize.normal}
              label={t("Common:CancelButton")}
              onClick={onCancel}
            />
          </>
        ) : null}
        {phase === "deleting" ? (
          <Button
            scale
            size={ButtonSize.normal}
            label={t("Common:ArbiterWorking")}
            isDisabled
          />
        ) : null}
        {phase === "failed" ? (
          <Button
            primary
            scale
            size={ButtonSize.normal}
            label={t("Common:CloseButton")}
            onClick={onCancel}
          />
        ) : null}
      </ModalDialog.Footer>
    </ModalDialog>
  );
}

export default ResetPanelDialog;
