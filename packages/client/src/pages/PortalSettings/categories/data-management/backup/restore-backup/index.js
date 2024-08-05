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

import React, { useState, useEffect, useCallback } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { getSettingsThirdParty } from "@docspace/shared/api/files";
import {
  getBackupStorage,
  getStorageRegions,
} from "@docspace/shared/api/settings";
import RestoreBackupLoader from "@docspace/shared/skeletons/backup/RestoreBackup";
import { toastr } from "@docspace/shared/components/toast";
import { RadioButtonGroup } from "@docspace/shared/components/radio-button-group";
import { BackupStorageType, DeviceType } from "@docspace/shared/enums";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Text } from "@docspace/shared/components/text";

import LocalFileModule from "./sub-components/LocalFileModule";
import ThirdPartyStoragesModule from "./sub-components/ThirdPartyStoragesModule";
import ThirdPartyResourcesModule from "./sub-components/ThirdPartyResourcesModule";
import BackupListModalDialog from "./sub-components/backup-list";
import RoomsModule from "./sub-components/RoomsModule";
import ButtonContainer from "./sub-components/ButtonComponent";
import { StyledRestoreBackup } from "../StyledBackup";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

const LOCAL_FILE = "localFile",
  BACKUP_ROOM = "backupRoom",
  DISK_SPACE = "thirdPartyDiskSpace",
  STORAGE_SPACE = "thirdPartyStorageSpace";

const NOTIFICATION = "notification",
  CONFIRMATION = "confirmation";

const {
  DocumentModuleType,
  ResourcesModuleType,
  StorageModuleType,
  LocalFileModuleType,
} = BackupStorageType;

