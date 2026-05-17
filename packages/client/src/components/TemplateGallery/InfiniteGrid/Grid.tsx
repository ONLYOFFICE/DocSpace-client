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

import React, { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { IndexRange } from "react-virtualized";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import styles from "./InfiniteGrid.module.scss";

type GridProps = {
  children: React.ReactNode[];
  hasMoreFiles: boolean;
  loadMoreItems: (params: IndexRange) => Promise<void>;
  listClassName?: string;
  onScroll?: () => void;
  smallPreview?: boolean;
  countTilesInRow?: number;
  isOneTile?: boolean;
};

const Grid = ({
  children,
  hasMoreFiles,
  loadMoreItems,
  listClassName,
  onScroll,
  smallPreview = false,
  countTilesInRow = 1,
  isOneTile,
}: GridProps) => {
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

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !hasMoreFiles || isLoadingMore) return;

    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 200) {
      handleLoadMoreItems();
    }

    if (onScroll) onScroll();
  }, [hasMoreFiles, isLoadingMore, handleLoadMoreItems, onScroll]);

  useEffect(() => {
    const scroll = document.querySelector(
      "#scroll-template-gallery .scroll-wrapper > .scroller",
    );

    const scrollElement = scroll || scrollContainerRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const renderLoadingRow = () => {
    if (!hasMoreFiles) return null;

    const skeletons = [];

    for (let i = 0; i < countTilesInRow; i += 1) {
      skeletons.push(
        <div
          key={`skeleton-${i}`}
          className={classNames(
            styles.skeletonTile,
            "tiles-loader isTemplate Card",
          )}
        >
          <div
            className={classNames(styles.loaderContainer, {
              [styles.smallPreview]: smallPreview,
              [styles.largePreview]: !smallPreview,
            })}
          >
            <RectangleSkeleton height="100%" width="100%" animate />

            <div className={styles.loaderTitle}>
              <RectangleSkeleton height="20px" animate />
            </div>
          </div>
        </div>,
      );
    }

    return (
      <div className="Item">
        <div
          className={classNames(styles.item, {
            [styles.oneTile]: isOneTile,
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

export default Grid;
