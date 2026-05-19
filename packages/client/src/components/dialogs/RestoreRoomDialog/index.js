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

import { useEffect } from "react";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { Button } from "@docspace/ui-kit/components/button";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { RoomsType } from "@docspace/shared/enums";

const RestoreRoomDialogComponent = (props) => {
  const {
    t,
    tReady,
    visible,
    restoreAll,
    setRestoreRoomDialogVisible,
    setRestoreAllArchive,
    setArchiveAction,
    items,
    hasPublicRoom,
  } = props;

  const onClose = () => {
    setRestoreAllArchive(false);
    setRestoreRoomDialogVisible(false);
  };

  const onAction = () => {
    const itemsRestoreHaveRights = items.filter(
      (item) => item.security.Move === true,
    );

    setRestoreRoomDialogVisible(false);
    setArchiveAction("unarchive", itemsRestoreHaveRights, t).then(() => {
      setRestoreAllArchive(false);
    });
  };

  const onKeyPress = (e) => {
    if (e.keyCode === 13) {
      onAction();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);

    return () => window.removeEventListener("keydown", onKeyPress);
  }, []);

  const getDescription = () => {
    if (hasPublicRoom) {
      return items.length > 1
        ? t("Files:WantToRestoreTheRooms")
        : t("Files:WantToRestoreTheRoom");
    }

    if (restoreAll) return t("ArchiveDialog:RestoreAllRooms");

    return items.length > 1
      ? t("ArchiveDialog:RestoreRooms")
      : t("ArchiveDialog:RestoreRoom");
  };

  const description = getDescription();

  return (
    <ModalDialog
      isLoading={!tReady}
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{t("Common:Restore")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{description}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="restore-all_submit"
          key="OKButton"
          label={t("Common:Restore")}
          size="normal"
          primary
          onClick={onAction}
          scale
          testId="restore_room_dialog_submit"
        />
        <Button
          id="restore-all_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onClose}
          scale
          testId="restore_room_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const RestoreRoomDialog = withTranslation(["Files", "ArchiveDialog", "Common"])(
  RestoreRoomDialogComponent,
);

export default inject(
  ({ filesStore, filesActionsStore, dialogsStore, selectedFolderStore }) => {
    const { roomsForRestore, selection, bufferSelection } = filesStore;
    const { setArchiveAction } = filesActionsStore;

    const {
      restoreRoomDialogVisible: visible,
      restoreAllArchive: restoreAll,
      setRestoreRoomDialogVisible,
      setRestoreAllArchive,
    } = dialogsStore;

    const items = restoreAll
      ? roomsForRestore
      : selection.length > 0
        ? selection
        : bufferSelection
          ? [bufferSelection]
          : [selectedFolderStore];

    const hasPublicRoom =
      items.findIndex((i) => i.roomType === RoomsType.PublicRoom) !== -1;

    return {
      visible,
      restoreAll,
      setRestoreRoomDialogVisible,
      setRestoreAllArchive,
      setArchiveAction,
      items,
      hasPublicRoom,
    };
  },
)(observer(RestoreRoomDialog));
