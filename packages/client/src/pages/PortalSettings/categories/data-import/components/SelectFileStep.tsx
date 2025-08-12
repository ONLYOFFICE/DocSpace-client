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

import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { inject, observer } from "mobx-react";
import { CancelUploadDialog } from "SRC_DIR/components/dialogs";
import { isMobile, isTablet, mobile } from "@docspace/shared/utils/device";
import styled from "styled-components";

import { WarningQuotaDialog } from "SRC_DIR/components/dialogs/WarningQuotaDialog";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { FileInput } from "@docspace/shared/components/file-input";
import { ProgressBar } from "@docspace/shared/components/progress-bar";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import { Link, LinkType } from "@docspace/shared/components/link";
import { toastr } from "@docspace/shared/components/toast";
import { InputSize } from "@docspace/shared/components/text-input";
import { InjectedSelectFileStepProps, SelectFileStepProps } from "../types";

const Wrapper = styled.div`
  max-width: 700px;
  margin-top: 16px;

  .choose-backup-file {
    font-weight: 600;
    line-height: 20px;
    margin-bottom: 4px;
  }

  .upload-backup-input {
    height: 32px;
    margin-bottom: 12px;

    .icon-button_svg {
      svg {
        path {
          fill: ${(props) =>
            props.theme.client.settings.migration.fileInputIconColor};
        }
      }
    }
  }

  .upload-back-buttons {
    margin-top: 16px;
  }

  .select-file-progress-text {
    margin: 12px 0;
  }

  .select-file-progress-bar {
    margin: 12px 0 16px;

    .progress-bar_percent,
    .progress-bar_animation {
      background: ${(props) => props.theme.progressBar.animation.background};
    }
  }
`;

const FileUploadContainer = styled.div`
  max-width: 350px;

  .cancel-btn {
    @media ${mobile} {
      height: 40px;
    }
  }

  .cancelUploadButton {
    @media ${mobile} {
      margin-bottom: 0;
      width: auto;
      position: fixed;
      inset-inline: 0px;
      bottom: 0px;
      padding: 16px;
      background: ${(props) =>
        props.theme.client.settings.migration.workspaceBackground};
      gap: 0;
    }
  }
`;

const ErrorBlock = styled.div`
  max-width: 700px;

  .complete-progress-bar {
    margin: 12px 0 16px;
    max-width: 350px;

    .progress-bar_percent,
    .progress-bar_animation {
      background: ${(props) => props.theme.progressBar.animation.background};
    }
  }

  .error-text {
    font-size: 12px;
    margin-bottom: 10px;
    color: ${(props) => props.theme.client.settings.migration.errorTextColor};
  }

  .save-cancel-buttons {
    margin-top: 16px;
  }
`;

const FAIL_TRIES = 2;

