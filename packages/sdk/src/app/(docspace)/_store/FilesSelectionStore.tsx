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

import { Nullable } from "@docspace/shared/types";
import type {
  TDownloadedFile,
  TSortedFiles,
} from "@docspace/shared/dialogs/download-dialog/DownloadDialog.types";

import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";

const isSame = (a: TFileItem | TFolderItem, b: TFileItem | TFolderItem) => {
  if (a.isFolder !== b.isFolder) return false;

  return a.id === b.id;
};

export class FilesSelectionStore {
  bufferSelection: Nullable<TFileItem | TFolderItem> = null;

  selection: (TFileItem | TFolderItem)[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setSelection = (items?: (TFileItem | TFolderItem)[]) => {
    if (!items?.length && !this.selection.length) {
      return;
    }

    this.selection = items || [];
  };

  addSelection = (item: TFileItem | TFolderItem) => {
    if (this.bufferSelection) {
      this.setBufferSelection(null);
    }

    if (this.selection.some((i) => isSame(i, item))) {
      return this.removeSelection(item);
    }
    this.selection.push(item);
  };

  removeSelection = (item: TFileItem | TFolderItem) => {
    this.selection = this.selection.filter((i) => !isSame(i, item));
  };

  setBufferSelection = (item: Nullable<TFileItem | TFolderItem>) => {
    if (item && this.bufferSelection && isSame(item, this.bufferSelection)) {
      return;
    }
    this.bufferSelection = item;
  };

  isCheckedItem = (item: TFileItem | TFolderItem) => {
    return this.selection.some((i) => isSame(i, item));
  };

  getSortedFilesFromSelection = (
    isDocument: (exst: string) => boolean,
    isSpreadsheet: (exst: string) => boolean,
    isPresentation: (exst: string) => boolean,
    isMasterForm: (exst: string) => boolean,
    isDiagram: (exst: string) => boolean,
  ) => {
    const newSortedFiles: TSortedFiles = {
      documents: [],
      spreadsheets: [],
      presentations: [],
      masterForms: [],
      pdfForms: [],
      diagrams: [],
      other: [],
    };

    let data = this.selection.length
      ? this.selection
      : this.bufferSelection
        ? [this.bufferSelection]
        : [];

    data = JSON.parse(JSON.stringify(data));

    data.forEach((item: TDownloadedFile) => {
      item.checked = true;
      item.format = null;

      if (
        "fileExst" in item &&
        item.fileExst &&
        item.viewAccessibility?.CanConvert
      ) {
        if (isSpreadsheet(item.fileExst)) {
          newSortedFiles.spreadsheets.push(item);
        } else if (isPresentation(item.fileExst)) {
          newSortedFiles.presentations.push(item);
        } else if (isMasterForm(item.fileExst)) {
          newSortedFiles.masterForms.push(item);
        } else if (isDocument(item.fileExst)) {
          newSortedFiles.documents.push(item);
        } else if (isDiagram(item.fileExst)) {
          newSortedFiles.diagrams.push(item);
        } else {
          newSortedFiles.other.push(item);
        }
      } else {
        newSortedFiles.other.push(item);
      }
    });

    return newSortedFiles;
  };
}

export const FilesSelectionStoreContext =
  React.createContext<FilesSelectionStore>(
    null as unknown as FilesSelectionStore,
  );

export const FilesSelectionStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new FilesSelectionStore(), []);
  return (
    <FilesSelectionStoreContext.Provider value={store}>
      {children}
    </FilesSelectionStoreContext.Provider>
  );
};

export const useFilesSelectionStore = () => {
  return React.useContext(FilesSelectionStoreContext);
};
