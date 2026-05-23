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

import { observer } from "mobx-react";
import React, { useCallback, useEffect, useState } from "react";
import uniqueid from "lodash/uniqueId";

import { TileSkeleton } from "@docspace/shared/skeletons/tiles";
import { getCountTilesInRow } from "@docspace/shared/utils";
import { InfiniteLoaderComponent } from "@docspace/ui-kit/components/infinite-loader";

import type { InfiniteGridProps } from "@/app/(docspace)/(files)/_components/tile-view/TileView.types";
import classNames from "classnames";
import styles from "./InfiniteGrid.module.scss";

const HeaderItem = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  return (
    <div className={classNames(styles.headerItem, className, "header-item")}>
      {children}
    </div>
  );
};

const Card = ({ children }: { children: React.ReactNode }) => {
  const getItemSize = (child: React.ReactNode) => {
    const horizontalGap = 16;
    const verticalGap = 14;
    const verticalRoomGap = 16;
    const headerMargin = 15;

    const folderHeight = 64 + verticalGap;
    const roomHeight = 104 + verticalRoomGap;
    const fileHeight = 220 + horizontalGap;
    const titleHeight = 20 + headerMargin;
    const templateHeight = 126 + verticalRoomGap;

    if (!React.isValidElement(child)) return titleHeight;

    const className = (child?.props as { className?: string })?.className ?? "";
    const isFile = className.includes("file");
    const isFolder = className.includes("folder");
    const isRoom = className.includes("room");
    const isTemplate = className.includes("template");

    if (isRoom) return roomHeight;
    if (isFolder) return folderHeight;
    if (isFile) return fileHeight;
    if (isTemplate) return templateHeight;
    return titleHeight;
  };

  const cardHeight = getItemSize(children);

  return (
    <div className="Card" style={{ height: `${cardHeight}px` }}>
      {children}
    </div>
  );
};

const Item = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) => {
  return (
    <div className={classNames(styles.item, className, "Item")}>{children}</div>
  );
};

const InfiniteGrid = (props: InfiniteGridProps) => {
  const {
    children,
    hasMoreFiles,
    fetchMoreFiles,
    filesLength,
    className,
    currentFolderId,
  } = props;

  const [countTilesInRow, setCountTilesInRow] = useState(0);

  let cards: React.ReactElement<{
    children: React.ReactElement<{
      className?: string;
    }>;
  }>[] = [];

  const list: React.ReactElement<{
    className?: string;
  }>[] = [];

  const addItemToList = (key: string, cls: string, clear?: boolean) => {
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

    const cardClassName = card?.props?.children?.props?.className ?? "";
    const listClassName = listItem?.props?.className ?? "";

    const isFile = useTempList
      ? cardClassName.includes("file")
      : listClassName.includes("isFile");
    if (isFile) return "isFile";

    const isFolder = useTempList
      ? cardClassName.includes("folder")
      : listClassName.includes("isFolder");
    if (isFolder) return "isFolder";

    const isTemplate = useTempList
      ? cardClassName.includes("template")
      : listClassName.includes("isTemplate");
    if (isTemplate) return "isTemplate";

    return "isRoom";
  };

  const onResize = useCallback(() => {
    const newCount = getCountTilesInRow();
    setCountTilesInRow((prev) => (prev !== newCount ? newCount : prev));
  }, []);

  useEffect(() => {
    onResize();

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  if (children && React.isValidElement(children)) {
    React.Children.map(
      (children.props as { children: React.ReactNode }).children,
      (child) => {
        if (child) {
          const childElement = child as React.ReactElement<{
            "data-type"?: string;
            className?: string;
          }>;
          if (childElement.props["data-type"] === "header") {
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
                {childElement}
              </HeaderItem>,
            );
          } else {
            const childClassName = childElement.props?.className ?? "";
            const isFile = childClassName.includes("file");
            const isRoom = childClassName.includes("room");
            const isTemplate = childClassName.includes("template");
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
            cards.push(<Card key={cardKey}>{childElement}</Card>);
          }
        }
      },
    );
  }

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
    <InfiniteLoaderComponent
      viewAs="tile"
      countTilesInRow={countTilesInRow}
      filesLength={filesLength}
      hasMoreFiles={hasMoreFiles}
      itemCount={hasMoreFiles ? list.length + 1 : list.length}
      loadMoreItems={fetchMoreFiles}
      className={classNames(styles.infiniteLoader, "TileList", className)}
      currentFolderId={currentFolderId}
      itemSize={0}
    >
      {list}
    </InfiniteLoaderComponent>
  );
};

export default observer(InfiniteGrid);
