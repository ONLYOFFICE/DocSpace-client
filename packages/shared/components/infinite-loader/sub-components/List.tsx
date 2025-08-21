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

import React, { useCallback, useEffect, useRef } from "react";
import { InfiniteLoader, WindowScroller, List } from "react-virtualized";
import classNames from "classnames";

import { TableSkeleton } from "../../../skeletons/table";
import { RowsSkeleton } from "../../../skeletons/rows";

import { ListComponentProps } from "../InfiniteLoader.types";
import styles from "../InfiniteLoader.module.scss";

const ListComponent = ({
  viewAs,
  hasMoreFiles,
  filesLength,
  itemCount,
  onScroll,
  loadMoreItems,
  itemSize,
  columnStorageName,
  columnInfoPanelStorageName,
  children,
  className,
  scroll,
  infoPanelVisible,
  showSkeleton,
}: ListComponentProps) => {
  const loaderRef = useRef<InfiniteLoader | null>(null);
  const listRef = useRef<List | null>(null);

  const listItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef?.current?.forceUpdate();
  });

  const getLoader = (style: React.CSSProperties, key: string) => {
    switch (viewAs) {
      case "table":
        return (
          <TableSkeleton
            key={key}
            style={style}
            className="table-container_body-loader"
            count={1}
          />
        );
      case "row":
        return (
          <RowsSkeleton
            key={key}
            style={style}
            className="row-loader"
            count={1}
          />
        );
      default:
        return null;
    }
  };

  const isItemLoaded = useCallback(
    ({ index }: { index: number }) => !hasMoreFiles || index < filesLength,
    [filesLength, hasMoreFiles],
  );

  const renderRow = ({
    key,
    index,
    style,
    isScrolling,
  }: {
    key: string;
    index: number;
    style: React.CSSProperties;
    isScrolling: boolean;
  }) => {
    const isLoaded = isItemLoaded({ index });
    if (!isLoaded || (isScrolling && showSkeleton))
      return getLoader(style, key);

    return (
      <div className="row-list-item window-item" style={style} key={key}>
        {children[index]}
      </div>
    );
  };

  const renderTable = ({
    index,
    style,
    key,
    isScrolling,
  }: {
    index: number;
    style: React.CSSProperties;
    key: string;
    isScrolling: boolean;
  }) => {
    if (!columnInfoPanelStorageName || !columnStorageName) {
      throw new Error("columnStorageName is required for a table view");
    }

    const storageSize = infoPanelVisible
      ? localStorage.getItem(columnInfoPanelStorageName)
      : localStorage.getItem(columnStorageName);

    const isLoaded = isItemLoaded({ index });
    if (!isLoaded || (isScrolling && showSkeleton))
      return getLoader(style, key);

    return (
      <div
        className="table-list-item window-item"
        ref={listItemRef}
        style={{
          ...style,
          display: "grid",
          gridTemplateColumns: storageSize!,
        }}
        key={key}
      >
        {children[index]}
      </div>
    );
  };

  const listClassName = classNames(styles.list, className, {
    [styles.tile]: viewAs === "tile",
    [styles.row]: viewAs === "row",
    [styles.table]: viewAs === "table",
  });

  return (
    <InfiniteLoader
      isRowLoaded={isItemLoaded}
      rowCount={itemCount}
      loadMoreRows={loadMoreItems}
      ref={loaderRef}
      data-testid="infinite-loader-container-list"
    >
      {({ onRowsRendered, registerChild }) => (
        <WindowScroller scrollElement={scroll}>
          {({ height, isScrolling, onChildScroll, scrollTop }) => {
            let newHeight = height;
            if (height === undefined && scroll instanceof Element) {
              newHeight = scroll.getBoundingClientRect().height;
            }

            const viewId =
              viewAs === "table" ? "table-container" : "rowContainer";

            const width =
              document.getElementById(viewId)?.getBoundingClientRect().width ??
              0;

            return (
              <List
                autoHeight
                height={newHeight}
                onRowsRendered={onRowsRendered}
                ref={(ref: List | null) => {
                  listRef.current = ref;
                  registerChild(ref);
                }}
                rowCount={hasMoreFiles ? children.length + 2 : children.length}
                rowHeight={itemSize}
                rowRenderer={viewAs === "table" ? renderTable : renderRow}
                isScrolling={isScrolling}
                onChildScroll={onChildScroll}
                scrollTop={scrollTop}
                overscanRowCount={3}
                onScroll={onScroll}
                viewAs={viewAs}
                width={width}
                // React virtualized sets "LTR" by default.
                style={
                  {
                    direction: "inherit",
                    "--infinite-loader-table-width": `${width}px`,
                  } as React.CSSProperties
                }
                className={listClassName}
              />
            );
          }}
        </WindowScroller>
      )}
    </InfiniteLoader>
  );
};

export default ListComponent;
