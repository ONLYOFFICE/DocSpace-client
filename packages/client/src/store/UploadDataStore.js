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

import { makeAutoObservable, runInAction } from "mobx";
import { Trans } from "react-i18next";
import { TIMEOUT } from "SRC_DIR/helpers/filesConstants";
import uniqueid from "lodash/uniqueId";
import sumBy from "lodash/sumBy";
import { ConflictResolveType } from "@docspace/shared/enums";
import SocketHelper, { SocketCommands } from "@docspace/shared/utils/socket";
import {
  getFileInfo,
  getFolderInfo,
  uploadFile,
  convertFile,
  startUploadSession,
  getFileConversationProgress,
  copyToFolder,
  moveToFolder,
  fileCopyAs,
  checkIsFileExist,
} from "@docspace/shared/api/files";
import { toastr } from "@docspace/shared/components/toast";
import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";

import { getUnexpectedErrorText } from "SRC_DIR/helpers/filesUtils";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import { hasOwnProperty } from "@docspace/shared/utils/object";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { Link } from "@docspace/shared/components/link";

const removeDuplicate = (items) => {
  const obj = {};
  return items.filter((x) => {
    if (obj[x.uniqueId]) return false;
    obj[x.uniqueId] = true;
    return true;
  });
};

const getConversationProgress = async (fileId) => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      getFileConversationProgress(fileId)
        .then((res) => {
          // console.log(`getFileConversationProgress fileId:${fileId}`, res);
          resolve(res);
        })
        .catch((error) => {
          // console.error("getFileConversationProgress error", error);
          reject(error);
        });
    }, 1000);
  });

  return promise;
};

class UploadDataStore {
  settingsStore;

  treeFoldersStore;

  selectedFolderStore;

  filesStore;

  secondaryProgressDataStore;

  primaryProgressDataStore;

  dialogsStore;

  filesSettingsStore;

  files = [];

  uploadedFilesHistory = [];

  displayedConversionFiles = []; // Files shown in the conversion panel

  filesSize = 0;

  tempConversionFiles = [];

  filesToConversion = [];

  activeConversionQueue = []; // Queue for files being converted from files view

  convertFilesSize = 0;

  uploadToFolder = null;

  uploadedFiles = 0;

  percent = 0;

  conversionPercent = 0;

  uploaded = true;

  converted = true;

  convertedFromFiles = true;

  uploadPanelVisible = false;

  selectedUploadFile = [];

  errors = 0;

  isUploading = false;

  isUploadingAndConversion = false;

  isConvertSingleFile = false;

  currentUploadNumber = 0;

  uploadedFilesSize = 0;

  asyncUploadObj = {};

  conversionVisible = false;

  totalErrorsCount = 0;

  finishUploadFilesCalled = false;

  constructor(
    settingsStore,
    treeFoldersStore,
    selectedFolderStore,
    filesStore,
    secondaryProgressDataStore,
    primaryProgressDataStore,
    dialogsStore,
    filesSettingsStore,
  ) {
    makeAutoObservable(this);
    this.settingsStore = settingsStore;
    this.treeFoldersStore = treeFoldersStore;
    this.selectedFolderStore = selectedFolderStore;
    this.filesStore = filesStore;
    this.secondaryProgressDataStore = secondaryProgressDataStore;
    this.primaryProgressDataStore = primaryProgressDataStore;
    this.dialogsStore = dialogsStore;
    this.filesSettingsStore = filesSettingsStore;
  }

  removeFiles = (fileIds) => {
    fileIds.forEach((id) => {
      this.files = this.files?.filter(
        (file) => !(file.action === "converted" && file.fileInfo?.id === id),
      );
    });
  };

  selectUploadedFile = (file) => {
    this.selectedUploadFile = file;
  };

  setUploadPanelVisible = (uploadPanelVisible) => {
    this.uploadPanelVisible = uploadPanelVisible;
  };

  setConversionPanelVisible = (conversionVisible) => {
    this.conversionVisible = conversionVisible;
  };

  setUploadData = (uploadData) => {
    const uploadDataItems = Object.keys(uploadData);
    uploadDataItems.forEach((key) => {
      if (key in this) {
        this[key] = uploadData[key];
      }
    });
  };

  updateUploadedFile = (id, info) => {
    const files = this.files.map((file) =>
      file.fileId === id ? { ...file, fileInfo: info } : file,
    );
    this.files = files;
  };

  updateUploadedItem = async (id) => {
    const uploadedFileData = await getFileInfo(id);
    this.updateUploadedFile(id, uploadedFileData);
  };

  clearUploadData = () => {
    console.log("clearUploadData");
    this.files = [];
    this.filesToConversion = [];
    this.uploadedFilesHistory = [];
    this.filesSize = 0;
    this.uploadedFiles = 0;
    this.percent = 0;
    this.conversionPercent = 0;
    this.uploaded = true;
    this.converted = true;
    this.errors = 0;
    this.uploadedFilesSize = 0;

    this.isUploadingAndConversion = false;
    this.isUploading = false;
    this.asyncUploadObj = {};
  };

  clearUploadedFiles = () => {
    console.log("clearUploadedFiles");

    const uploadData = {
      filesSize: 0,
      uploadedFiles: 0,
      percent: 0,
      files: this.files.filter((x) => x.action !== "uploaded"),
    };

    this.isUploadingAndConversion = false;
    this.isUploading = false;

    this.setUploadData(uploadData);
  };

  getUploadedFile = (id) => {
    return this.files.filter((f) => f.uniqueId === id);
  };

  cancelUpload = (t) => {
    this.finishUploadFilesCalled = false;

    const newUploadData = {
      filesSize: this.filesSize,
      uploadedFiles: this.uploadedFiles,
      percent: 100,
      uploaded: true,
      converted: true,
      currentUploadNumber: 0,
    };

    const newHistory = this.uploadedFilesHistory.filter(
      (el) =>
        el.action === "uploaded" ||
        el.action === "converted" ||
        (el.action === "upload" && el.error) ||
        (el.action === "convert" && el.error) ||
        (el.action === "convert" && el.inConversion),
    );
    this.filesToConversion = this.filesToConversion.filter(
      (el) => el.inConversion,
    );

    const shouldCancelFile = (file) => {
      return (
        file.action === "upload" ||
        (file.action === "convert" && !file.inConversion)
      );
    };

    this.files = this.files.map((file) =>
      shouldCancelFile(file) ? { ...file, cancel: true } : file,
    );

    this.setUploadData(newUploadData);
    this.uploadedFilesHistory = newHistory;

    toastr.info(t("Common:CancelUpload"));
  };

  cancelConversion = () => {
    const newFiles = [];

    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      if (file.action === "converted" || file.error || file.inConversion) {
        newFiles.push(this.files[i]);
      }
    }

    const newUploadData = {
      files: newFiles,
      filesToConversion: [],
      filesSize: this.filesSize,
      uploadedFiles: this.uploadedFiles,
      percent: 100,
      uploaded: true,
      converted: true,
    };

