// (c) Copyright Ascensio System SIA 2009-2025
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
import React from "react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Events, RoomsType } from "@docspace/shared/enums";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import type {
  EventWithPayload,
  SharePDFFormDialogProps,
} from "./SharePDFFormDialog.type";

export const SharePDFFormDialog = inject<TStore>(
  ({ filesActionsStore, filesStore }) => {
    const { setProcessCreatingRoomFromData } = filesActionsStore;
    const { setBufferSelection } = filesStore;

    return { setProcessCreatingRoomFromData, setBufferSelection };
  },
)(
  observer(
    ({
      file,
      onClose,
      setBufferSelection,
      setProcessCreatingRoomFromData,
    }: SharePDFFormDialogProps) => {
      const { t } = useTranslation(["Files", "Common"]);

      const onSubmit = () => {
        setBufferSelection?.(file);
        setProcessCreatingRoomFromData?.(true);
        const event: EventWithPayload = new Event(Events.ROOM_CREATE);

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
