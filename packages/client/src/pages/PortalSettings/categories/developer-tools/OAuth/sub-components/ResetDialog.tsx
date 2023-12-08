import React from "react";
import { useParams } from "react-router-dom";
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

interface DisableClientDialog {
  isVisible?: boolean;
  onClose?: () => void;
  onReset?: (id: string) => Promise<void>;
}

const DisableClientDialog = (props: DisableClientDialog) => {
  const { id } = useParams();

  const { t, ready } = useTranslation(["OAuth", "Common"]);
  const { isVisible, onClose, onReset } = props;

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const onResetClick = async () => {
    try {
      setIsRequestRunning(true);
      if (id) await onReset?.(id);

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
      <ModalDialog.Header>{t("ResetHeader")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Trans t={t} i18nKey="ResetDescription" ns="OAuth" />
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
          onClick={onResetClick}
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
  const { setResetDialogVisible, regenerateSecret, resetDialogVisible } =
    oauthStore;

  const onClose = () => {
    setResetDialogVisible(false);
  };

  const onReset = async (id: string) => {
    await regenerateSecret(id);
  };

  return { isVisible: resetDialogVisible, onClose, onReset };
})(observer(DisableClientDialog));
