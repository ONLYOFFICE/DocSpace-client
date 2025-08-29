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
import classNames from "classnames";
import styled from "styled-components";
import { RectangleSkeleton } from "../../../skeletons/rectangle";
import { GridDynamicHeightProps } from "../InfiniteLoader.types";
import styles from "../InfiniteLoader.module.scss";

const StyledSkeletonTile = styled.div<{
  $height?: string;
  $minHeight?: string;
}>`
  .loader-container {
    display: flex;
    flex-direction: column;
    gap: 8px;

    margin: 10px;
  }

  .loader-title {
    width: 70%;
  }

  &.Card {
    min-height: ${(props) => props.$minHeight || "auto"};
    height: ${(props) => props.$height || "auto"};
  }
`;

const GridDynamicHeight = ({
  children,
  hasMoreFiles,
  loadMoreItems,
  listClassName,
  scroll,
  onScroll,
  smallPreview = false,
  countTilesInRow = 1,
  isOneTile,
}: GridDynamicHeightProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const heightSyncTimeoutRef = useRef<number | null>(null);

  const handleLoadMoreItems = useCallback(async () => {
    if (isLoadingMore || !hasMoreFiles) return;

    setIsLoadingMore(true);
    try {
      await loadMoreItems({
        startIndex: children.length,
        stopIndex: children.length + 10,
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [loadMoreItems, hasMoreFiles, isLoadingMore, children.length]);

  // Handle scroll to detect when to load more items
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !hasMoreFiles || isLoadingMore) return;

    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Load more when scrolled to within 200px of bottom
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      handleLoadMoreItems();
    }

    // Call parent onScroll if provided
    if (onScroll) {
      onScroll();
    }
  }, [hasMoreFiles, isLoadingMore, handleLoadMoreItems, onScroll]);

  // Synchronize card heights within each row
  const synchronizeCardHeights = useCallback(() => {
    if (heightSyncTimeoutRef.current) {
      clearTimeout(heightSyncTimeoutRef.current);
    }

    heightSyncTimeoutRef.current = window.setTimeout(() => {
      const rows = containerRef.current?.querySelectorAll(".Item");
      if (!rows || rows.length === 0) return;

      // First, reset all heights to auto to measure natural heights
      rows.forEach((row) => {
        const cards = row.querySelectorAll(".Card");
        cards.forEach((card) => {
          (card as HTMLElement).style.height = "auto";
          (card as HTMLElement).style.minHeight = "auto";
        });
      });

      // Force reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      document.body.offsetHeight;

      if (smallPreview) {
        // For smallPreview: find the global minimum height across ALL rows,

        let globalMinHeight = Infinity;

        rows.forEach((row) => {
          const cards = row.querySelectorAll(".Card");
          cards.forEach((card) => {
            const isSubmitCard = (card as HTMLElement).querySelector(
              '[data-submit-tile="true"]',
            );

            if (isSubmitCard) return; // skip submit tile when measuring min height

            const cardHeight = (card as HTMLElement).offsetHeight;
            if (cardHeight > 0 && cardHeight < globalMinHeight) {
              globalMinHeight = cardHeight;
            }
          });
        });

        // If all cards were excluded (e.g., only submit tile present), fallback to a sane default
        const targetHeight =
          globalMinHeight === Infinity ? 120 : globalMinHeight;

        // Apply height only to rows that have cards taller than the minimum
        rows.forEach((row) => {
          const cards = row.querySelectorAll(".Card");
          let rowNeedsAdjustment = false;

          // Check if this row has any cards taller than the minimum
          cards.forEach((card) => {
            const cardHeight = (card as HTMLElement).offsetHeight;
            if (cardHeight > 0 && cardHeight > targetHeight + 2) {
              rowNeedsAdjustment = true;
            }
          });

          // Only adjust height for rows that need it
          if (rowNeedsAdjustment) {
            cards.forEach((card) => {
              (card as HTMLElement).style.height = `${targetHeight}px`;
              (card as HTMLElement).style.minHeight = `${targetHeight}px`;
            });
          }
        });
      } else {
        // For normal view: find the global maximum height across ALL rows
        let globalMaxHeight = 0;

        rows.forEach((row) => {
          const cards = row.querySelectorAll(".Card");
          cards.forEach((card) => {
            const cardHeight = (card as HTMLElement).offsetHeight;
            if (cardHeight > 0) {
              globalMaxHeight = Math.max(globalMaxHeight, cardHeight);
            }
          });
        });

        // Apply height only to rows that have cards shorter than the maximum
        if (globalMaxHeight > 0) {
          rows.forEach((row) => {
            const cards = row.querySelectorAll(".Card");
            let rowNeedsAdjustment = false;

            // Check if this row has any cards shorter than the maximum
            cards.forEach((card) => {
              const cardHeight = (card as HTMLElement).offsetHeight;
              if (cardHeight > 0 && cardHeight < globalMaxHeight - 2) {
                rowNeedsAdjustment = true;
              }
            });

            // Only adjust height for rows that need it
            if (rowNeedsAdjustment) {
              cards.forEach((card) => {
                (card as HTMLElement).style.height = `${globalMaxHeight}px`;
                (card as HTMLElement).style.minHeight = `${globalMaxHeight}px`;
              });
            }
          });
        }
      }
    }, 100);
  }, [smallPreview]);

  // Set up scroll listener
  useEffect(() => {
    const scrollElement = scroll || scrollContainerRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [scroll, handleScroll]);

  // Synchronize heights when children change
  useEffect(() => {
    synchronizeCardHeights();
  }, [children, synchronizeCardHeights]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      synchronizeCardHeights();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (heightSyncTimeoutRef.current) {
        clearTimeout(heightSyncTimeoutRef.current);
      }
    };
  }, [synchronizeCardHeights]);

  const renderLoadingRow = () => {
    if (!hasMoreFiles) return null;

    // Calculate height for skeleton tiles based on existing cards
    const calculateCardHeight = () => {
      const existingCards = containerRef.current?.querySelectorAll(".Card");
      if (!existingCards || existingCards.length === 0) return null;

      let totalHeight = 0;
      let validCards = 0;

      existingCards.forEach((card) => {
        const height = (card as HTMLElement).offsetHeight;
        if (height > 0) {
          totalHeight += height;
          validCards += 1;
        }
      });

      return validCards > 0 ? Math.round(totalHeight / validCards) : null;
    };

    const calculatedHeight = calculateCardHeight();
    const skeletons = [];

    console.log("renderLoadingRow countTilesInRow", countTilesInRow);

    for (let i = 0; i < countTilesInRow; i += 1) {
      skeletons.push(
        <StyledSkeletonTile
          key={`skeleton-${i}`}
          className="tiles-loader isTemplate Card"
          $height={calculatedHeight ? `${calculatedHeight}px` : "auto"}
          $minHeight={calculatedHeight ? `${calculatedHeight}px` : "auto"}
        >
          <div className="loader-container">
            <RectangleSkeleton
              className="image-skeleton"
              height={calculatedHeight ? `${calculatedHeight - 50}px` : "120px"}
              width="100%"
              animate
            />

            <div className="loader-title">
              <RectangleSkeleton height="20px" animate />
            </div>
          </div>
        </StyledSkeletonTile>,
      );
    }

    return (
      <div className="Item">
        <div
          className={classNames(styles.skeleton, {
            [styles.isOneTile]: isOneTile,
          })}
        >
          {skeletons}
        </div>
      </div>
    );
  };

  const listClassNameFinal = classNames(
    styles.list,
    listClassName,
    styles.tile,
  );

  return (
    <div
      ref={containerRef}
      className={classNames(styles.grid, listClassName)}
      style={{ width: "100%", height: "100%" }}
    >
      <div
        ref={scrollContainerRef}
        className={listClassNameFinal}
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {children.map((child, index) => {
          // Extract the key from the child element, but ensure uniqueness by combining with index
          const childKey =
            React.isValidElement(child) && child.key
              ? `${child.key}-${index}`
              : `grid-item-${index}`;

          return (
            <div
              key={childKey}
              className="row-item"
              style={{ marginBottom: "16px" }}
            >
              {child}
            </div>
          );
        })}
        {renderLoadingRow()}
      </div>
    </div>
  );
};

export default GridDynamicHeight;
