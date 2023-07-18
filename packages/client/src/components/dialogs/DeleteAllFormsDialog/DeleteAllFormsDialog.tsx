import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import Button from "@docspace/components/button";
import ModalDialog from "@docspace/components/modal-dialog";

import type DeleteAllFormsDialogProps from "./DeleteAllFormsDialog.props";
import { StoreType } from "SRC_DIR/types";

function DeleteAllFormsDialog({
  visible,
  isLoading,
  removeItem,

  clearBufferSelectionRole,
  setDeleteAllFormsDialogVisible,
}: DeleteAllFormsDialogProps) {
  const { t, ready } = useTranslation(["DeleteAllFormsDialog", "Common"]);

  const onClose = () => {
    setDeleteAllFormsDialogVisible(false);
    clearBufferSelectionRole();
  };

  const onDeleteAllForm = () => {};

  return (
    <ModalDialog
      isLoading={!ready}
      visible={visible}
      zIndex={310}
      onClose={onClose}
      modalLoaderBodyHeight={undefined}
      isDoubleFooterLine={undefined}
    >
      {/*@ts-ignore*/}
      <ModalDialog.Header>{t("DeleteAllFormsDialog:Title")}</ModalDialog.Header>
      {/*@ts-ignore*/}
      <ModalDialog.Body>
        {t("DeleteAllFormsDialog:Body", {
          name: removeItem?.title ?? "",
        })}
      </ModalDialog.Body>
      {/*@ts-ignore*/}
      <ModalDialog.Footer>
        <Button
          /*@ts-ignore*/
          isLoading={isLoading}
          label={t("Common:OKButton")}
          size="normal"
          primary
          scale
          onClick={onDeleteAllForm}
        />
        <Button
          /*@ts-ignore*/
          isLoading={isLoading}
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
}

export default inject<StoreType>(({ dialogsStore, dashboardStore }) => {
  const {
    deleteAllFormsDialogVisible: visible,
    setDeleteAllFormsDialogVisible,
  } = dialogsStore;

  const { BufferSelectionRole, clearBufferSelectionRole } = dashboardStore;

  const removeItem = BufferSelectionRole;

  return {
    visible,
    removeItem,
    setDeleteAllFormsDialogVisible,
    clearBufferSelectionRole,
  };
})(observer(DeleteAllFormsDialog));
