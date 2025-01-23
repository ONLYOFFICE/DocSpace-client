import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Text } from "@docspace/shared/components/text";
import { StyledBodyContent, StyledFooterContent } from "./StyledLifetimeDialog";

const LifetimeDialogComponent = (props) => {
  const { t, setLifetimeDialogVisible, visible, tReady, lifetimeDialogCB } =
    props;

  const [isChecked, setIsChecked] = useState(false);

  const onChange = () => {
    setIsChecked(!isChecked);
  };

  const onClose = () => {
    setLifetimeDialogVisible(false);
  };

  const onAcceptClick = () => {
    lifetimeDialogCB();
    onClose();
  };

  const onDeleteAction = () => {
    onAcceptClick();
  };

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onDeleteAction();
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  return (
    <ModalDialog isLoading={!tReady} visible={visible} onClose={onClose}>
      <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyContent className="modal-dialog-content-body">
          <Text fontWeight={600} fontSize="13px" noSelect>
            {t("Files:LifetimeDialogDescriptionHeader")}
          </Text>
          <Text fontSize="13px" noSelect>
            {t("Files:LifetimeDialogDescription")}
          </Text>
        </StyledBodyContent>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <StyledFooterContent>
          <Checkbox
            className="modal-dialog_lifetime-checkbox"
            label={t("ConvertDialog:HideMessage")}
            isChecked={isChecked}
            onChange={onChange}
          />
          <div className="modal-dialog_lifetime-buttons">
            <Button
              id="delete-file-modal_submit"
              key="OkButton"
              label={t("Common:OKButton")}
              size="normal"
              primary
              scale
              onClick={onAcceptClick}
            />
            <Button
              id="delete-file-modal_cancel"
              key="CancelButton"
              label={t("Common:CancelButton")}
              size="normal"
              scale
              onClick={onClose}
            />
          </div>
        </StyledFooterContent>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const LifetimeDialog = withTranslation(["Common", "Files", "ConvertDialog"])(
  LifetimeDialogComponent,
);

export default inject(({ dialogsStore }) => {
  const {
    lifetimeDialogVisible: visible,
    setLifetimeDialogVisible,
    lifetimeDialogCB,
  } = dialogsStore;

  return {
    visible,
    setLifetimeDialogVisible,
    lifetimeDialogCB,
  };
})(observer(LifetimeDialog));
