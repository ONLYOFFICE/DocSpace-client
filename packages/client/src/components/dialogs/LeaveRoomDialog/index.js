import { useEffect, useState } from "react";
import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import Text from "@docspace/components/text";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

const LeaveRoomDialog = (props) => {
  const {
    t,
    tReady,
    visible,
    setIsVisible,
    setChangeRoomOwnerIsVisible,
    isOwner,
    onLeaveRoomAction,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onLeaveRoom();
  };

  const onLeaveRoom = async () => {
    if (isOwner) {
      setChangeRoomOwnerIsVisible(true);
      onClose();
    } else {
      setIsLoading(true);
      await onLeaveRoomAction(t, isOwner);
      setIsLoading(false);
      onClose();
    }
  };

  const onClose = () => setIsVisible(false);

  return (
    <ModalDialog isLoading={!tReady} visible={visible} onClose={onClose}>
      <ModalDialog.Header>{t("Files:LeaveTheRoom")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <Text noSelect>
            {isOwner
              ? t("Files:LeaveRoomDescription")
              : t("Files:WantLeaveRoom")}
          </Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OkButton"
          label={isOwner ? t("Files:AssignOwner") : t("Common:OKButton")}
          size="normal"
          primary
          scale
          onClick={onLeaveRoom}
          isDisabled={isLoading}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({
    auth,
    dialogsStore,
    filesStore,
    selectedFolderStore,
    filesActionsStore,
  }) => {
    const {
      leaveRoomDialogVisible: visible,
      setLeaveRoomDialogVisible: setIsVisible,
      setChangeRoomOwnerIsVisible,
    } = dialogsStore;
    const { user } = auth.userStore;
    const { selection, bufferSelection } = filesStore;

    const selections = selection.length ? selection : [bufferSelection];
    const folderItem = selections[0] ? selections[0] : selectedFolderStore;

    const isRoomOwner = folderItem?.createdBy?.id === user.id;

    return {
      visible,
      setIsVisible,
      setChangeRoomOwnerIsVisible,
      isOwner: isRoomOwner,
      onLeaveRoomAction: filesActionsStore.onLeaveRoom,
    };
  }
)(observer(withTranslation(["Common", "Files"])(LeaveRoomDialog)));
