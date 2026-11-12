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
import { getHotkeyLetter } from "@docspace/shared/utils/getHotkeyLetter";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useEncryptedFileActions } from "@/app/(docspace)/_contexts/EncryptedFileActionsContext";
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

const suppressKeyRepeat = (code: string) => {
  const onRepeat = (e: KeyboardEvent) => {
    if (e.code === code && e.repeat) e.preventDefault();
  };

  const onRelease = (e: KeyboardEvent) => {
    if (e.code !== code) return;
    window.removeEventListener("keydown", onRepeat, true);
    window.removeEventListener("keyup", onRelease, true);
  };

  window.addEventListener("keydown", onRepeat, true);
  window.addEventListener("keyup", onRelease, true);
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
  // Non-null when rendered inside a private room — the provider is mounted only
  // in (private)/private/[roomId]/page.client.tsx (same pattern as useTrashActions).
  const encryptedActions = useEncryptedFileActions();

  const isEnabled = useCallback(() => {
    return !checkDialogsOpen();
  }, []);

  // Spec: private-rooms/sdk-surface, "No upload or creation without the create right".
  const canCreateHere = () =>
    !encryptedActions || !!filesListStore.currentFolder?.security?.Create;

  const hotkeysOptions = {
    filter: (ev: KeyboardEvent) =>
      (ev.target as HTMLElement)?.tagName !== "INPUT" &&
      (ev.target as HTMLElement)?.tagName !== "TEXTAREA",
    filterPreventDefault: false,
  };

  const onShiftHotkey = (action: () => void) => (e: KeyboardEvent) => {
    if (!isEnabled() || e.repeat) return;
    e.preventDefault();
    suppressKeyRepeat(e.code);
    action();
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

      switch (getHotkeyLetter(e)) {
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
    onShiftHotkey(() => {
      if (!canCreateHere()) return;
      onCreateFile("docx");
    }),
    hotkeysOptions,
  );

  // Create spreadsheet
  useHotkeys(
    "shift+s",
    onShiftHotkey(() => {
      if (!canCreateHere()) return;
      onCreateFile("xlsx");
    }),
    hotkeysOptions,
  );

  // Create presentation
  useHotkeys(
    "shift+p",
    onShiftHotkey(() => {
      if (!canCreateHere()) return;
      onCreateFile("pptx");
    }),
    hotkeysOptions,
  );

  // Create PDF form
  useHotkeys(
    "shift+o",
    onShiftHotkey(() => {
      if (!canCreateHere()) return;
      onCreateFile("pdf");
    }),
    hotkeysOptions,
  );

  // Create folder
  useHotkeys(
    "shift+f",
    onShiftHotkey(() => {
      if (!canCreateHere()) return;
      onCreateFile("folder");
    }),
    hotkeysOptions,
  );

  // Upload file
  useHotkeys(
    "shift+u",
    onShiftHotkey(() => {
      if (!canCreateHere()) return;
      onUploadFiles();
    }),
    hotkeysOptions,
  );

  // Upload folder — silently blocked in private rooms (no folder upload allowed).
  // Mirrors HotkeyStore.js:601-603: uploadFile(isFolder) { if (isFolder) {
  //   if (this.treeFoldersStore.isPrivacyFolder) return; ... } }.
  // No toast is shown — the reference client also returns silently.
  useHotkeys(
    "shift+i",
    onShiftHotkey(() => {
      if (encryptedActions) return;
      onUploadFolder();
    }),
    hotkeysOptions,
  );
}