const RestoreBackup = (props) => {
  const {
    getProgress,
    t,
    setThirdPartyStorage,
    setStorageRegions,
    setConnectedThirdPartyAccount,
    clearProgressInterval,
    isEnableRestore,
    setRestoreResource,
    buttonSize,
    standalone,
  } = props;

  const [radioButtonState, setRadioButtonState] = useState(LOCAL_FILE);
  const [checkboxState, setCheckboxState] = useState({
    notification: true,
    confirmation: false,
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isVisibleBackupListDialog, setIsVisibleBackupListDialog] =
    useState(false);
  const [isVisibleSelectFileDialog, setIsVisibleSelectFileDialog] =
    useState(false);

  const startRestoreBackup = useCallback(async () => {
    try {
      getProgress(t);

      const [account, backupStorage, storageRegions] = await Promise.all([
        getSettingsThirdParty(),
        getBackupStorage(),
        getStorageRegions(),
      ]);

      setConnectedThirdPartyAccount(account);
      setThirdPartyStorage(backupStorage);
      setStorageRegions(storageRegions);

      setIsInitialLoading(false);
    } catch (error) {
      toastr.error(error);
    }
  }, []);

  useEffect(() => {
    setDocumentTitle(t("RestoreBackup"));
    startRestoreBackup();
    return () => {
      clearProgressInterval();
      setRestoreResource(null);
    };
  }, []);

  const onChangeRadioButton = (e) => {
    const value = e.target.value;
    if (value === radioButtonState) return;

    setRestoreResource(null);
    setRadioButtonState(value);
  };

  const onChangeCheckbox = (e) => {
    const name = e.target.name;
    const checked = e.target.checked;

    setCheckboxState({ ...checkboxState, [name]: checked });
  };

  const getStorageType = () => {
    switch (radioButtonState) {
      case LOCAL_FILE:
        return LocalFileModuleType;
      case BACKUP_ROOM:
        return DocumentModuleType;
      case DISK_SPACE:
        return ResourcesModuleType;
      case STORAGE_SPACE:
        return StorageModuleType;
    }
  };

  const onClickBackupList = () => {
    setIsVisibleBackupListDialog(true);
  };

  const onClickInput = () => {
    setIsVisibleSelectFileDialog(true);
  };
  const onModalClose = () => {
    setIsVisibleBackupListDialog(false);
    setIsVisibleSelectFileDialog(false);
  };

  const onSetStorageId = (id) => {
    setRestoreResource(id);
  };

  const radioButtonContent = (
    <>
      <RadioButtonGroup
        name="restore_backup"
        orientation="vertical"
        fontSize="13px"
        fontWeight="400"
        className="backup_radio-button"
        options={[
          { id: "local-file", value: LOCAL_FILE, label: t("LocalFile") },
          { id: "backup-room", value: BACKUP_ROOM, label: t("RoomsModule") },
          {
            id: "third-party-resource",
            value: DISK_SPACE,
            label: t("ThirdPartyResource"),
          },
          {
            id: "third-party-storage",
            value: STORAGE_SPACE,
            label: t("Common:ThirdPartyStorage"),
          },
        ]}
        onClick={onChangeRadioButton}
        selected={radioButtonState}
        spacing="16px"
        isDisabled={!isEnableRestore}
      />
    </>
  );

  const backupModules = (
    <div className="restore-backup_modules">
      {radioButtonState === LOCAL_FILE && <LocalFileModule t={t} />}

      {radioButtonState === BACKUP_ROOM && <RoomsModule />}
      {radioButtonState === DISK_SPACE && (
        <ThirdPartyResourcesModule buttonSize={buttonSize} />
      )}
      {radioButtonState === STORAGE_SPACE && (
        <ThirdPartyStoragesModule onSetStorageId={onSetStorageId} />
      )}
    </div>
  );

  const warningContent = (
    <>
      <Text className="restore-backup_warning settings_unavailable" noSelect>
        {t("Common:Warning")}
        {"!"}
      </Text>
      <Text
        className="restore-backup_warning-description settings_unavailable"
        noSelect
      >
        {t("RestoreBackupWarningText", {
          productName: t("Common:ProductName"),
        })}
      </Text>
      {!standalone && (
        <Text
          className="restore-backup_warning-link settings_unavailable"
          noSelect
        >
          {t("RestoreBackupResetInfoWarningText", {
            productName: t("Common:ProductName"),
          })}
        </Text>
      )}
    </>
  );

  const onClickVersionListProp = isEnableRestore
    ? { onClick: onClickBackupList }
    : {};

  if (isInitialLoading) return <RestoreBackupLoader />;

  return (
    <StyledRestoreBackup isEnableRestore={isEnableRestore}>
      <div className="restore-description">
        <Text className="restore-description settings_unavailable">
          {t("RestoreBackupDescription")}
        </Text>
      </div>
      {radioButtonContent}
      {backupModules}

      <Text
        className="restore-backup_list settings_unavailable"
        {...onClickVersionListProp}
        noSelect
      >
        {t("BackupList")}
      </Text>

      {isVisibleBackupListDialog && (
        <BackupListModalDialog
          isVisibleDialog={isVisibleBackupListDialog}
          onModalClose={onModalClose}
          isNotify={checkboxState.notification}
        />
      )}
      <Checkbox
        truncate
        name={NOTIFICATION}
        className="restore-backup-checkbox_notification"
        onChange={onChangeCheckbox}
        isChecked={checkboxState.notification}
        label={t("SendNotificationAboutRestoring")}
        isDisabled={!isEnableRestore}
      />
      {warningContent}
      <Checkbox
        truncate
        name={CONFIRMATION}
        className="restore-backup-checkbox"
        onChange={onChangeCheckbox}
        isChecked={checkboxState.confirmation}
        label={t("UserAgreement")}
        isDisabled={!isEnableRestore}
      />
      <ButtonContainer
        isConfirmed={checkboxState.confirmation}
        isNotification={checkboxState.notification}
        getStorageType={getStorageType}
        radioButtonState={radioButtonState}
        isCheckedThirdPartyStorage={radioButtonState === STORAGE_SPACE}
        isCheckedLocalFile={radioButtonState === LOCAL_FILE}
        t={t}
        buttonSize={buttonSize}
      />
    </StyledRestoreBackup>
  );
};

export const Component = inject(
  ({ settingsStore, backup, currentQuotaStore }) => {
    const { currentDeviceType, standalone } = settingsStore;
    const { isRestoreAndAutoBackupAvailable } = currentQuotaStore;
    const {
      getProgress,
      clearProgressInterval,
      setStorageRegions,
      setThirdPartyStorage,
      setConnectedThirdPartyAccount,
      setRestoreResource,
    } = backup;

    const buttonSize =
      currentDeviceType !== DeviceType.desktop ? "normal" : "small";

    return {
      standalone,
      isEnableRestore: isRestoreAndAutoBackupAvailable,
      setStorageRegions,
      setThirdPartyStorage,
      buttonSize,
      setConnectedThirdPartyAccount,
      clearProgressInterval,
      getProgress,
      setRestoreResource,
    };
  },
)(withTranslation(["Settings", "Common"])(observer(RestoreBackup)));
