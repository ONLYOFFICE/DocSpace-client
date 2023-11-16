import React, { useEffect } from "react";
import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import Text from "@docspace/components/text";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

const BackupToPublicRoomComponent = (props) => {
  const { visible, setIsVisible, backupToPublicRoomData } = props;
  const { t, ready } = useTranslation(["Files", "Common"]);

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onMoveTo();
  };

  const onClose = () => {
    setIsVisible(false);
  };

  const onBackupTo = () => {
    const {
      selectedItemId,
      breadCrumbs,
      onSelectFolder,
      onClose: onCloseAction,
    } = backupToPublicRoomData;

    onSelectFolder && onSelectFolder(selectedItemId, breadCrumbs);

    onClose();
    onCloseAction();
  };

  return (
    <ModalDialog isLoading={!ready} visible={visible} onClose={onClose}>
      <ModalDialog.Header>{t("Common:SaveToPublicRoom")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <Text noSelect>{t("Files:MoveToPublicRoom")}</Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OkButton"
          label={t("Common:OKButton")}
          size="normal"
          primary
          scale
          onClick={onBackupTo}
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ dialogsStore }) => {
  const {
    backupToPublicRoomVisible,
    setBackupToPublicRoomVisible,
    backupToPublicRoomData,
  } = dialogsStore;

  return {
    visible: backupToPublicRoomVisible,
    setIsVisible: setBackupToPublicRoomVisible,

    backupToPublicRoomData,
  };
})(observer(BackupToPublicRoomComponent));
