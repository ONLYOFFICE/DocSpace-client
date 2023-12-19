import React, { useCallback, useRef } from "react";
import { InfiniteLoader, WindowScroller } from "react-virtualized";

import { TableSkeleton } from "../../../skeletons/table";
import { RowsSkeleton } from "../../../skeletons/rows";

import { StyledList } from "../InfiniteLoader.styled";
import { ListComponentProps } from "../InfiniteLoader.types";

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
}: ListComponentProps) => {
  const loaderRef = useRef<InfiniteLoader | null>(null);

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
  }: {
    key: string;
    index: number;
    style: React.CSSProperties;
  }) => {
    const isLoaded = isItemLoaded({ index });
    if (!isLoaded) return getLoader(style, key);

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
  }: {
    index: number;
    style: React.CSSProperties;
    key: string;
  }) => {
    const storageSize = infoPanelVisible
      ? columnInfoPanelStorageName
        ? localStorage.getItem(columnInfoPanelStorageName) || undefined
        : undefined
      : columnStorageName
        ? localStorage.getItem(columnStorageName) || undefined
        : undefined;

    const isLoaded = isItemLoaded({ index });
    if (!isLoaded) return getLoader(style, key);

    return (
      <div
        className="table-list-item window-item"
        style={{
          ...style,
          display: "grid",
          gridTemplateColumns: storageSize,
        }}
        key={key}
      >
        {children[index]}
      </div>
    );
  };

  return (
    <InfiniteLoader
      isRowLoaded={isItemLoaded}
      rowCount={itemCount}
      loadMoreRows={loadMoreItems}
      ref={loaderRef}
    >
      {({ onRowsRendered, registerChild }) => (
        <WindowScroller scrollElement={scroll}>
          {({ height, isScrolling, onChildScroll, scrollTop }) => {
            if (height === undefined && scroll instanceof Element) {
              height = scroll.getBoundingClientRect().height;
            }

            const viewId =
              viewAs === "table" ? "table-container" : "rowContainer";

            const width =
              document.getElementById(viewId)?.getBoundingClientRect().width ??
              0;
            return (
              <StyledList
                autoHeight
                height={height}
                onRowsRendered={onRowsRendered}
                ref={registerChild}
                rowCount={hasMoreFiles ? children.length + 2 : children.length}
                rowHeight={itemSize}
                rowRenderer={viewAs === "table" ? renderTable : renderRow}
                width={width}
                className={className}
                isScrolling={isScrolling}
                onChildScroll={onChildScroll}
                scrollTop={scrollTop}
                overscanRowCount={3}
                onScroll={onScroll}
                viewAs={viewAs}
              />
            );
          }}
        </WindowScroller>
      )}
    </InfiniteLoader>
  );
};

export default ListComponent;
