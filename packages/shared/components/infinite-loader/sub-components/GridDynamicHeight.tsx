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

// import { TileSkeleton } from "../../../skeletons/tiles";
// import { RectangleSkeleton } from "../../../skeletons/rectangle";

import { GridComponentProps } from "../InfiniteLoader.types";
import styles from "../InfiniteLoader.module.scss";

const GridDynamicHeight = ({
  hasMoreFiles,
  filesLength,
  itemCount,
  loadMoreItems: loadMoreRows,
  onScroll,
  countTilesInRow = 1,
  children,
  className,
  scroll,
  // showSkeleton,
  currentFolderId,
}: GridComponentProps) => {
  // Reference to the List component for recomputing row heights
  const listRef = useRef<List | null>(null);
  // Reference to track if a synchronization is already scheduled
  const synchronizationScheduled = useRef(false);
  // Reference to store any pending timeout
  const resizeTimerRef = useRef<number | null>(null);
  // Add loading state reference to prevent multiple simultaneous requests
  const isLoadingMore = useRef(false);

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

  // Fixed isItemLoaded implementation with correct logic from GridComponent
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
    // isScrolling,
    parent, // Required for CellMeasurer
  }: {
    index: number;
    style: React.CSSProperties;
    key: string;
    isScrolling: boolean;
    parent: {
      invalidateCellSizeAfterRender?: (params: {
        columnIndex: number;
        rowIndex: number;
      }) => void;
      registerChild?: (element: HTMLElement | null) => void;
    }; // Type that matches CellMeasurer requirements
  }) => {
    // const elem = children[index] as React.ReactElement;
    // const itemClassNames = (elem.props as { className?: string })?.className;

    // const isFolder = itemClassNames?.includes("isFolder");
    // const isRoom = itemClassNames?.includes("isRoom");
    // const isHeader =
    //   itemClassNames?.includes("folder_header") ||
    //   itemClassNames?.includes("files_header");

    // if (isScrolling && showSkeleton) {
    //   const list = [];
    //   let i = 0;

    //   if (isHeader) {
    //     return (
    //       <div key={key} style={style}>
    //         <div className={styles.item}>
    //           <RectangleSkeleton height="22px" width="100px" animate />
    //         </div>
    //       </div>
    //     );
    //   }

    //   while (i < countTilesInRow) {
    //     list.push(
    //       <TileSkeleton
    //         key={`${key}_${i}`}
    //         isFolder={isFolder}
    //         isRoom={isRoom}
    //       />,
    //     );
    //     i += 1;
    //   }

    //   const rowIndex = Math.floor(index / countTilesInRow);
    //   const rowHeight = cache.getHeight(rowIndex * countTilesInRow, 0);

    //   return (
    //     <div
    //       style={{
    //         ...style,
    //         height: rowHeight ? `${rowHeight}px` : "auto",
    //       }}
    //       key={key}
    //       data-row-index={rowIndex}
    //     >
    //       <div className={styles.item}>{list.map((item) => item)}</div>
    //     </div>
    //   );
    // }

    const rowIndex = Math.floor(index / countTilesInRow);
    const rowHeight = cache.getHeight(rowIndex * countTilesInRow, 0);

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
                height: rowHeight ? `${rowHeight}px` : "auto",
                width: "auto", // Ensure full width
              }}
              key={key}
              data-row-index={rowIndex}
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

  const getItemSize = useCallback(
    ({ index }: { index: number }) => {
      // Use the CellMeasurerCache to get the dynamic height for this index
      const height = cache.getHeight(index, 0);

      return height;
    },
    [cache],
  );

  // Function to get row elements and indices
  const getRowElements = () => {
    const rowElements: Record<string, HTMLElement[]> = {};
    const windowItems = document.querySelectorAll(".window-item");

    windowItems.forEach((item) => {
      const rowIndex = item.getAttribute("data-row-index");
      if (rowIndex) {
        if (!rowElements[rowIndex]) {
          rowElements[rowIndex] = [];
        }
        rowElements[rowIndex].push(item as HTMLElement);
      }
    });

    return rowElements;
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
        cache.set(index, 0, 1, estimatedHeight);
      }
    });
  }, [children, cache]);

  // Initialize cache with estimated heights on children change
  useEffect(() => {
    initializeCache();
  }, [children, initializeCache]);

  // The main synchronization function - designed to be highly resilient
  const synchronizeCardHeights = useCallback(() => {
    const rowElements = getRowElements();
    if (Object.keys(rowElements).length === 0) return;

    // Process each row
    Object.entries(rowElements).forEach(([, elements]) => {
      // Step 1: Reset heights to auto to get natural heights
      elements.forEach((element) => {
        const cards = element.querySelectorAll(".Card");
        cards.forEach((card) => {
          (card as HTMLElement).style.height = "auto";
          (card as HTMLElement).style.minHeight = "auto";
        });
      });
    });

    // Force reflow to ensure measurements are accurate
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    document.body.offsetHeight;

    // Process each row again to find max heights
    const rowMaxHeights: Record<string, number> = {};
    Object.entries(rowElements).forEach(([rowIndex, elements]) => {
      // Find maximum height in this row
      elements.forEach((element) => {
        const cards = element.querySelectorAll(".Card");
        cards.forEach((card) => {
          const cardHeight = (card as HTMLElement).offsetHeight;
          rowMaxHeights[rowIndex] = Math.max(
            rowMaxHeights[rowIndex] || 0,
            cardHeight,
          );
        });
      });
    });

    // Now apply the maximum heights to all cards in each row
    Object.entries(rowElements).forEach(([rowIndex, elements]) => {
      const maxHeight = rowMaxHeights[rowIndex];
      if (!maxHeight) return;

      // Update all cards and window items in this row
      elements.forEach((element) => {
        // Set window-item height
        element.style.height = `${maxHeight}px`;

        // Set all cards to same height
        const cards = element.querySelectorAll(".Card");
        cards.forEach((card) => {
          (card as HTMLElement).style.height = `${maxHeight}px`;
          (card as HTMLElement).style.minHeight = `${maxHeight}px`;
        });

        // Update cache for this item
        const itemIndex = parseInt(
          element.getAttribute("data-cell-index") || "0",
          10,
        );
        if (!Number.isNaN(itemIndex)) {
          cache.clear(itemIndex, 0);
          cache.set(itemIndex, 0, 1, maxHeight);
        }
      });
    });

    // Update the list in a way that preserves scroll position
    if (listRef.current) {
      // Use forceUpdateGrid instead of recomputeRowHeights to avoid scroll jumps
      listRef.current.forceUpdateGrid();
    }
  }, [cache]);

  // Enhanced loadMoreItems function with loading state control
  const handleLoadMoreItems = useCallback(
    (params: { startIndex: number; stopIndex: number }) => {
      // Don't load if we're already loading or out of files
      if (isLoadingMore.current || !hasMoreFiles) return Promise.resolve();

      // Set loading state
      isLoadingMore.current = true;

      // Return the original loadMoreRows promise but ensure we reset the loading flag when done
      return Promise.resolve(loadMoreRows(params))
        .then((result) => {
          // Short delay before allowing more loads to prevent rapid consecutive loads
          setTimeout(() => {
            isLoadingMore.current = false;

            // Force synchronize card heights after loading new items
            synchronizeCardHeights();
          }, 300);
          return result;
        })
        .catch((error) => {
          console.error("Error loading more items:", error);
          isLoadingMore.current = false;
          throw error;
        });
    },
    [loadMoreRows, hasMoreFiles],
  );

  const listClassName = classNames(styles.list, className, styles.tile);

  // Handle window resize specifically with a more robust approach
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimerRef.current) {
        window.clearTimeout(resizeTimerRef.current);
        resizeTimerRef.current = null;
      }

      // Schedule synchronization with debouncing
      resizeTimerRef.current = window.setTimeout(() => {
        synchronizeCardHeights();

        // Additional synchronizations with reduced frequency
        setTimeout(synchronizeCardHeights, 300);
      }, 100);
    };

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Start observing DOM changes that might affect heights
    const mutationObserver = new MutationObserver(() => {
      // Add a debouncing mechanism to avoid excessive calls
      if (synchronizationScheduled.current) return;

      synchronizationScheduled.current = true;
      requestAnimationFrame(() => {
        synchronizeCardHeights();
        synchronizationScheduled.current = false;
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Perform initial synchronization
    requestAnimationFrame(() => {
      synchronizeCardHeights();
      // One additional sync after a delay to catch any late-rendered items
      setTimeout(synchronizeCardHeights, 300);
    });

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
      mutationObserver.disconnect();
      if (resizeTimerRef.current) {
        window.clearTimeout(resizeTimerRef.current);
      }
    };
  }, [synchronizeCardHeights]);

  return (
    <InfiniteLoader
      isRowLoaded={isItemLoaded}
      loadMoreRows={handleLoadMoreItems}
      rowCount={itemCount}
      threshold={3}
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
                onRowsRendered={(params) => {
                  // Properly call the InfiniteLoader's onRowsRendered
                  onRowsRendered(params);

                  // Check if we're near the end of loaded rows and trigger loading
                  const { stopIndex } = params;

                  if (
                    hasMoreFiles &&
                    !isLoadingMore.current &&
                    stopIndex >= itemCount - 3
                  ) {
                    handleLoadMoreItems({
                      startIndex: children.length,
                      stopIndex: children.length + 10,
                    });
                  }
                }}
                ref={(ref) => {
                  if (ref !== null) {
                    listRef.current = ref;
                    registerChild(ref);
                  }
                }}
                rowCount={itemCount}
                deferredMeasurementCache={cache}
                rowHeight={getItemSize}
                rowRenderer={renderTile}
                width={width}
                isScrolling={isScrolling}
                onChildScroll={onChildScroll}
                scrollTop={scrollTop}
                overscanRowCount={20} // Increase overscan to reduce flickering
                onScroll={(info) => {
                  // Call the parent onScroll if provided
                  if (onScroll) {
                    onScroll();
                  }

                  // Enhanced scroll position check
                  if (hasMoreFiles && !isLoadingMore.current) {
                    // Look at both scroll percentage and proximity to loaded rows
                    const scrollPercentage =
                      info.scrollTop /
                      (info.scrollHeight - info.clientHeight || 1);

                    // Load more if approaching the bottom by percentage
                    if (scrollPercentage > 0.7) {
                      // More generous threshold
                      handleLoadMoreItems({
                        startIndex: children.length,
                        stopIndex: children.length + 10,
                      });
                    }
                  }
                }}
                className={listClassName}
                style={{ overflowX: "hidden" }} // Prevent horizontal scrolling
              />
            );
          }}
        </WindowScroller>
      )}
    </InfiniteLoader>
  );
};

export default GridDynamicHeight;
