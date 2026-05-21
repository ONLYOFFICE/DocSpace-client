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
import { makeAutoObservable } from "mobx";

export type TUploadItemStatus =
  | "uploading"
  | "uploaded"
  | "error"
  | "cancelled";

export type TUploadItem = {
  uniqueId: string;
  fileName: string;
  fileSize: number;
  folderId: number | string;
  percent: number;
  status: TUploadItemStatus;
  error?: string;
  abortController: AbortController;
};

export type TUploadItemInit = {
  uniqueId: string;
  fileName: string;
  fileSize: number;
  folderId: number | string;
};

class UploadStore {
  items: TUploadItem[] = [];
  uploadedBytes = 0;
  totalBytes = 0;
  batchAbortController: AbortController | null = null;
  panelVisible = false;

  constructor() {
    makeAutoObservable(this);
  }

  startBatch = (initItems: TUploadItemInit[]) => {
    const batch = new AbortController();
    this.batchAbortController = batch;
    this.totalBytes += initItems.reduce((sum, i) => sum + i.fileSize, 0);

    for (const init of initItems) {
      const fileAbort = new AbortController();
      batch.signal.addEventListener("abort", () => fileAbort.abort(), {
        once: true,
      });

      this.items.push({
        uniqueId: init.uniqueId,
        fileName: init.fileName,
        fileSize: init.fileSize,
        folderId: init.folderId,
        percent: 0,
        status: "uploading",
        abortController: fileAbort,
      });
    }
  };

  updateItemProgress = (uniqueId: string, percent: number) => {
    const item = this.items.find((i) => i.uniqueId === uniqueId);
    if (item && item.status === "uploading") {
      item.percent = Math.min(100, Math.max(0, percent));
    }
  };

  setItemUploaded = (uniqueId: string) => {
    const item = this.items.find((i) => i.uniqueId === uniqueId);
    if (item) {
      item.status = "uploaded";
      item.percent = 100;
    }
  };

  setItemError = (uniqueId: string, error: string) => {
    const item = this.items.find((i) => i.uniqueId === uniqueId);
    if (item) {
      item.status = "error";
      item.error = error;
    }
  };

  setItemCancelled = (uniqueId: string) => {
    const item = this.items.find((i) => i.uniqueId === uniqueId);
    if (item) {
      item.status = "cancelled";
    }
  };

  addUploadedBytes = (delta: number) => {
    this.uploadedBytes = Math.min(this.totalBytes, this.uploadedBytes + delta);
  };

  cancelBatch = () => {
    this.batchAbortController?.abort();
  };

  cancelItem = (uniqueId: string) => {
    const item = this.items.find((i) => i.uniqueId === uniqueId);
    item?.abortController.abort();
  };

  setPanelVisible = (visible: boolean) => {
    this.panelVisible = visible;
  };

  clearFinished = () => {
    this.items = this.items.filter((i) => i.status === "uploading");
    if (this.items.length === 0) {
      this.uploadedBytes = 0;
      this.totalBytes = 0;
    }
  };

  reset = () => {
    this.items = [];
    this.uploadedBytes = 0;
    this.totalBytes = 0;
    this.batchAbortController = null;
    this.panelVisible = false;
  };

  get isUploading() {
    return this.items.some((i) => i.status === "uploading");
  }

  get uploaded() {
    return !this.isUploading;
  }

  get errorsCount() {
    return this.items.filter((i) => i.status === "error").length;
  }

  get percent() {
    if (this.totalBytes === 0) return 0;
    return Math.round((this.uploadedBytes / this.totalBytes) * 100);
  }

  get hasItems() {
    return this.items.length > 0;
  }
}

export const UploadStoreContext = React.createContext<UploadStore>(
  new UploadStore(),
);

export const UploadStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new UploadStore(), []);
  return (
    <UploadStoreContext.Provider value={store}>
      {children}
    </UploadStoreContext.Provider>
  );
};

export const useUploadStore = () => {
  return React.useContext(UploadStoreContext);
};
