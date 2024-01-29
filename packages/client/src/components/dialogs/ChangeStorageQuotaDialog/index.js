import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { setTenantQuotaSettings } from "@docspace/shared/api/settings";

import QuotaForm from "../../../components/QuotaForm";

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

  const onSaveClick = async () => {
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

    onSave && onSave();
    setIsLoading(false);
  };

  const onSetQuotaBytesSize = (bytes) => {
    setSize(bytes);
  };

  return (
    <ModalDialog visible={isVisible} onClose={onClose}>
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
            // isError={isError}
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
          onClick={onClose}
          isDisabled={isLoading}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
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
