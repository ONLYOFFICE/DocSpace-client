import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";

// @ts-ignore
import ModalDialog from "@docspace/components/modal-dialog";
// @ts-ignore
import Button from "@docspace/components/button";
// @ts-ignore
import toastr from "@docspace/components/toast/toastr";

// @ts-ignore
import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";

interface DisableClientDialogProps {
  isVisible?: boolean;
  onClose?: () => void;
  onDisable?: () => Promise<void>;
}

const DisableClientDialog = (props: DisableClientDialogProps) => {
  const { t, ready } = useTranslation(["OAuth", "Common"]);
  const { isVisible, onClose, onDisable } = props;

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const onDisableClick = async () => {
    try {
      setIsRequestRunning(true);
      await onDisable?.();

      setIsRequestRunning(true);
      onClose?.();
    } catch (error) {
      toastr.error(error);
      onClose?.();
    }
  };

  return (
    <ModalDialog
      isLoading={!ready}
      visible={isVisible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{t("DisableApplication")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Trans t={t} i18nKey="DisableApplicationDescription" ns="OAuth" />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          // @ts-ignore
          className="delete-button"
          key="DeletePortalBtn"
          label={t("Common:OkButton")}
          size="normal"
          scale
          primary={true}
          isLoading={isRequestRunning}
          onClick={onDisableClick}
        />
        <Button
          // @ts-ignore
          className="cancel-button"
          key="CancelDeleteBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          isDisabled={isRequestRunning}
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ oauthStore }: { oauthStore: OAuthStoreProps }) => {
  const {
    bufferSelection,
    setDisableDialogVisible,
    setActiveClient,
    setSelection,
    changeClientStatus,
    disableDialogVisible,
  } = oauthStore;

  const onClose = () => {
    setDisableDialogVisible(false);
  };

  const onDisable = async () => {
    setActiveClient(bufferSelection.clientId);
    await changeClientStatus(bufferSelection.clientId, false);
    setActiveClient("");
    setSelection("");
  };

  return { isVisible: disableDialogVisible, onClose, onDisable };
})(observer(DisableClientDialog));
