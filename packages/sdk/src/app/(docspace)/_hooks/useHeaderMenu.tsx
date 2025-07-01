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
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import {
  getCheckboxItemId,
  getCheckboxItemLabel,
} from "@docspace/shared/utils";
import { FilterType } from "@docspace/shared/enums";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";

import { useFilesListStore } from "../_store/FilesListStore";
import { useFilesSelectionStore } from "../_store/FilesSelectionStore";

import useFileType from "./useFileType";

export default function useItemList({}) {
  const { t } = useTranslation(["Common"]);

  const { items } = useFilesListStore();
  const { setSelection } = useFilesSelectionStore();
  const { isDocument, isPresentation, isSpreadsheet, isArchive, isDiagram } =
    useFileType();

  const onSelect = useCallback(
    (e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
      const key = (e.currentTarget as HTMLElement).dataset.key;

      if (!key) return;

      if (key === "all") {
        setSelection(items);
        return;
      }

      const selectedItems = items.filter((item) => {
        if ((+key as unknown as FilterType) === FilterType.FoldersOnly)
          return item.isFolder;

        if ((+key as unknown as FilterType) === FilterType.FilesOnly)
          return !item.isFolder;

        let type;
        if ("fileExst" in item && item.fileExst) {
          if (isDocument(item.fileExst)) type = FilterType.DocumentsOnly;
          else if (isPresentation(item.fileExst))
            type = FilterType.PresentationsOnly;
          else if (isSpreadsheet(item.fileExst))
            type = FilterType.SpreadsheetsOnly;
          else if (item.viewAccessibility?.ImageView)
            type = FilterType.ImagesOnly;
          else if (item.viewAccessibility?.MediaView)
            type = FilterType.MediaOnly;
          else if (isArchive(item.fileExst)) type = FilterType.ArchiveOnly;
          else if (isDiagram(item.fileExst)) type = FilterType.DiagramsOnly;
        }

        return type === +key;
      });

      setSelection(selectedItems);
    },
    [
      isArchive,
      isDocument,
      isPresentation,
      isSpreadsheet,
      isDiagram,
      items,
      setSelection,
    ],
  );

  const getHeaderMenu = useCallback(() => {
    const menuItems = new Set<string | FilterType>(["all"]);

    items.forEach((item) => {
      if ("fileExst" in item && item.fileExst) {
        if (isDocument(item.fileExst)) menuItems.add(FilterType.DocumentsOnly);
        else if (isPresentation(item.fileExst))
          menuItems.add(FilterType.PresentationsOnly);
        else if (isSpreadsheet(item.fileExst))
          menuItems.add(FilterType.SpreadsheetsOnly);
        else if (isDiagram(item.fileExst))
          menuItems.add(FilterType.DiagramsOnly);
        else if (item.viewAccessibility?.ImageView)
          menuItems.add(FilterType.ImagesOnly);
        else if (item.viewAccessibility?.MediaView)
          menuItems.add(FilterType.MediaOnly);
        else if (isArchive(item.fileExst))
          menuItems.add(FilterType.ArchiveOnly);

        menuItems.add(FilterType.FilesOnly);

        return;
      }

      menuItems.add(FilterType.FoldersOnly);
    });

    const dropdownItems = Array.from(menuItems).map((item) => {
      const label = getCheckboxItemLabel(t, item);
      const id = getCheckboxItemId(item);
      return (
        <DropDownItem
          id={id}
          key={item}
          label={label}
          data-key={item}
          onClick={onSelect}
        />
      );
    });

    return <>{dropdownItems}</>;
  }, [
    isArchive,
    isDocument,
    isPresentation,
    isSpreadsheet,
    isDiagram,
    items,
    onSelect,
    t,
  ]);

  const onCheckboxChange = useCallback(
    (isChecked: boolean) => {
      if (isChecked) setSelection(items);
      else setSelection([]);
    },
    [items, setSelection],
  );

  return { getHeaderMenu, onCheckboxChange };
}
