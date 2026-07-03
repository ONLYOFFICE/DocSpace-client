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
import type { TFile } from "@docspace/shared/api/files/types";
import { FileStatus, FileAction } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import SocketHelper, { SocketEvents } from "@docspace/ui-kit/utils/socket";
import {
  resolveDisplayTitle,
  subscribeFilenameCache,
} from "@docspace/shared/services/encryption/filename-cache";

import type FilesActionsStore from "./FilesActionsStore";

// FABLE5-REVIEW: FilesStore is still .js (wave 3) — replace this structural
// type with `import type` once it is converted.
type TFilesStore = {
  files: TFile[];
  setFile: (file: TFile) => void;
  ensureEncryptedFilenameForFile?: (file: TFile) => void;
};

// Narrow interface (Track F): the only member of FilesActionsStore this
// store uses. The real store is attached post-construction in
// store/index.ts because the two stores reference each other.
type TFilesActionsStore = Pick<FilesActionsStore, "completeAction">;

class VersionHistoryStore {
  isVisible = false;

  fileId: number | string | null = null;

  fileSecurity: TFile["security"] | null | undefined = null;

  versions: TFile[] | null = null;

  // `null!` keeps the original runtime field initializer (null) while the
  // constructor immediately assigns the real store.
  filesStore: TFilesStore = null!;

  showProgressBar = false;

  timerId: ReturnType<typeof setTimeout> | null = null;

  isEditing = false;

  deleteVersionDialogVisible = false;

  versionSelectedForDeletion: number | null = null;

  versionDeletionProcess = false;

  filenameCacheVersion = 0;

  // `declare` (no emitted field): in the original .js this property did not
  // exist yet when makeAutoObservable ran — it is created by plain assignment
  // in the constructor body (and re-assigned from store/index.js), so it is
  // intentionally NOT observable.
  declare filesActionsStore: TFilesActionsStore;

  // FABLE5-REVIEW: `this.files` is referenced in the StopEditFile socket
  // handler below but is never assigned anywhere in this store — most likely
  // it should be `this.versions`. Declared (not initialized) to keep the
  // runtime shape identical: no own property, `undefined` at access time.
  declare files?: TFile[];

  constructor(filesStore: TFilesStore) {
    makeAutoObservable(this);
    this.filesStore = filesStore;

    subscribeFilenameCache(() => {
      runInAction(() => {
        this.filenameCacheVersion += 1;
      });
    });

    if (this.versions) {
      // TODO: Files store in not initialized on versionHistory page. Need socket.

      SocketHelper?.on(SocketEvents.StartEditFile, (data) => {
        const fileId = typeof data === "object" ? data.fileId : data;
        // console.log(`VERSION STORE Call s:start-edit-file (id=${fileId})`);
        // FABLE5-REVIEW: `this.versions` may be null by the time the socket
        // event fires — the original .js would throw here as well; `!` keeps
        // that runtime unchanged.
        const verIndex = this.versions!.findIndex((x) => x.id == fileId);
        if (verIndex == -1) return;

        runInAction(() => (this.isEditing = true));
      });

      SocketHelper?.on(SocketEvents.StopEditFile, (data) => {
        const fileId = typeof data === "object" ? data.fileId : data;
        // console.log(`VERSION STORE Call s:stop-edit-file (id=${fileId})`);
        // FABLE5-REVIEW: `this.files` is always undefined (see field note
        // above) — the original .js would throw here as well.
        const verIndex = this.files!.findIndex((x) => x.id === fileId);
        if (verIndex == -1) return;

        runInAction(() => (this.isEditing = false));
      });
    }
  }

  get fileTitle() {
    void this.filenameCacheVersion;
    const current = this.versions?.[0];
    return current ? resolveDisplayTitle(current) : "";
  }

