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
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Events, RoomsType } from "@docspace/shared/enums";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import type {
  EventWithPayload,
  SharePDFFormDialogProps,
} from "./SharePDFFormDialog.type";

export const SharePDFFormDialog = inject<TStore>(
  ({ filesActionsStore, filesStore, selectedFolderStore }) => {
    const { setProcessCreatingRoomFromData } = filesActionsStore;
    const { setBufferSelection } = filesStore;
    const currentFolderId = selectedFolderStore.id;

    return { setProcessCreatingRoomFromData, setBufferSelection, currentFolderId };
  },
)(
  observer(
    ({
      file,
      onClose,
      setBufferSelection,
      setProcessCreatingRoomFromData,
      currentFolderId,
    }: SharePDFFormDialogProps) => {
      const { t } = useTranslation(["Files", "Common"]);

      const onSubmit = () => {
        setBufferSelection?.(file);
        setProcessCreatingRoomFromData?.(true);
        const event: EventWithPayload = new CustomEvent(Events.ROOM_CREATE, {
          detail: { parentId: currentFolderId, context: "dialog" },
        });

        event.payload = {
          startRoomType: RoomsType.FormRoom,
        };

        window.dispatchEvent(event);

        onClose();
      };

      const handleOnClose = () => {
        onClose();
      };

      return (
        <ModalDialog
          visible
          autoMaxHeight
          onClose={handleOnClose}
          displayType={ModalDialogType.modal}
        >
          <ModalDialog.Header>
            {t("Files:SharePDFFormModalTitle")}
          </ModalDialog.Header>
          <ModalDialog.Body>
            {t("Files:SharePDFFormModalDescription")}
          </ModalDialog.Body>
          <ModalDialog.Footer>
            <Button
              scale
              primary
              tabIndex={0}
              size={ButtonSize.normal}
              label={t("Common:CreateRoom")}
              onClick={onSubmit}
            />
            <Button
              scale
              tabIndex={0}
              onClick={handleOnClose}
              size={ButtonSize.normal}
              label={t("Common:CancelButton")}
            />
          </ModalDialog.Footer>
        </ModalDialog>
      );
    },
  ),
);
