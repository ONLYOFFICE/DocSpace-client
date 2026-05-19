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

import type {
  TFile,
  TFolder,
  TOperation,
} from "@docspace/shared/api/files/types";
import type { ConflictResolveType, RoomsType } from "@docspace/shared/enums";
import type { TTranslation } from "@docspace/shared/types";

export type TConflictResolveDialogData = {
  destFolderId: number;
  folderIds: number[];
  fileIds: number[];
  deleteAfter: boolean;
  folderTitle: string;
  isCopy: boolean;
  translations: { [key: string]: string };
  isUploadConflict: boolean;
  newUploadData: {
    files: { file: { name: string; size: string } }[];
    filesSize: number;
  };

  selectedFolder?: TFolder;
  fromShareCollectSelector?: boolean;
  createDefineRoomType?: RoomsType;
  destFolderInfo: unknown;
  toFillOut?: boolean;
};

export type TActiveItem = TFile | TFolder;

export interface ConflictResolveDialogProps {
  visible: boolean;
  setConflictResolveDialogVisible: (value: boolean) => void;
  conflictResolveDialogData: TConflictResolveDialogData;
  items: (TFile & TFolder)[];
  itemOperationToFolder: (data: {
    destFolderId: number;
    folderIds: number[];
    fileIds: number[];
    conflictResolveType: ConflictResolveType;
    deleteAfter: boolean;
    isCopy: boolean;
    translations: {
      [key: string]: string;
    };
    toFillOut?: boolean;
  }) => Promise<TOperation>;
  activeFiles: TActiveItem[];
  activeFolders: TActiveItem[];
  setActiveFiles: (items: TActiveItem[]) => void;
  setActiveFolders: (items: TActiveItem[]) => void;
  updateActiveFiles: (items: TActiveItem[]) => void;
  updateActiveFolders: (items: TActiveItem[]) => void;
  setSelected: (value: string) => void;
  setMoveToPanelVisible: (value: boolean) => void;
  setRestorePanelVisible: (value: boolean) => void;
  setCopyPanelVisible: (value: boolean) => void;
  setRestoreAllPanelVisible: (value: boolean) => void;
  setMoveToPublicRoomVisible: (value: boolean) => void;
  openFileAction: TStore["filesActionsStore"]["openFileAction"];
  setFillPDFDialogData: TStore["dialogsStore"]["setFillPDFDialogData"];
  setIsShareFormData: TStore["dialogsStore"]["setIsShareFormData"];
  conflictDialogUploadHandler: (
    data: {
      files: {
        file: {
          name: string;
          size: string;
        };
      }[];
      filesSize: number;
    },
    t: TTranslation,
    create: boolean,
  ) => void;
  isFileDialog: boolean;
  isFolderDialog: boolean;
  files: TFile[];
  folders: TFolder[];
  cancelUploadAction: () => void;

  setAssignRolesDialogData: TStore["dialogsStore"]["setAssignRolesDialogData"];
  startFillingInFormRoom: TStore["contextOptionsStore"]["startFillingInFormRoom"];
}
