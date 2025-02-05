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

"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "styled-components";
import { Trans, useTranslation } from "react-i18next";

import { RadioButton } from "@docspace/shared/components/radio-button";
import { Text } from "@docspace/shared/components/text";
import {
  deleteBackupSchedule,
  getBackupSchedule,
  createBackupSchedule,
} from "@docspace/shared/api/portal";
import { toastr } from "@docspace/shared/components/toast";
import {
  BackupStorageType,
  AutoBackupPeriod,
  FolderType,
} from "@docspace/shared/enums";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { getBackupStorage } from "@docspace/shared/api/settings";
import AutoBackupLoader from "@docspace/shared/skeletons/backup/AutoBackup";
import StatusMessage from "@docspace/shared/components/status-message";
import SocketHelper, {
  SocketEvents,
  type TSocketListener,
} from "@docspace/shared/utils/socket";
import {
  FloatingButton,
  FloatingButtonIcons,
} from "@docspace/shared/components/floating-button";
import { Badge } from "@docspace/shared/components/badge";
import { Link, LinkTarget } from "@docspace/shared/components/link";
import { getBackupProgressInfo } from "@docspace/shared/utils/common";

import { globalColors } from "@docspace/shared/themes";
import { useStateCallback } from "@docspace/shared/hooks/useStateCallback";
import type { Nullable, Option } from "@docspace/shared/types";

import ThirdPartyModule from "./sub-components/ThirdPartyModule";
import RoomsModule from "./sub-components/RoomsModule";
import { ThirdPartyStorageModule } from "./sub-components/ThirdPartyStorageModule";

import { ButtonContainer } from "./sub-components/ButtonContainer";

