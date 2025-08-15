// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useState, useLayoutEffect } from "react";
import { isMobile } from "react-device-detect";
import { observer, inject } from "mobx-react";
import { SelectionArea as SelectionAreaComponent } from "@docspace/shared/components/selection-area";
import { getCountTilesInRow } from "@docspace/shared/utils";

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

  const onMove = ({ added, removed, clear }) => {
    setSelections(added, removed, clear);
  };

  const selectableClass = viewAs === "tile" ? "files-item" : "window-item";

  const getCountOfMissingFilesTiles = (itemsLength) => {
    const division = itemsLength % countTilesInRow;
    return division ? countTilesInRow - division : 0;
  };

  const arrayTypes = [
    {
      type: "file",
      rowCount: Math.ceil(filesLength / countTilesInRow),
      rowGap: 14,
      countOfMissingTiles: getCountOfMissingFilesTiles(filesLength),
    },
    {
      type: "folder",
      rowCount: Math.ceil(foldersLength / countTilesInRow),
      rowGap: isRooms ? 14 : 12,
      countOfMissingTiles: getCountOfMissingFilesTiles(foldersLength),
    },
  ];

  const isEnabled =
    selectionAreaIsEnabled && !isMobile && !dragging && !isIndexEditingMode;

  return isEnabled ? (
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
      onMouseDown={() => setWithContentSelection(false)}
    />
  ) : null;
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
