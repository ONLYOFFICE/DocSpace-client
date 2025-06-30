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

import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "../../components/text";
import { ModalDialog } from "../../components/modal-dialog";
import { Button, ButtonSize } from "../../components/button";
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
          <Text noSelect>{t("Common:MoveToPublicRoom")}</Text>
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
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
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
