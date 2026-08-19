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

"use client";

import React from "react";
import { makeAutoObservable, runInAction, toJS } from "mobx";

import type { TFile, TFileSecurity } from "@docspace/shared/api/files/types";
import {
  getFileVersionInfo,
  versionRestore,
  versionEditComment,
  deleteVersionFile,
} from "@docspace/shared/api/files";

class VersionHistoryStore {
  isVisible: boolean = false;
  file: TFile | null = null;
  versions: TFile[] | null = null;
  isLoading: boolean = false;
  fileSecurity: TFileSecurity | null = null;

  deleteVersionDialogVisible: boolean = false;
  versionSelectedForDeletion: number | null = null;
  versionDeletionProcess: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  open = (file: TFile) => {
    this.file = toJS(file);
    this.fileSecurity = file.security ?? null;
    this.isVisible = true;
    this.versions = null;
    void this.fetchVersions(file.id, file.requestToken);
  };

  close = () => {
    this.isVisible = false;
    this.file = null;
    this.versions = null;
    this.isLoading = false;
    this.fileSecurity = null;
    this.deleteVersionDialogVisible = false;
    this.versionSelectedForDeletion = null;
    this.versionDeletionProcess = false;
  };

  fetchVersions = async (fileId: number, requestToken?: string) => {
    this.isLoading = true;
    try {
      const res = await getFileVersionInfo(fileId, requestToken);
      runInAction(() => {
        this.versions = res;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  restoreVersion = async (fileId: number, version: number) => {
    const newVersion = await versionRestore(fileId, version);
    runInAction(() => {
      if (this.versions) {
        this.versions = [newVersion, ...this.versions];
      }
    });
  };

  updateCommentVersion = async (
    fileId: number,
    comment: string,
    version: number,
  ) => {
    const updatedComment = await versionEditComment(fileId, comment, version);
    runInAction(() => {
      if (this.versions) {
        this.versions = this.versions.map((v) => {
          if (v.version === version) return { ...v, comment: updatedComment };
          return v;
        });
      }
    });
  };

  deleteVersion = async (fileId: number, versionGroup: number) => {
    runInAction(() => {
      this.versionDeletionProcess = true;
    });
    try {
      await deleteVersionFile(fileId, [versionGroup]);
      if (this.file) {
        await this.fetchVersions(this.file.id, this.file.requestToken);
      }
    } finally {
      runInAction(() => {
        this.versionDeletionProcess = false;
        this.versionSelectedForDeletion = null;
      });
    }
  };

  setDeleteVersionDialogVisible = (visible: boolean) => {
    this.deleteVersionDialogVisible = visible;
  };

  setVersionSelectedForDeletion = (versionGroup: number | null) => {
    this.versionSelectedForDeletion = versionGroup;
  };
}

export const VersionHistoryStoreContext =
  React.createContext<VersionHistoryStore>(
    null as unknown as VersionHistoryStore,
  );

export const VersionHistoryStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new VersionHistoryStore(), []);
  return (
    <VersionHistoryStoreContext.Provider value={store}>
      {children}
    </VersionHistoryStoreContext.Provider>
  );
};

export const useVersionHistoryStore = () => {
  const store = React.useContext(VersionHistoryStoreContext);
  if (!store) {
    throw new Error(
      "useVersionHistoryStore must be used within a VersionHistoryStoreContextProvider",
    );
  }
  return store;
};
