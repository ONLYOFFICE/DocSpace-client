import React from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { withTranslation } from "react-i18next";
import {
  ModalDialog,
  Button,
  InputBlock,
  TextInput,
  toastr,
} from "@docspace/shared/components";

import copy from "copy-to-clipboard";

import { getCorrectFourValuesStyle } from "@docspace/shared/utils";

const StyledDeleteDialog = styled(ModalDialog)`
  .modal-dialog-content-body {
    display: flex;
    gap: 12px;

    .modal-dialog-content-body_text-input {
      color: #a3a9ae;
    }
  }

  .modal-dialog-aside-header {
    margin: ${({ theme }) =>
      getCorrectFourValuesStyle("0 -24px 0 -16px", theme.interfaceDirection)};
    padding: ${({ theme }) =>
      getCorrectFourValuesStyle("0 0 0 16px", theme.interfaceDirection)};
  }
`;

const RoomSharingDialog = ({ t, tReady, visible, setIsVisible }) => {
  const roomHref = window.location.href;

  const onClose = () => {
    setIsVisible(false);
  };

  const onCopy = () => {
    copy(roomHref);
    toastr.success(t("Translations:LinkCopySuccess"));
    onClose();
  };

  return (
    <StyledDeleteDialog isLoading={!tReady} visible={visible} onClose={onClose}>
      <ModalDialog.Header>{t("Files:ShareRoom")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <TextInput
            className="modal-dialog-content-body_text-input"
            value={roomHref}
            scale
            isReadOnly
            isDisabled
          />
          <Button
            label={t("Translations:Copy")}
            size="small"
            onClick={onCopy}
            isLoading={!tReady}
          />
        </div>
      </ModalDialog.Body>
    </StyledDeleteDialog>
  );
};

export default inject(({ dialogsStore }) => {
  const { setRoomSharingPanelVisible, roomSharingPanelVisible } = dialogsStore;

  return {
    visible: roomSharingPanelVisible,
    setIsVisible: setRoomSharingPanelVisible,
  };
})(
  withTranslation(["Files", "Common", "Translations"])(
    observer(RoomSharingDialog)
  )
);
