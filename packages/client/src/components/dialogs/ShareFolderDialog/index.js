import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { Events } from "@docspace/common/constants";

const ShareFolderDialog = ({
  visible,
  setIsVisible,
  setProcessCreatingRoomFromData,
}) => {
  const { t, ready } = useTranslation(["Files", "Common"]);

  const onClose = () => {
    setIsVisible(false);
  };

  const onAction = () => {
    setProcessCreatingRoomFromData(true);
    const event = new Event(Events.ROOM_CREATE);
    window.dispatchEvent(event);
    onClose();
  };

  return (
    <ModalDialog isLoading={!ready} visible={visible} onClose={onClose}>
      <ModalDialog.Header>{t("Files:ShareFolder")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontSize="13px" fontWeight={400} noSelect>
          {t("Files:ShareFolderDescription")}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="create-room"
          key="OkButton"
          label={t("Files:CreateRoom")}
          size="normal"
          primary
          onClick={onAction}
          scale
        />
        <Button
          id="cancel-share-folder"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ dialogsStore, filesActionsStore }) => {
  const { setShareFolderDialogVisible, shareFolderDialogVisible } =
    dialogsStore;
  const { setProcessCreatingRoomFromData } = filesActionsStore;
  return {
    visible: shareFolderDialogVisible,
    setIsVisible: setShareFolderDialogVisible,
    setProcessCreatingRoomFromData,
  };
})(observer(ShareFolderDialog));
