import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { setTenantQuotaSettings } from "@docspace/shared/api/settings";

import QuotaForm from "../../../components/QuotaForm";
import StyledModalDialog from "./StyledComponent";

const ChangeStorageQuotaDialog = (props) => {
  const {
    initialSize,
    portalInfo,
    isVisible,
    onSave,
    onClose,
    isDisableQuota,
  } = props;
  const { t } = useTranslation("Common");

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [size, setSize] = useState("");

  useEffect(() => {
    document.addEventListener("keyup", onKeyUpHandler, false);

    return () => {
      document.removeEventListener("keyup", onKeyUpHandler, false);
    };
  }, [size]);

  const isSizeError = () => {
    if (size.trim() === "") {
      setIsError(true);
      return true;
    }

    return false;
  };
  const onSaveClick = async () => {
    if (isSizeError()) return;

    isError && setIsError(false);
    setIsLoading(true);

    try {
      await setTenantQuotaSettings({
        TenantId: portalInfo.tenantId,
        Quota: isDisableQuota ? -1 : size,
      });

      toastr.success(t("Common:StorageQuotaSet"));
    } catch (e) {
      toastr.error(e);
    }
    setSize("");
    onSave && onSave();
    setIsLoading(false);
  };

  const onSetQuotaBytesSize = (bytes) => {
    setSize(bytes);
  };
  const onKeyUpHandler = (e) => {
    if (e.keyCode === 13 || e.which === 13) {
      if (isSizeError()) return;

      onSaveClick();
      setSize("");
      setIsError(false);

      return;
    }
  };
  const onCloseClick = () => {
    setSize("");
    setIsError(false);
    onClose && onClose();
  };

  return (
    <StyledModalDialog visible={isVisible} onClose={onCloseClick}>
      <ModalDialog.Header>{t("Common:DisableStorageQuota")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text noSelect>
          {isDisableQuota
            ? t("Common:TurnOffDiskSpaceLimit")
            : t("Common:SetDiskSpaceQuota")}
        </Text>
        {!isDisableQuota && (
          <QuotaForm
            onSetQuotaBytesSize={onSetQuotaBytesSize}
            isLoading={isLoading}
            isError={isError}
            initialSize={initialSize}
            isAutoFocussed
          />
        )}
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

export default inject(({ dialogsStore, storageManagement }) => {
  const { changeQuotaDialogVisible, setChangeQuotaDialogVisible } =
    dialogsStore;
  const { portalInfo } = storageManagement;
  return {
    changeQuotaDialogVisible,
    setChangeQuotaDialogVisible,
    portalInfo,
  };
})(observer(ChangeStorageQuotaDialog));