const SelectFileStep = (props: SelectFileStepProps) => {
  const {
    t,
    isMultipleUpload,
    migratorName,
    acceptedExtensions,
    incrementStep,
    setWorkspace,
    cancelUploadDialogVisible,
    setCancelUploadDialogVisible,
    initMigrations,
    getMigrationStatus,
    setUsers,
    cancelMigration,
    fileLoadingStatus,
    setLoadingStatus,
    files,
    setFiles,
    migratingWorkspace,
    setMigratingWorkspace,
    uploadFiles,
    defaultUsersQuota = 0,
    defaultRoomsQuota = 0,
    tenantCustomQuota = 0,
    isDefaultUsersQuotaSet,
    isDefaultRoomsQuotaSet,
    isTenantCustomQuotaSet,
    warningQuotaDialogVisible,
    setWarningQuotaDialogVisible,
  } = props as InjectedSelectFileStepProps;

  const [isSaveDisabled, setIsSaveDisabled] = useState(
    migratorName === migratingWorkspace,
  );
  const [progress, setProgress] = useState(0);
  const [isInfiniteProgress, setIsInfiniteProgress] = useState(true);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isFileError, setIsFileError] = useState(false);
  const [isBackupEmpty, setIsBackupEmpty] = useState(false);
  const isAbort = useRef(false);

  const [uploadFile, setFile] = useState<File | File[]>();
  const [startChunk, setChunk] = useState(0);
  const [chunkSize, setChunkSize] = useState(0);

  const [failTries, setFailTries] = useState(FAIL_TRIES);
  const uploadInterval = useRef<number>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const isQuotaWarningVisible =
      isDefaultUsersQuotaSet ||
      isDefaultRoomsQuotaSet ||
      isTenantCustomQuotaSet;
    setWarningQuotaDialogVisible(isQuotaWarningVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDefaultUsersQuotaSet, isDefaultRoomsQuotaSet, isTenantCustomQuotaSet]);

  const onClickRedirect = () => {
    navigate("/portal-settings/management/disk-space");
  };

  const handleError = useCallback(
    (message?: string) => {
      toastr.error(message || t("Common:SomethingWentWrong"));
      setIsFileError(true);
      setLoadingStatus("none");
      clearInterval(uploadInterval.current);
    },
    [t, setLoadingStatus],
  );

  const poolStatus = useCallback(async () => {
    try {
      const res = await getMigrationStatus();

      if (!res && failTries) {
        setFailTries((prevTries) => prevTries - 1);
        return;
      }

      if (!res) {
        handleError();
        return;
      }

      if (res.parseResult.failedArchives.length > 0 || res.error) {
        handleError(res.error);
        return;
      }

      if (res.isCompleted || res.progress === 100) {
        clearInterval(uploadInterval.current);

        const totalUsers =
          res.parseResult.users.length +
          res.parseResult.existUsers.length +
          res.parseResult.withoutEmailUsers.length;

        if (totalUsers > 0) {
          setIsBackupEmpty(false);
          setLoadingStatus("done");
          setUsers(res.parseResult);
          setIsSaveDisabled(false);
        } else {
          setLoadingStatus("none");
          setIsBackupEmpty(true);
        }

        setIsInfiniteProgress(false);
      }

      setProgress(res.progress);

      if (isInfiniteProgress && res.progress > 10) {
        setIsInfiniteProgress(false);
      }
    } catch (error) {
      handleError(error as string);
      setIsNetworkError(true);
    }
  }, [
    failTries,
    getMigrationStatus,
    isInfiniteProgress,
    setLoadingStatus,
    setUsers,
    handleError,
  ]);

  const onUploadFile = async (file: File | File[]) => {
    try {
      const filesData = Array.isArray(file) ? file : [file];
      setFiles(filesData.map((item) => item.name));

      await uploadFiles(
        filesData,
        setProgress,
        isAbort,
        setChunk,
        startChunk,
        setChunkSize,
        chunkSize,
      );

      if (isAbort.current) return;

      await initMigrations(migratorName);
      setLoadingStatus("proceed");
    } catch (error) {
      handleError(error as string);
      setIsNetworkError(true);
    } finally {
      isAbort.current = false;
    }
  };

  const onSelectFile = (file: File | File[]) => {
    if (!isMultipleUpload && file instanceof Array) {
      toastr.error(t("Common:SomethingWentWrong"));
      return;
    }

    setProgress(0);
    setIsFileError(false);
    setIsBackupEmpty(false);
    setIsSaveDisabled(true);
    setLoadingStatus("upload");
    setFailTries(FAIL_TRIES);
    setIsInfiniteProgress(true);
    setMigratingWorkspace(migratorName);
    setFile(file);
    setChunkSize(0);
    setChunk(0);
    isAbort.current = false;

    onUploadFile(file);
  };

  const onUploadToServer = () => {
    if (!(uploadFile instanceof File) && !(uploadFile instanceof Array)) return;

    const size =
      uploadFile instanceof Array
        ? Math.ceil(
            uploadFile.reduce((acc, curr) => acc + curr.size, 0) / chunkSize,
          )
        : Math.ceil(uploadFile.size / chunkSize);

    if (size > startChunk) {
      setProgress(0);
      setIsNetworkError(false);
      setIsFileError(false);
      setIsSaveDisabled(true);
      setLoadingStatus("upload");
      setFailTries(FAIL_TRIES);
      setIsInfiniteProgress(true);
      setMigratingWorkspace(migratorName);
      onUploadFile(uploadFile);
    } else {
      setLoadingStatus("proceed");
    }
  };

  const onDownloadArchives = async () => {
    try {
      const res = await getMigrationStatus();

      if (!res) {
        throw new Error();
      }

      const blob = new Blob(res.parseResult.failedArchives, {
        type: "text/csv;charset=utf-8",
      });
      const a = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = "unsupported_files";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toastr.error(error || t("Common:SomethingWentWrong"));
    }
  };

  const onCancel = () => {
    setCancelUploadDialogVisible(true);
  };

  const handleCancelMigration = () => {
    isAbort.current = true;
    setProgress(0);
    setLoadingStatus("none");
    clearInterval(uploadInterval.current);
    setMigratingWorkspace("");
    cancelMigration();
  };

  const hideCancelDialog = () => setCancelUploadDialogVisible(false);
  const returnToProviders = () => setWorkspace("");

  useEffect(() => {
    if (fileLoadingStatus === "proceed") {
      uploadInterval.current = window.setInterval(() => poolStatus(), 1000);
    } else if (fileLoadingStatus === "done") {
      setIsSaveDisabled(false);
    }

    return () => clearInterval(uploadInterval.current);
  }, [fileLoadingStatus, poolStatus]);

  return (
    <Wrapper>
      <FileUploadContainer>
        <Text className="choose-backup-file">
          {t("Settings:ChooseBackupFile")}
        </Text>
        <FileInput
          scale
          onInput={onSelectFile}
          className="upload-backup-input"
          placeholder={
            (migratingWorkspace === migratorName && files && files.join(",")) ||
            t("Settings:BackupFile")
          }
          isDisabled={
            fileLoadingStatus === "upload" || fileLoadingStatus === "proceed"
          }
          accept={acceptedExtensions}
          size={InputSize.base}
          isMultiple={migratorName === "GoogleWorkspace"}
          data-test-id="upload_backup_file_input"
        />
      </FileUploadContainer>
      {fileLoadingStatus === "upload" || fileLoadingStatus === "proceed" ? (
        <FileUploadContainer>
          <ProgressBar
            percent={progress}
            isInfiniteProgress={isInfiniteProgress}
            className="select-file-progress-bar"
            label={t("Settings:BackupFileUploading")}
          />
          <div className="cancelUploadButton">
            <Button
              size={isTablet() ? ButtonSize.medium : ButtonSize.small}
              className="cancel-btn"
              label={t("Common:CancelButton")}
              onClick={onCancel}
              scale={isMobile()}
              data-test-id="cancel_upload_backup_button"
            />
          </div>
        </FileUploadContainer>
      ) : (
        <ErrorBlock>
          {isFileError ? (
            <div>
              <ProgressBar
                percent={100}
                className="complete-progress-bar"
                label={t("Common:LoadingIsComplete")}
              />
              <Text className="error-text">
                {t("Settings:UnsupportedFilesDescription")}
              </Text>
              <Link
                type={LinkType.action}
                isHovered
                fontWeight={600}
                onClick={onDownloadArchives}
                dataTestId="check_unsupported_files_link"
              >
                {t("Settings:CheckUnsupportedFiles")}
              </Link>
            </div>
          ) : null}

          {isBackupEmpty ? (
            <div>
              <ProgressBar
                percent={100}
                className="complete-progress-bar"
                label={t("Common:LoadingIsComplete")}
              />
              <Text className="error-text">
                {t("Settings:NoUsersInBackup")}
              </Text>
            </div>
          ) : null}

          {isNetworkError ? (
            <SaveCancelButtons
              className="save-cancel-buttons"
              onSaveClick={onUploadToServer}
              onCancelClick={returnToProviders}
              saveButtonLabel={t("Settings:UploadToServer")}
              cancelButtonLabel={t("Common:Back")}
              displaySettings
              showReminder
              saveButtonDataTestId="upload_to_server_button"
              cancelButtonDataTestId="back_to_providers_button"
            />
          ) : (
            <SaveCancelButtons
              className="save-cancel-buttons"
              onSaveClick={incrementStep}
              onCancelClick={returnToProviders}
              saveButtonLabel={t("Settings:NextStep")}
              cancelButtonLabel={t("Common:Back")}
              displaySettings
              saveButtonDisabled={
                migratingWorkspace !== migratorName || isSaveDisabled
              }
              showReminder
              saveButtonDataTestId="next_step_button"
              cancelButtonDataTestId="back_to_providers_button"
            />
          )}
        </ErrorBlock>
      )}

      {cancelUploadDialogVisible ? (
        <CancelUploadDialog
          visible={cancelUploadDialogVisible}
          onClose={hideCancelDialog}
          cancelMigration={handleCancelMigration}
          loading={false}
          isFifthStep={false}
          isSixthStep={false}
        />
      ) : null}

      {warningQuotaDialogVisible ? (
        <WarningQuotaDialog
          t={t}
          visible={warningQuotaDialogVisible}
          onCloseDialog={() => setWarningQuotaDialogVisible(false)}
          onClickRedirect={onClickRedirect}
          defaultRoomsQuota={defaultRoomsQuota}
          defaultUsersQuota={defaultUsersQuota}
          tenantCustomQuota={tenantCustomQuota}
          isDefaultRoomsQuotaSet={isDefaultRoomsQuotaSet}
          isDefaultUsersQuotaSet={isDefaultUsersQuotaSet}
          isTenantCustomQuotaSet={isTenantCustomQuotaSet}
        />
      ) : null}
    </Wrapper>
  );
};

