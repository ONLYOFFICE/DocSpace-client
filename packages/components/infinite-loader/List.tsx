import React, { useCallback, useEffect, createRef } from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { InfiniteLoader, WindowScroller } from "react-virtualized";
import TableSkeleton from "../skeletons/table";
import RowsSkeleton from "../skeletons/rows";
import { StyledList } from "./StyledInfiniteLoader";

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
  infoPanelVisible
}: any) => {
  const loaderRef = createRef();

  const renderRow = ({
    key,
    index,
    style
  }: any) => {
    const isLoaded = isItemLoaded({ index });
    if (!isLoaded) return getLoader(style, key);

    return (
      <div className="row-list-item window-item" style={style} key={key}>
        {children[index]}
      </div>
    );
  };

  const isItemLoaded = useCallback(
    ({
      index
    }: any) => !hasMoreFiles || index < filesLength,
    [filesLength, hasMoreFiles]
  );

  const renderTable = ({
    index,
    style,
    key
  }: any) => {
    const storageSize = infoPanelVisible
      ? localStorage.getItem(columnInfoPanelStorageName)
      : localStorage.getItem(columnStorageName);

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

  const getLoader = (style: any, key: any) => {
    switch (viewAs) {
      case "table":
        return (
          <TableSkeleton
            key={key}
            // @ts-expect-error TS(2322): Type '{ key: any; style: any; className: string; c... Remove this comment to see the full error message
            style={style}
            className="table-container_body-loader"
            count={1}
          />
        );
      case "row":
        return (
          <RowsSkeleton
            key={key}
            // @ts-expect-error TS(2322): Type '{ key: any; style: any; className: string; c... Remove this comment to see the full error message
            style={style}
            className="row-loader"
            count={1}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <InfiniteLoader
      isRowLoaded={isItemLoaded}
      rowCount={itemCount}
      loadMoreRows={loadMoreItems}
      ref={loaderRef}
    >
      {({
        onRowsRendered,
        registerChild
      }: any) => (
        <WindowScroller scrollElement={scroll}>
          {({
            height,
            isScrolling,
            onChildScroll,
            scrollTop
          }: any) => {
            if (height === undefined) {
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
