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

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  InfiniteLoader,
  WindowScroller,
  List,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
import classNames from "classnames";

import { TileSkeleton } from "../../../skeletons/tiles";
import { RectangleSkeleton } from "../../../skeletons/rectangle";

import { GridComponentProps } from "../InfiniteLoader.types";
import styles from "../InfiniteLoader.module.scss";

const GridDynamicHeight = ({
  hasMoreFiles,
  filesLength,
  itemCount,
  loadMoreItems,
  onScroll,
  countTilesInRow = 1,
  children,
  className,
  scroll,
  showSkeleton,
  currentFolderId,
}: GridComponentProps) => {
  const loaderRef = useRef<InfiniteLoader | null>(null);
  const listRef = useRef<List | null>(null);

  // Create a cache to store height measurements
  const [cache] = useState(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        minHeight: 10, // Minimum height for any tile
        keyMapper: (index) => index, // Use index as the key for cache
      }),
  );

  const usePrevious = (value?: number | string) => {
    const prevRef = useRef<number | string>(undefined);

    useEffect(() => {
      prevRef.current = value;
    });

    return prevRef.current;
  };

  const prevCurrentFolderId = usePrevious(currentFolderId);

  useEffect(() => {
    if (currentFolderId !== prevCurrentFolderId) {
      // Reset cache when folder changes
      cache.clearAll();
      listRef?.current?.recomputeRowHeights();
    }
  });

  const isItemLoaded = useCallback(
    ({ index }: { index: number }) => {
      return !hasMoreFiles || (index + 1) * countTilesInRow < filesLength;
    },
    [filesLength, hasMoreFiles, countTilesInRow],
  );

  const renderTile = ({
    index,
    style,
    key,
    isScrolling,
    parent, // Required for CellMeasurer
  }: {
    index: number;
    style: React.CSSProperties;
    key: string;
    isScrolling: boolean;
    parent: { measure: () => void }; // Parent for CellMeasurer with measure function
  }) => {
    const elem = children[index] as React.ReactElement;
    const itemClassNames = (elem.props as { className?: string })?.className;

    const isFolder = itemClassNames?.includes("isFolder");
    const isRoom = itemClassNames?.includes("isRoom");
    const isHeader =
      itemClassNames?.includes("folder_header") ||
      itemClassNames?.includes("files_header");

    if (isScrolling && showSkeleton) {
      const list = [];
      let i = 0;

      if (isHeader) {
        return (
          <div key={key} style={style}>
            <div className={styles.item}>
              <RectangleSkeleton height="22px" width="100px" animate />
            </div>
          </div>
        );
      }

      while (i < countTilesInRow) {
        list.push(
          <TileSkeleton
            key={`${key}_${i}`}
            isFolder={isFolder}
            isRoom={isRoom}
          />,
        );
        i += 1;
      }

      return (
        <div key={key} style={style}>
          <div className={styles.item}>{list.map((item) => item)}</div>
        </div>
      );
    }

    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {({ measure }) => {
          // Schedule measurement after render using setTimeout
          // This avoids the need for a ref callback that could trigger React 19 warnings
          setTimeout(() => measure(), 0);

          return (
            <div
              className="window-item"
              style={{
                ...style,
                height: "auto", // Allow the item to determine its own height
                width: "auto", // Ensure full width
              }}
              key={key}
              data-row-index={Math.floor(index / countTilesInRow)}
              data-cell-index={index}
            >
              <div className="card-container" style={{ height: "100%" }}>
                {children[index]}
              </div>
            </div>
          );
        }}
      </CellMeasurer>
    );
  };

  const getItemSize = ({ index }: { index: number }) => {
    // Use the CellMeasurerCache to get the dynamic height for this index
    const height = cache.rowHeight({ index });

    // Get the actual element to check if it's a FileTile or similar component
    // that needs extra height accommodation
    // const elem = children[index] as React.ReactElement;
    // const itemClassNames = (elem?.props as { className?: string })?.className;

    // console.log("elem", elem);
    // // Add extra buffer for certain types of content that might need more space
    // if (itemClassNames?.includes("isTemplateGallery")) {
    //   console.log("Adding buffer for isTemplate ");
    //   // Ensure FileTile elements have enough space by adding a buffer
    //   return height + 16; // Extra 16px buffer for FileTile elements
    // }

    return height;
  };

  // Function to initialize the cache with estimated heights
  const initializeCache = useCallback(() => {
    if (!children || children.length === 0) return;

    children.forEach((child, index) => {
      const elem = child as React.ReactElement;

      if (
        React.isValidElement(elem) &&
        typeof elem !== "string" &&
        typeof elem !== "boolean" &&
        typeof elem !== "number"
      ) {
        const props = elem?.props as { className?: string };
        const itemClassNames = props?.className;
        const isFile = itemClassNames?.includes("isFile");
        const isFolder = itemClassNames?.includes("isFolder");
        const isRoom = itemClassNames?.includes("isRoom");
        const isTemplate = itemClassNames?.includes("isTemplate");
        const isFolderHeader = itemClassNames?.includes("folder_header");

        const horizontalGap = 16;
        const verticalGap = 14;
        const verticalRoomGap = 16;
        const headerMargin = 15;

        // Add buffer for height to ensure content fits
        const folderHeight = 64 + verticalGap;
        const roomHeight = 104 + verticalRoomGap;
        const fileHeight = 220 + horizontalGap;
        const templateHeight = 150 + verticalRoomGap; // Increased to accommodate FileTile content
        const titleHeight = 20 + headerMargin + (isFolderHeader ? 0 : 11);

        let estimatedHeight = 0;
        if (isRoom) estimatedHeight = roomHeight;
        else if (isFolder) estimatedHeight = folderHeight;
        else if (isFile) estimatedHeight = fileHeight;
        else if (isTemplate) estimatedHeight = templateHeight;
        else estimatedHeight = titleHeight;

        // Set the estimated height in the cache
        cache.set(index, 0, estimatedHeight);
      }
    });
  }, [children, cache]);

  // Initialize cache with estimated heights on children change
  useEffect(() => {
    initializeCache();
  }, [children, initializeCache]);

  const listClassName = classNames(styles.list, className, styles.tile);

  return (
    <InfiniteLoader
      isRowLoaded={isItemLoaded}
      rowCount={itemCount}
      loadMoreRows={loadMoreItems}
      ref={loaderRef}
      data-testid="infinite-loader-container-grid"
    >
      {({ onRowsRendered, registerChild }) => (
        <WindowScroller scrollElement={scroll}>
          {({ height, isScrolling, onChildScroll, scrollTop }) => {
            let newHeight = height;
            if (height === undefined && scroll instanceof Element) {
              newHeight = scroll.getBoundingClientRect().height;
            }

            const width =
              document.getElementById("tileContainer")?.getBoundingClientRect()
                .width ?? 0;

            return (
              <List
                autoHeight
                height={newHeight}
                onRowsRendered={onRowsRendered}
                ref={(ref) => {
                  if (ref !== null) {
                    listRef.current = ref;
                    registerChild(ref);
                  }
                }}
                rowCount={children.length}
                deferredMeasurementCache={cache}
                rowHeight={getItemSize}
                rowRenderer={renderTile}
                width={width}
                isScrolling={isScrolling}
                onChildScroll={onChildScroll}
                scrollTop={scrollTop}
                overscanRowCount={3}
                onScroll={onScroll}
                className={listClassName}
              />
            );
          }}
        </WindowScroller>
      )}
    </InfiniteLoader>
  );
};

export default GridDynamicHeight;
