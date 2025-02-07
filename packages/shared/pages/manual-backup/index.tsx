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

import React, { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { Link, LinkTarget } from "@docspace/shared/components/link";
import { startBackup } from "@docspace/shared/api/portal";
import { RadioButton } from "@docspace/shared/components/radio-button";
import { toastr } from "@docspace/shared/components/toast";
import { BackupStorageType, FolderType } from "@docspace/shared/enums";
import StatusMessage from "@docspace/shared/components/status-message";
import SocketHelper, {
  SocketEvents,
  TSocketListener,
} from "@docspace/shared/utils/socket";

import {
  FloatingButton,
  FloatingButtonIcons,
} from "@docspace/shared/components/floating-button";
import DataBackupLoader from "@docspace/shared/skeletons/backup/DataBackup";
import {
  isManagement,
  getBackupProgressInfo,
} from "@docspace/shared/utils/common";
import { getFromLocalStorage } from "@docspace/shared/utils/getFromLocalStorage";

import { StyledModules, StyledManualBackup } from "./ManualBackup.styled";

import ThirdPartyModule from "./sub-components/ThirdPartyModule";
import RoomsModule from "./sub-components/RoomsModule";
import ThirdPartyStorageModule from "./sub-components/ThirdPartyStorageModule";
import type { ManualBackupProps } from "./ManualBackup.types";

const switches = [
  "isCheckedTemporaryStorage",
  "isCheckedDocuments",
  "isCheckedThirdParty",
  "isCheckedThirdPartyStorage",
];

const ManualBackup = ({
  isInitialLoading,
  buttonSize,
  temporaryLink,
  dataBackupUrl,
  pageIsDisabled,
  isNotPaidPeriod,
  rootFoldersTitles,
  currentColorScheme,
  downloadingProgress,
  isBackupProgressVisible,
  isEmptyContentBeforeLoader,
  basePath,
  isErrorPath,
  newPath,
  providers,
  accounts,
  selectedThirdPartyAccount,
  setBasePath,
  setNewPath,
  settingsFileSelector,
  toDefault,
  isFormReady,
  currentDeviceType,
  maxWidth,
  removeItem,
  isValidForm = false,
  deleteThirdPartyDialogVisible,
  connectDialogVisible,
  isTheSameThirdPartyAccount,
  connectedThirdPartyAccount,
  isNeedFilePath = false,
  thirdPartyStorage,
  formSettings,
  errorsFieldsBeforeSafe,
  defaultRegion,
  storageRegions,
  setThirdPartyProviders,
  deleteThirdParty,
  setThirdPartyAccountsInfo,
  setSelectedThirdPartyAccount,
  setDeleteThirdPartyDialogVisible,
  openConnectWindow,
  deleteValueFormSetting,
  setRequiredFormSettings,
  addValueInFormSettings,
  setCompletedFormFields,
  setTemporaryLink,
  getStorageParams,
  clearLocalStorage,
  saveToLocalStorage,
  setDownloadingProgress,
  setConnectedThirdPartyAccount,
  setConnectDialogVisible,
  setIsThirdStorageChanged,
  setErrorInformation,
  errorInformation,
}: ManualBackupProps) => {
  const { t } = useTranslation(["Settings", "Common"]);

  const selectedStorageType = useMemo(
    () => getFromLocalStorage<string>("LocalCopyStorageType"),
    [],
  );

  const [isCheckedDocuments, setIsCheckedDocuments] = useState(
    () => selectedStorageType === "Documents",
  );
  const [isCheckedThirdParty, setIsCheckedThirdParty] = useState(
    () => selectedStorageType === "ThirdPartyResource",
  );
  const [isCheckedTemporaryStorage, setIsCheckedTemporaryStorage] = useState(
    () => selectedStorageType === "TemporaryStorage",
  );
  const [isCheckedThirdPartyStorage, setIsCheckedThirdPartyStorage] = useState(
    () => selectedStorageType === "ThirdPartyStorage",
  );

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

  const onMakeTemporaryBackup = async () => {
    setErrorInformation("");
    clearLocalStorage();
    localStorage.setItem(
      "LocalCopyStorageType",
      JSON.stringify("TemporaryStorage"),
    );

    try {
      await startBackup(
        `${BackupStorageType.TemporaryModuleType}`,
        null,
        false,
        isManagement(),
      );
      setDownloadingProgress(1);
    } catch (err) {
      setErrorInformation(err, t);
    }
  };

  const onClickDownloadBackup = () => {
    const url = window.location.origin;
    const downloadUrl = `${url}${temporaryLink}`;
    window.open(downloadUrl, "_self");
  };

  const onClickShowStorage = (
    e: React.MouseEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newStateObj: Record<
      string,
      React.Dispatch<React.SetStateAction<boolean>>
    > = {
      isCheckedTemporaryStorage: setIsCheckedTemporaryStorage,
      isCheckedDocuments: setIsCheckedDocuments,
      isCheckedThirdParty: setIsCheckedThirdParty,
      isCheckedThirdPartyStorage: setIsCheckedThirdPartyStorage,
    };

    const name = e.currentTarget.name;

    newStateObj[name]?.(true);

    const newState = switches.filter((el) => el !== name);

    newState.forEach((stateName) => newStateObj[stateName]?.(false));
  };

  const onMakeCopy = async (
    selectedFolder: string | number,
    moduleName: string,
    moduleType: string,
    selectedStorageId?: string,
    selectedStorageTitle?: string,
  ) => {
    clearLocalStorage();
    setErrorInformation("");
    const storageParams = getStorageParams(
      isCheckedThirdPartyStorage,
      selectedFolder,
      selectedStorageId,
    );

    const folderId = isCheckedThirdPartyStorage
      ? selectedStorageId
      : selectedFolder;

    saveToLocalStorage(
      isCheckedThirdPartyStorage,
      moduleName,
      folderId,
      selectedStorageTitle,
    );

    try {
      await startBackup(moduleType, storageParams, false, isManagement());
      setDownloadingProgress(1);
      setTemporaryLink("");
    } catch (err) {
      setErrorInformation(err, t);
    }
  };

  const isMaxProgress = downloadingProgress === 100;

  const commonRadioButtonProps = {
    fontSize: "13px",
    fontWeight: 600,
    value: "value",
    className: "backup_radio-button",
    onClick: onClickShowStorage,
  };

  const commonModulesProps = {
    isMaxProgress,
    onMakeCopy,
    buttonSize,
  };

  const roomName = rootFoldersTitles[FolderType.USER]?.title;

  if (isEmptyContentBeforeLoader && !isInitialLoading) return null;

  if (isInitialLoading) return <DataBackupLoader />;

  return (
    <StyledManualBackup>
      <StatusMessage message={errorInformation} />
      <div className="backup_modules-header_wrapper">
        <Text className="backup_modules-description">
          {t("ManualBackupDescription")}
        </Text>
        {!isManagement() ? (
          <Link
            className="link-learn-more"
            href={dataBackupUrl}
            target={LinkTarget.blank}
            fontSize="13px"
            color={currentColorScheme?.main?.accent}
            isHovered
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>

      <StyledModules>
        <RadioButton
          key={0}
          id="temporary-storage"
          label={t("TemporaryStorage")}
          name="isCheckedTemporaryStorage"
          isChecked={isCheckedTemporaryStorage}
          isDisabled={!isMaxProgress || pageIsDisabled}
          {...commonRadioButtonProps}
        />
        <Text className="backup-description">
          {t("TemporaryStorageDescription")}
        </Text>
        {isCheckedTemporaryStorage ? (
          <div className="manual-backup_buttons">
            <Button
              id="create-button"
              label={t("Common:Create")}
              onClick={onMakeTemporaryBackup}
              primary
              isDisabled={!isMaxProgress || pageIsDisabled}
              size={buttonSize}
            />
            {temporaryLink && temporaryLink.length > 0 && isMaxProgress ? (
              <Button
                id="download-copy"
                label={t("DownloadCopy")}
                onClick={onClickDownloadBackup}
                isDisabled={pageIsDisabled}
                size={buttonSize}
                style={{ marginInlineStart: "8px" }}
              />
            ) : null}
            {!isMaxProgress ? (
              <Button
                label={`${t("Common:CopyOperation")} ...`}
                isDisabled
                size={buttonSize}
                style={{ marginInlineStart: "8px" }}
              />
            ) : null}
          </div>
        ) : null}
      </StyledModules>
      <StyledModules isDisabled={isNotPaidPeriod}>
        <RadioButton
          id="backup-room"
          label={t("Common:RoomsModule")}
          name="isCheckedDocuments"
          key={1}
          isChecked={isCheckedDocuments}
          isDisabled={!isMaxProgress || isNotPaidPeriod || pageIsDisabled}
          {...commonRadioButtonProps}
        />
        <Text className="backup-description module-documents">
          <Trans t={t} i18nKey="RoomsModuleDescription" ns="Common">
            {{ roomName }}
          </Trans>
        </Text>
        {isCheckedDocuments ? (
          <RoomsModule
            newPath={newPath}
            basePath={basePath}
            isErrorPath={isErrorPath}
            toDefault={toDefault}
            setBasePath={setBasePath}
            setNewPath={setNewPath}
            settingsFileSelector={settingsFileSelector}
            {...commonModulesProps}
            // isCheckedDocuments={isCheckedDocuments}
            // isMaxProgress,
            // onMakeCopy,
            // buttonSize,
            currentDeviceType={currentDeviceType}
            maxWidth={maxWidth}
          />
        ) : null}
      </StyledModules>

      <StyledModules isDisabled={isNotPaidPeriod}>
        <RadioButton
          id="third-party-resource"
          label={t("Common:ThirdPartyResource")}
          name="isCheckedThirdParty"
          key={2}
          isChecked={isCheckedThirdParty}
          isDisabled={!isMaxProgress || isNotPaidPeriod || pageIsDisabled}
          {...commonRadioButtonProps}
        />
        <Text className="backup-description">
          {t("Common:ThirdPartyResourceDescription")}
        </Text>
        {isCheckedThirdParty ? (
          <ThirdPartyModule
            newPath={newPath}
            accounts={accounts}
            basePath={basePath}
            providers={providers}
            removeItem={removeItem}
            isErrorPath={isErrorPath}
            connectDialogVisible={connectDialogVisible}
            filesSelectorSettings={settingsFileSelector}
            selectedThirdPartyAccount={selectedThirdPartyAccount}
            connectedThirdPartyAccount={connectedThirdPartyAccount}
            isTheSameThirdPartyAccount={isTheSameThirdPartyAccount}
            deleteThirdPartyDialogVisible={deleteThirdPartyDialogVisible}
            setBasePath={setBasePath}
            toDefault={toDefault}
            setNewPath={setNewPath}
            deleteThirdParty={deleteThirdParty}
            openConnectWindow={openConnectWindow}
            clearLocalStorage={clearLocalStorage}
            setThirdPartyProviders={setThirdPartyProviders}
            setConnectDialogVisible={setConnectDialogVisible}
            setThirdPartyAccountsInfo={setThirdPartyAccountsInfo}
            setSelectedThirdPartyAccount={setSelectedThirdPartyAccount}
            setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
            setDeleteThirdPartyDialogVisible={setDeleteThirdPartyDialogVisible}
            {...commonModulesProps}
          />
        ) : null}
      </StyledModules>
      <StyledModules isDisabled={isNotPaidPeriod}>
        <RadioButton
          id="third-party-storage"
          label={t("Common:ThirdPartyStorage")}
          name="isCheckedThirdPartyStorage"
          key={3}
          isChecked={isCheckedThirdPartyStorage}
          isDisabled={!isMaxProgress || isNotPaidPeriod || pageIsDisabled}
          {...commonRadioButtonProps}
        />
        <Text className="backup-description">
          {t("ThirdPartyStorageDescription")}
        </Text>
        {isCheckedThirdPartyStorage ? (
          <ThirdPartyStorageModule
            isValidForm={isValidForm}
            formSettings={formSettings}
            defaultRegion={defaultRegion}
            storageRegions={storageRegions}
            isNeedFilePath={isNeedFilePath}
            thirdPartyStorage={thirdPartyStorage}
            errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
            isFormReady={isFormReady}
            deleteValueFormSetting={deleteValueFormSetting}
            setCompletedFormFields={setCompletedFormFields}
            addValueInFormSettings={addValueInFormSettings}
            setRequiredFormSettings={setRequiredFormSettings}
            setIsThirdStorageChanged={setIsThirdStorageChanged}
            isMaxProgress={isMaxProgress}
            onMakeCopy={onMakeCopy} // {...commonModulesProps}
          />
        ) : null}
      </StyledModules>

      {isBackupProgressVisible ? (
        <FloatingButton
          alert={false}
          percent={downloadingProgress}
          className="layout-progress-bar"
          icon={FloatingButtonIcons.file}
        />
      ) : null}
    </StyledManualBackup>
  );
};

export default ManualBackup;

// export default inject(
//   ({ settingsStore, backup, treeFoldersStore, currentTariffStatusStore }) => {
//     const {
//       clearProgressInterval,
//       clearLocalStorage,
//       // commonThirdPartyList,
//       downloadingProgress,
//       getProgress,
//       getIntervalProgress,
//       setDownloadingProgress,
//       setTemporaryLink,
//       // setCommonThirdPartyList,
//       temporaryLink,
//       getStorageParams,
//       setThirdPartyStorage,
//       setStorageRegions,
//       saveToLocalStorage,
//       setConnectedThirdPartyAccount,
//     } = backup;

//     const { currentColorScheme, dataBackupUrl, portals } = settingsStore;
//     const { rootFoldersTitles, fetchTreeFolders } = treeFoldersStore;
//     const { isNotPaidPeriod } = currentTariffStatusStore;

//     const pageIsDisabled = isManagement() && portals?.length === 1;

//     return {
//       isNotPaidPeriod,
//       setThirdPartyStorage,
//       clearProgressInterval,
//       clearLocalStorage,
//       // commonThirdPartyList,
//       downloadingProgress,
//       getProgress,
//       getIntervalProgress,
//       setDownloadingProgress,
//       setTemporaryLink,
//       setStorageRegions,
//       // setCommonThirdPartyList,
//       temporaryLink,
//       getStorageParams,
//       rootFoldersTitles,
//       fetchTreeFolders,
//       saveToLocalStorage,
//       setConnectedThirdPartyAccount,

//       dataBackupUrl,
//       currentColorScheme,
//       pageIsDisabled,
//     };
//   },
// )(withTranslation(["Settings", "Common"])(observer(ManualBackup)));
