import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";

import ModalDialogContainer from "../ModalDialogContainer";

const DisableUserDialog = ({ t, visible, onClose, isLoading }) => {
  return (
    <ModalDialogContainer
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>
        {t("ChangeUserStatusDialog:DisableUser")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        {t("ChangeUserStatusDialog:DisableUserDescription")}&nbsp;
        {t("ChangeUserStatusDialog:DisableGeneralDescription")}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="DisableBtn"
          label={t("Common:DisableUserButton")}
          size="normal"
          scale
          primary={true}
          onClick={() => console.log("disable")}
          isLoading={isLoading}
        />
        <Button
          key="CloseBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default DisableUserDialog;
