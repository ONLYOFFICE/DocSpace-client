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
import api from "@docspace/shared/api";
import { size } from "@docspace/shared/utils";
import { FileStatus } from "@docspace/shared/enums";

class VersionHistoryStore {
  isVisible = false;
  fileId = null;

  fileSecurity = null;
  versions = null;
  filesStore = null;
  showProgressBar = false;
  timerId = null;
  isEditing = false;

  constructor(filesStore, settingsStore) {
    makeAutoObservable(this);
    this.filesStore = filesStore;

    if (this.versions) {
      //TODO: Files store in not initialized on versionHistory page. Need socket.

      const { socketHelper } = settingsStore;

      socketHelper.on("s:start-edit-file", (id) => {
        //console.log(`VERSION STORE Call s:start-edit-file (id=${id})`);
        const verIndex = this.versions.findIndex((x) => x.id == id);
        if (verIndex == -1) return;

        runInAction(() => (this.isEditing = true));
      });

      socketHelper.on("s:stop-edit-file", (id) => {
        //console.log(`VERSION STORE Call s:stop-edit-file (id=${id})`);
        const verIndex = this.files.findIndex((x) => x.id === id);
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

  //setFileVersions
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

  fetchFileVersions = (fileId, access, requestToken) => {
    if (this.fileId !== fileId || !this.versions) {
      this.setVerHistoryFileId(fileId);
      this.setVerHistoryFileSecurity(access);

      return api.files
        .getFileVersionInfo(fileId, requestToken)
        .then((versions) => this.setVerHistoryFileVersions(versions));
    } else {
      return Promise.resolve(this.versions);
    }
  };

  markAsVersion = (id, isVersion, version) => {
    return api.files
      .markAsVersion(id, isVersion, version)
      .then((versions) => this.setVerHistoryFileVersions(versions));
  };

  restoreVersion = (id, version) => {
    this.timerId = setTimeout(() => this.setShowProgressBar(true), 100);

    return api.files
      .versionRestore(id, version)
      .then((newVersion) => {
        const updatedVersions = this.versions.slice();
        updatedVersions.unshift(newVersion);
        this.setVerHistoryFileVersions(updatedVersions);
      })
      .catch((e) => console.error(e))
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
}

export default VersionHistoryStore;
