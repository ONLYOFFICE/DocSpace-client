import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";

import ModalDialogContainer from "../ModalDialogContainer";

const LogoutSessionDialog = ({
  t,
  visible,
  data,
  onClose,
  onRemoveSession,
  isLoading,
}) => {
  const onClick = () => {
    onRemoveSession(data.id);
  };

  return (
    <ModalDialogContainer
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>
        {t("Profile:LogoutActiveConnection")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        {t("Profile:LogoutFrom", {
          platform: data.platform,
          browser: data.browser,
        })}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="LogoutBtn"
          label={t("Profile:LogoutBtn")}
          size="normal"
          scale
          primary={true}
          onClick={onClick}
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

export default LogoutSessionDialog;
