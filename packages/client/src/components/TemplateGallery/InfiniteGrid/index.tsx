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

import uniqueid from "lodash/uniqueId";
import React, { useEffect, useState, useRef, FC } from "react";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import { getCountTilesInRow } from "@docspace/shared/utils";
import classNames from "classnames";

import Grid from "./Grid";

import {
  CardProps,
  ItemProps,
  InfiniteGridInjectedProps,
  SkeletonTileProps,
} from "./InfiniteGrid.types";
import styles from "./InfiniteGrid.module.scss";

const SkeletonTile: FC<SkeletonTileProps> = ({ smallPreview, className }) => {
  const containerClass = classNames(styles.loaderContainer, {
    [styles.smallPreview]: smallPreview,
    [styles.largePreview]: !smallPreview,
  });

  return (
    <div className={classNames(styles.skeletonTile, className)}>
      <div className={containerClass}>
        <RectangleSkeleton height="100%" width="100%" animate />
        <div className={styles.loaderTitle}>
          <RectangleSkeleton height="20px" animate />
        </div>
      </div>
    </div>
  );
};

const Card: FC<CardProps> = ({
  children,
  smallPreview,
  className,
  ...rest
}) => {
  const isSubmitToGalleryTile = (children as any)?.props?.isSubmitTile === true;
  const cardClass = classNames(
    styles.card,
    "Card",
    {
      [styles.doubleWidth]: Boolean(smallPreview && isSubmitToGalleryTile),
    },
    className,
  );

  return (
    <div className={cardClass} {...rest}>
      {children}
    </div>
  );
};

const Item: FC<ItemProps> = ({ children, className, isOneTile, ...rest }) => {
  const itemClass = classNames(
    styles.item,
    "Item",
    {
      [styles.oneTile]: isOneTile,
    },
    className,
  );

  return (
    <div className={itemClass} {...rest}>
      {children}
    </div>
  );
};

const InfiniteGrid: FC<InfiniteGridInjectedProps> = (props) => {
  const {
    children,
    hasMoreFiles,
    fetchMoreFiles,
    isShowOneTile,
    smallPreview,
    showLoading,
    ...rest
  } = props;

  const [countTilesInRow, setCountTilesInRow] = useState<number>(
    getCountTilesInRow(false, false, true, isShowOneTile),
  );

  const containerRef = useRef<HTMLDivElement>(null);

  let cards: React.ReactElement[] = [];
  const list: React.ReactElement[] = [];

  const addItemToList = (
    key: string,
    clear: boolean,
    isOneTile?: boolean,
  ): void => {
    list.push(
      <Item key={key} className="isTemplateGallery" isOneTile={isOneTile}>
        {cards}
      </Item>,
    );
    if (clear) cards = [];
  };

  const setTilesCount = (): void => {
    const newCount = getCountTilesInRow(false, false, true, isShowOneTile);
    if (countTilesInRow !== newCount) setCountTilesInRow(newCount);
  };

  const onResize = (): void => {
    setTilesCount();
  };

  useEffect(() => {
    setTilesCount();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  // If showLoading is true, show 3 rows of skeletons instead of content
  if (showLoading) {
    // Create 3 rows of skeleton tiles
    for (let row = 0; row < 3; row++) {
      cards = [];

      // Fill each row with skeleton tiles
      for (let col = 0; col < countTilesInRow; col++) {
        const key = `skeleton-loader_${row}_${col}`;
        cards.push(
          <SkeletonTile
            key={key}
            className="tiles-loader isTemplate Card"
            smallPreview={smallPreview}
          />,
        );
      }

      const listKey = uniqueid(`skeleton-row_${row}`);
      addItemToList(listKey, true, isShowOneTile);
    }
  } else {
    let currentRowSpan = 0; // Track how many grid columns are used in current row

    React.Children.map(children, (child) => {
      if (child) {
        // Check if this is a SubmitToGalleryTile that will span 2 columns
        const isSubmitTile = (child as any)?.props?.isSubmitTile === true;
        const elementSpan = smallPreview && isSubmitTile ? 2 : 1;

        // If adding this element would exceed the row capacity, start a new row
        if (
          currentRowSpan > 0 &&
          currentRowSpan + elementSpan > countTilesInRow
        ) {
          const listKey = uniqueid("list-item_");
          addItemToList(listKey, true, isShowOneTile);
          currentRowSpan = 0;
        }

        const cardKey = uniqueid("card-item_");
        cards.push(
          <Card
            countTilesInRow={countTilesInRow}
            smallPreview={smallPreview}
            key={cardKey}
          >
            {child}
          </Card>,
        );

        currentRowSpan += elementSpan;

        // If we've filled the row exactly, start a new row
        if (currentRowSpan === countTilesInRow) {
          const listKey = uniqueid("list-item_");
          addItemToList(listKey, true, isShowOneTile);
          currentRowSpan = 0;
        }
      }
    });
  }

  // Only add infinite loading skeletons if not in showLoading state
  if (!showLoading) {
    if (hasMoreFiles) {
      // If cards elements are full, it will add the full line of loaders
      if (cards.length === countTilesInRow) {
        addItemToList("loaded-row", true, isShowOneTile);
      }

      // Added line of loaders
      while (
        countTilesInRow > cards.length &&
        cards.length !== countTilesInRow
      ) {
        const key = `tiles-loader_${countTilesInRow - cards.length}`;
        cards.push(
          <SkeletonTile
            key={key}
            className="tiles-loader isTemplate Card"
            smallPreview={smallPreview}
          />,
        );
      }

      addItemToList("loaded-row", false, isShowOneTile);
    } else if (cards.length) {
      // Adds loaders until the row is full
      const listKey = uniqueid("list-item_");
      addItemToList(listKey, false, isShowOneTile);
    }
  }

  return (
    <div ref={containerRef}>
      <Grid
        countTilesInRow={countTilesInRow}
        hasMoreFiles={hasMoreFiles}
        loadMoreItems={fetchMoreFiles}
        smallPreview={smallPreview}
        isOneTile={isShowOneTile}
        {...rest}
      >
        {list}
      </Grid>
    </div>
  );
};

export default InfiniteGrid;
