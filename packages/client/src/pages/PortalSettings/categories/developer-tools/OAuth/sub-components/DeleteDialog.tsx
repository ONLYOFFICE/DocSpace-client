import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { ModalDialogType } from "@docspace/shared/components/modal-dialog/ModalDialog.enums";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";

import OAuthStore from "SRC_DIR/store/OAuthStore";

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
      toastr.success(
        isGroup
          ? t("OAuth:ApplicationsDeletedSuccessfully")
          : t("OAuth:ApplicationDeletedSuccessfully"),
      );
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
      <ModalDialog.Header>
        {isGroup ? t("DeleteApplications") : t("DeleteApplication")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        {isGroup ? (
          <Trans t={t} i18nKey="DeleteApplicationsDescription" ns="OAuth" />
        ) : (
          <Trans t={t} i18nKey="DeleteApplicationDescription" ns="OAuth" />
        )}
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

export default inject(({ oauthStore }: { oauthStore: OAuthStore }) => {
  const {
    bufferSelection,
    selection,

    setDeleteDialogVisible,
    setActiveClient,
    setSelection,
    deleteClient,
    deleteDialogVisible,
  } = oauthStore;

  const isGroup = selection.length > 1;

  const onClose = () => {
    setDeleteDialogVisible(false);
  };

  const onDelete = async () => {
    if (selection.length) {
      await deleteClient(selection);

      setActiveClient("");
      setSelection("");

      return;
    }
    if (!bufferSelection) return;
    await deleteClient([bufferSelection.clientId]);
    setActiveClient("");
    setSelection("");
  };

  return { isVisible: deleteDialogVisible, isGroup, onClose, onDelete };
})(observer(DeleteClientDialog));
