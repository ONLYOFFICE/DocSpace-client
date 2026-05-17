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

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";

import {
  SelectionArea as SelectionAreaComponent,
  type TArrayTypes,
  type TOnMove,
} from "@docspace/ui-kit/components/selection-area";
import { checkIsSSR, getCountTilesInRow } from "@docspace/shared/utils";
import useFilesSelection from "@/app/(docspace)/_hooks/useFilesSelection";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

const SelectionArea = observer(() => {
  const [countTilesInRow, setCountTilesInRow] = useState(0);
  const [isSSR, setIsSSR] = useState(true);

  const { setSelections } = useFilesSelection();
  const { filesViewAs } = useSettingsStore();
  const { items } = useFilesListStore();

  const foldersLength = useMemo(
    () => items.filter((item) => item.isFolder).length,
    [items],
  );
  const filesLength = items.length - foldersLength;

  const getCountOfMissingFilesTiles = (itemsLength: number) => {
    const division = itemsLength % countTilesInRow;
    return division ? countTilesInRow - division : 0;
  };

  const arrayTypes: TArrayTypes[] = [
    {
      type: "file",
      rowGap: 14,
      itemHeight: 0,
      rowCount: Math.ceil(filesLength / countTilesInRow),
      countOfMissingTiles: getCountOfMissingFilesTiles(filesLength),
    },
    {
      type: "folder",
      rowGap: 12,
      itemHeight: 0,
      rowCount: Math.ceil(foldersLength / countTilesInRow),
      countOfMissingTiles: getCountOfMissingFilesTiles(foldersLength),
    },
  ];

  const selectableClass = filesViewAs === "tile" ? "files-item" : "window-item";

  const onMove = ({ added, removed, clear }: TOnMove) => {
    setSelections(added, removed, clear);
  };

  useLayoutEffect(() => {
    const setTilesCount = () => {
      const newCount = getCountTilesInRow();
      if (countTilesInRow !== newCount) setCountTilesInRow(newCount);
    };

    const onResize = () => setTilesCount();

    setTilesCount();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [countTilesInRow]);

  useLayoutEffect(() => {
    setIsSSR(checkIsSSR());
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest("#sectionScroll")) {
        document.body.classList.add("no-select");
      }
    };
    const onMouseUp = () => document.body.classList.remove("no-select");

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.classList.remove("no-select");
    };
  }, []);

  return isSSR ? null : (
    <SelectionAreaComponent
      containerClass="section-scroll"
      selectableClass={selectableClass}
      scrollClass="section-scroll"
      viewAs={filesViewAs || "row"}
      itemsContainerClass="ReactVirtualized__Grid__innerScrollContainer"
      arrayTypes={arrayTypes}
      itemClass="files-item"
      onMove={onMove}
      folderHeaderHeight={35}
      countTilesInRow={countTilesInRow}
      defaultHeaderHeight={46}
    />
  );
});

export default SelectionArea;