import { useDefaultOptions } from "./hooks/index";
import { StyledModules, StyledAutoBackup } from "./AutoBackup.styled";
import type { AutomaticBackupProps } from "./AutoBackup.types";

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
  rootFoldersTitles,
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
}: AutomaticBackupProps) => {
  const isCheckedDocuments =
    selectedStorageType === `${BackupStorageType.DocumentModuleType}`;
  const isCheckedThirdParty =
    selectedStorageType === `${BackupStorageType.ResourcesModuleType}`;
  const isCheckedThirdPartyStorage =
    selectedStorageType === `${BackupStorageType.StorageModuleType}`;

  const { t } = useTranslation(["Settings", "Common"]);
  const theme = useTheme();

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

      if (error) toastr.error(error);
      if (success) toastr.success(success);
    };

    SocketHelper.on(SocketEvents.BackupProgress, onBackupProgress);

    return () => {
      SocketHelper.off(SocketEvents.BackupProgress, onBackupProgress);
    };
  }, [setDownloadingProgress, setTemporaryLink, t]);

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
      deleteBackupSchedule()
        ?.then(() => {
          deleteSchedule(weekdaysLabelArray);
          toastr.success(t("SuccessfullySaveSettingsMessage"));
        })
        .catch((error) => {
          setErrorInformation(error, t);
          toastr.error(error);
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
      if (isCheckedThirdParty || isCheckedDocuments) updateBaseFolderPath();

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
        getBackupSchedule(),
        getBackupStorage(),
      ]);

      if (selectedSchedule) setBackupSchedule(selectedSchedule);
      if (storageInfo) setThirdPartyStorage(storageInfo);

      setDefaultOptions(t, periodsObject, weekdaysLabelArray);
      toastr.success(t("SuccessfullySaveSettingsMessage"));
    } catch (e) {
      toastr.error(e as Error);
      setErrorInformation(e, t);
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
    className: "backup_radio-button",
    onClick: onClickShowStorage,
  };

  const roomName = rootFoldersTitles[FolderType.USER]?.title;

  if (isEmptyContentBeforeLoader && !isInitialLoading) return null;

  if (isInitialLoading) return <AutoBackupLoader />;

  console.log({
    isLoadingData,
    isEnableAuto,
    isInitialError,
  });

  return (
    <StyledAutoBackup>
      <StatusMessage message={errorInformation} />
      <div className="backup_modules-header_wrapper">
        <Text className="backup_modules-description settings_unavailable">
          {t("AutoBackupDescription", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        {!isManagement ? (
          <Link
            className="link-learn-more"
            href={automaticBackupUrl}
            target={LinkTarget.blank}
            fontSize="13px"
            color={currentColorScheme?.main?.accent}
            isHovered
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>

      <div className="backup_toggle-wrapper">
        <ToggleButton
          className="enable-automatic-backup backup_toggle-btn"
          onChange={onClickPermissions}
          isChecked={selectedEnableSchedule}
          isDisabled={isLoadingData || !isEnableAuto || isInitialError}
        />

        <div className="toggle-caption">
          <div className="toggle-caption_title">
            <Text
              fontWeight={600}
              lineHeight="20px"
              noSelect
              className="settings_unavailable"
            >
              {t("EnableAutomaticBackup")}
            </Text>
            {!isEnableAuto && !isManagement ? (
              <Badge
                backgroundColor={
                  theme.isBase
                    ? globalColors.favoritesStatus
                    : globalColors.favoriteStatusDark
                }
                label={t("Common:Paid")}
                fontWeight="700"
                className="auto-backup_badge"
                isPaidBadge
              />
            ) : null}
          </div>
          <Text className="backup_toggle-btn-description settings_unavailable">
            {t("EnableAutomaticBackupDescription")}
          </Text>
        </div>
      </div>
      {!isInitialError && selectedEnableSchedule && isEnableAuto ? (
        <div className="backup_modules">
          <StyledModules>
            <RadioButton
              key={0}
              {...commonRadioButtonProps}
              id="backup-room"
              label={t("RoomsModule")}
              name={`${BackupStorageType.DocumentModuleType}`}
              isChecked={isCheckedDocuments}
              isDisabled={isLoadingData}
            />
            <Text className="backup-description">
              <Trans t={t} i18nKey="RoomsModuleDescription" ns="Settings">
                {{ roomName }}
              </Trans>
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
              />
            ) : null}
          </StyledModules>

          <StyledModules
          // isDisabled={isDisabledThirdPartyList}
          >
            <RadioButton
              {...commonRadioButtonProps}
              id="third-party-resource"
              label={t("ThirdPartyResource")}
              name={`${BackupStorageType.ResourcesModuleType}`}
              isChecked={isCheckedThirdParty}
              isDisabled={
                isLoadingData
                // || isDisabledThirdPartyList
              }
            />
            <Text className="backup-description">
              {t("ThirdPartyResourceDescription")}
            </Text>
            {isCheckedThirdParty ? (
              <ThirdPartyModule
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
          </StyledModules>
          <StyledModules>
            <RadioButton
              {...commonRadioButtonProps}
              id="third-party-storage"
              label={t("Common:ThirdPartyStorage")}
              name={`${BackupStorageType.StorageModuleType}`}
              isChecked={isCheckedThirdPartyStorage}
              isDisabled={isLoadingData}
            />
            <Text className="backup-description">
              {t("ThirdPartyStorageDescription")}
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
                {...commonProps}
              />
            ) : null}
          </StyledModules>
        </div>
      ) : null}

      <ButtonContainer
        t={t}
        isLoadingData={isLoadingData || isInitialError}
        buttonSize={buttonSize}
        onSaveModuleSettings={onSaveModuleSettings}
        onCancelModuleSettings={onCancelModuleSettings}
        isChanged={isChanged}
        isThirdStorageChanged={isThirdStorageChanged}
      />

      {isBackupProgressVisible ? (
        <FloatingButton
          className="layout-progress-bar"
          icon={FloatingButtonIcons.file}
          alert={false}
          percent={downloadingProgress}
        />
      ) : null}
    </StyledAutoBackup>
  );
};

export default AutomaticBackup;

// export default inject(
//   ({
//     authStore,
//     settingsStore,
//     backup,
//     treeFoldersStore,
//     filesSelectorInput,
//     currentQuotaStore,
//   }) => {
//     const { language } = authStore;
//     const { isRestoreAndAutoBackupAvailable } = currentQuotaStore;
//     const {
//       theme,
//       currentColorScheme,
//       automaticBackupUrl,
//       checkEnablePortalSettings,
//     } = settingsStore;

//     const {
//       downloadingProgress,
//       backupSchedule,
//       //commonThirdPartyList,
//       clearProgressInterval,
//       deleteSchedule,
//       getProgress,
//       setThirdPartyStorage,
//       setDefaultOptions,
//       setBackupSchedule,
//       selectedStorageType,
//       seStorageType,
//       //setCommonThirdPartyList,
//       selectedPeriodLabel,
//       selectedWeekdayLabel,
//       selectedWeekday,
//       selectedHour,
//       selectedMonthDay,
//       selectedMaxCopiesNumber,
//       selectedPeriodNumber,
//       selectedFolderId,
//       selectedStorageId,
//       toDefault,
//       isFormReady,
//       getStorageParams,
//       setSelectedEnableSchedule,
//       selectedEnableSchedule,
//       setConnectedThirdPartyAccount,
//       setStorageRegions,
//       defaultFolderId,
//       isBackupProgressVisible,
//     } = backup;

//     const { updateBaseFolderPath, resetNewFolderPath } = filesSelectorInput;

//     const isCheckedDocuments =
//       selectedStorageType === `${BackupStorageType.DocumentModuleType}`;
//     const isCheckedThirdParty =
//       selectedStorageType === `${BackupStorageType.ResourcesModuleType}`;
//     const isCheckedThirdPartyStorage =
//       selectedStorageType === `${BackupStorageType.StorageModuleType}`;

//     const { rootFoldersTitles, fetchTreeFolders } = treeFoldersStore;

//     const isEnableAuto = checkEnablePortalSettings(
//       isRestoreAndAutoBackupAvailable,
//     );

//     return {
//       setConnectedThirdPartyAccount,
//       defaultFolderId,
//       isEnableAuto,
//       fetchTreeFolders,
//       rootFoldersTitles,
//       downloadingProgress,
//       theme,
//       language,
//       isFormReady,
//       backupSchedule,
//       //commonThirdPartyList,
//       clearProgressInterval,
//       deleteSchedule,
//       getProgress,
//       setThirdPartyStorage,
//       setDefaultOptions,
//       setBackupSchedule,
//       selectedStorageType,
//       seStorageType,
//       //setCommonThirdPartyList,
//       selectedPeriodLabel,
//       selectedWeekdayLabel,
//       selectedWeekday,
//       selectedHour,
//       selectedMonthDay,
//       selectedMaxCopiesNumber,
//       selectedPeriodNumber,
//       selectedFolderId,
//       selectedStorageId,

//       toDefault,

//       isCheckedThirdPartyStorage,
//       isCheckedThirdParty,
//       isCheckedDocuments,

//       getStorageParams,

//       setSelectedEnableSchedule,
//       selectedEnableSchedule,

//       resetNewFolderPath,
//       setStorageRegions,
//       updateBaseFolderPath,

//       automaticBackupUrl,
//       currentColorScheme,
//       isBackupProgressVisible,
//     };
//   },
// )(withTranslation(["Settings", "Common"])(observer(AutomaticBackup)));
