/**
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
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";
import api from "@docspace/shared/api";
import { ShareAccessRights } from "@docspace/ui-kit/enums";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useDialogsStore } from "@/app/(docspace)/_store/DialogsStore";
import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import { SDKDialogs } from "@/app/(docspace)/_enums/dialogs";
import type { TFolderItem } from "@/app/(docspace)/_hooks/useItemList";

type LeaveRoomDialogProps = {
  currentUserId?: string;
  onTransferOwnership: (room: TFolderItem) => void;
};

const LeaveRoomDialog = observer(
  ({ currentUserId, onTransferOwnership }: LeaveRoomDialogProps) => {
    const { t } = useTranslation(["Common"]);
    const dialogsStore = useDialogsStore();
    const filesListStore = useFilesListStore();
    const filesSelectionStore = useFilesSelectionStore();
    const navigationStore = useNavigationStore();
    const { openFolder } = useFolderActions({ t });

    const visible = dialogsStore.isDialogOpen(SDKDialogs.LeaveRoom);

    const room =
      (filesSelectionStore.selection[0] as TFolderItem | undefined) ??
      (filesSelectionStore.bufferSelection as TFolderItem | undefined) ??
      null;

    const [isLoading, setIsLoading] = React.useState(false);

    const onClose = () => dialogsStore.closeDialog(SDKDialogs.LeaveRoom);

    const isOwner =
      !!room && !!currentUserId && room.createdBy?.id === currentUserId;

    const descriptionText = isOwner
      ? t("Common:LeaveRoomDescription")
      : t("Common:WantLeaveRoom");

    const okLabel = isOwner ? t("Common:AssignOwner") : t("Common:OKButton");

    const handleConfirm = async () => {
      if (!room) return;

      if (isOwner) {
        onTransferOwnership(room);
        onClose();
        return;
      }

      if (!currentUserId) return;

      const roomId = room.id as number;
      const isInsideRoom = filesListStore.currentFolder?.id === roomId;
      setIsLoading(true);
      try {
        await api.rooms.updateRoomMemberRole(roomId, {
          invitations: [{ id: currentUserId, access: ShareAccessRights.None }],
          force: false,
        });
        filesListStore.removeItem(roomId);
        filesSelectionStore.setSelection([]);
        filesSelectionStore.setBufferSelection(null);
        toastr.success(t("Common:YouLeftTheRoom"));
        onClose();
        if (isInsideRoom) {
          const parent = navigationStore.navigationItems?.[0];
          if (parent) openFolder(parent.id, parent.title);
        }
      } catch (e) {
        toastr.error(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <ModalDialog
        visible={visible}
        onClose={onClose}
        displayType={ModalDialogType.modal}
      >
        <ModalDialog.Header>{t("Common:LeaveTheRoom")}</ModalDialog.Header>
        <ModalDialog.Body>
          <Text>{descriptionText}</Text>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            key="ok"
            label={okLabel}
            size={ButtonSize.normal}
            primary
            scale
            onClick={handleConfirm}
            isDisabled={isLoading}
            isLoading={isLoading}
            testId="leave_room_dialog_submit"
          />
          <Button
            key="cancel"
            label={t("Common:CancelButton")}
            size={ButtonSize.normal}
            scale
            onClick={onClose}
            isDisabled={isLoading}
            testId="leave_room_dialog_cancel"
          />
        </ModalDialog.Footer>
      </ModalDialog>
    );
  },
);

export default LeaveRoomDialog;
export { LeaveRoomDialog };
