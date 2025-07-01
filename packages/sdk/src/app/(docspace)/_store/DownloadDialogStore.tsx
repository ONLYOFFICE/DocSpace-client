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
import { toastr } from "@docspace/shared/components/toast";

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
    return;
  };
}

export const DownloadDialogStoreContext =
  React.createContext<DownloadDialogStore>(new DownloadDialogStore());

export const DownloadDialogStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <DownloadDialogStoreContext.Provider value={new DownloadDialogStore()}>
      {children}
    </DownloadDialogStoreContext.Provider>
  );
};

export const useDownloadDialogStore = () => {
  return React.useContext(DownloadDialogStoreContext);
};
