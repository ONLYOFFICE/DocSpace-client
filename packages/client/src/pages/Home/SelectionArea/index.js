import React, { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import { observer, inject } from "mobx-react";
import SelectionAreaComponent from "@docspace/components/selection-area";

const SelectionArea = (props) => {
  const {
    dragging,
    viewAs,
    setSelections,
    getCountTilesInRow,
    isRooms,
    foldersLength,
    filesLength,
    boardsLength,
    isInfoPanelVisible,
  } = props;

  const [countTilesInRow, setCountTilesInRow] = useState(getCountTilesInRow());

  useEffect(() => {
    setTilesCount();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [isInfoPanelVisible]);

  const onResize = () => {
    setTilesCount();
  };

  const setTilesCount = () => {
    const newCount = getCountTilesInRow();
    if (countTilesInRow !== newCount) setCountTilesInRow(newCount);
  };

  const onMove = ({ added, removed, clear }) => {
    setSelections(added, removed, clear);
  };

  const selectableClass = viewAs === "tile" ? "files-item" : "window-item";

  const countRowsOfFolders = Math.ceil(foldersLength / countTilesInRow);

  const countRowsOfBoards = Math.ceil(boardsLength / countTilesInRow);

  const foldersDivision = foldersLength % countTilesInRow;

  const countOfMissingFolderTiles = foldersDivision
    ? countTilesInRow - foldersDivision
    : 0;

  const boardsDivision = boardsLength % countTilesInRow;

  const countOfMissingBoardTiles = boardsDivision
    ? countTilesInRow - boardsDivision
    : 0;

  const countRowsOfFiles = Math.ceil(filesLength / countTilesInRow);
  const filesDivision = filesLength % countTilesInRow;
  const countOfMissingFilesTiles = filesDivision
    ? countTilesInRow - filesDivision
    : 0;

  return isMobile || dragging ? (
    <></>
  ) : (
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
      arrayTypes={[
        {
          type: "board",
          rowCount: countRowsOfBoards,
          rowGap: 12,
          countOfMissingTiles: countOfMissingBoardTiles,
        },
        {
          type: "file",
          rowCount: countRowsOfFiles,
          rowGap: 14,
          countOfMissingTiles: countOfMissingFilesTiles,
        },
        {
          type: "folder",
          rowCount: countRowsOfFolders,
          rowGap: 12,
          countOfMissingTiles: countOfMissingFolderTiles,
        },
      ]}
    />
  );
};

export default inject(({ auth, filesStore, treeFoldersStore }) => {
  const {
    dragging,
    viewAs,
    setSelections,
    getCountTilesInRow,
    folders,
    files,
    boards,
  } = filesStore;
  const { isRoomsFolder, isArchiveFolder } = treeFoldersStore;
  const { isVisible: isInfoPanelVisible } = auth.infoPanelStore;

  const isRooms = isRoomsFolder || isArchiveFolder;

  return {
    dragging,
    viewAs,
    setSelections,
    getCountTilesInRow,
    isRooms,
    boardsLength: boards.length,
    foldersLength: folders.length,
    filesLength: files.length,
    isInfoPanelVisible,
  };
})(observer(SelectionArea));
