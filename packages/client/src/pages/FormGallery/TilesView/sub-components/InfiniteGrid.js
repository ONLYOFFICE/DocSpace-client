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
import { inject, observer } from "mobx-react";
import React, { useEffect, useState } from "react";

import { TileSkeleton } from "@docspace/shared/skeletons/tiles";
import { InfiniteLoaderComponent } from "@docspace/shared/components/infinite-loader";
import { getCountTilesInRow } from "@docspace/shared/utils";

import { StyledCard, StyledItem } from "../StyledTileView";

const Card = ({ children, ...rest }) => {
  const horizontalGap = 16;
  const fileHeight = 220 + horizontalGap;
  const cardHeight = fileHeight;

  return (
    <StyledCard className="Card" cardHeight={cardHeight} {...rest}>
      {children}
    </StyledCard>
  );
};

const Item = ({ children, className, ...rest }) => {
  return (
    <StyledItem className={`Item ${className}`} {...rest}>
      {children}
    </StyledItem>
  );
};

const InfiniteGrid = (props) => {
  const {
    children,
    hasMoreFiles,
    fetchMoreFiles,
    filesLength,
    className,
    ...rest
  } = props;

  const [countTilesInRow, setCountTilesInRow] = useState(getCountTilesInRow());

  let cards = [];
  const list = [];

  const addItemToList = (key, clear) => {
    list.push(
      <Item key={key} className="isFile">
        {cards}
      </Item>,
    );
    if (clear) cards = [];
  };

  const setTilesCount = () => {
    const newCount = getCountTilesInRow();
    if (countTilesInRow !== newCount) setCountTilesInRow(newCount);
  };

  const onResize = () => {
    setTilesCount();
  };

  useEffect(() => {
    setTilesCount();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  React.Children.map(children, (child) => {
    if (child) {
      if (cards.length && cards.length === countTilesInRow) {
        const listKey = uniqueid("list-item_");
        addItemToList(listKey, true);
      }

      const cardKey = uniqueid("card-item_");
      cards.push(
        <Card countTilesInRow={countTilesInRow} key={cardKey}>
          {child}
        </Card>,
      );
    }
  });

  if (hasMoreFiles) {
    // If cards elements are full, it will add the full line of loaders
    if (cards.length === countTilesInRow) {
      addItemToList("loaded-row", true);
    }

    // Added line of loaders
    while (countTilesInRow > cards.length && cards.length !== countTilesInRow) {
      const key = `tiles-loader_${countTilesInRow - cards.length}`;
      cards.push(
        <TileSkeleton
          key={key}
          className="tiles-loader isFile"
          isFolder={false}
        />,
      );
    }

    addItemToList("loaded-row");
  } else if (cards.length) {
    // Adds loaders until the row is full
    const listKey = uniqueid("list-item_");
    addItemToList(listKey);
  }

  // console.log("InfiniteGrid render", list);

  return (
    <InfiniteLoaderComponent
      viewAs="tile"
      countTilesInRow={countTilesInRow}
      filesLength={filesLength}
      hasMoreFiles={hasMoreFiles}
      itemCount={hasMoreFiles ? list.length + 1 : list.length}
      loadMoreItems={fetchMoreFiles}
      className={`TileList ${className}`}
      {...rest}
    >
      {list}
    </InfiniteLoaderComponent>
  );
};

export default inject(({ oformsStore, infoPanelStore }) => {
  const { oformFiles, hasMoreForms, oformsFilterTotal, fetchMoreOforms } =
    oformsStore;

  const filesLength = oformFiles.length;
  const { isVisible } = infoPanelStore;

  return {
    filesList: oformFiles,
    hasMoreFiles: hasMoreForms,
    filterTotal: oformsFilterTotal,
    fetchMoreFiles: fetchMoreOforms,
    filesLength,
    isVisible,
  };
})(observer(InfiniteGrid));
