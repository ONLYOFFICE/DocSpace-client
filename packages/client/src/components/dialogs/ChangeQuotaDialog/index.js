import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import Text from "@docspace/components/text";

import QuotaForm from "../../../components/QuotaForm";
import StyledModalDialog from "./StyledComponent";

const ChangeQuotaDialog = (props) => {
  const { changeQuotaDialogVisible } = props;
  const { t } = useTranslation(["Profile", "Common"]);
  const ref = useRef("");

  const onSetQuotaSize = (convertedValueToBytes) => {
    ref.current = convertedValueToBytes;
  };

  const onSave = () => {
    console.log("onSave", ref.current);
  };

  const onCancel = () => {
    console.log("onCancel");
  };
  return (
    <StyledModalDialog visible={changeQuotaDialogVisible}>
      <ModalDialog.Header>{"Edit quota"}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text noSelect={true}>
          {"Set quota to define the storage limitation."}
        </Text>
        <QuotaForm isButtonsEnable={false} onSetQuotaSize={onSetQuotaSize} />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:OKButton")}
          size="normal"
          primary
          onClick={onSave}
          scale
        />
        <Button
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onCancel}
          scale
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default inject((dialogsStore) => {
  const { changeQuotaDialogVisible } = dialogsStore;
  return {
    changeQuotaDialogVisible,
  };
})(observer(ChangeQuotaDialog));
