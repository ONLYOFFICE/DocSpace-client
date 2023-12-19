import React, { useState, useEffect } from "react";
import ModalDialog from "@docspace/components/modal-dialog";
import { StyledDeleteLinkDialog } from "./StyledDeleteLinkDialog";
import Button from "@docspace/components/button";
import Text from "@docspace/components/text";
import { withTranslation } from "react-i18next";
import toastr from "@docspace/components/toast/toastr";
import { inject, observer } from "mobx-react";
import { RoomsType } from "@docspace/common/constants";

const DeleteLinkDialogComponent = (props) => {
  const {
    t,
    link,
    visible,
    setIsVisible,
    tReady,
    roomId,
    deleteExternalLink,
    editExternalLink,
    isPublicRoomType,
    setRoomShared,
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
    if (e.keyCode === 13 || e.which === 13) onDelete();
  };

  const onClose = () => {
    setIsVisible(false);
  };

  const onDelete = () => {
    setIsLoading(true);

    const newLink = JSON.parse(JSON.stringify(link));
    newLink.access = 0;

    editExternalLink(roomId, newLink)
      .then((res) => {
        setRoomShared(roomId, !!res);
        deleteExternalLink(res, newLink.sharedTo.id);

        if (link.sharedTo.primary && isPublicRoomType) {
          toastr.success(t("Files:GeneralLinkDeletedSuccessfully"));
        } else toastr.success(t("Files:LinkDeletedSuccessfully"));
      })
      .catch((err) => toastr.error(err?.message))
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  return (
    <StyledDeleteLinkDialog
      isLoading={!tReady}
      visible={visible}
      onClose={onClose}
    >
      <ModalDialog.Header>
        {link.sharedTo.primary && isPublicRoomType
          ? t("Files:RevokeLink")
          : t("Files:DeleteLink")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <Text noSelect>
            {link.sharedTo.primary && isPublicRoomType
              ? t("Files:DeleteGeneralLink")
              : t("Files:DeleteLinkNote")}
          </Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OkButton"
          label={
            link.sharedTo.primary && isPublicRoomType
              ? t("Files:RevokeLink")
              : t("Files:DeleteLink")
          }
          size="normal"
          primary
          scale
          onClick={onDelete}
          isDisabled={isLoading}
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </StyledDeleteLinkDialog>
  );
};

const DeleteLinkDialog = withTranslation(["Common", "Files"])(
  DeleteLinkDialogComponent
);

export default inject(({ auth, dialogsStore, publicRoomStore, filesStore }) => {
  const { selectionParentRoom } = auth.infoPanelStore;
  const {
    deleteLinkDialogVisible: visible,
    setDeleteLinkDialogVisible: setIsVisible,
    linkParams,
  } = dialogsStore;
  const { editExternalLink, deleteExternalLink } = publicRoomStore;

  return {
    visible,
    setIsVisible,
    roomId: selectionParentRoom.id,
    link: linkParams.link,
    editExternalLink,
    deleteExternalLink,
    isPublicRoomType: selectionParentRoom.roomType === RoomsType.PublicRoom,
    setRoomShared: filesStore.setRoomShared,
  };
})(observer(DeleteLinkDialog));
