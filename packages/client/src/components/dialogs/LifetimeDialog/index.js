import { useEffect } from "react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { StyledLifetimeDialog } from "./StyledLifetimeDialog";

const LifetimeDialogComponent = (props) => {
  const { t, setLifetimeDialogVisible, visible, tReady } = props;

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onDeleteAction();
  };

  const onClose = () => {
    setLifetimeDialogVisible(false);
  };

  const onAcceptClick = () => {
    console.log("onAcceptClick");
    onClose();
  };

  const onDeleteAction = () => {
    onAcceptClick();
  };

  return (
    <StyledLifetimeDialog
      isLoading={!tReady}
      visible={visible}
      onClose={onClose}
    >
      <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <Text fontWeight={600} fontSize="13px" noSelect>
            {t("Files:LifetimeDialogDescriptionHeader")}
          </Text>
          <Text fontSize="13px" noSelect>
            {t("Files:LifetimeDialogDescription")}
          </Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OkButton"
          label={t("Common:OKButton")}
          size="normal"
          primary
          scale
          onClick={onDeleteAction}
          // isDisabled={!selection.length}
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </StyledLifetimeDialog>
  );
};

const LifetimeDialog = withTranslation(["Common", "Files"])(
  LifetimeDialogComponent,
);

export default inject(({ dialogsStore }) => {
  const { lifetimeDialogVisible: visible, setLifetimeDialogVisible } =
    dialogsStore;

  return {
    visible,
    setLifetimeDialogVisible,
  };
})(observer(LifetimeDialog));
