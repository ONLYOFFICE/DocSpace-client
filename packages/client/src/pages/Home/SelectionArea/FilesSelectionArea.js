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

import React, { useState, useLayoutEffect, useMemo, useCallback } from "react";
import { isMobile } from "react-device-detect";
import { observer, inject } from "mobx-react";
import { SelectionArea as SelectionAreaComponent } from "@docspace/ui-kit/components/selection-area";
import { getCountTilesInRow } from "@docspace/shared/utils";

const getCountOfMissingFilesTiles = (itemsLength, countTilesInRow) => {
  const division = itemsLength % countTilesInRow;
  return division ? countTilesInRow - division : 0;
};

const SelectionArea = (props) => {
  const {
    dragging,
    viewAs,
    setSelections,
    isRooms,
    foldersLength,
    filesLength,
    isInfoPanelVisible,
    isIndexEditingMode,
    selectionAreaIsEnabled,
    setWithContentSelection,
  } = props;

  const [countTilesInRow, setCountTilesInRow] = useState();

  const setTilesCount = () => {
    if (isRooms === undefined) return;
    const newCount = getCountTilesInRow(isRooms);
    if (countTilesInRow !== newCount) setCountTilesInRow(newCount);
  };

  const onResize = () => {
    setTilesCount();
  };

  useLayoutEffect(() => {
    setTilesCount();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [isInfoPanelVisible, onResize]);

  const onMove = useCallback(
    ({ added, removed, clear }) => {
      setSelections(added, removed, clear);
    },
    [setSelections],
  );

  const onMouseDown = useCallback(() => {
    setWithContentSelection(false);
  }, [setWithContentSelection]);

  const selectableClass = viewAs === "tile" ? "files-item" : "window-item";

  const arrayTypes = useMemo(
    () => [
      {
        type: "file",
        rowCount: Math.ceil(filesLength / countTilesInRow),
        rowGap: 14,
        countOfMissingTiles: getCountOfMissingFilesTiles(
          filesLength,
          countTilesInRow,
        ),
      },
      {
        type: "folder",
        rowCount: Math.ceil(foldersLength / countTilesInRow),
        rowGap: isRooms ? 14 : 12,
        countOfMissingTiles: getCountOfMissingFilesTiles(
          foldersLength,
          countTilesInRow,
        ),
      },
    ],
    [filesLength, foldersLength, countTilesInRow, isRooms],
  );

  const isEnabled =
    selectionAreaIsEnabled && !isMobile && !dragging && !isIndexEditingMode;

  if (!isEnabled) return null;

  return (
    <SelectionAreaComponent
      containerClass="section-scroll"
      scrollClass="section-scroll"
      itemsContainerClass="ReactVirtualized__Grid__innerScrollContainer"
      selectableClass={selectableClass}
      itemClass="files-item"
      onMove={onMove}
      viewAs={viewAs}
      countTilesInRow={countTilesInRow}
      isRooms={isRooms}
      folderHeaderHeight={35}
      defaultHeaderHeight={46}
      arrayTypes={arrayTypes}
      onMouseDown={onMouseDown}
    />
  );
};

export default inject(
  ({
    filesStore,
    treeFoldersStore,
    infoPanelStore,
    indexingStore,
    hotkeyStore,
  }) => {
    const { dragging, viewAs, setSelections, folders, files } = filesStore;
    const { isRoomsFolder, isArchiveFolder } = treeFoldersStore;
    const { isVisible: isInfoPanelVisible } = infoPanelStore;
    const { isIndexEditingMode } = indexingStore;
    const { selectionAreaIsEnabled, setWithContentSelection } = hotkeyStore;

    const isRooms = isRoomsFolder || isArchiveFolder;

    return {
      dragging,
      viewAs,
      setSelections,
      isRooms,
      foldersLength: folders.length,
      filesLength: files.length,
      isInfoPanelVisible,
      isIndexEditingMode,
      selectionAreaIsEnabled,
      setWithContentSelection,
    };
  },
)(observer(SelectionArea));
