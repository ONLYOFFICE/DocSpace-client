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

import { makeAutoObservable, runInAction } from "mobx";
import { Trans } from "react-i18next";
import { TIMEOUT } from "@docspace/client/src/helpers/filesConstants";
import uniqueid from "lodash/uniqueId";
import sumBy from "lodash/sumBy";
import uniqBy from "lodash/uniqBy";
import { ConflictResolveType } from "@docspace/shared/enums";
import SocketHelper, { SocketCommands } from "@docspace/shared/utils/socket";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";
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

import {
  isMobile as isMobileUtils,
  isTablet as isTabletUtils,
} from "@docspace/shared/utils";
import { getUnexpectedErrorText } from "SRC_DIR/helpers/filesUtils";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import { globalColors } from "@docspace/shared/themes";

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
  filesSize = 0;
  tempConversionFiles = [];
  filesToConversion = [];
  convertFilesSize = 0;
  uploadToFolder = null;
  uploadedFiles = 0;
  percent = 0;
  conversionPercent = 0;
  uploaded = true;
  converted = true;
  uploadPanelVisible = false;
  selectedUploadFile = [];
  errors = 0;

  isUploading = false;
  isUploadingAndConversion = false;

  isConvertSingleFile = false;

  currentUploadNumber = 0;
  uploadedFilesSize = 0;

  asyncUploadObj = {};

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

  setUploadData = (uploadData) => {
    const uploadDataItems = Object.keys(uploadData);
    for (let key of uploadDataItems) {
      if (key in this) {
        this[key] = uploadData[key];
      }
    }
  };

  setIsConvertSingleFile = (isConvertSingleFile) => {
    this.isConvertSingleFile = isConvertSingleFile;
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

  removeFileFromList = (id) => {
    this.files = this.files.filter((obj) => {
      return obj.fileId !== id;
    });
  };

  clearUploadedFiles = () => {
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
    let newFiles = [];

    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].fileId) {
        newFiles.push(this.files[i]);
      }
    }

    const newUploadData = {
      files: newFiles,
      filesSize: this.filesSize,
      uploadedFiles: this.uploadedFiles,
      percent: 100,
      uploaded: true,
      converted: true,
      currentUploadNumber: 0,
    };

    const newHistory = this.uploadedFilesHistory.filter(
      (el) => el.action === "uploaded",
    );

    if (newUploadData.files.length === 0) this.setUploadPanelVisible(false);
    this.setUploadData(newUploadData);
    this.uploadedFilesHistory = newHistory;

    toastr.info(t("CancelUpload"));
  };

  cancelConversion = () => {
    let newFiles = [];

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

  cancelCurrentUpload = (id, t) => {
    runInAction(() => {
      const uploadedFilesHistory = this.uploadedFilesHistory.filter(
        (el) => el.uniqueId !== id,
      );

      const canceledFile = this.files.find((f) => f.uniqueId === id);
      const newPercent = this.getFilesPercent(canceledFile.file.size);
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

    const files = this.files.filter((el) => el.fileId + "" !== fileId);
    const filesToConversion = this.filesToConversion.filter(
      (el) => el.fileId + "" !== fileId,
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

  convertFile = (file, t, isOpen) => {
    this.dialogsStore.setConvertItem(null);

    const secondConvertingWithPassword = file.hasOwnProperty("password");
    const conversionPositionIndex = file.hasOwnProperty("index");

    let alreadyConverting = this.files.some(
      (item) => item.fileId === file.fileId,
    );

    if (this.isConvertSingleFile) alreadyConverting = false;

    if (this.converted && !alreadyConverting) {
      this.filesToConversion = [];
      this.convertFilesSize = 0;
      if (!secondConvertingWithPassword)
        this.files = this.files.filter((f) => f.action === "converted");

      this.primaryProgressDataStore.clearPrimaryProgressData();
    }

    if (!alreadyConverting) {
      if (secondConvertingWithPassword && conversionPositionIndex) {
        this.files.splice(file.index, 0, file);
      } else {
        this.files.push(file);
      }

      if (!this.filesToConversion.length) {
        this.filesToConversion.push(file);

        if (secondConvertingWithPassword && conversionPositionIndex) {
          this.uploadedFilesHistory[file.index].error = null; //reset error to show loader for convert with password
        } else {
          this.uploadedFilesHistory.push(file);
        }

        this.startConversion(t, isOpen);
      } else {
        this.filesToConversion.push(file);
        if (!secondConvertingWithPassword && !conversionPositionIndex)
          this.uploadedFilesHistory.push(file);
      }
    }

    this.setIsConvertSingleFile(false);
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

  getFilesPercent = (uploadedSize) => {
    const newSize = this.uploadedFilesSize + uploadedSize;
    this.uploadedFilesSize = newSize;

    const newTotalSize = sumBy(this.files, (f) =>
      !f.isCalculated && f.file && !this.uploaded ? f.file.size : 0,
    );

    const newPercent = (newSize / newTotalSize) * 100;

    /*console.log(
    `newPercent=${newPercent} (newTotalSize=${newTotalSize} totalUploadedSize=${totalUploadedSize} indexOfFile=${indexOfFile})`
  );*/

    return newPercent;
  };

  getConversationProgress = async (fileId) => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          getFileConversationProgress(fileId).then((res) => {
            //console.log(`getFileConversationProgress fileId:${fileId}`, res);
            resolve(res);
          });
        } catch (error) {
          console.error(error);
          reject(error);
        }
      }, 1000);
    });

    return promise;
  };

  setConversionPercent = (percent, alert) => {
    const data = { icon: "file", percent, visible: true };

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

  startConversion = async (t, isOpen = false) => {
    const { isRecentFolder, isFavoritesFolder, isShareFolder } =
      this.treeFoldersStore;

    if (!this.converted) return;

    const { storeOriginalFiles } = this.filesSettingsStore;

    const isSortedFolder = isRecentFolder || isFavoritesFolder || isShareFolder;
    const needToRefreshFilesList = !isSortedFolder || !storeOriginalFiles;

    runInAction(() => (this.converted = false));
    this.setConversionPercent(0);

    let index = 0;
    let len = this.filesToConversion.length;
    let filesToConversion = this.filesToConversion;

    while (index < len) {
      const conversionItem = filesToConversion[index];
      const { fileId, toFolderId, password, format } = conversionItem;
      const itemPassword = password ? password : null;
      const file = this.files.find((f) => f.fileId === fileId);
      if (file) runInAction(() => (file.inConversion = true));

      const historyFile = this.uploadedFilesHistory.find(
        (f) => f.fileId === fileId,
      );
      if (historyFile) runInAction(() => (historyFile.inConversion = true));

      const numberFiles = this.files.filter((f) => f.needConvert).length;

      const res = convertFile(fileId, format, itemPassword)
        .then((res) => res)
        .catch(() => {
          const error = t("FailedToConvert");

          runInAction(() => {
            if (file) file.error = error;
            if (historyFile) historyFile.error = error;
          });

          if (this.uploaded) {
            const primaryProgressData = {
              icon: "file",
              alert: true,
            };

            this.primaryProgressDataStore.setPrimaryProgressBarData(
              numberFiles === 1
                ? { ...primaryProgressData, ...{ percent: 100 } }
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
          const res = await this.getConversationProgress(fileId);
          progress = res && res[0] && res[0].progress;
          fileInfo = res && res[0] && res[0].result;

          runInAction(() => {
            const file = this.files.find((file) => file.fileId === fileId);
            if (file) file.convertProgress = progress;

            const historyFile = this.uploadedFilesHistory.find(
              (file) => file.fileId === fileId,
            );
            if (historyFile) historyFile.convertProgress = progress;
          });

          error = res && res[0] && res[0].error;
          if (error.length) {
            const percent = this.getConversationPercent(index + 1);
            this.setConversionPercent(percent, !!error);

            runInAction(() => {
              const file = this.files.find((file) => file.fileId === fileId);
              if (file) {
                file.error = error;
                file.inConversion = false;
                if (fileInfo === "password") file.needPassword = true;
              }

              const historyFile = this.uploadedFilesHistory.find(
                (file) => file.fileId === fileId,
              );

              if (historyFile) {
                historyFile.error = error;
                historyFile.inConversion = false;
                if (fileInfo === "password") historyFile.needPassword = true;
              }
            });

            //this.refreshFiles(toFolderId, false);
            break;
          }

          const percent = this.getConversationPercent(index + 1);

          if (numberFiles === 1 && !(isMobileUtils() || isTabletUtils())) {
            this.setConversionPercent(progress);
          } else {
            this.setConversionPercent(percent);
          }
        }

        if (progress === 100) {
          if (!error) error = data[0].error;

          if (!error && isOpen && data && data[0]) {
            this.filesStore.openDocEditor(fileInfo.id);
          }

          runInAction(() => {
            const file = this.files.find((file) => file.fileId === fileId);

            if (file) {
              file.error = error;
              file.convertProgress = progress;
              file.inConversion = false;
              file.fileInfo = fileInfo;

              if (error.indexOf("password") !== -1) {
                file.needPassword = true;
              } else file.action = "converted";
            }

            const historyFile = this.uploadedFilesHistory.find(
              (file) => file.fileId === fileId,
            );

            if (historyFile) {
              historyFile.error = error;
              historyFile.convertProgress = progress;
              historyFile.inConversion = false;

              if (error.indexOf("password") !== -1) {
                historyFile.needPassword = true;
              } else historyFile.action = "converted";
            }
          });

          storeOriginalFiles &&
            fileInfo &&
            fileInfo !== "password" &&
            this.refreshFiles(file);

          if (fileInfo && fileInfo !== "password") {
            file.fileInfo = fileInfo;
            historyFile.fileInfo = fileInfo;
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
                .catch((error) => toastr.error(error));
          }
          const percent = this.getConversationPercent(index + 1);
          this.setConversionPercent(percent, !!error);

          if (!file.error && file.fileInfo.version > 2) {
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
      this.setConversionPercent(100);
      this.finishUploadFiles(t);
    } else {
      runInAction(() => {
        this.converted = true;
        this.filesToConversion = [];
        this.conversionPercent = 0;
      });
    }
  };

  convertUploadedFiles = (t, createNewIfExist = true) => {
    this.files = [...this.files, ...this.tempConversionFiles];
    this.uploadedFilesHistory = [
      ...this.uploadedFilesHistory,
      ...this.tempConversionFiles,
    ];

    if (this.uploaded) {
      let newUploadData = {
        files: this.files,
        filesSize: this.convertFilesSize,
        uploadedFiles: this.uploadedFiles,
        percent: this.percent,
        uploaded: false,
        // converted: false,
      };

      this.tempConversionFiles = [];

      this.setUploadData(newUploadData);
      this.startUploadFiles(t, createNewIfExist);
    }
    this.tempConversionFiles = [];
  };

  cancelUploadAction = (items) => {
    const files =
      items ?? this.dialogsStore.conflictResolveDialogData.newUploadData.files;

    let i = files.length;
    while (i !== 0) {
      this.files = this.files.filter((f) => f.uniqueId === files[i - 1]);

      this.tempConversionFiles = this.tempConversionFiles.filter(
        (f) => f.uniqueId === files[i - 1],
      );
      i--;
    }

    if (this.uploaded) {
      this.primaryProgressDataStore.clearPrimaryProgressData();
    }
  };

  setConflictDialogData = (conflicts, operationData) => {
    this.dialogsStore.setConflictResolveDialogItems(conflicts);
    this.dialogsStore.setConflictResolveDialogData(operationData);
    this.dialogsStore.setConflictResolveDialogVisible(true);
  };

  handleFilesUpload = (newUploadData, t, createNewIfExist = true) => {
    this.uploadedFilesHistory = newUploadData.files;
    this.setUploadData(newUploadData);
    this.startUploadFiles(t, createNewIfExist);
  };

  conflictDialogUploadHandler = (uploadData, t, createNewIfExist) => {
    const newUploadData = { ...uploadData };
    newUploadData.files = newUploadData.filesWithoutConversion;
    this.handleFilesUpload(newUploadData, t, createNewIfExist);

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

  handleUploadConflicts = async (t, toFolderId, uploadData) => {
    const filesArray = uploadData.files.map((fileInfo) => fileInfo.file.name);
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
      const newUploadData = { ...uploadData };
      newUploadData.files = newUploadData.filesWithoutConversion;
      this.handleFilesUpload(newUploadData, t);

      if (this.tempConversionFiles.length) {
        if (this.filesSettingsStore.hideConfirmConvertSave) {
          this.convertUploadedFiles(t);
        } else {
          this.dialogsStore.setConvertDialogVisible(true);
          this.dialogsStore.setConvertDialogData({
            createNewIfExist: true,
            isUploadAction: true,
            files: uploadData.conversionFiles,
          });
        }
      }
    }
  };

  startUpload = (uploadFiles, folderId, t) => {
    const { canConvert } = this.filesSettingsStore;

    const toFolderId = folderId ? folderId : this.selectedFolderStore.id;

    if (this.uploaded) {
      this.files = this.files.filter((f) => f.action !== "upload");
      this.filesSize = 0;
      this.uploadToFolder = null;
      this.percent = 0;
    }
    if (this.uploaded && this.converted) {
      this.files = [];
      this.filesToConversion = [];
      this.uploadedFilesSize = 0;
      this.asyncUploadObj = {};
    }

    let newFiles = this.files;
    let allFiles = [];
    let filesSize = 0;
    let convertSize = 0;

    const uploadFilesArray = Object.keys(uploadFiles);

    for (let index of uploadFilesArray) {
      const file = uploadFiles[index];

      const parts = file.name.split(".");
      const ext = parts.length > 1 ? "." + parts.pop() : "";
      const needConvert = canConvert(ext);

      const newFile = {
        file: file,
        uniqueId: uniqueid("download_row-key_"),
        fileId: null,
        // toFolderId,
        toFolderId: file.parentFolderId,
        action: "upload",
        error: file.size ? null : t("Files:EmptyFile"),
        fileInfo: null,
        cancel: false,
        needConvert,
        encrypted: file.encrypted,
      };

      if (needConvert) {
        this.tempConversionFiles.push(newFile);
      } else {
        newFiles.push(newFile);
      }

      allFiles.push(newFile);

      filesSize += file.size;
      convertSize += file.size;
    }

    const countUploadingFiles = this.removeDuplicate([
      ...this.files,
      ...newFiles,
    ]).length;
    const countConversionFiles = this.tempConversionFiles.length;

    if (countUploadingFiles && !countConversionFiles) {
      this.isUploading = true;
    } else {
      this.isUploadingAndConversion = true;
    }
    this.convertFilesSize = convertSize;

    //console.log("this.tempConversionFiles", this.tempConversionFiles);

    const clearArray = this.removeDuplicate([
      ...newFiles,
      ...this.uploadedFilesHistory,
    ]);

    this.uploadedFilesHistory = clearArray;

    let newUploadData = {
      filesWithoutConversion: this.removeDuplicate([
        ...this.files,
        ...newFiles,
      ]),
      conversionFiles: this.removeDuplicate(this.tempConversionFiles),
      files: this.removeDuplicate(allFiles),
      filesSize,
      uploadedFiles: this.uploadedFiles,
      percent: this.percent,
      uploaded: false,
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
      const path = currentFile.path ? currentFile.path.slice() : [];
      const fileIndex = newFiles.findIndex(
        (x) => x.id === currentFile.fileInfo.id,
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
        } else {
          if (currentFile && currentFile.fileInfo) {
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
      allChunkUploaded, // needed for progress, files is uploaded, awaiting finalized chunk
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

    let uploadedSize, newPercent;

    if (!uploaded && !allChunkUploaded) {
      uploadedSize =
        fileSize <= this.filesSettingsStore.chunkUploadSize
          ? fileSize
          : this.filesSettingsStore.chunkUploadSize;
    } else {
      uploadedSize = isFinalize
        ? 0
        : fileSize <= this.filesSettingsStore.chunkUploadSize
          ? fileSize
          : fileSize - index * this.filesSettingsStore.chunkUploadSize;
    }
    newPercent = this.getFilesPercent(uploadedSize);

    const percentCurrentFile = (index / chunksLength) * 100;

    const fileIndex = this.uploadedFilesHistory.findIndex(
      (f) => f.uniqueId === this.files[indexOfFile].uniqueId,
    );
    if (fileIndex > -1)
      this.uploadedFilesHistory[fileIndex].percent = percentCurrentFile;

    this.primaryProgressDataStore.setPrimaryProgressBarData({
      icon: "upload",
      percent: newPercent,
      visible: true,
      loadingFile: {
        uniqueId: this.files[indexOfFile].uniqueId,
        percent: percentCurrentFile,
      },
    });

    if (uploaded) {
      runInAction(() => {
        this.files[indexOfFile].action = "uploaded";
        this.files[indexOfFile].fileId = fileId;
        this.files[indexOfFile].fileInfo = fileInfo;

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
    currentFile.path = path;
    if (!currentFile) return resolve();
    const { needConvert } = currentFile;

    const isXML = currentFile.fileInfo?.fileExst?.includes(".xml");

    if (isXML) return resolve();

    if (needConvert) {
      runInAction(() => (currentFile.action = "convert"));

      if (!currentFile.fileId) return;

      if (!this.filesToConversion.length || this.converted) {
        this.filesToConversion.push(currentFile);
        this.startConversion(t);
      } else {
        this.filesToConversion.push(currentFile);
      }
      return resolve();
    } else {
      if (currentFile.action === "uploaded") {
        this.refreshFiles(currentFile);
      }
      if (!isAsyncUpload || res.status === 201) {
        return resolve();
      }
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
        } else
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
              location + `&chunkNumber=${index + 1}&upload=true`,
              requestsDataArray[index],
            ),
        });
      }
      chunksArray.push({
        isActive: false,
        isFinished: false,
        isFinalize: true,
        onUpload: () => uploadFile(location + "&finalize=true"),
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
        const resolve = (res) => Promise.resolve(res);
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

        //console.log(`Uploaded chunk ${index}/${length}`, res);
      }
    }
  };

  startUploadFiles = async (t, createNewIfExist = true) => {
    let files = this.files;

    if (files.length === 0 || this.filesSize === 0) {
      return this.finishUploadFiles(t);
    }

    const progressData = {
      visible: true,
      percent: this.percent,
      icon: "upload",
      alert: false,
    };

    this.primaryProgressDataStore.setPrimaryProgressBarData(progressData);

    const notUploadedFiles = this.files.filter((f) => !f.inAction);

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

  startSessionFunc = (indexOfFile, t, createNewIfExist = true) => {
    // console.log("START UPLOAD SESSION FUNC");

    if (!this.uploaded && this.files.length === 0) {
      this.uploaded = true;
      this.asyncUploadObj = {};
      //setUploadData(uploadData);
      return;
    }

    const item = this.files[indexOfFile];
    this.files[indexOfFile].inAction = true;

    if (!item) {
      console.error("Empty files");
      return Promise.resolve();
    } else if (
      item.action === "uploaded" ||
      item.action === "convert" ||
      item.action === "converted"
    ) {
      return Promise.resolve();
    }

    const { chunkUploadSize } = this.filesSettingsStore;

    const { file, toFolderId /*, action*/ } = item;
    const chunks = Math.ceil(file.size / chunkUploadSize, chunkUploadSize);
    const fileName = file.name;
    const fileSize = file.size;
    const relativePath = file.path
      ? file.path.slice(1, -file.name.length)
      : file.webkitRelativePath
        ? file.webkitRelativePath.slice(0, -file.name.length)
        : "";

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
          fileSize,
          path,
          operationId,
          toFolderId,
        };
      })
      .then(
        ({
          location,
          requestsDataArray,
          fileSize,
          path,
          t,
          operationId,
          toFolderId,
        }) => {
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
        },
      )
      .catch((error) => {
        if (this.files[indexOfFile] === undefined) {
          this.primaryProgressDataStore.setPrimaryProgressBarData({
            icon: "upload",
            percent: 0,
            visible: false,
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

        this.files[indexOfFile].error = errorMessage;

        const index = error?.chunkIndex ?? 0;

        const uploadedSize = error?.isFinalize
          ? 0
          : fileSize <= chunkUploadSize
            ? fileSize
            : fileSize - index * chunkUploadSize;

        const newPercent = this.getFilesPercent(uploadedSize);

        this.primaryProgressDataStore.setPrimaryProgressBarData({
          icon: "upload",
          percent: newPercent,
          visible: true,
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
              !f.error,
          ) === -1;

        if (allFilesIsUploaded) {
          if (!this.filesToConversion.length) {
            this.finishUploadFiles(t);
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

            setTimeout(() => {
              if (
                !this.uploadPanelVisible &&
                !totalErrorsCount &&
                this.converted
              ) {
                this.clearUploadedFiles();
              }
            }, TIMEOUT);
          }
        }
      });
  };

  finishUploadFiles = (t) => {
    const { fetchFiles, filter } = this.filesStore;

    const filesWithErrors = this.files.filter((f) => f.error);

    const totalErrorsCount = filesWithErrors.length;

    if (totalErrorsCount > 0) {
      const uniqErrors = uniqBy(filesWithErrors, "error");
      uniqErrors.forEach((f) =>
        f.error.indexOf("password") > -1
          ? toastr.warning(
              <Trans
                i18nKey="Files:PasswordProtectedFiles"
                t={t}
                components={[
                  <ColorTheme
                    tag="a"
                    themeId={ThemeId.Link}
                    isHovered
                    color={globalColors.link}
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
            )
          : toastr.error(f.error),
      );

      this.primaryProgressDataStore.setPrimaryProgressBarShowError(true); // for empty file
      this.primaryProgressDataStore.setPrimaryProgressBarErrors(
        totalErrorsCount,
      );
      console.log("Errors: ", totalErrorsCount);
    }

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
    };

    if (this.files.length > 0) {
      const toFolderId = this.files[0]?.toFolderId;

      if (toFolderId) {
        SocketHelper.emit(SocketCommands.RefreshFolder, {
          toFolderId,
        });
      }
    }

    setTimeout(() => {
      if (!this.primaryProgressDataStore.alert) {
        //this.primaryProgressDataStore.clearPrimaryProgressData();
      }

      if (this.uploadPanelVisible || this.primaryProgressDataStore.alert) {
        uploadData.files = this.files;
        uploadData.filesToConversion = this.filesToConversion;
      } else {
        // uploadData.files = [];
        // uploadData.filesToConversion = [];
        // this.isUploadingAndConversion = false;
        // this.isUploading = false;
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
  ) => {
    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      this.secondaryProgressDataStore;

    return copyToFolder(
      destFolderId,
      folderIds,
      fileIds,
      conflictResolveType,
      deleteAfter,
      content,
    )
      .then((res) => {
        const pbData = { icon: "duplicate", operationId };
        let data = null;

        if (res && res.length > 0) {
          if (res[res.length - 1]?.error) {
            return Promise.reject(res[res.length - 1]);
          }

          data = res[res.length - 1] ? res[res.length - 1] : null;
        }

        return this.loopFilesOperations(data, pbData)
          .then(() =>
            this.moveToCopyTo(destFolderId, pbData, true, fileIds, folderIds),
          )
          .finally(async () => {
            //to update the status of trashIsEmpty filesStore
            if (this.treeFoldersStore.isRecycleBinFolder)
              await this.filesStore.getIsEmptyTrash();
          });
      })
      .catch((err) => {
        setSecondaryProgressBarData({
          visible: true,
          alert: true,
          operationId,
        });
        this.clearActiveOperations(fileIds, folderIds);
        setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
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
  ) => {
    const { setSecondaryProgressBarData, clearSecondaryProgressData } =
      this.secondaryProgressDataStore;
    const { refreshFiles, setMovingInProgress } = this.filesStore;

    return moveToFolder(
      destFolderId,
      folderIds,
      fileIds,
      conflictResolveType,
      deleteAfter,
    )
      .then((res) => {
        const pbData = { icon: "move", operationId };
        let data = null;

        if (res && res.length > 0) {
          if (res[res.length - 1]?.error) {
            return Promise.reject(res[res.length - 1]);
          }

          data = res[res.length - 1] ? res[res.length - 1] : null;
        }

        return this.loopFilesOperations(data, pbData)
          .then(() =>
            this.moveToCopyTo(destFolderId, pbData, false, fileIds, folderIds),
          )
          .finally(async () => {
            //to update the status of trashIsEmpty filesStore
            if (this.treeFoldersStore.isRecycleBinFolder)
              await this.filesStore.getIsEmptyTrash();
          });
      })
      .catch((err) => {
        setSecondaryProgressBarData({
          visible: true,
          alert: true,
          operationId,
        });
        this.clearActiveOperations(fileIds, folderIds);
        setTimeout(() => clearSecondaryProgressData(operationId), TIMEOUT);
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

  fileCopyAs = async (fileId, title, folderId, enableExternalExt, password) => {
    return fileCopyAs(fileId, title, folderId, enableExternalExt, password);
  };
  itemOperationToFolder = (data) => {
    const {
      destFolderId,
      folderIds,
      fileIds,
      deleteAfter,
      isCopy,
      translations,
      content,
    } = data;
    const conflictResolveType = data.conflictResolveType
      ? data.conflictResolveType
      : ConflictResolveType.Duplicate;

    const operationId = uniqueid("operation_");

    this.secondaryProgressDataStore.setSecondaryProgressBarData({
      icon: isCopy ? "duplicate" : "move",
      visible: true,
      percent: 0,
      label: isCopy ? translations.copy : translations.move,
      alert: false,
      filesCount: this.secondaryProgressDataStore.filesCount + fileIds.length,
      operationId,
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
        )
      : this.moveToAction(
          destFolderId,
          folderIds,
          fileIds,
          conflictResolveType,
          deleteAfter,
          operationId,
        );
  };

  loopFilesOperations = async (data, pbData, isDownloadAction) => {
    const { clearSecondaryProgressData, setSecondaryProgressBarData } =
      this.secondaryProgressDataStore;

    if (!data) {
      setTimeout(() => clearSecondaryProgressData(pbData.operationId), TIMEOUT);
      return;
    }

    const label = this.secondaryProgressDataStore.label;
    let progress = data.progress;

    let operationItem = data;
    let finished = data.finished;

    while (!finished) {
      const item = await getOperationProgress(
        data.id,
        getUnexpectedErrorText(),
      );
      operationItem = item;

      progress = item ? item.progress : 100;
      finished = item
        ? isDownloadAction
          ? item.finished && item.url
          : item.finished
        : true;

      setSecondaryProgressBarData({
        icon: pbData.icon,
        label: pbData.label || label,
        percent: progress,
        visible: true,
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

    const { clearSecondaryProgressData, setSecondaryProgressBarData, label } =
      this.secondaryProgressDataStore;
    const isMovingSelectedFolder =
      !isCopy && folderIds && this.selectedFolderStore.id === folderIds[0];

    let receivedFolder = destFolderId;
    let updatedFolder = this.selectedFolderStore.id;

    if (this.dialogsStore.isFolderActions) {
      receivedFolder = this.selectedFolderStore.parentId;
      updatedFolder = destFolderId;
    }

    if (!isCopy || destFolderId === this.selectedFolderStore.id) {
      !isCopy && removeFiles(fileIds, folderIds);
      this.clearActiveOperations(fileIds, folderIds);
      setTimeout(() => clearSecondaryProgressData(pbData.operationId), TIMEOUT);
      isMovingSelectedFolder &&
        this.navigateToNewFolderLocation(this.selectedFolderStore.id);
      this.dialogsStore.setIsFolderActions(false);
      return;
    } else {
      this.clearActiveOperations(fileIds, folderIds);
      setSecondaryProgressBarData({
        icon: pbData.icon,
        label: pbData.label || label,
        percent: 100,
        visible: true,
        alert: false,
        operationId: pbData.operationId,
      });

      setTimeout(() => clearSecondaryProgressData(pbData.operationId), TIMEOUT);
    }
  };

  clearActiveOperations = (fileIds = [], folderIds = []) => {
    const { activeFiles, activeFolders, setActiveFiles, setActiveFolders } =
      this.filesStore;

    const newActiveFiles = activeFiles.filter(
      (el) => !fileIds?.includes(el.id),
    );
    const newActiveFolders = activeFolders.filter(
      (el) => !folderIds.includes(el.id),
    );

    setActiveFiles(newActiveFiles);
    setActiveFolders(newActiveFolders);
  };

  clearUploadedFilesHistory = () => {
    this.primaryProgressDataStore.clearPrimaryProgressData();
    this.uploadedFilesHistory = [];
  };

  removeDuplicate = (items) => {
    let obj = {};
    return items.filter((x) => {
      if (obj[x.uniqueId]) return false;
      obj[x.uniqueId] = true;
      return true;
    });
  };
}

export default UploadDataStore;
