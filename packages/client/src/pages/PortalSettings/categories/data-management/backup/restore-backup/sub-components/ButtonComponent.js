import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import config from "PACKAGE_FILE";
import { useNavigate } from "react-router-dom";
import { Button } from "@docspace/shared/components/button";
import { FloatingButton } from "@docspace/shared/components/floating-button";
import { TenantStatus } from "@docspace/shared/enums";
import { startRestore } from "@docspace/shared/api/portal";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { toastr } from "@docspace/shared/components/toast";

const ButtonContainer = (props) => {
  const {
    downloadingProgress,
    isMaxProgress,
    isConfirmed,
    getStorageType,
    isNotification,
    restoreResource,
    isCheckedThirdPartyStorage,
    isCheckedLocalFile,

    isEnableRestore,
    t,
    buttonSize,
    socketHelper,
    setTenantStatus,
    isFormReady,
    getStorageParams,
    uploadLocalFile,
  } = props;

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const onRestoreClick = async () => {
    if (isCheckedThirdPartyStorage) {
      const requiredFieldsFilled = isFormReady();
      if (!requiredFieldsFilled) return;
    }
    setIsLoading(true);

    let storageParams = [],
      tempObj = {};

    const backupId = "";
    const storageType = getStorageType().toString();

    if (isCheckedThirdPartyStorage) {
      storageParams = getStorageParams(true, null, restoreResource);
    } else {
      tempObj.key = "filePath";
      tempObj.value = isCheckedLocalFile ? "" : restoreResource;

      storageParams.push(tempObj);
    }

    if (isCheckedLocalFile) {
      const uploadedFile = await uploadLocalFile();

      if (!uploadedFile) {
        toastr.error(t("BackupCreatedError"));
        setIsLoading(false);
        return;
      }

      if (!uploadedFile.data.EndUpload) {
        toastr.error(uploadedFile.data.Message ?? t("BackupCreatedError"));
        setIsLoading(false);
        return;
      }
    }

    try {
      await startRestore(backupId, storageType, storageParams, isNotification);
      setTenantStatus(TenantStatus.PortalRestore);

      socketHelper.emit({
        command: "restore-backup",
      });

      navigate(
        combineUrl(
          window.DocSpaceConfig?.proxy?.url,
          config.homepage,
          "/preparation-portal"
        )
      );
    } catch (e) {
      toastr.error(e);

      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    isLoading ||
    !isMaxProgress ||
    !isConfirmed ||
    !isEnableRestore ||
    !restoreResource;
  const isLoadingButton = isLoading;

  return (
    <div className="restore-backup_button-container">
      <Button
        className="restore-backup_button"
        label={t("Common:Restore")}
        onClick={onRestoreClick}
        primary
        isDisabled={isButtonDisabled}
        isLoading={isLoadingButton}
        size={buttonSize}
        tabIndex={10}
      />

      {downloadingProgress > 0 && !isMaxProgress && (
        <FloatingButton
          className="layout-progress-bar"
          icon="file"
          alert={false}
          percent={downloadingProgress}
        />
      )}
    </div>
  );
};

export default inject(({ auth, backup, currentQuotaStore }) => {
  const { settingsStore } = auth;
  const { socketHelper, setTenantStatus } = settingsStore;
  const {
    downloadingProgress,
    isFormReady,
    getStorageParams,
    restoreResource,
    uploadLocalFile,
  } = backup;

  const { isRestoreAndAutoBackupAvailable } = currentQuotaStore;
  const isMaxProgress = downloadingProgress === 100;
  return {
    uploadLocalFile,
    isMaxProgress,
    setTenantStatus,
    isEnableRestore: isRestoreAndAutoBackupAvailable,
    downloadingProgress,
    socketHelper,
    isFormReady,
    getStorageParams,
    restoreResource,
  };
})(observer(ButtonContainer));
