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

import { inject, observer } from "mobx-react";
import React from "react";
import uniqueid from "lodash/uniqueId";

import { TileSkeleton } from "@docspace/shared/skeletons/tiles";
import { getCountTilesInGrid } from "@docspace/shared/utils";
import { useGridColumns } from "@docspace/shared/hooks/useGridColumns";
import { RoomsType } from "@docspace/shared/enums";

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

// The rooms of the AI section - an agent, a skill set, a knowledge base - are
// rooms to the tile container, which wraps them as one; their tiles are
// taller, so their rows are told apart by the room type of the item.
const AI_TILE_ROOM_TYPES = [
  RoomsType.AiProjectRoom,
  RoomsType.InstructionsRoom,
  RoomsType.KnowledgeRoom,
];

const getTileRoomType = (child) =>
  child?.props?.children?.props?.item?.roomType;

const isAgentTile = (child) =>
  AI_TILE_ROOM_TYPES.includes(getTileRoomType(child));

// An agent's card holds five rows, a skill set's four and a knowledge
// base's three. Keep in step with AiProjectTile.module.scss.
const AI_TILE_HEIGHTS = {
  [RoomsType.AiProjectRoom]: 290,
  [RoomsType.InstructionsRoom]: 182,
  [RoomsType.KnowledgeRoom]: 154,
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

    if (isAgentTile(child))
      return AI_TILE_HEIGHTS[getTileRoomType(child)] + verticalRoomGap;
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
  // A row of agents lays out as a row of rooms, with wider and taller cards.
  const isAgent = className === "isAgent";
  const isRoom = className === "isRoom" || isAgent;
  const isTemplate = className === "isTemplate";
  return (
    <StyledItem
      className={`Item ${className}`}
      isRoom={isRoom}
      isTemplate={isTemplate}
      isAgent={isAgent}
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
    isAgents,
    tilesGridColumns,
    setTilesGridColumns,
    ...rest
  } = props;

  const countTilesInRow =
    tilesGridColumns || getCountTilesInGrid(isRooms, isTemplates, isAgents);

  const observeRow = useGridColumns(setTilesGridColumns);

  let cards = [];
  const list = [];
  const aiRoomTypes = new Set();

  const addItemToList = (key, cls, clear) => {
    list.push(
      <Item key={key} className={cls} ref={observeRow}>
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

    const isAgent = useTempList
      ? isAgentTile(card.props.children)
      : listItem.props.className.includes("isAgent");

    if (isAgent) return "isAgent";

    return "isRoom";
  };

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
            key={list.length ? "files_header" : "folder_header"}
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
          : isAgentTile(child)
            ? "isAgent"
            : isRoom
            ? "isRoom"
            : isTemplate
              ? "isTemplate"
              : "isFolder";

        if (cards.length && cards.length === countTilesInRow) {
          const key = cards.map((card) => card.key).join("_");

          const listKey = `list_${key}`;
          addItemToList(listKey, cls, true);
        }

        if (isAgentTile(child)) aiRoomTypes.add(getTileRoomType(child));

        const key = child?.props?.children?.props?.id;

        const cardKey = key ? `card-item_${key}` : uniqueid("card-item_");

        cards.push(
          <Card key={cardKey}>
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
          isRoom={type === "isRoom" || type === "isAgent"}
        />,
      );
    }

    addItemToList("loaded-row", type);
  } else if (cards.length) {
    const key = cards.map((card) => card.key).join("_");

    // Adds loaders until the row is full
    const listKey = `list-${key}`;
    addItemToList(listKey, type);
  }
  // The grid caches its row heights and measures them again only when this
  // key changes. The folder alone is not enough: Agents, Skill sets and
  // Knowledge bases are one folder narrowed to a room type, and an agent's
  // row is taller than a room's, so the kinds of rows shown are part of it -
  // and the room types of the AI cards, each as high as its own rows.
  const rowKinds = [
    ...new Set(list.map((row) => row.props.className ?? "")),
    ...aiRoomTypes,
  ].join(" ");
  const rowHeightsKey = `${currentFolderId}:${rowKinds}`;

  return (
    <StyledInfiniteLoader
      viewAs="tile"
      countTilesInRow={countTilesInRow}
      filesLength={filesLength}
      hasMoreFiles={hasMoreFiles}
      itemCount={hasMoreFiles ? list.length + 1 : list.length}
      loadMoreItems={fetchMoreFiles}
      className={`TileList ${className}`}
      currentFolderId={rowHeightsKey}
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
    hotkeyStore,
  }) => {
    const { filesList, hasMoreFiles, filter, fetchMoreFiles, roomsFilter } =
      filesStore;
    const { tilesGridColumns, setTilesGridColumns } = hotkeyStore;

    const { isLoading } = clientLoadingStore;
    const { isRoomsFolder, isArchiveFolder, isFormsFolder, isAiSectionFolder } = treeFoldersStore;

    const filesLength = filesList.length;
    const isRooms = isRoomsFolder || isArchiveFolder || isFormsFolder || isAiSectionFolder;

    const currentFolderId = selectedFolderStore.id;

    // The lists of the AI Chat section: their rows are agent-sized cards,
    // for agents, skill sets and knowledge bases alike (see isAgentTile).
    const isAgents =
      isAiSectionFolder &&
      filesList.some((item) => AI_TILE_ROOM_TYPES.includes(item.roomType));

    return {
      filesList,
      isAgents,
      hasMoreFiles,
      filterTotal: isRooms ? roomsFilter.total : filter.total,
      fetchMoreFiles,
      filesLength,
      isLoading,
      currentFolderId,
      tilesGridColumns,
      setTilesGridColumns,
    };
  },
)(observer(InfiniteGrid));
