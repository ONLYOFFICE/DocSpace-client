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

import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { useEventListener } from "@docspace/ui-kit/hooks/useEventListener";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";

import type { PauseSubmissionsDialogProps } from "./PauseSubmissions.types";

const PauseSubmissionsDialog = ({
  visible,
  onClose,
  onEdit,
}: PauseSubmissionsDialogProps) => {
  const { t, ready } = useTranslation(["PauseSubmissionsDialog", "Common"]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    try {
      setIsLoading(true);
      onEdit();
      onClose();
    } catch (error) {
      console.error("Error editing submissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyPress = (e: KeyboardEvent) => {
    if (!visible) return;

    if (e.key === "Escape") {
      onClose();
    }
    if (e.key === "Enter") {
      handleEdit();
    }
  };

  useEventListener("keydown", onKeyPress);

  return (
    <ModalDialog
      isLoading={!ready}
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>
        {t("PauseSubmissionsDialog:PauseSubmissionsTitle")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontSize="13px" fontWeight={400}>
          {t("PauseSubmissionsDialog:Description1")}
        </Text>
        <Text fontSize="13px" fontWeight={400} style={{ marginTop: "8px" }}>
          {t("PauseSubmissionsDialog:Description2")}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="pause-submissions-dialog_edit"
          key="EditButton"
          label={t("Common:EditButton")}
          size={ButtonSize.normal}
          primary
          onClick={handleEdit}
          isLoading={isLoading}
          isDisabled={isLoading}
          scale
        />
        <Button
          id="pause-submissions-dialog_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          isDisabled={isLoading}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject<TStore>(({ dialogsStore }) => {
  const {
    pauseSubmissionsDialogVisible: visible,
    pauseSubmissionsDialogCallback: callback,
    setPauseSubmissionsDialogVisible,
  } = dialogsStore;

  return {
    visible,
    setPauseSubmissionsDialogVisible,
    onClose: () => {
      setPauseSubmissionsDialogVisible(false);
      callback?.(false);
    },
    onEdit: () => callback?.(true),
  };
})(observer(PauseSubmissionsDialog as FC));
