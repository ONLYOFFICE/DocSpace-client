// (c) Copyright Ascensio System SIA 2009-2026
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

import { FileType, FilterType, RoomsType } from "@docspace/shared/enums";

import type { TActiveItem, TItem, TRemovedRoomsTypes } from "./types";

// Active items (files being moved/copied/etc.) suppress selection. Passed
// explicitly so the check is a pure function of (file, selected, deps); the
// FilesStore facade reads its observables in the same reactive context.
export type SelectionCheckDeps = {
  activeFiles: TActiveItem[];
  activeFolders: TActiveItem[];
};

// Preserves the original mixed return type verbatim: some branches return a
// boolean, "folders-only" returns the truthy `file.parentId`, and the type
// filters return the `FileType` value — all consumed only for truthiness.
export const isFileChecked = (
  file: TItem,
  selected: string,
  deps: SelectionCheckDeps,
) => {
  if (!file.parentId) {
    if (deps.activeFiles.find((elem) => elem.id === file.id)) return false;
  } else if (deps.activeFolders.find((elem) => elem.id === file.id))
    return false;

  const type = file.fileType;
  const roomType = file.roomType;

  switch (selected) {
    case "all":
      return true;
    case FilterType.FoldersOnly.toString():
      return file.parentId;
    case FilterType.DocumentsOnly.toString():
      return type === FileType.Document;
    case FilterType.PresentationsOnly.toString():
      return type === FileType.Presentation;
    case FilterType.SpreadsheetsOnly.toString():
      return type === FileType.Spreadsheet;
    case FilterType.ImagesOnly.toString():
      return type === FileType.Image;
    case FilterType.MediaOnly.toString():
      return type === FileType.Video || type === FileType.Audio;
    case FilterType.ArchiveOnly.toString():
      return type === FileType.Archive;
    case FilterType.FilesOnly.toString():
      return type || !file.parentId;
    case `room-${(RoomsType as TRemovedRoomsTypes).FillingFormsRoom}`:
      return roomType === (RoomsType as TRemovedRoomsTypes).FillingFormsRoom;
    case `room-${RoomsType.CustomRoom}`:
      return roomType === RoomsType.CustomRoom;
    case `room-${RoomsType.AIRoom}`:
      return roomType === RoomsType.AIRoom;
    case `room-${RoomsType.EditingRoom}`:
      return roomType === RoomsType.EditingRoom;
    case `room-${(RoomsType as TRemovedRoomsTypes).ReviewRoom}`:
      return roomType === (RoomsType as TRemovedRoomsTypes).ReviewRoom;
    case `room-${(RoomsType as TRemovedRoomsTypes).ReadOnlyRoom}`:
      return roomType === (RoomsType as TRemovedRoomsTypes).ReadOnlyRoom;
    case `room-${RoomsType.FormRoom}`:
      return roomType === RoomsType.FormRoom;
    case `room-${RoomsType.PublicRoom}`:
      return roomType === RoomsType.PublicRoom;
    case `room-${RoomsType.VirtualDataRoom}`:
      return roomType === RoomsType.VirtualDataRoom;
    default:
      return false;
  }
};

export const filterFilesBySelected = (
  files: TItem[],
  selected: string,
  deps: SelectionCheckDeps,
) => {
  const newSelection: TItem[] = [];
  files.forEach((file) => {
    const checked = isFileChecked(file, selected, deps);

    if (checked) newSelection.push(file);
  });

  return newSelection;
};