  get isEditingVersion() {
    if (this.fileId && this.filesStore.files.length) {
      // `!` because the outer truthiness guard does not narrow inside the
      // callback; fileId is known non-null here.
      const file = this.filesStore.files.find((x) => x.id === +this.fileId!);
      return file
        ? (file.fileStatus & FileStatus.IsEditing) === FileStatus.IsEditing
        : false;
    }
    return false;
  }

  setIsVerHistoryPanel = (isVisible: boolean) => {
    this.isVisible = isVisible;

    if (!isVisible) {
      this.setVersions(null);
      this.setVerHistoryFileId(null);
    }
  };

  setVerHistoryFileId = (fileId: number | string | null) => {
    this.fileId = fileId;
  };

  setVerHistoryFileSecurity = (
    security: TFile["security"] | null | undefined,
  ) => {
    this.fileSecurity = security;
  };

  setVersions = (versions: TFile[] | null) => {
    this.versions = versions;
  };

  setVersionSelectedForDeletion = (version: number | null) => {
    this.versionSelectedForDeletion = version;
  };

  setVersionDeletionProcess = (process: boolean) => {
    this.versionDeletionProcess = process;
  };

  // setFileVersions
  setVerHistoryFileVersions = (versions: TFile[]) => {
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
      // FABLE5-REVIEW: `file` may be undefined (e.g. on the standalone
      // version-history page where filesStore is not initialized — see the
      // TODO in the constructor). The original .js spread undefined the same
      // way, producing a partial file object; the cast keeps that runtime.
      ...file!,
      comment: currentVersion.comment,
      version: versions.length,
      versionGroup: currentVersion.versionGroup,
    };

    this.filesStore.setFile(newFile);

    this.versions = versions;

    this.filesStore.ensureEncryptedFilenameForFile?.(versions[0]);
  };

  fetchFileVersions = (
    fileId: number | string,
    access?: TFile["security"] | null,
    requestToken?: string,
    update?: boolean,
  ) => {
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

  markAsVersion = (id: number, isVersion: boolean, version: number) => {
    // FABLE5-REVIEW: markAsVersion is untyped in shared/api (bare
    // `request(...)`), cast until it gets a proper return type.
    return (
      api.files.markAsVersion(id, isVersion, version) as Promise<TFile[]>
    ).then((versions) => this.setVerHistoryFileVersions(versions));
  };

  restoreVersion = (id: number, version: number) => {
    const { completeAction } = this.filesActionsStore;

    this.timerId = setTimeout(() => this.setShowProgressBar(true), 100);

    return api.files
      .versionRestore(id, version)
      .then((newVersion) => {
        // FABLE5-REVIEW: `this.versions` may be null here; the original .js
        // would throw the same way (caught by the .catch below).
        const updatedVersions = this.versions!.slice();
        updatedVersions.unshift(newVersion);
        this.setVerHistoryFileVersions(updatedVersions);
      })
      .then(() => {
        const file = this.filesStore.files.find((x) => x.id === +this.fileId!);
        if (file) {
          completeAction(file, FileAction.RestoreVersion);
        }
      })
      .catch((e) => toastr.error(e as string))
      .finally(() => {
        clearTimeout(this.timerId!);
        this.timerId = null;
        this.setShowProgressBar(false);
      });
  };

  updateCommentVersion = (id: number, comment: string, version: number) => {
    return api.files
      .versionEditComment(id, comment, version)
      .then((updatedComment) => {
        // FABLE5-REVIEW: `this.versions` may be null here; the original .js
        // would throw the same way.
        const copyVersions = this.versions!.slice();
        const updatedVersions = copyVersions.map((item) => {
          if (item.version === version) {
            item.comment = updatedComment;
          }
          return item;
        });
        this.setVerHistoryFileVersions(updatedVersions);
      });
  };

  setShowProgressBar = (show: boolean) => {
    this.showProgressBar = show;
  };

  onSetDeleteVersionDialogVisible = (deleteVersionDialogVisible: boolean) => {
    this.deleteVersionDialogVisible = deleteVersionDialogVisible;
  };
}

export default VersionHistoryStore;
