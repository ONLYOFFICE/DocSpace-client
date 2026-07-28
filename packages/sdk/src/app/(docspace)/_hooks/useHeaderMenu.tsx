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

export default function useItemList() {
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

    return (
      <>
        {dropdownItems} <div />
      </>
    );
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
