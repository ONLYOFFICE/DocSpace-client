// (c) Copyright Ascensio System SIA 2009-2025
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
}
