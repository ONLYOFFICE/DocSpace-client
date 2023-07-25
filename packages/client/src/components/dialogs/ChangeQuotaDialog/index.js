import React, { useRef, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import ModalDialog from "@docspace/components/modal-dialog";
import Button from "@docspace/components/button";
import Text from "@docspace/components/text";

import QuotaForm from "../../../components/QuotaForm";
import StyledModalDialog from "./StyledComponent";

let timerId = null;
const ChangeQuotaDialog = (props) => {
  const {
    changeQuotaDialogVisible,
    setUserQuota,
    headerTitle,
    bodyDescription,
    setChangeQuotaDialogVisible,
  } = props;
  const { t } = useTranslation("Common");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const sizeRef = useRef("");

  const onSetQuotaBytesSize = (size) => {
    sizeRef.current = size;
  };

  const onSaveClick = async () => {
    const size = sizeRef.current;

    if (!size || (typeof size === "string" && size?.trim() === "")) {
      setIsError(true);
      return;
    }

    timerId = setTimeout(() => setIsLoading(true), 500);
    await setUserQuota(size, true, t);
    timerId && clearTimeout(timerId);
    timerId = null;

    setIsLoading(false);
    setIsError(false);
    setChangeQuotaDialogVisible(false);
  };

  const onCloseClick = () => {
    timerId && clearTimeout(timerId);
    timerId = null;

    setChangeQuotaDialogVisible(false);
  };

  return (
    <StyledModalDialog
      visible={changeQuotaDialogVisible}
      onClose={onCloseClick}
    >
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
          isButtonsEnable={false}
          onSetQuotaBytesSize={onSetQuotaBytesSize}
          isLoading={isLoading}
          isError={isError}
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          label={t("Common:OKButton")}
          size="normal"
          primary
          onClick={onSaveClick}
          scale
        />
        <Button
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onCloseClick}
          scale
        />
      </ModalDialog.Footer>
    </StyledModalDialog>
  );
};

export default inject(({ auth, dialogsStore }) => {
  const { currentQuotaStore } = auth;
  const { changeQuotaDialogVisible, setChangeQuotaDialogVisible } =
    dialogsStore;
  const { setUserQuota } = currentQuotaStore;
  return {
    setUserQuota,
    changeQuotaDialogVisible,
    setChangeQuotaDialogVisible,
  };
})(observer(ChangeQuotaDialog));
