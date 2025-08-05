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

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { toastr } from "../../../components/toast";
import StatusMessage from "../../../components/status-message";
import { getBackupProgressInfo } from "../../../utils/common";
import SocketHelper, {
  SocketEvents,
  TSocketListener,
} from "../../../utils/socket";

import { Text } from "../../../components/text";
import { Checkbox } from "../../../components/checkbox";
import { BackupStorageType, FilesSelectorFilterTypes } from "../../../enums";
import RestoreBackupLoader from "../../../skeletons/backup/RestoreBackup";
import { RadioButtonGroup } from "../../../components/radio-button-group";
import { InputSize } from "../../../components/text-input";
import { FileInput } from "../../../components/file-input";
import { FilesSelectorInput } from "../../../components/files-selector-input";
import type { FileInfoType } from "../../../components/files-selector-input/FilesSelectorInput.types";
import { DirectThirdPartyConnection } from "../../../components/direct-third-party-connection";

import BackupListModalDialog from "./sub-components/backup-list";
import { ButtonContainer } from "./sub-components/button-component";
import { ThirdPartyStoragesModule } from "./sub-components/ThirdPartyStoragesModule";

import {
  BACKUP_ROOM,
  CONFIRMATION,
  DISK_SPACE,
  LOCAL_FILE,
  NOTIFICATION,
  STORAGE_SPACE,
} from "./RestoreBackup.constants";
import type { RestoreBackupProps } from "./RestoreBackup.types";
import styles from "./RestoreBackup.module.scss";

