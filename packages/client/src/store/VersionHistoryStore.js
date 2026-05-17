/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { makeAutoObservable, runInAction } from "mobx";
import api from "@docspace/shared/api";
import { FileStatus, FileAction } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import SocketHelper, { SocketEvents } from "@docspace/ui-kit/utils/socket";

class VersionHistoryStore {
  isVisible = false;

  fileId = null;

  fileSecurity = null;

  versions = null;

  filesStore = null;

  showProgressBar = false;

  timerId = null;

  isEditing = false;

  deleteVersionDialogVisible = false;

  versionSelectedForDeletion = null;

  versionDeletionProcess = false;

  constructor(filesStore, filesActionsStore) {
    makeAutoObservable(this);
    this.filesStore = filesStore;
    this.filesActionsStore = filesActionsStore;

    if (this.versions) {
      // TODO: Files store in not initialized on versionHistory page. Need socket.

      SocketHelper?.on(SocketEvents.StartEditFile, (data) => {
        const fileId = typeof data === "object" ? data.fileId : data;
        // console.log(`VERSION STORE Call s:start-edit-file (id=${fileId})`);
        const verIndex = this.versions.findIndex((x) => x.id == fileId);
        if (verIndex == -1) return;

        runInAction(() => (this.isEditing = true));
      });

      SocketHelper?.on(SocketEvents.StopEditFile, (data) => {
        const fileId = typeof data === "object" ? data.fileId : data;
        // console.log(`VERSION STORE Call s:stop-edit-file (id=${fileId})`);
        const verIndex = this.files.findIndex((x) => x.id === fileId);
        if (verIndex == -1) return;

        runInAction(() => (this.isEditing = false));
      });
    }
  }

  get isEditingVersion() {
    if (this.fileId && this.filesStore.files.length) {
      const file = this.filesStore.files.find((x) => x.id === +this.fileId);
      return file
        ? (file.fileStatus & FileStatus.IsEditing) === FileStatus.IsEditing
        : false;
    }
    return false;
  }

  setIsVerHistoryPanel = (isVisible) => {
    this.isVisible = isVisible;

    if (!isVisible) {
      this.setVersions(null);
      this.setVerHistoryFileId(null);
    }
  };

  setVerHistoryFileId = (fileId) => {
    this.fileId = fileId;
  };

  setVerHistoryFileSecurity = (security) => {
    this.fileSecurity = security;
  };

  setVersions = (versions) => {
    this.versions = versions;
  };

  setVersionSelectedForDeletion = (version) => {
    this.versionSelectedForDeletion = version;
  };

  setVersionDeletionProcess = (process) => {
    this.versionDeletionProcess = process;
  };

  // setFileVersions
  setVerHistoryFileVersions = (versions) => {
    const file = this.filesStore.files.find((item) => item.id == this.fileId);

    const currentVersion = versions.reduce((prev, current) => {
      return prev.versionGroup > current.versionGroup ? prev : current;
    });

    // const currentVersionGroup = Math.max.apply(
    //   null,
    //   versions.map((ver) => ver.versionGroup)
    // );

    // const currentComment =
    //   versions[versions.length - currentVersionGroup].comment;

    const newFile = {
      ...file,
      comment: currentVersion.comment,
      version: versions.length,
      versionGroup: currentVersion.versionGroup,
    };

    this.filesStore.setFile(newFile);

    this.versions = versions;
  };

  fetchFileVersions = (fileId, access, requestToken, update) => {
    if (this.fileId !== fileId || !this.versions || update) {
      if (!update) {
        this.setVerHistoryFileId(fileId);
        this.setVerHistoryFileSecurity(access);
      }

      return api.files
        .getFileVersionInfo(fileId, requestToken)
        .then((versions) => this.setVerHistoryFileVersions(versions));
    }
    return Promise.resolve(this.versions);
  };

  markAsVersion = (id, isVersion, version) => {
    return api.files
      .markAsVersion(id, isVersion, version)
      .then((versions) => this.setVerHistoryFileVersions(versions));
  };

  restoreVersion = (id, version) => {
    const { completeAction } = this.filesActionsStore;

    this.timerId = setTimeout(() => this.setShowProgressBar(true), 100);

    return api.files
      .versionRestore(id, version)
      .then((newVersion) => {
        const updatedVersions = this.versions.slice();
        updatedVersions.unshift(newVersion);
        this.setVerHistoryFileVersions(updatedVersions);
      })
      .then(() => {
        const file = this.filesStore.files.find((x) => x.id === +this.fileId);
        if (file) {
          completeAction(file, FileAction.RestoreVersion);
        }
      })
      .catch((e) => toastr.error(e))
      .finally(() => {
        clearTimeout(this.timerId);
        this.timerId = null;
        this.setShowProgressBar(false);
      });
  };

  updateCommentVersion = (id, comment, version) => {
    return api.files
      .versionEditComment(id, comment, version)
      .then((updatedComment) => {
        const copyVersions = this.versions.slice();
        const updatedVersions = copyVersions.map((item) => {
          if (item.version === version) {
            item.comment = updatedComment;
          }
          return item;
        });
        this.setVerHistoryFileVersions(updatedVersions);
      });
  };

  setShowProgressBar = (show) => {
    this.showProgressBar = show;
  };

  onSetDeleteVersionDialogVisible = (deleteVersionDialogVisible) => {
    this.deleteVersionDialogVisible = deleteVersionDialogVisible;
  };
}

export default VersionHistoryStore;
