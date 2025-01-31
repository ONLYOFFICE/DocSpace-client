// (c) Copyright Ascensio System SIA 2009-2024
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
// import config from "PACKAGE_FILE";

import SocketHelper, { SocketCommands } from "@docspace/shared/utils/socket";
import { Button } from "@docspace/shared/components/button";
import {
  FloatingButton,
  FloatingButtonIcons,
} from "@docspace/shared/components/floating-button";
import { TenantStatus } from "@docspace/shared/enums";
import { startRestore } from "@docspace/shared/api/portal";
import { toastr } from "@docspace/shared/components/toast";
import { isManagement } from "@docspace/shared/utils/common";

import type { ButtonContainerProps } from "./ButtonContainer.types";

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
    const tempObj: Record<string, string | null> = {};

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

      SocketHelper.emit(SocketCommands.RestoreBackup);

      navigate(
        "/preparation-portal",
        // combineUrl(
        //   window.ClientConfig?.proxy?.url,
        //   config.homepage,
        //   "/preparation-portal",
        // ),
      );
    } catch (e) {
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
    <div className="restore-backup_button-container">
      <Button
        className="restore-backup_button"
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
        <FloatingButton
          className="layout-progress-bar"
          icon={FloatingButtonIcons.file}
          alert={false}
          percent={downloadingProgress}
        />
      ) : null}
    </div>
  );
};

export default ButtonContainer;

// export default inject(({ settingsStore, backup, currentQuotaStore }) => {
//   const { setTenantStatus } = settingsStore;
//   const {
//     downloadingProgress,
//     isFormReady,
//     getStorageParams,
//     restoreResource,
//     uploadLocalFile,
//     isBackupProgressVisible,
//   } = backup;

//   const { isRestoreAndAutoBackupAvailable } = currentQuotaStore;
//   const isMaxProgress = downloadingProgress === 100;
//   return {
//     uploadLocalFile,
//     isMaxProgress,
//     setTenantStatus,
//     isEnableRestore: isRestoreAndAutoBackupAvailable,
//     downloadingProgress,
//     isFormReady,
//     getStorageParams,
//     restoreResource,
//     isBackupProgressVisible,
//   };
// })(observer(ButtonContainer));
