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

import type {
  TDownloadedFile,
  TFileConvertId,
  TSortedDownloadFiles,
  TSortedFiles,
  TTranslationsForDownload,
} from "@docspace/shared/dialogs/download-dialog/DownloadDialog.types";
import type { TTranslation } from "@docspace/shared/types";
import { ProtectedFileCategoryType } from "@docspace/shared/dialogs/download-dialog/DownloadDialog.enums";
import { toastr } from "@docspace/ui-kit/components/toast";

class DownloadDialogStore {
  sortedFiles: TSortedFiles = {
    documents: [],
    spreadsheets: [],
    presentations: [],
    masterForms: [],
    other: [],
    pdfForms: [],
    diagrams: [],
  };

  sortedDownloadFiles: TSortedDownloadFiles = {
    other: [],
    password: [],
    remove: [],
    original: [],
  };

  downloadItems: TDownloadedFile[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setDownloadItems = (items: TDownloadedFile[]) => {
    this.downloadItems = items;
  };

  setSortedFiles = (value: TSortedFiles) => {
    this.sortedFiles = value;
  };

  setSortedDownloadFiles = (value: TSortedDownloadFiles) => {
    this.sortedDownloadFiles = { ...value };
  };

  get sortedPasswordFiles() {
    const original = this.sortedDownloadFiles.original ?? [];
    const other = this.sortedDownloadFiles.other ?? [];
    const password = this.sortedDownloadFiles.password ?? [];
    const remove = this.sortedDownloadFiles.remove ?? [];

    return [...other, ...original, ...password, ...remove];
  }

  getDownloadItems = (
    itemList: TDownloadedFile[],
    t: TTranslation,
  ): [TFileConvertId[], number[], string | null] => {
    const files: TFileConvertId[] = [];
    const folders: number[] = [];
    let singleFileUrl: string | null = null;

    itemList.forEach((item) => {
      if (item.checked) {
        if ("fileExst" in item && (!!item.fileExst || item.contentLength)) {
          const format =
            !item.format || item.format === t("Common:OriginalFormat")
              ? item.fileExst
              : item.format;
          if (!singleFileUrl) {
            singleFileUrl = item.viewUrl;
          }
          files.push({
            key: item.id,
            value: format,
            ...(item.password && { password: item.password }),
          });
        } else {
          folders.push(item.id);
        }
      }
    });

    return [files, folders, singleFileUrl];
  };

  resetDownloadedFileFormat = (
    id: number,
    fileExst: string,
    type: ProtectedFileCategoryType,
  ) => {
    const currentType = this.sortedDownloadFiles[type];
    if (!currentType) return;

    let originItem: TDownloadedFile | undefined;
    const newArray = currentType.filter((item) => {
      if (item.id === id) {
        originItem = item;
        return false;
      }
      return true;
    });
    if (!originItem) return;

    if (type === "remove")
      this.downloadItems.push({
        ...originItem,
        format: fileExst,
        oldFormat: originItem.format,
      });
    else
      this.downloadItems.forEach((item) => {
        if (item.id === id) {
          item.oldFormat = item.format;
          item.format = fileExst;
        }
      });

    this.sortedDownloadFiles[type] = [...newArray];

    this.sortedDownloadFiles.original = [
      ...(this.sortedDownloadFiles.original ?? []),
      originItem,
    ];
  };

  updateDownloadedFilePassword = (
    id: number,
    password: string,
    type: ProtectedFileCategoryType,
  ) => {
    const currentType = this.sortedDownloadFiles[type];
    if (!currentType) return;

    let originItem: TDownloadedFile | undefined;

    const newArray = currentType.filter((item) => {
      if (item.id === id) {
        originItem = item;
        return false;
      }
      return true;
    });

    if (!originItem) return;

    if (type === "remove") this.downloadItems.push({ ...originItem, password });
    else
      this.downloadItems.forEach((item) => {
        if (item.id === id) {
          item.password = password;
          if (item.oldFormat) item.format = item.oldFormat;
        }
      });

    this.sortedDownloadFiles[type] = [...newArray];

    this.sortedDownloadFiles.password = [
      ...(this.sortedDownloadFiles.password ?? []),
      originItem,
    ];
  };

  discardDownloadedFile = (id: number, type: ProtectedFileCategoryType) => {
    const newFileIds = this.downloadItems.filter((item) => item.id !== id);
    this.downloadItems = [...newFileIds];

    const currentType = this.sortedDownloadFiles[type];
    if (!currentType) return;

    let removedItem: TDownloadedFile | undefined;
    const newArray = currentType.filter((item) => {
      if (item.id === id) {
        removedItem = item;
        return false;
      }
      return true;
    });

    if (!removedItem) return;

    this.sortedDownloadFiles[type] = [...newArray];

    this.sortedDownloadFiles.remove = [
      ...(this.sortedDownloadFiles.remove ?? []),
      removedItem,
    ];
  };

  handlePasswordError = (
    fileConvertIds: TFileConvertId[],
    error: string,
    translations: TTranslationsForDownload,
  ) => {
    const filesIds = error.match(/\d+/g)?.map(Number) ?? [
      fileConvertIds[0].key,
    ];

    const passwordArray: TDownloadedFile[] = [];

    this.downloadItems.forEach((item) => {
      filesIds.forEach((id) => {
        if (item.id === id) {
          passwordArray.push(item);
        }
      });
    });

    toastr.error(translations.passwordError, undefined, 0, true);
    this.setSortedDownloadFiles({ other: [...passwordArray] });
  };
}

export const DownloadDialogStoreContext =
  React.createContext<DownloadDialogStore>(
    null as unknown as DownloadDialogStore,
  );

export const DownloadDialogStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new DownloadDialogStore(), []);
  return (
    <DownloadDialogStoreContext.Provider value={store}>
      {children}
    </DownloadDialogStoreContext.Provider>
  );
};

export const useDownloadDialogStore = () => {
  return React.useContext(DownloadDialogStoreContext);
};
