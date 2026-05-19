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

import { useCallback } from "react";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import type { TViewAs } from "@docspace/shared/types";

const extractFileInfo = (
  item: Element | null,
  filesViewAs: TViewAs,
): { fileType: string; id: string } | null => {
  if (!item) return null;

  const value =
    filesViewAs === "tile"
      ? item.getAttribute("value")
      : item.querySelector(".files-item")?.getAttribute("value");

  if (!value) return null;

  const [fileType, ...rest] = value.split("_");
  const id = rest.slice(0, -3).join("_");

  return { fileType, id };
};

/** Component must be wrapped in mobx observer to use this hook */
export default function useFilesSelection() {
  const { items: filesList } = useFilesListStore();
  const { selection, setSelection } = useFilesSelectionStore();
  const { filesViewAs } = useSettingsStore();

  const setSelections = useCallback(
    (added: Element[], removed: Element[], clear: boolean = false) => {
      let newSelections: (TFileItem | TFolderItem)[] = clear
        ? []
        : JSON.parse(JSON.stringify(selection));

      const processItem = (item: Element, action: "add" | "remove") => {
        const fileInfo = extractFileInfo(item, filesViewAs || "row");
        if (!fileInfo) return;

        const { fileType, id } = fileInfo;
        const isFolder = fileType !== "file";
        const foundItem = filesList.find(
          (f) => f.id === +id && f.isFolder === isFolder,
        );

        if (foundItem) {
          if (action === "add") {
            newSelections.push(foundItem);
          } else {
            newSelections = newSelections.filter(
              (f) => f.id !== +id || f.isFolder !== isFolder,
            );
          }
        }
      };

      added.forEach((item) => processItem(item, "add"));
      removed.forEach((item) => processItem(item, "remove"));

      const removeDuplicate = (items: (TFileItem | TFolderItem)[]) => {
        return items.filter(
          (x, index, self) =>
            index ===
            self.findIndex((i) => i.id === x.id && i.isFolder === x.isFolder),
        );
      };

      setSelection(removeDuplicate(newSelections));
    },
    [filesList, filesViewAs, selection, setSelection],
  );

  return { setSelections };
}
