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

import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import classNames from "classnames";
import { TFunction } from "i18next";

import { Text } from "../../../components/text";
import { Button } from "../../../components/button";
import { Link, LinkTarget } from "../../../components/link";
import { startBackup } from "../../../api/portal";
import { RadioButton } from "../../../components/radio-button";
import { toastr } from "../../../components/toast";
import { BackupStorageLocalKey, BackupStorageType } from "../../../enums";
import StatusMessage from "../../../components/status-message";
import SocketHelper, {
  SocketEvents,
  TSocketListener,
} from "../../../utils/socket";
import { OPERATIONS_NAME } from "../../../constants";
import OperationsProgressButton from "../../../components/operations-progress-button";
import DataBackupLoader from "../../../skeletons/backup/DataBackup";
import { getBackupProgressInfo, getErrorInfo } from "../../../utils/common";
import { getFromLocalStorage } from "../../../utils";
import { useDidMount } from "../../../hooks/useDidMount";

import { ThirdPartyModule } from "./sub-components/ThirdPartyModule";
import { RoomsModule } from "./sub-components/RoomsModule";
import { ThirdPartyStorageModule } from "./sub-components/ThirdPartyStorageModule";

import type { ManualBackupProps, TStorageType } from "./ManualBackup.types";
import {
  DOCUMENTS,
  TEMPORARY_STORAGE,
  THIRD_PARTY_RESOURCE,
  THIRD_PARTY_STORAGE,
} from "./ManualBackup.constants";
import styles from "./ManualBackup.module.scss";
import { combineUrl } from "../../../utils/combineUrl";

const getPaymentError = (
  t: TFunction,
  isPayer: boolean | undefined,
  walletCustomerEmail: string | null,
  backupPrice: number,
) => {
  const onClickWalletUrl = () => {
    const walletPageUrl = combineUrl(
      "/portal-settings",
      `/payments/wallet?open=true&price=${backupPrice.toString()}`,
    );

    window.DocSpace.navigate(walletPageUrl);
  };

  return isPayer ? (
    <Trans
      t={t}
      ns="Common"
      i18nKey="InsufficientFundsWithTopUp"
      components={{
        1: <Link tag="a" onClick={onClickWalletUrl} color="accent" />,
      }}
    />
  ) : (
    <Trans
      t={t}
      ns="Common"
      i18nKey="InsufficientFundsWithContact"
      components={{
        1: (
          <Link
            key="contact-payer-link"
            tag="a"
            color="accent"
            href={`mailto:${walletCustomerEmail}`}
          />
        ),
      }}
    />
  );
};

