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

import { useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import type { TFileItem, TFolderItem } from "@/app/(docspace)/_hooks/useItemList";
import type { CreateFileDialogType } from "../_components/create-file-dialog";

export type DocsHotkeysHandlers = {
  onOpenFile: (item: TFileItem | TFolderItem) => void;
  onRenameItem: (item: TFileItem | TFolderItem) => void;
  onDeleteItems: (items: (TFileItem | TFolderItem)[]) => void;
  onCreateFile: (type: CreateFileDialogType) => void;
  onUploadFiles: () => void;
  onUploadFolder: () => void;
};

export default function useDocsHotkeys({
  onOpenFile,
  onRenameItem,
  onDeleteItems,
  onCreateFile,
  onUploadFiles,
  onUploadFolder,
}: DocsHotkeysHandlers) {
  const filesListStore = useFilesListStore();
  const filesSelectionStore = useFilesSelectionStore();

  const isEnabled = useCallback(() => {
    return !checkDialogsOpen();
  }, []);

  const hotkeysOptions = {
    filter: (ev: KeyboardEvent) =>
      (ev.target as HTMLElement)?.tagName !== "INPUT" &&
      (ev.target as HTMLElement)?.tagName !== "TEXTAREA",
    filterPreventDefault: false,
  };

  // Navigate list with arrow keys and vim keys
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isEnabled()) return;
      if (
        (e.target as HTMLElement)?.tagName === "INPUT" ||
        (e.target as HTMLElement)?.tagName === "TEXTAREA"
      )
        return;
      if (e.shiftKey || e.ctrlKey || e.metaKey) return;

      const items = filesListStore.items;
      if (!items.length) return;

      const { selection, bufferSelection } = filesSelectionStore;
      const current = selection[selection.length - 1] ?? bufferSelection;

      const currentIndex = current
        ? items.findIndex(
            (i) => i.id === current.id && i.isFolder === current.isFolder,
          )
        : -1;

      switch (e.key) {
        case "ArrowDown":
        case "j": {
          e.preventDefault();
          const nextIndex =
            currentIndex === -1 ? 0 : Math.min(currentIndex + 1, items.length - 1);
          filesSelectionStore.setSelection([items[nextIndex]]);
          break;
        }
        case "ArrowUp":
        case "k": {
          e.preventDefault();
          const prevIndex =
            currentIndex === -1 ? 0 : Math.max(currentIndex - 1, 0);
          filesSelectionStore.setSelection([items[prevIndex]]);
          break;
        }
        case "Enter": {
          if (selection.length === 1) {
            onOpenFile(selection[0]);
          }
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filesListStore, filesSelectionStore, onOpenFile, isEnabled]);

  // Select all
  useHotkeys(
    "ctrl+a, command+a",
    (e: KeyboardEvent) => {
      if (!isEnabled()) return;
      e.preventDefault();
      filesSelectionStore.setSelection([...filesListStore.items]);
    },
    hotkeysOptions,
  );

  // Deselect all
  useHotkeys(
    "escape, shift+n",
    () => {
      if (!isEnabled()) return;
      filesSelectionStore.setSelection([]);
    },
    hotkeysOptions,
  );

  // Rename (F2)
  useHotkeys(
    "f2",
    () => {
      if (!isEnabled()) return;
      const { selection } = filesSelectionStore;
      if (selection.length === 1) {
        onRenameItem(selection[0]);
      }
    },
    hotkeysOptions,
  );

  // Delete
  useHotkeys(
    "delete, shift+3, command+delete, command+backspace",
    () => {
      if (!isEnabled()) return;
      const { selection } = filesSelectionStore;
      if (selection.length) {
        onDeleteItems(selection);
      }
    },
    hotkeysOptions,
  );

  // Create document
  useHotkeys(
    "shift+d",
    () => {
      if (!isEnabled()) return;
      onCreateFile("docx");
    },
    { ...hotkeysOptions, keyup: true },
  );

  // Create spreadsheet
  useHotkeys(
    "shift+s",
    () => {
      if (!isEnabled()) return;
      onCreateFile("xlsx");
    },
    { ...hotkeysOptions, keyup: true },
  );

  // Create presentation
  useHotkeys(
    "shift+p",
    () => {
      if (!isEnabled()) return;
      onCreateFile("pptx");
    },
    { ...hotkeysOptions, keyup: true },
  );

  // Create PDF form
  useHotkeys(
    "shift+o",
    () => {
      if (!isEnabled()) return;
      onCreateFile("pdf");
    },
    { ...hotkeysOptions, keyup: true },
  );

  // Create folder
  useHotkeys(
    "shift+f",
    () => {
      if (!isEnabled()) return;
      onCreateFile("folder");
    },
    { ...hotkeysOptions, keyup: true },
  );

  // Upload file
  useHotkeys(
    "shift+u",
    () => {
      if (!isEnabled()) return;
      onUploadFiles();
    },
    { ...hotkeysOptions, keyup: true },
  );

  // Upload folder
  useHotkeys(
    "shift+i",
    () => {
      if (!isEnabled()) return;
      onUploadFolder();
    },
    { ...hotkeysOptions, keyup: true },
  );
}
