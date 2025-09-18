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

type SkeletonTileProps = {
  smallPreview?: boolean;
};

const StyledSkeletonTile = styled.div<SkeletonTileProps>`
  .loader-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    aspect-ratio: ${(props) => (props.smallPreview ? "229 / 162" : "12 /16")};
  }

  .loader-title {
    width: 70%;
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

  // Set up scroll listener
  useEffect(() => {
    const scrollElement = scroll || scrollContainerRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [scroll, handleScroll]);

  const renderLoadingRow = () => {
    if (!hasMoreFiles) return null;

    const skeletons = [];

    for (let i = 0; i < countTilesInRow; i += 1) {
      skeletons.push(
        <StyledSkeletonTile
          key={`skeleton-${i}`}
          className="tiles-loader isTemplate Card"
          smallPreview={smallPreview}
        >
          <div className="loader-container">
            <RectangleSkeleton height="100%" width="100%" animate />

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
