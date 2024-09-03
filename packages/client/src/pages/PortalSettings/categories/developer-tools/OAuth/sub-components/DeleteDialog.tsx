import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { ModalDialogType } from "@docspace/shared/components/modal-dialog/ModalDialog.enums";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";

import { OAuthStoreProps } from "SRC_DIR/store/OAuthStore";

interface DeleteClientDialogProps {
  isVisible?: boolean;
  isGroup?: boolean;
  onClose?: () => void;
  onDelete?: () => Promise<void>;
}

const DeleteClientDialog = (props: DeleteClientDialogProps) => {
  const { t, ready } = useTranslation(["OAuth", "Common"]);
  const { isVisible, isGroup, onClose, onDelete } = props;

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const onDeleteClick = async () => {
    try {
      setIsRequestRunning(true);
      await onDelete?.();

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
      <ModalDialog.Header>{t("DeleteHeader")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Trans t={t} i18nKey="DeleteDescription" ns="OAuth" />
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
          onClick={onDeleteClick}
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
  const {
    bufferSelection,
    selection,

    setDeleteDialogVisible,
    setActiveClient,
    setSelection,
    deleteClient,
    deleteDialogVisible,
  } = oauthStore;

  const isGroup = !!selection.length;

  const onClose = () => {
    setDeleteDialogVisible(false);
  };

  const onDelete = async () => {
    if (isGroup) {
      selection.forEach((item) => {
        setActiveClient(item);
      });
      await deleteClient(selection);

      setActiveClient("");
      setSelection("");
    }
    if (!bufferSelection) return;
    setActiveClient(bufferSelection.clientId);
    await deleteClient([bufferSelection.clientId]);
    setActiveClient("");
    setSelection("");
  };

  return { isVisible: deleteDialogVisible, isGroup, onClose, onDelete };
})(observer(DeleteClientDialog));