    if (newUploadData.files.length === 0) this.setUploadPanelVisible(false);
    this.setUploadData(newUploadData);
  };

  clearConversionData = () => {
    this.displayedConversionFiles = [];
    this.activeConversionQueue = [];
    this.convertedFromFiles = true;
  };

  cancelCurrentUpload = (id, t) => {
    runInAction(() => {
      const uploadedFilesHistory = this.uploadedFilesHistory.filter(
        (el) => el.uniqueId !== id,
      );

      const canceledFile = this.files.find((f) => f.uniqueId === id);
      const newPercent = this.getFilesPercent(); // canceledFile.file.size
      canceledFile.cancel = true;
      canceledFile.percent = 100;
      canceledFile.action = "uploaded";

      this.currentUploadNumber -= 1;
      this.uploadedFilesHistory = uploadedFilesHistory;
      this.percent = newPercent;
      const nextFileIndex = this.files.findIndex((f) => !f.inAction);

      if (nextFileIndex !== -1) {
        this.startSessionFunc(nextFileIndex, t);
      }
    });
  };

  cancelCurrentFileConversion = (fileId) => {
    const { convertItem, setConvertItem } = this.dialogsStore;
    convertItem && setConvertItem(null);

    const files = this.files.filter((el) => `${el.fileId}` !== fileId);
    const filesToConversion = this.filesToConversion.filter(
      (el) => `${el.fileId}` !== fileId,
    );

    const newUploadData = {
      files,
      filesToConversion,
      filesSize: this.filesSize,
      uploadedFiles: this.uploadedFiles,
      percent: this.percent,
    };

    this.setUploadData(newUploadData);
  };

  convertFileFromFiles = (file, t, isOpen) => {
    this.dialogsStore.setConvertItem(null);
    const fileIndex =
      file.index ??
      this.displayedConversionFiles.findIndex(
        (el) => el.fileId === file.fileId,
      );

    if (fileIndex > -1 && this.displayedConversionFiles[fileIndex].inConversion)
      return;

    const secondConvertingWithPassword =
      hasOwnProperty(file, "password") || fileIndex > -1;
    const conversionPositionIndex =
      hasOwnProperty(file, "index") || fileIndex > -1;

    this.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: OPERATIONS_NAME.convert,
      alert: false,
      completed: !this.activeConversionQueue.length === 0,
      showPanel: this.setConversionPanelVisible,
      withoutProgress: true,
    });

    const isFirstConversion = !this.activeConversionQueue.length;
    this.activeConversionQueue.push(file);

    const shouldUpdateExistingFile =
      secondConvertingWithPassword && conversionPositionIndex;

    if (shouldUpdateExistingFile) {
      const updatedFile = this.displayedConversionFiles[fileIndex];

      updatedFile.fileInfo.fileExst = file.fileInfo.fileExst;

      this.displayedConversionFiles[fileIndex] = {
        ...updatedFile,
        action: "convert",
        error: null,
        errorShown: false,
      };
    } else {
      this.displayedConversionFiles.push(file);
    }

    if (isFirstConversion) {
      this.startConversionFromFiles(t, isOpen);
    }
  };

  convertFile = (file, t, isOpen) => {
    this.dialogsStore.setConvertItem(null);

    const fileHistoryIndex = this.uploadedFilesHistory.findIndex(
      (el) => el.fileId === file.fileId,
    );
    const secondConverting = fileHistoryIndex > -1;

    if (
      secondConverting &&
      this.uploadedFilesHistory[fileHistoryIndex].inConversion
    )
      return;

    if (this.converted) {
      this.filesToConversion = [];
      this.convertFilesSize = 0;
    }

    const operationName = OPERATIONS_NAME.upload;
    this.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: operationName,
      alert: false,
    });

    this.uploadedFilesHistory[fileHistoryIndex].action = "convert";
    this.uploadedFilesHistory[fileHistoryIndex].error = null;
    this.uploadedFilesHistory[fileHistoryIndex].errorShown = false;

    if (!this.filesToConversion.length) {
      this.filesToConversion.push(file);

      this.startConversion(t, isOpen);
    } else {
      this.filesToConversion.push(file);
    }
  };

  getNewPercent = (uploadedSize, indexOfFile) => {
    const newTotalSize = sumBy(this.files, (f) =>
      f.file && !this.uploaded ? f.file.size : 0,
    );
    const totalUploadedFiles = this.files.filter((_, i) => i < indexOfFile);
    const totalUploadedSize = sumBy(totalUploadedFiles, (f) =>
      f.file && !this.uploaded ? f.file.size : 0,
    );
    const newPercent =
      ((uploadedSize + totalUploadedSize) / newTotalSize) * 100;

    return newPercent;
  };

  getFilesPercent = () => {
    // const newTotalSize = sumBy(this.files, (f) =>
    //   !f.isCalculated && f.file && !this.uploaded ? f.file.size : 0,
    // );

    // const newPercent = (newSize / newTotalSize) * 100;

    const percentCurrentFileHistory = sumBy(
      this.uploadedFilesHistory,
      (f) => f.percent,
    );

    const commonPercent = this.uploadedFilesHistory.length * 100;
    const newPercent = (percentCurrentFileHistory / commonPercent) * 100;

    return newPercent;
  };

  setConversionPercent = (percent, alert) => {
    const data = {
      operation: OPERATIONS_NAME.upload,
      percent,
      completed: false,
    };

    if (this.uploaded) {
      this.primaryProgressDataStore.setPrimaryProgressBarData(
        alert ? { ...data, ...{ alert } } : data,
      );
    }
  };

  getConversationPercent = (fileIndex) => {
    const length = this.files.filter((f) => f.needConvert).length;
    return (fileIndex / length) * 100;
  };

  startConversionFromFiles = async (t, isOpen = false) => {
    const operationName = OPERATIONS_NAME.convert;

    runInAction(() => (this.convertedFromFiles = false));

    let index = 0;
    this.activeConversionQueue = removeDuplicate(this.activeConversionQueue);
    const filesToConversion = this.activeConversionQueue;

    while (index < filesToConversion.length) {
      const conversionItem = filesToConversion[index];
      const { fileId, password, format } = conversionItem;
      const itemPassword = password || null;

      const historyFile = this.displayedConversionFiles.find(
        (f) => f.fileId === fileId,
      );
      const fileIndex = this.displayedConversionFiles.findIndex(
        (f) => f.fileId === fileId,
      );

      if (fileIndex === -1) break;

      runInAction(() => (historyFile.inConversion = true));

      const res = convertFile(fileId, format, itemPassword).catch(() => {
        const error = t("FailedToConvert");

        runInAction(() => {
          historyFile.error = error;
        });

        if (this.convertedFromFiles) {
          this.primaryProgressDataStore.setPrimaryProgressBarData({
            operation: operationName,
            alert: true,
          });
        }

        return null;
      });

      const data = await res;
      if (!data || !data[0]) {
        index++;
        break;
      }

      let progress = data[0].progress;
      let fileInfo = null;
      let error = null;

      while (progress < 100) {
        const response = await getConversationProgress(fileId);
        progress = response?.[0]?.progress;
        fileInfo = response?.[0]?.result;

        historyFile.convertProgress = progress;

        error = response && response[0] && response[0].error;

        if (error?.length) {
          this.primaryProgressDataStore.setPrimaryProgressBarData({
            operation: operationName,
            alert: true,
          });

          runInAction(() => {
            historyFile.error = error;
            historyFile.inConversion = false;
            historyFile.needPassword = fileInfo === "password";
          });

          break;
        }
      }

      if (progress === 100) {
        if (!error) error = data[0].error;

        if (!error && isOpen && data && data[0]) {
          this.filesStore.openDocEditor(fileInfo.id);
        }

        runInAction(() => {
          historyFile.error = error;
          historyFile.convertProgress = progress;
          historyFile.inConversion = false;

          if (error.indexOf("password") !== -1) {
            historyFile.needPassword = true;
          } else historyFile.action = "converted";

          if (fileInfo && fileInfo !== "password") {
            historyFile.fileInfo = fileInfo;
          }
        });

        if (!historyFile?.error && historyFile?.fileInfo?.version > 2) {
          this.filesStore.setHighlightFile({
            highlightFileId: historyFile.fileInfo.id,
            isFileHasExst: !historyFile.fileInfo.fileExst,
          });
        }
      }

      index++;
    }

    this.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: operationName,
      completed: true,
    });

    runInAction(() => {
      this.convertedFromFiles = true;

      if (this.convertedFromFiles) {
        this.activeConversionQueue = [];
      }
    });
  };

  startConversion = async (t, isOpen = false) => {
    const { isRecentFolder, isFavoritesFolder, isSharedWithMeFolder } =
      this.treeFoldersStore;

    if (!this.converted) return;

    const { storeOriginalFiles } = this.filesSettingsStore;

    const isSortedFolder =
      isRecentFolder || isFavoritesFolder || isSharedWithMeFolder;
    const needToRefreshFilesList = !isSortedFolder || !storeOriginalFiles;

    runInAction(() => (this.converted = false));

    this.setConversionPercent(0, false);

    let index = 0;
    let len = this.filesToConversion.length;
    this.filesToConversion = removeDuplicate(this.filesToConversion);
    let filesToConversion = this.filesToConversion;

    while (index < len) {
      const conversionItem = filesToConversion[index];
      const { fileId, password, format } = conversionItem;
      const itemPassword = password || null;
      const file = this.files.find((f) => f.fileId === fileId);
      if (file) runInAction(() => (file.inConversion = true));

      const historyFile = this.uploadedFilesHistory.find(
        (f) => f.fileId === fileId,
      );
      if (historyFile) runInAction(() => (historyFile.inConversion = true));

      const numberFiles = this.files.filter((f) => f.needConvert).length;

      const res = convertFile(fileId, format, itemPassword).catch(() => {
        const error = t("FailedToConvert");

        runInAction(() => {
          if (file) {
            file.error = error;
            file.inConversion = false;
          }
          if (historyFile) {
            historyFile.error = error;
            historyFile.inConversion = false;
          }
        });

        if (this.uploaded) {
          const primaryProgressData = {
            operation: OPERATIONS_NAME.upload,
            alert: true,
          };

          this.primaryProgressDataStore.setPrimaryProgressBarData(
            numberFiles === 1
              ? { ...primaryProgressData, ...{ percent: 100, completed: true } }
              : primaryProgressData,
          );
        }

        return null;
      });

      const data = await res;

      if (data && data[0]) {
        let progress = data[0].progress;
        let fileInfo = null;
        let error = null;

        while (progress < 100) {
          let response = null;
          try {
            response = await getConversationProgress(fileId);
            progress = response?.[0]?.progress;
            fileInfo = response?.[0]?.result;
          } catch (err) {
            // console.log("Error in startConversion while loop:", fileId, err);
            const conversionError = err.message || t("FailedToConvert");

            runInAction(() => {
              if (file) {
                file.error = conversionError;
                file.inConversion = false;
              }
              if (historyFile) {
                historyFile.error = conversionError;
                historyFile.inConversion = false;
              }
            });

            break;
          }

          runInAction(() => {
            const currentFile = this.files.find((f) => f.fileId === fileId);
            if (currentFile) currentFile.convertProgress = progress;

            const hFile = this.uploadedFilesHistory.find(
              (f) => f.fileId === fileId,
            );
            if (hFile) hFile.convertProgress = progress;
          });

          error = response && response[0] && response[0].error;

          if (error?.length) {
            const percent = this.getConversationPercent(index + 1);
            this.setConversionPercent(percent, !!error);

            runInAction(() => {
              const newFile = this.files.find((f) => f.fileId === fileId);
              if (newFile) {
                newFile.error = error;
                newFile.inConversion = false;
                if (fileInfo === "password") {
                  newFile.needPassword = true;

                  this.primaryProgressDataStore.setPrimaryProgressBarData({
                    operation: OPERATIONS_NAME.upload,
                    alert: true,
                  });
                }
              }

              const hFile = this.uploadedFilesHistory.find(
                (f) => f.fileId === fileId,
              );
              const fileIndex = this.uploadedFilesHistory.findIndex(
                (f) => f.fileId === fileId,
              );

              if (hFile) {
                hFile.error = error;
                hFile.inConversion = false;
                if (fileInfo === "password") hFile.needPassword = true;

                const operationObject = this.uploadedFilesHistory[fileIndex];
                Object.assign(operationObject, hFile);
              }
            });

            // this.refreshFiles(toFolderId, false);
            break;
          }

          const percent = this.getConversationPercent(index + 1);

          this.setConversionPercent(percent, false);
        }

        if (progress === 100) {
          if (!error) error = data[0].error;

          if (!error && isOpen && data && data[0]) {
            this.filesStore.openDocEditor(fileInfo.id);
          }

          runInAction(() => {
            const currentFile = this.files.find((f) => f.fileId === fileId);

            if (currentFile) {
              currentFile.error = error;
              currentFile.convertProgress = progress;
              currentFile.inConversion = false;
              if (fileInfo) currentFile.fileInfo = fileInfo;

              if (error.indexOf("password") !== -1) {
                currentFile.needPassword = true;
              } else currentFile.action = "converted";
            }

            const hFile = this.uploadedFilesHistory.find(
              (f) => f.fileId === fileId,
            );

            if (hFile) {
              hFile.error = error;
              hFile.convertProgress = progress;
              hFile.inConversion = false;

              if (error.indexOf("password") !== -1) {
                hFile.needPassword = true;

                this.primaryProgressDataStore.setPrimaryProgressBarData({
                  operation: OPERATIONS_NAME.upload,
                  alert: true,
                });
              } else hFile.action = "converted";
            }
          });

          storeOriginalFiles &&
            fileInfo &&
            fileInfo !== "password" &&
            this.refreshFiles(file);

          if (file && fileInfo && fileInfo !== "password") {
            file.fileInfo = fileInfo;
            if (historyFile) historyFile.fileInfo = fileInfo;
            needToRefreshFilesList && this.refreshFiles(file);
          }

          if (file && isSortedFolder) {
            const folderId = file.fileInfo?.folderId;
            const fileTitle = file.fileInfo?.title;

            folderId &&
              getFolderInfo(folderId)
                .then((folderInfo) =>
                  toastr.success(
                    t("InfoCreateFileIn", {
                      fileTitle,
                      folderTitle: folderInfo.title,
                    }),
                  ),
                )
                .catch((err) => toastr.error(err));
          }
          const percent = this.getConversationPercent(index + 1);
          this.setConversionPercent(percent, !!error);

          if (!file?.error && file?.fileInfo?.version > 2) {
            this.filesStore.setHighlightFile({
              highlightFileId: file.fileInfo.id,
              isFileHasExst: !file.fileInfo.fileExst,
            });
          }
        }
      }

      index++;
      filesToConversion = this.filesToConversion;
      len = filesToConversion.length;
    }

    const allFilesIsUploaded =
      this.files.findIndex(
        (f) =>
          f.action !== "uploaded" &&
          f.action !== "convert" &&
          f.action !== "converted" &&
          !f.error,
      ) === -1;

    if (this.uploaded || allFilesIsUploaded) {
      this.setConversionPercent(100, false);
      this.finishUploadFiles(t, false);
    } else {
      runInAction(() => {
        this.converted = true;
        this.filesToConversion = [];
        this.conversionPercent = 0;
      });
    }
  };

  parallelUploading = (notUploadedFiles, t, createNewIfExist) => {
    const { maxUploadFilesCount } = this.filesSettingsStore;

    const countFiles =
      notUploadedFiles.length >= maxUploadFilesCount
        ? maxUploadFilesCount
        : notUploadedFiles.length;

    for (let i = 0; i < countFiles; i++) {
      if (this.currentUploadNumber <= maxUploadFilesCount) {
        const fileIndex = this.files.findIndex(
          (f) => f.uniqueId === notUploadedFiles[i].uniqueId,
        );

        if (fileIndex !== -1) {
          this.currentUploadNumber += 1;
          this.startSessionFunc(fileIndex, t, createNewIfExist);
        }
      }
    }
  };

  convertUploadedFiles = (t, createNewIfExist = true) => {
    this.files = [...this.files, ...this.tempConversionFiles];

    if (!this.uploaded) {
      const notUploadedFiles = this.tempConversionFiles.filter(
        (f) => !f.inAction,
      );
      this.parallelUploading(notUploadedFiles, t);
    }

    this.tempConversionFiles = [];

    if (this.uploaded) {
      const newUploadData = {
        filesSize: this.convertFilesSize,
        uploadedFiles: this.uploadedFiles,
        percent: this.percent,
        uploaded: false,
        // converted: false,
      };

      this.setUploadData(newUploadData);
      this.startUploadFiles(t, createNewIfExist);
    }
  };

  cancelUploadAction = (items) => {
    const files =
      items ??
      this.dialogsStore.conflictResolveDialogData.newUploadData.allNewFiles;

    let i = files.length;

    while (i !== 0) {
      this.uploadedFilesHistory = this.uploadedFilesHistory.filter(
        (f) => f.uniqueId !== files[i - 1].uniqueId,
      );
      this.files = this.files.filter(
        (f) => f.uniqueId !== files[i - 1].uniqueId,
      );
      this.tempConversionFiles = this.tempConversionFiles.filter(
        (f) => f.uniqueId !== files[i - 1].uniqueId,
      );
      i--;
    }

    if (this.uploaded) {
      this.primaryProgressDataStore.setPrimaryProgressBarData({
        operation: OPERATIONS_NAME.upload,
        completed: true,
        withoutStatus: this.uploadedFilesHistory.length === 0,
        ...(this.uploadedFilesHistory.length === 0 && { showPanel: null }),
      });
    }
  };

  setConflictDialogData = (conflicts, operationData) => {
    this.dialogsStore.setConflictResolveDialogItems(conflicts);
    this.dialogsStore.setConflictResolveDialogData(operationData);
    this.dialogsStore.setConflictResolveDialogVisible(true);
  };

  handleFilesUpload = (newUploadData, t, createNewIfExist = true) => {
    this.uploadedFilesHistory = newUploadData.uploadedFilesHistory;

    this.setUploadData(newUploadData);
    this.startUploadFiles(t, createNewIfExist);
  };

  handleUploadAndOptionalConversion = (uploadData, t, createNewIfExist) => {
    const newUploadData = { ...uploadData };
    // newUploadData.files = newUploadData.filesWithoutConversion;

    const onlyConversion =
      !!this.tempConversionFiles.length &&
      newUploadData.newFilesWithoutConversion.length === 0;

    if (!onlyConversion) {
      this.handleFilesUpload(newUploadData, t, createNewIfExist);
    } else {
      if (this.uploaded) {
        newUploadData.uploaded = true;
        this.asyncUploadObj = {};
      }
      this.uploadedFilesHistory = newUploadData.uploadedFilesHistory;
      // this.setUploadData(newUploadData);
    }

    if (this.tempConversionFiles.length) {
      if (this.filesSettingsStore.hideConfirmConvertSave) {
        this.convertUploadedFiles(t, createNewIfExist);
      } else {
        this.dialogsStore.setConvertDialogVisible(true);
        this.dialogsStore.setConvertDialogData({
          createNewIfExist,
          isUploadAction: true,
          files: uploadData.conversionFiles,
        });
      }
    }
  };

  conflictDialogUploadHandler = (uploadData, t, createNewIfExist) => {
    this.handleUploadAndOptionalConversion(uploadData, t, createNewIfExist);
  };

  handleUploadConflicts = async (t, toFolderId, uploadData) => {
    const filesArray = uploadData.files.map((fileInfo) => fileInfo.file.name);

    try {
      let conflicts = await checkIsFileExist(toFolderId, filesArray);
      const folderInfo = await getFolderInfo(toFolderId);

      conflicts = conflicts.map((fileTitle) => ({
        title: fileTitle,
        isFile: true,
      }));

      if (conflicts.length > 0) {
        this.setConflictDialogData(conflicts, {
          isUploadConflict: true,
          newUploadData: uploadData,
          folderTitle: folderInfo.title,
        });
      } else {
        this.handleUploadAndOptionalConversion(uploadData, t, true);
      }
    } catch (err) {
      let errorMessage = "";

      if (typeof err === "object") {
        errorMessage =
          err?.response?.data?.error?.message ||
          err?.statusText ||
          err?.message ||
          "";
      } else {
        errorMessage = err;
      }

      toastr.error(errorMessage, null, 0, true);

      if (this.uploaded) {
        this.primaryProgressDataStore.setPrimaryProgressBarData({
          operation: OPERATIONS_NAME.upload,
          completed: this.uploaded,
          alert: this.uploadedFilesHistory.length === 0,
          ...(this.uploadedFilesHistory.length === 0 && { showPanel: null }),
        });
      }
    }
  };

  startUpload = (uploadFiles, folderId, t) => {
    const { canConvert } = this.filesSettingsStore;

    const toFolderId = folderId || this.selectedFolderStore.id;

    if (this.uploaded) {
      this.files = this.files.filter((f) => f.action !== "upload" || f.error);
      this.filesSize = 0;
      this.uploadToFolder = null;
      this.percent = 0;
    }
    if (this.uploaded && this.converted) {
      this.files = this.files.filter((f) => f.error);
      this.filesToConversion = [];
      this.uploadedFilesSize = 0;
      this.asyncUploadObj = {};
    }

    const newFiles = []; // this.files;
    const allFiles = [];
    let filesSize = 0;
    let convertSize = 0;

    const uploadFilesArray = Object.keys(uploadFiles);

    uploadFilesArray.forEach((index) => {
      const file = uploadFiles[index];

      const parts = file.name.split(".");
      const ext = parts.length > 1 ? `.${parts.pop()}` : "";
      const needConvert = canConvert(ext);

      const newFile = {
        file,
        uniqueId: uniqueid("download_row-key_"),
        fileId: null,
        toFolderId: file.parentFolderId,
        action: "upload",
        error: file.size ? null : t("Files:EmptyFile"),
        fileInfo: null,
        cancel: false,
        needConvert,
        encrypted: file.encrypted,
        percent: 0,
      };

      if (needConvert) {
        this.tempConversionFiles.push(newFile);
      } else {
        newFiles.push(newFile);
      }

      allFiles.push(newFile);

      filesSize += file.size;
      convertSize += file.size;
    });

    const filesWithoutConversion = removeDuplicate([
      ...this.files,
      ...newFiles,
    ]);

    const countUploadingFiles = filesWithoutConversion.length;
    const countConversionFiles = this.tempConversionFiles.length;

    if (countUploadingFiles && !countConversionFiles) {
      this.isUploading = true;
    } else {
      this.isUploadingAndConversion = true;
    }
    this.convertFilesSize = convertSize;

    const clearArray = removeDuplicate([
      ...this.uploadedFilesHistory,
      ...allFiles,
    ]);

    // this.uploadedFilesHistory = clearArray;

    const newUploadData = {
      // filesWithoutConversion,
      newFilesWithoutConversion: newFiles,
      allNewFiles: allFiles,
      conversionFiles: removeDuplicate(this.tempConversionFiles),
      files: [...filesWithoutConversion],
      filesSize: filesSize + this.filesSize,
      uploadedFiles: this.uploadedFiles,
      percent: this.percent,
      uploaded: false,
      uploadedFilesHistory: clearArray,
      // converted: !!this.tempConversionFiles.length,
    };

    if (countUploadingFiles || countConversionFiles) {
      this.handleUploadConflicts(t, toFolderId, newUploadData);
    }
  };

  refreshFiles = async (currentFile) => {
    const { files, setFiles, folders, setFolders, filter, setFilter } =
      this.filesStore;

    const { filesCount, setFilesCount } = this.selectedFolderStore;

    if (window.location.pathname.indexOf("/history") === -1) {
      const newFiles = files;
      const newFolders = folders;
      const path = currentFile?.path ? currentFile.path.slice() : [];
      const fileIndex = newFiles.findIndex(
        (x) => x.id === currentFile?.fileInfo?.id,
      );

      let folderInfo = null;
      const index = path.findIndex((x) => x === this.selectedFolderStore.id);
      const folderId = index !== -1 ? path[index + 1] : null;
      if (folderId) folderInfo = await getFolderInfo(folderId);

      const newPath = [];
      if (folderInfo || path[path.length - 1] === this.selectedFolderStore.id) {
        let i = 0;
        while (path[i] && path[i] !== folderId) {
          newPath.push(path[i]);
          i++;
        }
      }

      if (
        newPath[newPath.length - 1] !== this.selectedFolderStore.id &&
        path.length
      ) {
        return;
      }

      const addNewFile = () => {
        if (!this.filesStore.showNewFilesInList) {
          return;
        }

        if (folderInfo) {
          const isFolderExist = newFolders.find((x) => x.id === folderInfo.id);
          if (!isFolderExist && folderInfo) {
            newFolders.unshift(folderInfo);
            setFolders(newFolders);
            const newFilter = filter;
            newFilter.total += 1;
            setFilter(newFilter);
          }
        } else if (currentFile && currentFile.fileInfo) {
          if (fileIndex === -1) {
            newFiles.unshift(currentFile.fileInfo);
            setFiles(newFiles);
            const newFilter = filter;
            newFilter.total += 1;
            setFilesCount(filesCount + 1);
            setFilter(newFilter);
          } else if (!this.filesSettingsStore.storeOriginalFiles) {
            newFiles[fileIndex] = currentFile.fileInfo;
            setFiles(newFiles);
          }
        }
      };

      const isFiltered =
        filter.filterType || filter.authorType || filter.search;

      if ((!currentFile && !folderInfo) || isFiltered) return;
      if (folderInfo && this.selectedFolderStore.id === folderInfo.id) return;

      if (folderInfo) {
        const folderIndex = folders.findIndex((f) => f.id === folderInfo.id);
        if (folderIndex !== -1) {
          folders[folderIndex] = folderInfo;
          return;
        }
      }

      addNewFile();
    }
  };

  checkChunkUpload = (chunkUploadObj) => {
    const {
      t,
      res, // file response data
      fileSize, // file size
      index, // chunk index
      indexOfFile, // file index in the list
      path, // file path
      chunksLength, // length of file chunks
      resolve, // resolve cb
      reject, // reject cb
      isAsyncUpload = false, // async upload checker
      isFinalize = false, // is finalize chunk
      //  allChunkUploaded, // needed for progress, files is uploaded, awaiting finalized chunk
      createNewIfExist,
    } = chunkUploadObj;

    if (!res.data.data && res.data.message) {
      return reject({
        message: res.data.message,
        chunkIndex: index,
        chunkSize: fileSize,
        isFinalize,
      });
    }

    const { uploaded, id: fileId, file: fileInfo } = res.data.data;

    // let uploadedSize;

    // if (!uploaded && !allChunkUploaded) {
    //   uploadedSize =
    //     fileSize <= this.filesSettingsStore.chunkUploadSize
    //       ? fileSize
    //       : this.filesSettingsStore.chunkUploadSize;
    // } else {
    //   uploadedSize = isFinalize
    //     ? 0
    //     : fileSize <= this.filesSettingsStore.chunkUploadSize
    //       ? fileSize
    //       : fileSize - index * this.filesSettingsStore.chunkUploadSize;
    // }

    const percentCurrentFile = (index / chunksLength) * 100;

    const fileIndex = this.uploadedFilesHistory.findIndex(
      (f) => f.uniqueId === this.files[indexOfFile].uniqueId,
    );

    if (fileIndex > -1) {
      if (this.uploadedFilesHistory[fileIndex].percent < percentCurrentFile)
        this.uploadedFilesHistory[fileIndex].percent = percentCurrentFile;
    }

    const newPercent = this.getFilesPercent();

    this.percent = newPercent;

    this.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: OPERATIONS_NAME.upload,
      percent: newPercent,
    });

    if (uploaded) {
      runInAction(() => {
        this.files[indexOfFile].action = "uploaded";
        this.files[indexOfFile].fileId = fileId;
        this.files[indexOfFile].fileInfo = fileInfo;

        this.uploadedFilesHistory[fileIndex].action = "uploaded";
        this.uploadedFilesHistory[fileIndex].fileId = fileId;
        this.uploadedFilesHistory[fileIndex].fileInfo = fileInfo;

        this.currentUploadNumber -= 1;

        const nextFileIndex = this.files.findIndex((f) => !f.inAction);

        if (nextFileIndex !== -1) {
          this.startSessionFunc(nextFileIndex, t, createNewIfExist);
        }
      });

      if (fileInfo.version > 2) {
        this.filesStore.setHighlightFile({
          highlightFileId: fileInfo.id,
          isFileHasExst: !fileInfo.fileExst,
        });
      }
    }

    // All chuncks are uploaded

    const currentFile = this.files[indexOfFile];

    if (!currentFile) return resolve();

    if (!currentFile.fileId) return;

    currentFile.path = path;

    const { needConvert } = currentFile;

    const isXML = currentFile.fileInfo?.fileExst?.includes(".xml");

    if (isXML) return resolve();

    if (needConvert) {
      runInAction(() => {
        currentFile.action = "convert";

        if (fileIndex > -1) {
          this.uploadedFilesHistory[fileIndex].action = "convert";
        }
      });

      if (!this.filesToConversion.length || this.converted) {
        this.filesToConversion.push(currentFile);
        this.startConversion(t);
      } else {
        this.filesToConversion.push(currentFile);
      }
      return resolve();
    }

    if (currentFile.action === "uploaded") {
      this.refreshFiles(currentFile);
    }
    if (!isAsyncUpload || res.status === 201) {
      return resolve();
    }
  };

  asyncUpload = async (t, chunkData, resolve, reject, createNewIfExist) => {
    const { operationId, file, fileSize, indexOfFile, path, length } =
      chunkData;

    if (
      this.uploaded ||
      !this.files.some((f) => f.file === file) ||
      this.files[indexOfFile].cancel
    ) {
      return resolve();
    }

    if (!this.asyncUploadObj[operationId]) {
      return reject();
    }
    const chunkObjIndex = this.asyncUploadObj[
      operationId
    ].chunksArray.findIndex((x) => !x.isActive && !x.isFinalize);

    if (chunkObjIndex !== -1) {
      this.asyncUploadObj[operationId].chunksArray[chunkObjIndex].isActive =
        true;

      try {
        const res =
          await this.asyncUploadObj[operationId].chunksArray[
            chunkObjIndex
          ].onUpload();

        if (this.asyncUploadObj[operationId]) {
          this.asyncUploadObj[operationId].chunksArray[
            chunkObjIndex
          ].isFinished = true;
        }

        if (!res.data.data && res.data.message) {
          delete this.asyncUploadObj[operationId];
          return reject(res.data.message);
        }
        this.asyncUpload(t, chunkData, resolve, reject, createNewIfExist);

        const activeLength = this.asyncUploadObj[operationId]
          ? this.asyncUploadObj[operationId].chunksArray.filter(
              (x) => x.isActive,
            ).length - 1
          : 0;

        let allIsUploaded;
        if (this.asyncUploadObj[operationId]) {
          const finished = this.asyncUploadObj[operationId].chunksArray.filter(
            (x) => x.isFinished,
          );

          allIsUploaded =
            this.asyncUploadObj[operationId].chunksArray.length -
            finished.length -
            1; // 1 last
        }

        this.checkChunkUpload({
          t,
          res,
          fileSize,
          index: activeLength,
          indexOfFile,
          path,
          chunksLength: length,
          resolve,
          reject,
          isAsyncUpload: true,
          isFinalize: false,
          allChunkUploaded: allIsUploaded === 0,
          createNewIfExist,
        });

        let finalizeChunk = -1;
        if (this.asyncUploadObj[operationId]) {
          finalizeChunk = this.asyncUploadObj[
            operationId
          ].chunksArray.findIndex((x) => !x.isFinished && !x.isFinalize);
        }

        if (finalizeChunk === -1) {
          const finalizeChunkIndex = this.asyncUploadObj[
            operationId
          ].chunksArray.findIndex((x) => x.isFinalize);

          if (finalizeChunkIndex > -1) {
            const finalizeIndex =
              this.asyncUploadObj[operationId].chunksArray.length - 1;

            const finalizeRes =
              await this.asyncUploadObj[operationId].chunksArray[
                finalizeChunkIndex
              ].onUpload();

            this.checkChunkUpload({
              t,
              res: finalizeRes,
              fileSize,
              index: finalizeIndex,
              indexOfFile,
              path,
              chunksLength: length,
              resolve,
              reject,
              isAsyncUpload: true,
              isFinalize: true,
              createNewIfExist,
            });
          }
        }
      } catch (error) {
        return reject(error);
      }
    }
  };

  uploadFileChunks = async (
    location,
    requestsDataArray,
    fileSize,
    indexOfFile,
    file,
    path,
    t,
    operationId,
    toFolderId,
    createNewIfExist,
  ) => {
    const { uploadThreadCount } = this.filesSettingsStore;
    const length = requestsDataArray.length;

    const isThirdPartyFolder = typeof toFolderId === "string";
    if (!isThirdPartyFolder) {
      const chunksArray = [];
      for (let index = 0; index < length; index++) {
        chunksArray.push({
          isActive: false,
          isFinished: false,
          isFinalize: false,
          onUpload: () =>
            uploadFile(
              `${location}&chunkNumber=${index + 1}&upload=true`,
              requestsDataArray[index],
            ),
        });
      }
      chunksArray.push({
        isActive: false,
        isFinished: false,
        isFinalize: true,
        onUpload: () => uploadFile(`${location}&finalize=true`),
      });

      if (!this.asyncUploadObj[operationId]) {
        this.asyncUploadObj[operationId] = { chunksArray: [] };
        this.asyncUploadObj[operationId].chunksArray = chunksArray;
      }

      const promise = new Promise((resolve, reject) => {
        let i = length <= uploadThreadCount ? length : uploadThreadCount;
        while (i !== 0) {
          this.asyncUpload(
            t,
            { operationId, file, fileSize, indexOfFile, path, length },
            resolve,
            reject,
            createNewIfExist,
          );
          i--;
        }
      });

      await promise;
    } else {
      for (let index = 0; index < length; index++) {
        if (
          this.uploaded ||
          !this.files.some((f) => f.file === file) ||
          this.files[indexOfFile].cancel
        ) {
          return Promise.resolve();
        }

        const res = await uploadFile(location, requestsDataArray[index]);
        const resolve = (r) => Promise.resolve(r);
        const reject = (err) => Promise.reject(err);

        this.checkChunkUpload({
          t,
          res,
          fileSize,
          index,
          indexOfFile,
          path,
          chunksLength: length,
          resolve,
          reject,
          createNewIfExist,
        });

        // console.log(`Uploaded chunk ${index}/${length}`, res);
      }
    }
  };

  retryUploadFiles = (t, uniqueId) => {
    const fileIndex = this.files.findIndex((f) => f.uniqueId === uniqueId);
    const fileUploadedIndex = this.uploadedFilesHistory.findIndex(
      (f) => f.uniqueId === uniqueId,
    );
    const retryFile = this.files[fileIndex];
    const retryFileUploaded = this.uploadedFilesHistory[fileUploadedIndex];

    if (retryFileUploaded.action === "convert") {
      retryFileUploaded.inConversion = false;
      retryFile.inConversion = false;
      this.convertFile(retryFileUploaded, t);
      return;
    }

    retryFile.action = "upload";
    retryFile.error = "";
    retryFile.inAction = false;
    retryFile.percent = 0;

    retryFileUploaded.action = "upload";
    retryFileUploaded.error = "";
    retryFileUploaded.inAction = false;
    retryFileUploaded.errorShown = false;
    retryFileUploaded.percent = 0;

    if (this.uploaded) {
      const newUploadData = {
        filesSize: this.convertFilesSize,
        uploadedFiles: this.uploadedFiles,
        percent: this.percent,
        uploaded: false,
      };

      this.setUploadData(newUploadData);
      const progressData = {
        completed: false,
        percent: this.percent,
        operation: OPERATIONS_NAME.upload,
        alert: false,
        showPanel: this.setUploadPanelVisible,
      };

      this.primaryProgressDataStore.setPrimaryProgressBarData(progressData);
    }

    this.parallelUploading([retryFile], t);
  };

  startUploadFiles = async (t, createNewIfExist = true) => {
    this.finishUploadFilesCalled = false;

    const files = this.files;

    if (files.length === 0 || this.filesSize === 0) {
      return this.finishUploadFiles(t);
    }

    const progressData = {
      completed: false,
      percent: this.percent,
      operation: OPERATIONS_NAME.upload,
      alert: false,
      showPanel: this.setUploadPanelVisible,
    };

    this.primaryProgressDataStore.setPrimaryProgressBarData(progressData);

    const notUploadedFiles = this.files.filter((f) => !f.inAction);

    this.parallelUploading(notUploadedFiles, t, createNewIfExist);
  };

  startSessionFunc = (indexOfFile, t, createNewIfExist = true) => {
    if (!this.uploaded && this.files.length === 0) {
      this.uploaded = true;
      this.asyncUploadObj = {};
      // setUploadData(uploadData);
      return;
    }

    const item = this.files[indexOfFile];

    this.files[indexOfFile].inAction = true;

    if (!item) {
      console.error("Empty files");
      return Promise.resolve();
    }

    if (
      item.action === "uploaded" ||
      item.action === "convert" ||
      item.action === "converted"
    ) {
      return Promise.resolve();
    }

    if (item.error) {
      return Promise.resolve();
    }

    const { chunkUploadSize } = this.filesSettingsStore;

    const { file, toFolderId /* , action */ } = item;
    const chunks = Math.ceil(file.size / chunkUploadSize, chunkUploadSize);
    const fileName = file.name;
    const fileSize = file.size;

    return startUploadSession(
      toFolderId,
      fileName,
      fileSize,
      "", // relativePath,
      file.encrypted,
      file.lastModifiedDate,
      createNewIfExist,
    )
      .then((res) => {
        const location = res.data.location;
        const path = res.data.path;
        const operationId = res.data.id;
        const requestsDataArray = [];

        let chunk = 0;

        while (chunk < chunks) {
          const offset = chunk * chunkUploadSize;
          const formData = new FormData();
          formData.append("file", file.slice(offset, offset + chunkUploadSize));
          requestsDataArray.push(formData);
          chunk++;
        }

        return {
          location,
          requestsDataArray,
          path,
          operationId,
        };
      })
      .then(({ location, requestsDataArray, path, operationId }) => {
        const fileIndex = this.uploadedFilesHistory.findIndex(
          (f) => f.uniqueId === this.files[indexOfFile].uniqueId,
        );
        if (fileIndex > -1)
          this.uploadedFilesHistory[fileIndex].percent = chunks < 2 ? 50 : 0;

        return this.uploadFileChunks(
          location,
          requestsDataArray,
          fileSize,
          indexOfFile,
          file,
          path,
          t,
          operationId,
          toFolderId,
          createNewIfExist,
        );
      })
      .catch((error) => {
        if (this.files[indexOfFile] === undefined) {
          this.primaryProgressDataStore.setPrimaryProgressBarData({
            operation: OPERATIONS_NAME.upload,
            completed: true,
            alert: true,
          });
          return Promise.resolve();
        }
        let errorMessage = "";
        if (typeof error === "object") {
          errorMessage =
            error?.response?.data?.error?.message ||
            error?.statusText ||
            error?.message ||
            "";
        } else {
          errorMessage = error;
        }

        runInAction(() => {
          this.files[indexOfFile].error = errorMessage;
          const fileIndex = this.uploadedFilesHistory.findIndex(
            (f) => f.uniqueId === this.files[indexOfFile].uniqueId,
          );
          if (fileIndex > -1)
            this.uploadedFilesHistory[fileIndex].error = errorMessage;
        });

        // const index = error?.chunkIndex ?? 0;

        // const uploadedSize = error?.isFinalize
        //   ? 0
        //   : fileSize <= chunkUploadSize
        //     ? fileSize
        //     : fileSize - index * chunkUploadSize;

        const newPercent = this.getFilesPercent();
        this.percent = newPercent;

        const allFilesIsUploaded =
          this.files.findIndex(
            (f) =>
              f.action !== "uploaded" &&
              f.action !== "convert" &&
              f.action !== "converted" &&
              !f.error &&
              !f.cancel,
          ) === -1;

        this.primaryProgressDataStore.setPrimaryProgressBarData({
          operation: OPERATIONS_NAME.upload,
          percent: newPercent,
          completed: allFilesIsUploaded,
          alert: true,
        });

        this.currentUploadNumber -= 1;

        const nextFileIndex = this.files.findIndex((f) => !f.inAction);

        if (nextFileIndex !== -1) {
          this.startSessionFunc(nextFileIndex, t, createNewIfExist);
        }

        return Promise.resolve();
      })
      .finally(() => {
        const allFilesIsUploaded =
          this.files.findIndex(
            (f) =>
              f.action !== "uploaded" &&
              f.action !== "convert" &&
              f.action !== "converted" &&
              !f.error &&
              !f.cancel,
          ) === -1;

        if (allFilesIsUploaded && !this.finishUploadFilesCalled) {
          this.finishUploadFilesCalled = true;

          if (!this.filesToConversion.length) {
            this.finishUploadFiles(t, !!this.tempConversionFiles.length);
          } else {
            runInAction(() => {
              this.uploaded = true;
              this.asyncUploadObj = {};
            });
            const uploadedFiles = this.files.filter(
              (x) => x.action === "uploaded",
            );
            const totalErrorsCount = sumBy(uploadedFiles, (f) =>
              f.error ? 1 : 0,
            );
            if (totalErrorsCount > 0)
              console.log("Upload errors: ", totalErrorsCount);
          }
        }
      });
  };

  showFinishUploadToastr = (
    t,
    totalErrorsCount,
    filesWithoutErrors,
    filesWithErrors,
    filesWithAllErrors,
  ) => {
    if (totalErrorsCount === 0) {
      toastr.success(
        t("Common:ItemsSuccessfullyUploaded", {
          count: filesWithoutErrors.length,
        }),
      );
      return;
    }

    this.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: OPERATIONS_NAME.upload,
      alert: true,
      errorCount: filesWithAllErrors,
    });

    this.uploadedFilesHistory.forEach((f) => {
      f.errorShown = true;
    });

    console.log("Errors: ", totalErrorsCount);

    if (totalErrorsCount > 1) {
      toastr.error(t("UploadPanel:UploadingError"));
      return;
    }

    const errorItem = filesWithErrors[0];
    const passwordErrorIndex = errorItem.error.indexOf("password");

    if (passwordErrorIndex === -1) {
      toastr.error(errorItem.error);
      return;
    }

    toastr.warning(
      <Trans
        i18nKey="Common:PasswordProtectedFiles"
        t={t}
        components={[
          <Link
            key="a"
            tag="a"
            isHovered
            color="accent"
            onClick={() => {
              toastr.clear();
              this.setUploadPanelVisible(true);
            }}
          />,
        ]}
      />,
      null,
      60000,
      true,
    );
  };

  finishUploadFiles = (t, waitConversion) => {
    const filesWithErrors = this.uploadedFilesHistory.filter(
      (f) => f.error && !f.errorShown,
    );
    const filesWithAllErrors = this.uploadedFilesHistory.filter((f) => f.error);
    const filesWithoutErrors = this.uploadedFilesHistory.filter(
      (f) => !f.error,
    );

    this.showFinishUploadToastr(
      t,
      filesWithAllErrors.length,
      filesWithoutErrors,
      filesWithErrors,
      filesWithAllErrors.length,
    );

    this.uploaded = true;
    this.converted = true;
    this.uploadedFilesSize = 0;
    this.asyncUploadObj = {};

    this.files = this.files.map((f) => {
      f.isCalculated = true;
      return f;
    });

    const uploadData = {
      filesSize: 0,
      uploadedFiles: 0,
      percent: 0,
      conversionPercent: 0,
      totalErrorsCount: 0,
    };

    if (this.files.length > 0) {
      const toFolderId = this.files[0]?.toFolderId;

      if (toFolderId) {
        SocketHelper?.emit(SocketCommands.RefreshFolder, {
          toFolderId,
        });
      }
    }

    if (!waitConversion)
      this.primaryProgressDataStore.setPrimaryProgressBarData({
        operation: OPERATIONS_NAME.upload,
        completed: true,
      });

    setTimeout(() => {
      if (this.uploadPanelVisible || this.primaryProgressDataStore.alert) {
        uploadData.files = this.files;
        uploadData.filesToConversion = this.filesToConversion;
      }

      this.setUploadData(uploadData);
    }, TIMEOUT);
  };

  copyToAction = (
    destFolderId,
    folderIds,
    fileIds,
    conflictResolveType,
    deleteAfter,
    operationId,
    content,
    toFillOut,
  ) => {
    const { setSecondaryProgressBarData } = this.secondaryProgressDataStore;

    const pbData = {
      operation: OPERATIONS_NAME.copy,
      operationId,
    };

    return copyToFolder(
      destFolderId,
      folderIds,
      fileIds,
      conflictResolveType,
      deleteAfter,
      content,
      toFillOut,
    )
      .then((res) => {
        let data = null;
        const operation = res[0];

        if (operation) {
          if (operation?.error) {
            return Promise.reject(operation);
          }

          data = operation ?? null;
        }

        if (!data) {
          return Promise.reject();
        }
        return this.loopFilesOperations(data, pbData)
          .then((result) => {
            this.moveToCopyTo(destFolderId, pbData, true, fileIds, folderIds);
            return result;
          })
          .finally(async () => {
            // to update the status of trashIsEmpty filesStore
            if (this.treeFoldersStore.isRecycleBinFolder)
              await this.filesStore.getIsEmptyTrash();
          });
      })
      .catch((err) => {
        setSecondaryProgressBarData({
          completed: true,
          alert: true,
          operationId,
          operation: pbData.operation,
          error: err,
        });
        this.clearActiveOperations(fileIds, folderIds);

        return Promise.reject(err);
      });
  };

  moveToAction = (
    destFolderId,
    folderIds,
    fileIds,
    conflictResolveType,
    deleteAfter,
    operationId,
    toFillOut,
  ) => {
    const { setSecondaryProgressBarData } = this.secondaryProgressDataStore;
    const { refreshFiles, setMovingInProgress } = this.filesStore;
    const pbData = { operation: OPERATIONS_NAME.move, operationId };
    return moveToFolder(
      destFolderId,
      folderIds,
      fileIds,
      conflictResolveType,
      deleteAfter,
      toFillOut,
    )
      .then((res) => {
        let data = null;

        const operation = res[0];
        if (operation) {
          if (operation?.error) {
            return Promise.reject(operation);
          }

          data = operation ?? null;
        }

        if (!data) {
          return Promise.reject();
        }

        return this.loopFilesOperations(data, pbData)
          .then((result) => {
            this.moveToCopyTo(destFolderId, pbData, false, fileIds, folderIds);
            return result;
          })
          .finally(async () => {
            // to update the status of trashIsEmpty filesStore
            if (this.treeFoldersStore.isRecycleBinFolder)
              await this.filesStore.getIsEmptyTrash();
          });
      })
      .catch((err) => {
        setSecondaryProgressBarData({
          completed: true,
          alert: true,
          operationId,
          operation: pbData.operation,
          error: err,
        });
        this.clearActiveOperations(fileIds, folderIds);

        return Promise.reject(err);
      })
      .finally(() => {
        refreshFiles().then(() => setMovingInProgress(false));
      });
  };

  copyAsAction = (fileId, title, folderId, enableExternalExt, password) => {
    const { fetchFiles, filter } = this.filesStore;

    return fileCopyAs(fileId, title, folderId, enableExternalExt, password)
      .then(() => fetchFiles(folderId, filter, true, true))
      .catch((err) => {
        return Promise.reject(err);
      });
  };

  /**
   * @returns {Promise<import("@docspace/shared/api/files/types").TOperation>}
   */
  itemOperationToFolder = (data) => {
    const {
      destFolderId,
      destFolderInfo,
      folderIds,
      fileIds,
      deleteAfter,
      isCopy,
      content,
      title,
      itemsCount,
      isFolder,
      toFillOut,
    } = data;
    const { setSecondaryProgressBarData } = this.secondaryProgressDataStore;

    const conflictResolveType = data.conflictResolveType
      ? data.conflictResolveType
      : ConflictResolveType.Duplicate;

    const operationId = uniqueid("operation_");

    const operation = isCopy ? OPERATIONS_NAME.copy : OPERATIONS_NAME.move;

    setSecondaryProgressBarData({
      operation,
      percent: 0,
      operationId,
      title,
      itemsCount,
      operationIds: [...folderIds],
      destFolderInfo,
      isFolder,
    });

    return isCopy
      ? this.copyToAction(
          destFolderId,
          folderIds,
          fileIds,
          conflictResolveType,
          deleteAfter,
          operationId,
          content,
          toFillOut,
        )
      : this.moveToAction(
          destFolderId,
          folderIds,
          fileIds,
          conflictResolveType,
          deleteAfter,
          operationId,
          toFillOut,
        );
  };

  loopFilesOperations = async (data, pbData) => {
    const { setSecondaryProgressBarData } = this.secondaryProgressDataStore;

    if (!data) {
      setSecondaryProgressBarData({
        operation: pbData.operation,
        alert: false,
        completed: true,
        operationId: pbData.operationId,
      });

      return;
    }

    // let progress = data.progress;

    let operationItem = data;
    let finished = data.finished;

    while (!finished) {
      const item = await getOperationProgress(
        data.id,
        getUnexpectedErrorText(),
        true,
      );
      operationItem = item;

      // progress = item ? item.progress : 100;
      finished = item ? item.finished : true;

      setSecondaryProgressBarData({
        operation: pbData.operation,
        //  percent: progress,
        alert: false,
        currentFile: item,
        operationId: pbData.operationId,
      });
    }

    return operationItem;
  };

  navigateToNewFolderLocation = async (folderId) => {
    const { filter } = this.filesStore;

    filter.folder = folderId;

    try {
      const { rootFolderType, parentId } = await getFolderInfo(folderId);
      const path = getCategoryUrl(
        getCategoryTypeByFolderType(rootFolderType, parentId),
        folderId,
      );

      window.DocSpace.navigate(`${path}?${filter.toUrlParams()}`, {
        replace: true,
      });
    } catch (e) {
      console.log(e);
    }
  };

  moveToCopyTo = (destFolderId, pbData, isCopy, fileIds, folderIds) => {
    const { removeFiles } = this.filesStore;

    const { setSecondaryProgressBarData } = this.secondaryProgressDataStore;
    const isMovingSelectedFolder =
      !isCopy && folderIds && this.selectedFolderStore.id === folderIds[0];

    if (!isCopy || destFolderId === this.selectedFolderStore.id) {
      !isCopy && removeFiles(fileIds, folderIds);
      this.clearActiveOperations(fileIds, folderIds);

      isMovingSelectedFolder &&
        this.navigateToNewFolderLocation(this.selectedFolderStore.id);
      this.dialogsStore.setIsFolderActions(false);
    } else {
      this.clearActiveOperations(fileIds, folderIds);
    }

    setSecondaryProgressBarData({
      operation: pbData.operation,
      percent: 100,
      completed: true,
      operationId: pbData.operationId,
    });
  };

  clearActiveOperations = (fileIds = [], folderIds = []) => {
    const { activeFiles, activeFolders, setActiveFiles, setActiveFolders } =
      this.filesStore;

    const newActiveFiles = activeFiles.filter(
      (el) => !fileIds?.includes(el.id),
    );
    const newActiveFolders = activeFolders.filter(
      (el) => !folderIds?.includes(el.id),
    );

    setActiveFiles(newActiveFiles);
    setActiveFolders(newActiveFolders);
  };
}

export default UploadDataStore;