export const RestoreBackup = (props: RestoreBackupProps) => {
  const {
    setConnectedThirdPartyAccount,
    isEnableRestore,
    setRestoreResource,
    buttonSize,
    standalone,
    downloadingProgress,
    navigate,
    setTenantStatus,
    settingsFileSelector,
    basePath,
    newPath,
    isErrorPath,
    toDefault,
    setBasePath,
    setNewPath,
    openConnectWindow,
    connectDialogVisible,
    setConnectDialogVisible,
    deleteThirdPartyDialogVisible,
    setDeleteThirdPartyDialogVisible,
    clearLocalStorage,
    setSelectedThirdPartyAccount,
    isTheSameThirdPartyAccount,
    selectedThirdPartyAccount,
    accounts,
    setThirdPartyAccountsInfo,
    deleteThirdParty,
    setThirdPartyProviders,
    providers,
    removeItem,
    defaultRegion,
    storageRegions,
    thirdPartyStorage,
    setCompletedFormFields,
    errorsFieldsBeforeSafe,
    formSettings,
    addValueInFormSettings,
    setRequiredFormSettings,
    deleteValueFormSetting,
    setIsThirdStorageChanged,
    isFormReady,
    getStorageParams,
    restoreResource,
    uploadLocalFile,
    isBackupProgressVisible,
    isInitialLoading,

    errorInformation,
    setDownloadingProgress,
    setTemporaryLink,
    setErrorInformation,
    connectedThirdPartyAccount,
    setIsBackupProgressVisible,
    backupProgressError,
    setBackupProgressError,
  } = props;

  const { t } = useTranslation(["Common"]);

  const [radioButtonState, setRadioButtonState] = useState(LOCAL_FILE);
  const [checkboxState, setCheckboxState] = useState({
    notification: true,
    confirmation: false,
  });

  const [isVisibleBackupListDialog, setIsVisibleBackupListDialog] =
    useState(false);

  useEffect(() => {
    const onBackupProgress: TSocketListener<SocketEvents.BackupProgress> = (
      opt,
    ) => {
      const options = getBackupProgressInfo(
        opt,
        t,
        setDownloadingProgress,
        setTemporaryLink,
      );

      if (!options) return;

      const { error, success } = options;

      if (error) {
        toastr.error(error);
        setBackupProgressError(error);
      }

      if (success) toastr.success(success);
    };

    SocketHelper.on(SocketEvents.BackupProgress, onBackupProgress);

    return () => {
      SocketHelper.off(SocketEvents.BackupProgress, onBackupProgress);
    };
  }, [setDownloadingProgress, setTemporaryLink, setBackupProgressError, t]);

  const onChangeRadioButton = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === radioButtonState) return;

    setRestoreResource(null);
    setRadioButtonState(value);
  };

  const onChangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const checked = e.target.checked;

    setCheckboxState({ ...checkboxState, [name]: checked });
  };

  const getStorageType = () => {
    switch (radioButtonState) {
      case LOCAL_FILE:
        return BackupStorageType.LocalFileModuleType;
      case BACKUP_ROOM:
        return BackupStorageType.DocumentModuleType;
      case DISK_SPACE:
        return BackupStorageType.ResourcesModuleType;
      case STORAGE_SPACE:
        return BackupStorageType.StorageModuleType;
      default:
        throw new Error("unknown case", { cause: { radioButtonState } });
    }
  };

  const onClickBackupList = () => {
    setIsVisibleBackupListDialog(true);
  };

  const onModalClose = () => {
    setIsVisibleBackupListDialog(false);
  };

  const onSetStorageId = (id: string) => {
    setRestoreResource(id);
  };

  const onLocalFileInputClick = (result: File | File[]) => {
    const file = Array.isArray(result) ? result[0] : result;
    setRestoreResource(file);
  };

  const onSelectFile = (file: FileInfoType) => {
    setRestoreResource(file.id);
  };

  const radioButtonContent = (
    <RadioButtonGroup
      name="restore_backup"
      orientation="vertical"
      fontSize="13px"
      fontWeight={400}
      className={classNames(styles.backupRadioButton, "backup_radio-button")}
      options={[
        { id: "local-file", value: LOCAL_FILE, label: t("Common:LocalFile") },
        {
          id: "backup-room",
          value: BACKUP_ROOM,
          label: t("Common:RoomsModule"),
        },
        {
          id: "third-party-resource",
          value: DISK_SPACE,
          label: t("Common:ThirdPartyResource"),
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
  );

  const backupModules = (
    <div
      className={classNames(
        styles.restoreBackupModules,
        "restore-backup_modules",
      )}
    >
      {radioButtonState === LOCAL_FILE ? (
        <FileInput
          scale
          size={InputSize.base}
          onInput={onLocalFileInputClick}
          accept={[".tar", ".gz"]}
          className={classNames(
            styles.restoreBackupInput,
            "restore-backup_input",
          )}
          isDisabled={!isEnableRestore}
          data-test-id="restore_backup_file_input"
        />
      ) : null}

      {radioButtonState === BACKUP_ROOM ? (
        <FilesSelectorInput
          isSelect
          withoutInitPath
          className={classNames(
            styles.restoreBackupInput,
            "restore-backup_input",
          )}
          isDisabled={!isEnableRestore}
          onSelectFile={onSelectFile}
          filterParam={FilesSelectorFilterTypes.BackupOnly}
          descriptionText={t("Common:SelectFileInGZFormat")}
          newPath={newPath}
          basePath={basePath}
          isErrorPath={isErrorPath}
          filesSelectorSettings={settingsFileSelector}
          setBasePath={setBasePath}
          toDefault={toDefault}
          setNewPath={setNewPath}
          dataTestId="restore_backup_files_selector"
        />
      ) : null}
      {radioButtonState === DISK_SPACE ? (
        <DirectThirdPartyConnection
          className={classNames(
            styles.restoreBackupThirdPartyModule,
            "restore-backup_third-party-module",
          )}
          isSelect
          isMobileScale
          withoutInitPath
          buttonSize={buttonSize}
          onSelectFile={onSelectFile}
          descriptionText={t("Common:SelectFileInGZFormat")}
          filterParam={FilesSelectorFilterTypes.BackupOnly}
          setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
          newPath={newPath}
          basePath={basePath}
          isErrorPath={isErrorPath}
          setBasePath={setBasePath}
          toDefault={toDefault}
          setNewPath={setNewPath}
          openConnectWindow={openConnectWindow}
          connectDialogVisible={connectDialogVisible}
          deleteThirdPartyDialogVisible={deleteThirdPartyDialogVisible}
          connectedThirdPartyAccount={connectedThirdPartyAccount}
          setConnectDialogVisible={setConnectDialogVisible}
          setDeleteThirdPartyDialogVisible={setDeleteThirdPartyDialogVisible}
          clearLocalStorage={clearLocalStorage}
          setSelectedThirdPartyAccount={setSelectedThirdPartyAccount}
          isTheSameThirdPartyAccount={isTheSameThirdPartyAccount}
          selectedThirdPartyAccount={selectedThirdPartyAccount}
          accounts={accounts}
          setThirdPartyAccountsInfo={setThirdPartyAccountsInfo}
          deleteThirdParty={deleteThirdParty}
          setThirdPartyProviders={setThirdPartyProviders}
          providers={providers}
          removeItem={removeItem}
          filesSelectorSettings={settingsFileSelector}
          dataTestId="restore_backup"
        />
      ) : null}
      {radioButtonState === STORAGE_SPACE ? (
        <ThirdPartyStoragesModule
          onSetStorageId={onSetStorageId}
          defaultRegion={defaultRegion}
          storageRegions={storageRegions}
          thirdPartyStorage={thirdPartyStorage}
          setCompletedFormFields={setCompletedFormFields}
          errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
          formSettings={formSettings}
          addValueInFormSettings={addValueInFormSettings}
          setRequiredFormSettings={setRequiredFormSettings}
          deleteValueFormSetting={deleteValueFormSetting}
          setIsThirdStorageChanged={setIsThirdStorageChanged}
        />
      ) : null}
    </div>
  );

  const warningContent = (
    <>
      <Text
        className={classNames(
          styles.restoreBackupWarning,
          styles.settingsUnavailable,
          "restore-backup_warning settings_unavailable",
        )}
        noSelect
      >
        {t("Common:Warning")}!
      </Text>
      <Text
        className={classNames(
          styles.restoreBackupWarningDescription,
          styles.settingsUnavailable,
          "restore-backup_warning-description settings_unavailable",
        )}
        noSelect
      >
        {t("Common:RestoreBackupWarningText", {
          productName: t("Common:ProductName"),
        })}
      </Text>
      {!standalone ? (
        <Text
          className={classNames(
            styles.restoreBackupWarningLink,
            styles.settingsUnavailable,
            "restore-backup_warning-link settings_unavailable",
          )}
          noSelect
        >
          {t("Common:RestoreBackupResetInfoWarningText", {
            productName: t("Common:ProductName"),
          })}
        </Text>
      ) : null}
    </>
  );

  const onClickVersionListProp = isEnableRestore
    ? { onClick: onClickBackupList }
    : {};

  if (isInitialLoading) return <RestoreBackupLoader />;

  return (
    <div
      data-testid="restore-backup"
      className={classNames(styles.restoreBackup, {
        [styles.isEnableRestore]: isEnableRestore,
      })}
    >
      <StatusMessage message={errorInformation} />

      <div
        className={classNames(styles.restoreDescription, "restore-description")}
      >
        <Text
          className={classNames(
            styles.restoreDescription,
            styles.settingsUnavailable,
            "restore-description settings_unavailable",
          )}
        >
          {t("Common:RestoreBackupDescription")}
        </Text>
      </div>
      {radioButtonContent}
      {backupModules}

      <Text
        className={classNames(
          styles.restoreBackupList,
          styles.settingsUnavailable,
          "restore-backup_list settings_unavailable",
        )}
        {...onClickVersionListProp}
        noSelect
        dataTestId="restore_backup_list_button"
      >
        {t("Common:BackupList")}
      </Text>

      {isVisibleBackupListDialog ? (
        <BackupListModalDialog
          isVisibleDialog={isVisibleBackupListDialog}
          onModalClose={onModalClose}
          isNotify={checkboxState.notification}
          navigate={navigate}
          standalone={standalone}
          setTenantStatus={setTenantStatus}
          downloadingProgress={downloadingProgress}
        />
      ) : null}
      <Checkbox
        truncate
        name={NOTIFICATION}
        className={classNames(
          styles.restoreBackupCheckboxNotification,
          "restore-backup-checkbox_notification",
        )}
        onChange={onChangeCheckbox}
        isChecked={checkboxState.notification}
        label={t("Common:SendNotificationAboutRestoring")}
        isDisabled={!isEnableRestore}
        dataTestId="about_restoring_checkbox"
      />
      {warningContent}
      <Checkbox
        truncate
        name={CONFIRMATION}
        className={classNames(
          styles.restoreBackupDescription,
          "restore-backup-checkbox",
        )}
        onChange={onChangeCheckbox}
        isChecked={checkboxState.confirmation}
        label={t("Common:UserAgreement")}
        isDisabled={!isEnableRestore}
        dataTestId="user_agreement_checkbox"
      />
      <ButtonContainer
        setErrorInformation={setErrorInformation}
        isConfirmed={checkboxState.confirmation}
        isNotification={checkboxState.notification}
        getStorageType={getStorageType}
        radioButtonState={radioButtonState}
        isCheckedThirdPartyStorage={radioButtonState === STORAGE_SPACE}
        isCheckedLocalFile={radioButtonState === LOCAL_FILE}
        t={t}
        buttonSize={buttonSize}
        navigate={navigate}
        downloadingProgress={downloadingProgress}
        isFormReady={isFormReady}
        getStorageParams={getStorageParams}
        restoreResource={restoreResource}
        uploadLocalFile={uploadLocalFile}
        isBackupProgressVisible={isBackupProgressVisible}
        isEnableRestore={isEnableRestore}
        setTenantStatus={setTenantStatus}
        setIsBackupProgressVisible={setIsBackupProgressVisible}
        operationsAlert={Boolean(backupProgressError)}
      />
    </div>
  );
};
