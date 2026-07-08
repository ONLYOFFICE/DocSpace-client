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

import { FileType, FilterType, RoomsType } from "@docspace/shared/enums";
import { EMPTY_ARRAY } from "@docspace/shared/constants";
import { isSameEntity } from "@docspace/shared/utils/isSameEntity";

import type { TFile } from "@docspace/shared/api/files/types";

import type { TActiveItem, TItem, TRemovedRoomsTypes } from "./types";

import type { default as FilesStore } from "../FilesStore";

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


export function updateSelectionImpl(self: FilesStore, item: TItem) {
  const indexFileList = self.filesList.findIndex((file) =>
    isSameEntity(file as TFile, item as TFile),
  );
  const indexSelectedRoom = self.selection.findIndex((selectionItem) =>
    isSameEntity(selectionItem as TFile, item as TFile),
  );

  if (~indexFileList && ~indexSelectedRoom) {
    self.selection[indexSelectedRoom] = self.filesList[indexFileList];
  }

  if (self.bufferSelection) {
    const newBuffer = self.filesList.find((file) =>
      isSameEntity(file as TFile, self.bufferSelection as TFile),
    );

    if (!newBuffer) return;

    self.bufferSelection = newBuffer;
  }
}

export function setSelectionsImpl(
  self: FilesStore,
  added: Element[],
  removed: Element[],
  clear = false,
) {
  if (clear) {
    self.setSelection(EMPTY_ARRAY);
  }

  let newSelections: TItem[] = JSON.parse(JSON.stringify(self.selection));

  added.forEach((item) => {
    if (!item) return;

    const value =
      self.viewAs === "tile"
        ? item.getAttribute("value")
        : item.getElementsByClassName("files-item")
          ? item
              .getElementsByClassName("files-item")[0]
              ?.getAttribute("value")
          : null;

    if (!value) return;
    const splitValue = (value && value.split("_")) as string[];

    const fileType = splitValue[0];
    const id = splitValue.slice(1, -3).join("_");

    if (fileType === "file") {
      if (self.activeFiles.findIndex((f) => f.id == id) === -1) {
        const selectableFile = self.filesList.find(
          (f) => f.id == id && !f.isFolder,
        );

        if (selectableFile) {
          newSelections.push(selectableFile);
        }
      }
    } else if (self.activeFolders.findIndex((f) => f.id == id) === -1) {
      const selectableFolder = self.filesList.find(
        (f) => f.id == id && f.isFolder,
      );

      if (selectableFolder) {
        selectableFolder.isFolder = true;

        newSelections.push(selectableFolder);
      }
    }
  });

  removed.forEach((item) => {
    if (!item) return;

    const value =
      self.viewAs === "tile"
        ? item.getAttribute("value")
        : item.getElementsByClassName("files-item")
          ? item
              .getElementsByClassName("files-item")[0]
              ?.getAttribute("value")
          : null;

    // unlike the `added` loop there is no `!value` guard
    // here, so the old JS would throw on a null value; the erased cast
    // keeps that behavior.
    const splitValue = (value && value.split("_")) as string[];

    const fileType = splitValue[0];
    const id = splitValue.slice(1, -3).join("_");

    if (fileType === "file") {
      if (self.activeFiles.findIndex((f) => f.id == id) === -1) {
        newSelections = newSelections.filter(
          (f) => !(f.id == id && !f.isFolder),
        );
      }
    } else if (self.activeFolders.findIndex((f) => f.id == id) === -1) {
      newSelections = newSelections.filter(
        (f) => !(f.id == id && f.isFolder),
      );
    }
  });

  const removeDuplicate = (items: TItem[]) => {
    return items.filter(
      (x, index, self) =>
        index ===
        self.findIndex((i) => i.id === x.id && i.isFolder === x.isFolder),
    );
  };

  self.setSelection(removeDuplicate(newSelections));
}

export function withCtrlSelectImpl(self: FilesStore, item: TItem) {
  self.setHotkeyCaret(item);
  self.setHotkeyCaretStart(item);

  const fileIndex = self.selection.findIndex(
    (f) => f.id === item.id && f.isFolder === item.isFolder,
  );
  if (fileIndex === -1) {
    self.setSelection([...self.selection, item]);
  } else {
    self.deselectFile(item);
  }
}

export function withShiftSelectImpl(self: FilesStore, item: TItem) {
  const caretStart = self.hotkeyCaretStart
    ? self.hotkeyCaretStart
    : self.filesList[0];
  const caret = self.hotkeyCaret ? self.hotkeyCaret : caretStart;

  if (!caret || !caretStart) return;

  const startCaretIndex = self.filesList.findIndex(
    (f) => f.id === caretStart.id && f.isFolder === caretStart.isFolder,
  );

  const caretIndex = self.filesList.findIndex(
    (f) => f.id === caret.id && f.isFolder === caret.isFolder,
  );

  const itemIndex = self.filesList.findIndex(
    (f) => f.id === item.id && f.isFolder === item.isFolder,
  );

  const isMoveDown = caretIndex < itemIndex;

  let newSelection: TItem[] = JSON.parse(JSON.stringify(self.selection));
  let index = caretIndex;
  const newItemIndex = isMoveDown ? itemIndex + 1 : itemIndex - 1;

  while (index !== newItemIndex) {
    const filesItem = self.filesList[index];

    const selectionIndex = newSelection.findIndex(
      (f) => f.id === filesItem.id && f.isFolder === filesItem.isFolder,
    );
    if (selectionIndex === -1) {
      newSelection.push(filesItem);
    } else {
      newSelection = newSelection.filter(
        (_, fIndex) => selectionIndex !== fIndex,
      );
      newSelection.push(filesItem);
    }

    if (isMoveDown) {
      index++;
    } else {
      index--;
    }
  }

  const lastSelection = self.selection[self.selection.length - 1];
  const indexOfLast = self.filesList.findIndex(
    (f) =>
      f.id === lastSelection?.id && f.isFolder === lastSelection?.isFolder,
  );

  newSelection = newSelection.filter((f) => {
    const listIndex = self.filesList.findIndex(
      (x) => x.id === f.id && x.isFolder === f.isFolder,
    );

    if (isMoveDown) {
      const isSelect = listIndex < indexOfLast;
      if (isSelect) return true;

      if (listIndex >= startCaretIndex) {
        return true;
      }
      return listIndex >= itemIndex;
    }
    const isSelect = listIndex > indexOfLast;
    if (isSelect) return true;

    if (listIndex <= startCaretIndex) {
      return true;
    }
    return listIndex <= itemIndex;
  });

  self.setSelection(newSelection);
  self.setHotkeyCaret(item);
}
