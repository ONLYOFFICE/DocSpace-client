import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import Text from "@docspace/components/text";

import QuotaForm from "../../../components/QuotaForm";
import StyledModalDialog from "./StyledComponent";

const ChangeQuotaDialog = (props) => {
  const {
    visible,
    headerTitle,
    bodyDescription,
    onSaveClick,
    onCloseClick,
    onSetQuotaBytesSize,
    isError,
    isLoading,
    initialSize,
  } = props;
  const { t } = useTranslation("Common");
  return (
    <StyledModalDialog visible={visible} onClose={onCloseClick}>
      <ModalDialog.Header>
        {headerTitle ? headerTitle : "Edit quota"}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Text noSelect={true}>
          {bodyDescription
            ? bodyDescription
            : "Set quota to define the storage limitation."}
        </Text>
        <QuotaForm
          onSetQuotaBytesSize={onSetQuotaBytesSize}
          isLoading={isLoading}
          isError={isError}
          initialSize={initialSize}
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:OKButton")}
          size="normal"
          primary
          onClick={onSaveClick}
          isLoading={isLoading}
          scale
        />
        <Button
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onCloseClick}
          isDisabled={isLoading}
          scale
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default inject(({ dialogsStore }) => {
  const { changeQuotaDialogVisible, setChangeQuotaDialogVisible } =
    dialogsStore;

  return {
    changeQuotaDialogVisible,
    setChangeQuotaDialogVisible,
  };
})(observer(ChangeQuotaDialog));
