// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { RoomsType } from "@docspace/ui-kit/enums";

type RestoreRoomDialogProps = {
  visible: boolean;
  onClose: () => void;
  roomType?: number;
  onConfirm: () => void;
};

const RestoreRoomDialog = ({
  visible,
  onClose,
  roomType,
  onConfirm,
}: RestoreRoomDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const handleConfirm = React.useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  const onKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") handleConfirm();
    },
    [handleConfirm],
  );

  React.useEffect(() => {
    if (!visible) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, onKeyDown]);

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("Common:Restore")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>
          {roomType === RoomsType.PublicRoom
            ? t("Common:WantToRestoreTheRoom")
            : t("Common:RestoreRoom")}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="restore"
          label={t("Common:Restore")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={handleConfirm}
          testId="restore_room_dialog_submit"
        />
        <Button
          key="cancel"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          testId="restore_room_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RestoreRoomDialog;
