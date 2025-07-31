// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React, { useState } from "react";
import classNames from "classnames";

import SocketHelper, { SocketCommands } from "../../../../../utils/socket";
import { Button } from "../../../../../components/button";
import OperationsProgressButton from "../../../../../components/operations-progress-button";
import { OPERATIONS_NAME } from "../../../../../constants";
import { TenantStatus } from "../../../../../enums";
import { startRestore } from "../../../../../api/portal";
import { toastr } from "../../../../../components/toast";
import { isManagement } from "../../../../../utils/common";

import type { ButtonContainerProps } from "./ButtonContainer.types";
import styles from "../../RestoreBackup.module.scss";

const ButtonContainer = (props: ButtonContainerProps) => {
  const {
    isConfirmed,
    navigate,
    downloadingProgress,
    getStorageType,
    isNotification,
    restoreResource,
    isCheckedThirdPartyStorage,
    isCheckedLocalFile,

    isEnableRestore,
    t,
    buttonSize,
    setTenantStatus,
    isFormReady,
    getStorageParams,
    uploadLocalFile,
    isBackupProgressVisible,
    setErrorInformation,
    setIsBackupProgressVisible,
    operationsAlert,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const isMaxProgress = downloadingProgress === 100;

  const onRestoreClick = async () => {
    if (isCheckedThirdPartyStorage) {
      const requiredFieldsFilled = isFormReady();
      if (!requiredFieldsFilled) return;
    }
    setIsLoading(true);

    let storageParams = [];
    const tempObj: Record<string, File | number | string | null> = {};

    const backupId = "";
    const storageType = getStorageType().toString();

    if (isCheckedThirdPartyStorage) {
      storageParams = getStorageParams(true, null, restoreResource as string);
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

    setErrorInformation("");

    try {
      await startRestore(
        backupId,
        storageType,
        storageParams,
        isNotification,
        isManagement(),
      );
      setTenantStatus(TenantStatus.PortalRestore);

      SocketHelper.emit(SocketCommands.RestoreBackup, { dump: isManagement() });

      navigate(
        "/preparation-portal",
        // combineUrl(
        //   window.ClientConfig?.proxy?.url,
        //   config.homepage,
        //   "/preparation-portal",
        // ),
      );
    } catch (e) {
      console.error(e);
      toastr.error(e as Error);
      setErrorInformation(e, t);
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
    <div
      className={classNames(
        styles.restoreBackupButtonContainer,
        "restore-backup_button-container",
      )}
    >
      <Button
        className={classNames(
          styles.restoreBackupButton,
          "restore-backup_button",
        )}
        label={t("Common:Restore")}
        onClick={onRestoreClick}
        primary
        isDisabled={isButtonDisabled}
        isLoading={isLoadingButton}
        size={buttonSize}
        // eslint-disable-next-line jsx-a11y/tabindex-no-positive
        tabIndex={10}
      />

      {isBackupProgressVisible ? (
        <OperationsProgressButton
          operationsAlert={operationsAlert}
          operationsCompleted={downloadingProgress === 100}
          operations={[
            {
              label:
                downloadingProgress === 100
                  ? t("Backup")
                  : downloadingProgress === 0
                    ? t("PreparingBackup")
                    : t("BackupProgress", { progress: downloadingProgress }),
              percent: downloadingProgress,
              operation: OPERATIONS_NAME.backup,
              alert: false,
              completed: false,
            },
          ]}
          clearOperationsData={() => setIsBackupProgressVisible(false)}
        />
      ) : null}
    </div>
  );
};

export default ButtonContainer;
