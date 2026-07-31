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

import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import type { BackupToPublicRoomProps } from "./BackupToPublicRoomDialog";

const BackupToPublicRoom = ({
  visible,
  setIsVisible,
  backupToPublicRoomData,
}: BackupToPublicRoomProps) => {
  const { t, ready } = useTranslation(["Common"]);

  const onClose = useCallback(() => {
    setIsVisible(false);
  }, [setIsVisible]);

  const onBackupTo = useCallback(() => {
    const {
      selectedItemId,
      breadCrumbs,
      onSelectFolder,
      onClose: onCloseAction,
    } = backupToPublicRoomData;

    onSelectFolder?.(selectedItemId, breadCrumbs);

    onClose();
    onCloseAction();
  }, [backupToPublicRoomData, onClose]);

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onBackupTo();
    },
    [onBackupTo, onClose],
  );

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, [onKeyUp]);

  return (
    <ModalDialog isLoading={!ready} visible={visible} onClose={onClose}>
      <ModalDialog.Header>{t("Common:SaveToPublicRoom")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <Text>{t("Common:MoveToPublicRoom")}</Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OKButton"
          label={t("Common:OKButton")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onBackupTo}
          testId="save_backup_to_room_button"
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          testId="cancel_backup_to_room_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default BackupToPublicRoom;

// export default inject(({ dialogsStore }) => {
//   const {
//     backupToPublicRoomVisible,
//     setBackupToPublicRoomVisible,
//     backupToPublicRoomData,
//   } = dialogsStore;

//   return {
//     visible: backupToPublicRoomVisible,
//     setIsVisible: setBackupToPublicRoomVisible,

//     backupToPublicRoomData,
//   };
// })(observer(BackupToPublicRoomComponent));
