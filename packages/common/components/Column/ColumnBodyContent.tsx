import { ComponentType, useCallback } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList, ListChildComponentProps } from "react-window";

import { CustomScrollbarsVirtualList } from "@docspace/components";

import Card from "../Card";
import Loaders from "../Loaders";

import type { ColumnBodyContentProps, ListChildDataType } from "./Column.props";

function ColumnBodyContent({
  isLoading,
  filesByRole,
  onSelected,
}: ColumnBodyContentProps) {
  const rowRender: ComponentType<ListChildComponentProps<ListChildDataType>> =
    useCallback(
      ({ index, data, style, isScrolling }) => {
        const { files } = data;

        if (!files) return <></>;

        const file = files[index];

        return (
          <div key={file.id} style={style}>
            <Card key={file.id} file={file} onSelected={onSelected} />
          </div>
        );
      },
      [onSelected]
    );

  if (isLoading) {
    return (
      <>
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
        <Loaders.Rectangle width="264px" height="107px" />
      </>
    );
  }

  const itemCount = filesByRole?.length ?? 0;

  return (
    <>
      <AutoSizer>
        {({ height }: { height: number }) => (
          <InfiniteLoader
            itemCount={itemCount}
            loadMoreItems={(startIndex, stopIndex) => {}}
            isItemLoaded={(index) => {
              return false;
            }}
          >
            {({ onItemsRendered, ref }) => (
              <FixedSizeList
                ref={ref}
                layout="vertical"
                width={270}
                height={height}
                itemSize={120}
                itemData={{
                  files: filesByRole,
                }}
                overscanCount={3}
                itemCount={itemCount}
                onItemsRendered={onItemsRendered}
                outerElementType={CustomScrollbarsVirtualList}
              >
                {rowRender}
              </FixedSizeList>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </>
  );
}

export default ColumnBodyContent;