const ManualBackup = ({
  isInitialLoading,
  buttonSize,
  temporaryLink,
  dataBackupUrl,
  pageIsDisabled,
  isNotPaidPeriod,
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

  errorInformation,
  isManagement = false,

  backupProgressError,
  setBackupProgressError,
  setIsBackupProgressVisible,
  isPayer,
  walletCustomerEmail,
  isThirdPartyAvailable,
  backupServicePrice,
}: ManualBackupProps) => {
  const { t } = useTranslation(["Common"]);

  const [storageType, setStorageType] =
    useState<TStorageType>(TEMPORARY_STORAGE);

  const [errorMessage, setErrorMessage] = useState<string | React.ReactNode>(
    "",
  );

  const isCheckedTemporaryStorage = storageType === TEMPORARY_STORAGE;
  const isCheckedDocuments = storageType === DOCUMENTS;
  const isCheckedThirdParty = storageType === THIRD_PARTY_RESOURCE;
  const isCheckedThirdPartyStorage = storageType === THIRD_PARTY_STORAGE;

  useDidMount(() => {
    const saveStorageType = getFromLocalStorage<TStorageType>(
      BackupStorageLocalKey.StorageType,
    );

    if (saveStorageType) setStorageType(saveStorageType);
  });

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

  const onMakeTemporaryBackup = async () => {
    setErrorMessage("");
    setBackupProgressError("");
    clearLocalStorage();
    localStorage.setItem(
      BackupStorageLocalKey.StorageType,
      JSON.stringify(TEMPORARY_STORAGE),
    );

    setDownloadingProgress(1);
    setIsBackupProgressVisible(true);

    try {
      await startBackup(
        `${BackupStorageType.TemporaryModuleType}`,
        null,
        false,
        isManagement,
      );
    } catch (err) {
      let customText;

      const knownError = err as {
        response?: { status: number; data: { error: { message: string } } };
        statusText?: string;
        message?: string;
      };

      if (knownError?.response?.status === 402 && backupServicePrice) {
        customText = getPaymentError(
          t,
          isPayer ?? false,
          walletCustomerEmail ?? "",
          backupServicePrice,
        );
      }

      const message = getErrorInfo(err, t, customText);
      setErrorMessage(message);
      setBackupProgressError("error");
      setDownloadingProgress(100);
      console.error(err);
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
    const name = e.currentTarget.name as TStorageType;

    setStorageType(name);
  };

  const onMakeCopy = async (
    selectedFolder: string | number,
    moduleName: string,
    moduleType: string,
    selectedStorageId?: string,
    selectedStorageTitle?: string,
  ) => {
    clearLocalStorage();

    setErrorMessage("");
    setBackupProgressError("");
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

    setDownloadingProgress(1);
    setIsBackupProgressVisible(true);

    try {
      await startBackup(moduleType, storageParams, false, isManagement);

      setTemporaryLink("");
    } catch (err) {
      let customText;

      const knownError = err as {
        response?: { status: number; data: { error: { message: string } } };
        statusText?: string;
        message?: string;
      };

      if (knownError?.response?.status === 402 && backupServicePrice) {
        customText = getPaymentError(
          t,
          isPayer ?? false,
          walletCustomerEmail ?? "",
          backupServicePrice,
        );
      }

      const message = getErrorInfo(err, t, customText);
      setErrorMessage(message);
      setBackupProgressError("error");
      setDownloadingProgress(100);
      console.error(err);
    }
  };

  const isMaxProgress = downloadingProgress === 100;

  const commonRadioButtonProps = {
    fontSize: "13px",
    fontWeight: 600,
    value: "value",
    className: classNames(styles.backupRadioButton, "backup_radio-button"),
    onClick: onClickShowStorage,
  };

  const commonModulesProps = {
    isMaxProgress,
    onMakeCopy,
    buttonSize,
  };

  if (isEmptyContentBeforeLoader && !isInitialLoading) return null;

  if (isInitialLoading) return <DataBackupLoader />;

  const mainDisabled = !isMaxProgress || pageIsDisabled;
  const additionalDisabled =
    !isMaxProgress || isNotPaidPeriod || pageIsDisabled;

  return (
    <div className={styles.manualBackup}>
      <StatusMessage message={errorMessage || errorInformation} />
      <div
        className={classNames(
          styles.backupModulesHeaderWrapper,
          "backup_modules-header_wrapper",
        )}
      >
        <Text
          className={classNames(
            styles.backupModulesDescription,
            "backup_modules-description",
          )}
        >
          {t("Common:ManualBackupDescription")}
        </Text>
        {!isManagement ? (
          <Link
            className={classNames(styles.linkLearnMore, "link-learn-more")}
            href={dataBackupUrl}
            target={LinkTarget.blank}
            fontSize="13px"
            color={currentColorScheme?.main?.accent}
            isHovered
            dataTestId="creating_backup_learn_link"
          >
            {t("Common:LearnMore")}
          </Link>
        ) : null}
      </div>

      <div className={styles.modules}>
        <div
          className={classNames(styles.modules, {
            [styles.isDisabled]: mainDisabled,
          })}
        >
          <RadioButton
            key={0}
            id="temporary-storage"
            label={t("Common:TemporaryStorage")}
            name={TEMPORARY_STORAGE}
            isChecked={isCheckedTemporaryStorage}
            isDisabled={mainDisabled}
            {...commonRadioButtonProps}
            testId="temporary_storage_radio_button"
          />
          <Text
            className={classNames(
              styles.backupDescription,
              "backup-description",
            )}
          >
            {t("Common:TemporaryStorageDescription")}
          </Text>
          {isCheckedTemporaryStorage ? (
            <div
              className={classNames(
                styles.manualBackupButtons,
                "manual-backup_buttons",
              )}
            >
              <Button
                id="create-button"
                label={t("Common:Create")}
                onClick={onMakeTemporaryBackup}
                primary
                isDisabled={mainDisabled}
                size={buttonSize}
                testId="create_temporary_backup_button"
              />
              {temporaryLink && temporaryLink.length > 0 && isMaxProgress ? (
                <Button
                  id="download-copy"
                  label={t("Common:DownloadCopy")}
                  onClick={onClickDownloadBackup}
                  isDisabled={pageIsDisabled}
                  size={buttonSize}
                  style={{ marginInlineStart: "8px" }}
                  testId="download_temporary_copy_button"
                />
              ) : null}
              {!isMaxProgress ? (
                <Button
                  label={`${t("Common:CopyOperation")} ...`}
                  isDisabled
                  size={buttonSize}
                  style={{ marginInlineStart: "8px" }}
                  testId="copy_temporary_operation_button"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div
        className={classNames(styles.modules, {
          [styles.isDisabled]: additionalDisabled,
        })}
      >
        <RadioButton
          id="backup-room"
          label={t("Common:RoomsModule")}
          name={DOCUMENTS}
          key={1}
          isChecked={isCheckedDocuments}
          isDisabled={additionalDisabled}
          {...commonRadioButtonProps}
          testId="backup_room_radio_button"
        />
        <Text
          className={classNames(
            styles.backupDescription,
            "backup-description module-documents",
            { [styles.disabled]: additionalDisabled },
          )}
        >
          {t("Common:RoomsModuleDescription", {
            roomName: t("Common:MyFilesSection"),
          })}
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
            currentDeviceType={currentDeviceType}
            maxWidth={maxWidth}
          />
        ) : null}
      </div>

      <div
        className={classNames(styles.modules, {
          [styles.isDisabled]: additionalDisabled,
        })}
      >
        <RadioButton
          id="third-party-resource"
          label={t("Common:ThirdPartyResource")}
          name={THIRD_PARTY_RESOURCE}
          key={2}
          isChecked={isCheckedThirdParty}
          isDisabled={additionalDisabled}
          {...commonRadioButtonProps}
          testId="third_party_resource_radio_button"
        />
        <Text
          className={classNames(styles.backupDescription, "backup-description")}
        >
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
      </div>
      <div
        className={classNames(styles.modules, {
          [styles.isDisabled]: additionalDisabled,
        })}
      >
        <RadioButton
          id="third-party-storage"
          label={t("Common:ThirdPartyStorage")}
          name={THIRD_PARTY_STORAGE}
          key={3}
          isChecked={isCheckedThirdPartyStorage}
          isDisabled={additionalDisabled}
          {...commonRadioButtonProps}
        />
        <Text
          className={classNames(styles.backupDescription, "backup-description")}
        >
          {t("Common:ThirdPartyStorageDescription")}
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
            onMakeCopy={onMakeCopy}
            buttonSize={buttonSize}
            isThirdPartyAvailable={isThirdPartyAvailable ?? true}
          />
        ) : null}
      </div>

      {isBackupProgressVisible ? (
        <OperationsProgressButton
          operationsAlert={Boolean(backupProgressError)}
          operationsCompleted={downloadingProgress === 100}
          operations={[
            {
              label:
                downloadingProgress === 100
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

export default ManualBackup;