export default inject<TStore>(
  ({ dialogsStore, importAccountsStore, currentQuotaStore }) => {
    const {
      initMigrations,
      getMigrationStatus,
      setUsers,
      fileLoadingStatus,
      setLoadingStatus,
      cancelMigration,
      setWorkspace,
      incrementStep,
      files,
      setFiles,
      migratingWorkspace,
      setMigratingWorkspace,
      uploadFiles,
    } = importAccountsStore;
    const {
      cancelUploadDialogVisible,
      setCancelUploadDialogVisible,
      warningQuotaDialogVisible,
      setWarningQuotaDialogVisible,
    } = dialogsStore;

    const {
      isDefaultRoomsQuotaSet,
      isDefaultUsersQuotaSet,
      isTenantCustomQuotaSet,
      defaultUsersQuota,
      defaultRoomsQuota,
      tenantCustomQuota,
    } = currentQuotaStore;

    return {
      initMigrations,
      getMigrationStatus,
      setUsers,
      fileLoadingStatus,
      setLoadingStatus,
      cancelMigration,
      cancelUploadDialogVisible,
      setCancelUploadDialogVisible,
      setWorkspace,
      incrementStep,
      files,
      setFiles,
      migratingWorkspace,
      setMigratingWorkspace,
      uploadFiles,
      defaultUsersQuota,
      defaultRoomsQuota,
      tenantCustomQuota,
      isDefaultRoomsQuotaSet,
      isDefaultUsersQuotaSet,
      isTenantCustomQuotaSet,
      warningQuotaDialogVisible,
      setWarningQuotaDialogVisible,
    };
  },
)(observer(SelectFileStep));
