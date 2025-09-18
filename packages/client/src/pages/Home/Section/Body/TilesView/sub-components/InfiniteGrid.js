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

import { inject, observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import uniqueid from "lodash/uniqueId";

import { TileSkeleton } from "@docspace/shared/skeletons/tiles";
import { getCountTilesInRow } from "@docspace/shared/utils";

import {
  StyledCard,
  StyledItem,
  StyledHeaderItem,
  StyledInfiniteLoader,
} from "./StyledInfiniteGrid";

const HeaderItem = ({ children, className, ...rest }) => {
  return (
    <StyledHeaderItem className={`${className} header-item`} {...rest}>
      {children}
    </StyledHeaderItem>
  );
};

const Card = ({ children, ...rest }) => {
  const getItemSize = (child) => {
    const isFile = child?.props?.className?.includes("file");
    const isFolder = child?.props?.className?.includes("folder");
    const isRoom = child?.props?.className?.includes("room");
    const isTemplate = child?.props?.className?.includes("template");

    const horizontalGap = 16;
    const verticalGap = 14;
    const verticalRoomGap = 16;
    const headerMargin = 15;

    const folderHeight = 64 + verticalGap;
    const roomHeight = 104 + verticalRoomGap;
    const fileHeight = 220 + horizontalGap;
    const titleHeight = 20 + headerMargin;
    const templateHeight = 126 + verticalRoomGap;

    if (isRoom) return roomHeight;
    if (isFolder) return folderHeight;
    if (isFile) return fileHeight;
    if (isTemplate) return templateHeight;
    return titleHeight;
  };

  const cardHeight = getItemSize(children);

  return (
    <StyledCard className="Card" cardHeight={cardHeight} {...rest}>
      {children}
    </StyledCard>
  );
};

const Item = ({ children, className, ...rest }) => {
  const isRoom = className === "isRoom";
  const isTemplate = className === "isTemplate";
  return (
    <StyledItem
      className={`Item ${className}`}
      isRoom={isRoom}
      isTemplate={isTemplate}
      {...rest}
    >
      {children}
    </StyledItem>
  );
};

const InfiniteGrid = (props) => {
  const {
    children,
    hasMoreFiles,
    fetchMoreFiles,
    filesLength,
    className,
    currentFolderId,
    isRooms,
    isTemplates,
    ...rest
  } = props;

  const [countTilesInRow, setCountTilesInRow] = useState();

  let cards = [];
  const list = [];

  const addItemToList = (key, cls, clear) => {
    list.push(
      <Item key={key} className={cls}>
        {cards}
      </Item>,
    );
    if (clear) cards = [];
  };

  const checkType = (useTempList = true) => {
    const card = cards[cards.length - 1];
    const listItem = list[list.length - 1];

    const isFile = useTempList
      ? card.props.children.props.className.includes("file")
      : listItem.props.className.includes("isFile");

    if (isFile) return "isFile";

    const isFolder = useTempList
      ? card.props.children.props.className.includes("folder")
      : listItem.props.className.includes("isFolder");

    if (isFolder) return "isFolder";

    const isTemplate = useTempList
      ? card.props.children.props.className.includes("template")
      : listItem.props.className.includes("isTemplate");

    if (isTemplate) return "isTemplate";

    return "isRoom";
  };

  const setTilesCount = () => {
    const newCount = getCountTilesInRow(isRooms, isTemplates);
    if (countTilesInRow !== newCount) setCountTilesInRow(newCount);
  };

  const onResize = () => {
    setTilesCount();
  };

  useEffect(() => {
    onResize();

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  React.Children.map(children.props.children, (child) => {
    if (child) {
      if (child?.props["data-type"] === "header") {
        // If cards is not empty then put the cards into the list
        if (cards.length) {
          const type = checkType();

          addItemToList(`last-item-of_${type}`, type, true);
        }

        list.push(
          <HeaderItem
            className={list.length ? "files_header" : "folder_header"}
            key="header_item"
          >
            {child}
          </HeaderItem>,
        );
      } else {
        const isFile = child?.props?.className?.includes("file");
        const isRoom = child?.props?.className?.includes("room");
        const isTemplate = child?.props?.className?.includes("template");
        const cls = isFile
          ? "isFile"
          : isRoom
            ? "isRoom"
            : isTemplate
              ? "isTemplate"
              : "isFolder";

        if (cards.length && cards.length === countTilesInRow) {
          const listKey = uniqueid("list-item_");
          addItemToList(listKey, cls, true);
        }

        const cardKey = uniqueid("card-item_");
        cards.push(
          <Card countTilesInRow={countTilesInRow} key={cardKey}>
            {child}
          </Card>,
        );
      }
    }
  });

  const type = checkType(!!cards.length);

  if (hasMoreFiles) {
    // If cards elements are full, it will add the full line of loaders
    if (cards.length === countTilesInRow) {
      addItemToList("loaded-row", type, true);
    }
    // Added line of loaders
    while (countTilesInRow > cards.length && cards.length !== countTilesInRow) {
      const key = `tiles-loader_${countTilesInRow - cards.length}`;
      cards.push(
        <TileSkeleton
          key={key}
          className={`tiles-loader ${type}`}
          isFolder={type === "isFolder"}
          isRoom={type === "isRoom"}
        />,
      );
    }

    addItemToList("loaded-row", type);
  } else if (cards.length) {
    // Adds loaders until the row is full
    const listKey = uniqueid("list-item_");
    addItemToList(listKey, type);
  }
  return (
    <StyledInfiniteLoader
      viewAs="tile"
      countTilesInRow={countTilesInRow}
      filesLength={filesLength}
      hasMoreFiles={hasMoreFiles}
      itemCount={hasMoreFiles ? list.length + 1 : list.length}
      loadMoreItems={fetchMoreFiles}
      className={`TileList ${className}`}
      currentFolderId={currentFolderId}
      {...rest}
    >
      {list}
    </StyledInfiniteLoader>
  );
};

export default inject(
  ({
    filesStore,
    treeFoldersStore,
    clientLoadingStore,
    selectedFolderStore,
  }) => {
    const { filesList, hasMoreFiles, filter, fetchMoreFiles, roomsFilter } =
      filesStore;

    const { isLoading } = clientLoadingStore;
    const { isRoomsFolder, isArchiveFolder } = treeFoldersStore;

    const filesLength = filesList.length;
    const isRooms = isRoomsFolder || isArchiveFolder;

    const currentFolderId = selectedFolderStore.id;

    return {
      filesList,
      hasMoreFiles,
      filterTotal: isRooms ? roomsFilter.total : filter.total,
      fetchMoreFiles,
      filesLength,
      isLoading,
      currentFolderId,
    };
  },
)(observer(InfiniteGrid));
