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

"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import {
  deleteBackupSchedule,
  getBackupSchedule,
  createBackupSchedule,
} from "../../../api/portal";
import { BackupStorageType, AutoBackupPeriod } from "../../../enums";
import { OPERATIONS_NAME } from "../../../constants";
import { ToggleButton } from "../../../components/toggle-button";
import { getBackupStorage } from "../../../api/settings";
import AutoBackupLoader from "../../../skeletons/backup/AutoBackup";
import StatusMessage from "../../../components/status-message";
import SocketHelper, {
  SocketEvents,
  type TSocketListener,
} from "../../../utils/socket";
import { getBackupProgressInfo } from "../../../utils/common";
import { useStateCallback } from "../../../hooks/useStateCallback";
import type { Nullable, Option } from "../../../types";
import OperationsProgressButton from "../../../components/operations-progress-button";
import { toastr } from "../../../components/toast";
import { Text } from "../../../components/text";
import { RadioButton } from "../../../components/radio-button";
import { Link, LinkTarget } from "../../../components/link";
import { SaveCancelButtons } from "../../../components/save-cancel-buttons";

import { ThirdPartyModule } from "./sub-components/ThirdPartyModule";
import { RoomsModule } from "./sub-components/RoomsModule";
import { ThirdPartyStorageModule } from "./sub-components/ThirdPartyStorageModule";
import { useDefaultOptions } from "./hooks";
import type { AutomaticBackupProps } from "./AutoBackup.types";
import styles from "./AutoBackup.module.scss";

const hoursArray = Array(24)
  .fill(null)
  .map((_, index) => {
    return {
      key: index,
      label: `${index}:00`,
    };
  });
const monthNumbersArray = Array(31)
  .fill(null)
  .map((_, index) => {
    return {
      key: index + 1,
      label: `${index + 1}`,
    };
  });

