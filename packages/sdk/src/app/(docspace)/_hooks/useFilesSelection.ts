/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { useCallback } from "react";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";

/** Component must be wrapped in mobx observer to use this hook */
export default function useFilesSelection() {
  const { items: filesList } = useFilesListStore();
  const { selection, setSelection } = useFilesSelectionStore();

  const setSelections = useCallback(
    (added: Element[], removed: Element[], clear: boolean = false) => {
      if (clear) {
        setSelection([]);
      }

      let newSelections: (TFileItem | TFolderItem)[] = JSON.parse(
        JSON.stringify(selection),
      );

      added.forEach((item) => {
        if (!item) return;

        const value = item.getElementsByClassName("files-item")
          ? item.getElementsByClassName("files-item")[0]?.getAttribute("value")
          : null;

        if (!value) return;
        const splitValue = value.split("_");

        const fileType = splitValue[0];
        const id = splitValue.slice(1, -3).join("_");

        if (fileType === "file") {
          const foundFile = filesList.find((f) => {
            return f.id === +id && !f.isFolder;
          });
          foundFile && newSelections.push(foundFile);
        } else {
          const selectableFolder = filesList.find(
            (f) => f.id === +id && f.isFolder,
          );

          if (selectableFolder) {
            selectableFolder.isFolder = true;

            newSelections.push(selectableFolder);
          }
        }
      });

      removed.forEach((item) => {
        if (!item) return;

        const value = item.getElementsByClassName("files-item")
          ? item.getElementsByClassName("files-item")[0]?.getAttribute("value")
          : null;

        if (!value) return;
        const splitValue = value.split("_");

        const fileType = splitValue[0];
        const id = splitValue.slice(1, -3).join("_");

        if (fileType === "file") {
          newSelections = newSelections.filter(
            (f) => !(f.id === +id && !f.isFolder),
          );
        } else {
          newSelections = newSelections.filter(
            (f) => !(f.id === +id && f.isFolder),
          );
        }
      });

      const removeDuplicate = (items: (TFileItem | TFolderItem)[]) => {
        return items.filter(
          (x, index, self) =>
            index ===
            self.findIndex((i) => i.id === x.id && i.isFolder === x.isFolder),
        );
      };

      setSelection(removeDuplicate(newSelections));
    },
    [filesList, selection, setSelection],
  );

  return { setSelections };
}
