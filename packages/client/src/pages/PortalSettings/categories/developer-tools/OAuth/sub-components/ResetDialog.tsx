import React from "react";
import { useParams } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { ModalDialogType } from "@docspace/shared/components/modal-dialog/ModalDialog.enums";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";

interface ResetDialogProps {
  isVisible?: boolean;
  onClose?: () => void;
  onReset?: (id: string) => Promise<void>;
}

const ResetDialog = (props: ResetDialogProps) => {
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
    } catch (error: unknown) {
      const e = error as TData;
      toastr.error(e);
      onClose?.();
    }
  };

  return (
    <ModalDialog
      isLoading={!ready}
      visible={isVisible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("ResetHeader")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Trans t={t} i18nKey="ResetDescription" ns="OAuth" />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="delete-button"
          key="DeletePortalBtn"
          label={t("Common:OkButton")}
          size={ButtonSize.normal}
          scale
          primary
          isLoading={isRequestRunning}
          onClick={onResetClick}
        />
        <Button
          className="cancel-button"
          key="CancelDeleteBtn"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
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
})(observer(ResetDialog));