const AutomaticBackup = ({
  language,
  setDefaultOptions,
  setThirdPartyStorage,
  setBackupSchedule,
  setConnectedThirdPartyAccount,

  seStorageType,
  setSelectedEnableSchedule,
  toDefault,
  selectedStorageType,
  resetNewFolderPath,
  updateBaseFolderPath,
  isFormReady,
  selectedFolderId,
  getStorageParams,
  selectedEnableSchedule,
  selectedHour,
  selectedMaxCopiesNumber,
  selectedMonthDay,
  selectedPeriodNumber,
  selectedStorageId,
  selectedWeekday,
  deleteSchedule,
  buttonSize,
  downloadingProgress,
  isEnableAuto,
  automaticBackupUrl,
  currentColorScheme,
  isBackupProgressVisible,
  setIsBackupProgressVisible,
  isChanged,
  isThirdStorageChanged,
  settingsFileSelector,

  basePath,
  isErrorPath,
  newPath,
  setBasePath,
  setNewPath,
  toDefaultFileSelector,
  setSelectedFolder,
  defaultStorageType,
  defaultFolderId,
  openConnectWindow,
  connectDialogVisible,
  deleteThirdPartyDialogVisible,
  connectedThirdPartyAccount,
  setConnectDialogVisible,
  selectedPeriodLabel,
  selectedWeekdayLabel,
  setDeleteThirdPartyDialogVisible,
  setMaxCopies,
  setMonthNumber,
  setPeriod,
  setTime,
  setWeekday,
  setStorageId,
  thirdPartyStorage,
  defaultStorageId,
  setCompletedFormFields,
  errorsFieldsBeforeSafe,
  formSettings,
  addValueInFormSettings,
  setIsThirdStorageChanged,
  setRequiredFormSettings,
  storageRegions,
  defaultRegion,
  deleteValueFormSetting,
  clearLocalStorage,
  setSelectedThirdPartyAccount,
  isTheSameThirdPartyAccount,
  selectedThirdPartyAccount,
  accounts,
  setThirdPartyAccountsInfo,
  deleteThirdParty,
  providers,
  setThirdPartyProviders,
  removeItem,
  isNeedFilePath = false,
  isEmptyContentBeforeLoader,
  isInitialLoading,
  setDownloadingProgress,
  setTemporaryLink,
  setErrorInformation,
  isInitialError,
  errorInformation,
  isManagement = false,
  backupProgressError,
  setBackupProgressError,
  setDefaultFolderId,
}: AutomaticBackupProps) => {
  const isCheckedDocuments =
    selectedStorageType === `${BackupStorageType.DocumentModuleType}`;
  const isCheckedThirdParty =
    selectedStorageType === `${BackupStorageType.ResourcesModuleType}`;
  const isCheckedThirdPartyStorage =
    selectedStorageType === `${BackupStorageType.StorageModuleType}`;

  const { t } = useTranslation(["Common"]);

  const [isLoadingData, setIsLoadingData] = useStateCallback(false);

  const [isError, setIsError] = useState(false);

  const { maxNumberCopiesArray, periodsObject, weekdaysLabelArray } =
    useDefaultOptions(t, language);

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

    SocketHelper?.on(SocketEvents.BackupProgress, onBackupProgress);

    return () => {
      SocketHelper?.off(SocketEvents.BackupProgress, onBackupProgress);
    };
  }, [setDownloadingProgress, setBackupProgressError, setTemporaryLink, t]);

  const onClickPermissions = () => {
    seStorageType(BackupStorageType.DocumentModuleType.toString());

    setSelectedEnableSchedule();
  };

  const onClickShowStorage = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => {
    const key = e.currentTarget.name;
    seStorageType(key);
    if (isError) setIsError(false);
  };

  const onCancelModuleSettings = () => {
    toDefault();

    if (isCheckedThirdParty || isCheckedDocuments) {
      resetNewFolderPath();
    }

    if (isError) {
      setIsError(false);
    }
  };

  const canSave = () => {
    if (
      (isCheckedDocuments && !selectedFolderId) ||
      (isCheckedThirdParty && !selectedFolderId)
    ) {
      setIsError(true);

      return false;
    }

    if (isCheckedThirdPartyStorage) {
      return isFormReady();
    }

    return true;
  };

  const handleDeleteSchedule = () => {
    setIsLoadingData(true, () => {
      deleteBackupSchedule(isManagement)
        ?.then(() => {
          deleteSchedule(weekdaysLabelArray);
          toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
        })
        .catch((error) => {
          setErrorInformation(error, t);
          toastr.error(error);
          console.error(error);
        })
        .finally(() => setIsLoadingData(false));
    });
  };

  const createSchedule = async (
    storageType: string,
    storageParams: Option[],
    selectedMaxCopiesNum: string,
    period: string,
    time: string,
    day: string | undefined,
  ) => {
    try {
      await createBackupSchedule(
        storageType,
        storageParams,
        selectedMaxCopiesNum,
        period,
        time,
        day,
        false,
        isManagement,
      );
      const [selectedSchedule, storageInfo] = await Promise.all([
        getBackupSchedule(isManagement),
        getBackupStorage(isManagement),
      ]);

      if (selectedSchedule) setBackupSchedule(selectedSchedule);
      if (storageInfo) setThirdPartyStorage(storageInfo);

      setIsError(false);
      setDefaultOptions(periodsObject, weekdaysLabelArray, selectedSchedule);
      toastr.success(t("Common:SuccessfullySaveSettingsMessage"));
    } catch (e) {
      setErrorInformation(e, t);
      toastr.error(e as Error);
      console.error(e);
      if (isCheckedThirdParty || isCheckedDocuments) updateBaseFolderPath();
    } finally {
      setIsLoadingData(false);
    }
  };

  const onSaveModuleSettings = async () => {
    if (!selectedEnableSchedule) {
      handleDeleteSchedule();
      return;
    }

    if (!canSave()) return;

    setIsLoadingData(true, () => {
      let day: Nullable<string>;
      let period: AutoBackupPeriod;

      if (selectedPeriodNumber === "1") {
        period = AutoBackupPeriod.EveryWeekType;
        day = selectedWeekday;
      } else if (selectedPeriodNumber === "2") {
        period = AutoBackupPeriod.EveryMonthType;
        day = selectedMonthDay;
      } else {
        period = AutoBackupPeriod.EveryDayType;
        day = null;
      }

      const time = selectedHour.substring(0, selectedHour.indexOf(":"));

      const storageType = isCheckedDocuments
        ? BackupStorageType.DocumentModuleType
        : isCheckedThirdParty
          ? BackupStorageType.ResourcesModuleType
          : BackupStorageType.StorageModuleType;

      const storageParams = getStorageParams(
        isCheckedThirdPartyStorage,
        selectedFolderId,
        selectedStorageId,
      );

      createSchedule(
        storageType.toString(),
        storageParams,
        selectedMaxCopiesNumber,
        period.toString(),
        time,
        day?.toString(),
      );
    });
  };

  const commonProps = {
    isLoadingData,
    monthNumbersArray,
    hoursArray,
    maxNumberCopiesArray,
    periodsObject,
    weekdaysLabelArray,
  };

  const commonRadioButtonProps = {
    fontSize: "13px",
    fontWeight: 600,
    value: "value",
    className: classNames(styles.backupRadioButton, "backup_radio-button"),
    onClick: onClickShowStorage,
  };

  const operationsCompleted = downloadingProgress === 100;

  const isSaveCancelDisabled =
    isLoadingData || !(isChanged || isThirdStorageChanged);

  if (isEmptyContentBeforeLoader && !isInitialLoading) return null;

  if (isInitialLoading) return <AutoBackupLoader />;

  const mainDisabled = isLoadingData || !isEnableAuto || isInitialError;

  return (
    <div data-testid="auto-backup" className={styles.autoBackup}>
      <StatusMessage message={errorInformation} />
      <div
        className={classNames(
          styles.backupModulesHeaderWrapper,
          "backup_modules-header_wrapper",
        )}
      >
        <Text
          className={classNames(
            styles.backupModulesDescription,
            styles.settingsUnavailable,
            "backup_modules-description settings_unavailable",
          )}
        >
          {t("Common:AutoBackupDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        {!isManagement ? (
          <Link
            className={classNames(styles.linkLearnMore, "link-learn-more")}
            href={automaticBackupUrl}
            target={LinkTarget.blank}
            fontSize="13px"
            color={currentColorScheme?.main?.accent}
            isHovered
            dataTestId="automatic_backup_learn_link"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>

      <div
        className={classNames(
          styles.backupToggleWrapper,
          "backup_toggle-wrapper",
          {
            [styles.isDisabled]: mainDisabled,
          },
        )}
      >
        <ToggleButton
          className={classNames(
            styles.backupToggleBtn,
            "enable-automatic-backup backup_toggle-btn",
          )}
          onChange={onClickPermissions}
          isChecked={selectedEnableSchedule}
          isDisabled={mainDisabled}
          dataTestId="enable_automatic_backup_button"
        />

        <div className={classNames(styles.toggleCaption, "toggle-caption")}>
          <div
            className={classNames(
              styles.toggleCaptionTitle,
              "toggle-caption_title",
            )}
          >
            <Text
              fontWeight={600}
              lineHeight="20px"
              noSelect
              className={classNames(
                styles.settingsUnavailable,
                "settings_unavailable",
              )}
            >
              {t("Common:EnableAutomaticBackup")}
            </Text>
          </div>
          <Text
            className={classNames(
              styles.settingsUnavailable,
              "backup_toggle-btn-description settings_unavailable",
            )}
          >
            {t("Common:EnableAutomaticBackupDescription")}
          </Text>
        </div>
      </div>
      {!isInitialError && selectedEnableSchedule && isEnableAuto ? (
        <div className="backup_modules">
          <div className={styles.modules}>
            <RadioButton
              key={0}
              {...commonRadioButtonProps}
              id="backup-room"
              label={t("Common:RoomsModule")}
              name={`${BackupStorageType.DocumentModuleType}`}
              isChecked={isCheckedDocuments}
              isDisabled={isLoadingData}
              testId="auto_backup_room_radio_button"
            />
            <Text
              className={classNames(
                styles.backupDescription,
                "backup-description",
              )}
            >
              {t("Common:RoomsModuleDescription", {
                roomName: t("Common:MyDocuments"),
              })}
            </Text>
            {isCheckedDocuments ? (
              <RoomsModule
                settingsFileSelector={settingsFileSelector}
                newPath={newPath}
                basePath={basePath}
                isErrorPath={isErrorPath}
                defaultStorageType={defaultStorageType}
                setSelectedFolder={setSelectedFolder}
                defaultFolderId={defaultFolderId}
                toDefault={toDefaultFileSelector}
                setBasePath={setBasePath}
                setNewPath={setNewPath}
                selectedPeriodLabel={selectedPeriodLabel}
                selectedWeekdayLabel={selectedWeekdayLabel}
                selectedHour={selectedHour}
                selectedMonthDay={selectedMonthDay}
                selectedMaxCopiesNumber={selectedMaxCopiesNumber}
                selectedPeriodNumber={selectedPeriodNumber}
                setMaxCopies={setMaxCopies}
                setPeriod={setPeriod}
                setWeekday={setWeekday}
                setMonthNumber={setMonthNumber}
                setTime={setTime}
                {...commonProps}
                isError={isError}
                setIsError={setIsError}
              />
            ) : null}
          </div>

          <div className={styles.modules}>
            <RadioButton
              {...commonRadioButtonProps}
              id="third-party-resource"
              label={t("Common:ThirdPartyResource")}
              name={`${BackupStorageType.ResourcesModuleType}`}
              isChecked={isCheckedThirdParty}
              isDisabled={isLoadingData}
              testId="auto_backup_resource_radio_button"
            />
            <Text
              className={classNames(
                styles.backupDescription,
                "backup-description",
              )}
            >
              {t("Common:ThirdPartyResourceDescription")}
            </Text>
            {isCheckedThirdParty ? (
              <ThirdPartyModule
                setDefaultFolderId={setDefaultFolderId}
                setSelectedFolder={setSelectedFolder}
                defaultStorageType={defaultStorageType}
                defaultFolderId={defaultFolderId}
                setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
                toDefault={toDefaultFileSelector}
                setBasePath={setBasePath}
                setNewPath={setNewPath}
                basePath={basePath}
                isErrorPath={isErrorPath}
                newPath={newPath}
                openConnectWindow={openConnectWindow}
                connectDialogVisible={connectDialogVisible}
                deleteThirdPartyDialogVisible={deleteThirdPartyDialogVisible}
                connectedThirdPartyAccount={connectedThirdPartyAccount}
                setConnectDialogVisible={setConnectDialogVisible}
                setDeleteThirdPartyDialogVisible={
                  setDeleteThirdPartyDialogVisible
                }
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
                selectedPeriodLabel={selectedPeriodLabel}
                selectedWeekdayLabel={selectedWeekdayLabel}
                selectedHour={selectedHour}
                selectedMonthDay={selectedMonthDay}
                selectedMaxCopiesNumber={selectedMaxCopiesNumber}
                selectedPeriodNumber={selectedPeriodNumber}
                setMaxCopies={setMaxCopies}
                setPeriod={setPeriod}
                setWeekday={setWeekday}
                setMonthNumber={setMonthNumber}
                setTime={setTime}
                {...commonProps}
                isError={isError}
                buttonSize={buttonSize}
              />
            ) : null}
          </div>
          <div className={styles.modules}>
            <RadioButton
              {...commonRadioButtonProps}
              id="third-party-storage"
              label={t("Common:ThirdPartyStorage")}
              name={`${BackupStorageType.StorageModuleType}`}
              isChecked={isCheckedThirdPartyStorage}
              isDisabled={isLoadingData}
              testId="auto_backup_storage_radio_button"
            />
            <Text
              className={classNames(
                styles.backupDescription,
                "backup-description",
              )}
            >
              {t("Common:ThirdPartyStorageDescription")}
            </Text>

            {isCheckedThirdPartyStorage ? (
              <ThirdPartyStorageModule
                thirdPartyStorage={thirdPartyStorage}
                setStorageId={setStorageId}
                defaultStorageId={defaultStorageId}
                setCompletedFormFields={setCompletedFormFields}
                isNeedFilePath={isNeedFilePath}
                errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
                formSettings={formSettings}
                addValueInFormSettings={addValueInFormSettings}
                setRequiredFormSettings={setRequiredFormSettings}
                setIsThirdStorageChanged={setIsThirdStorageChanged}
                selectedPeriodLabel={selectedPeriodLabel}
                selectedWeekdayLabel={selectedWeekdayLabel}
                selectedHour={selectedHour}
                selectedMonthDay={selectedMonthDay}
                selectedMaxCopiesNumber={selectedMaxCopiesNumber}
                selectedPeriodNumber={selectedPeriodNumber}
                setMaxCopies={setMaxCopies}
                setPeriod={setPeriod}
                setWeekday={setWeekday}
                setMonthNumber={setMonthNumber}
                setTime={setTime}
                storageRegions={storageRegions}
                defaultRegion={defaultRegion}
                deleteValueFormSetting={deleteValueFormSetting}
                selectedStorageId={selectedStorageId}
                {...commonProps}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {isChanged || isThirdStorageChanged ? (
        <SaveCancelButtons
          saveButtonLabel={t("Common:SaveButton")}
          cancelButtonLabel={t("Common:CancelButton")}
          onSaveClick={onSaveModuleSettings}
          onCancelClick={onCancelModuleSettings}
          saveButtonDisabled={isSaveCancelDisabled}
          disableRestoreToDefault={isSaveCancelDisabled}
          displaySettings
          saveButtonDataTestId="auto_backup_storage_save_button"
          cancelButtonDataTestId="auto_backup_storage_cancel_button"
        />
      ) : null}

      {isBackupProgressVisible ? (
        <OperationsProgressButton
          operationsAlert={Boolean(backupProgressError)}
          operationsCompleted={operationsCompleted}
          operations={[
            {
              label: operationsCompleted
                ? t("Common:Backup")
                : downloadingProgress === 0
                  ? t("Common:PreparingBackup")
                  : t("Common:BackupProgress", {
                      progress: downloadingProgress,
                    }),
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

export default AutomaticBackup;
