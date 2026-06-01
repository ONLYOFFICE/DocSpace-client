// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";

type RemoveUserDialogProps = {
  isEncrypted?: boolean;
  isRemoving: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const RemoveUserDialog = ({
  isEncrypted,
  isRemoving,
  onConfirm,
  onClose,
}: RemoveUserDialogProps) => {
  const { t } = useTranslation(["Common"]);

  return (
    <ModalDialog
      visible
      onClose={() => {
        if (!isRemoving) onClose();
      }}
    >
      <ModalDialog.Header>{t("Common:RoomMembersRemoveUser")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>
          {isEncrypted
            ? t("Common:RemoveUserFromEncryptedRoomWarning")
            : t("Common:RoomRemoveUserConfirmationText")}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OKButton"
          label={t("Common:Remove")}
          size={ButtonSize.normal}
          primary
          scale
          isLoading={isRemoving}
          onClick={onConfirm}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          isLoading={isRemoving}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RemoveUserDialog;
