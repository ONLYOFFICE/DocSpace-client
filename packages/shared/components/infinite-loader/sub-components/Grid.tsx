// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useCallback, useRef } from "react";
import { InfiniteLoader, WindowScroller } from "react-virtualized";

import { StyledList } from "../InfiniteLoader.styled";
import { GridComponentProps } from "../InfiniteLoader.types";

const GridComponent = ({
  hasMoreFiles,
  filesLength,
  itemCount,
  loadMoreItems,
  onScroll,
  countTilesInRow = 1,
  children,
  className,
  scroll,
}: GridComponentProps) => {
  const loaderRef = useRef<InfiniteLoader | null>(null);

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
  }: {
    index: number;
    style: React.CSSProperties;
    key: string;
  }) => {
    return (
      <div className="window-item" style={style} key={key}>
        {children[index]}
      </div>
    );
  };

  const getItemSize = ({ index }: { index: number }) => {
    const elem = children[index] as React.ReactElement;

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
      const isFolderHeader = itemClassNames?.includes("folder_header");

      const horizontalGap = 16;
      const verticalGap = 14;
      const headerMargin = 15;

      const folderHeight = 64 + verticalGap;
      const roomHeight = 122 + verticalGap;
      const fileHeight = 220 + horizontalGap;
      const titleHeight = 20 + headerMargin + (isFolderHeader ? 0 : 11);

      if (isRoom) return roomHeight;
      if (isFolder) return folderHeight;
      if (isFile) return fileHeight;
      return titleHeight;
    }
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

            const width =
              document.getElementById("tileContainer")?.getBoundingClientRect()
                .width ?? 0;

            return (
              <StyledList
                autoHeight
                height={height}
                onRowsRendered={onRowsRendered}
                ref={registerChild}
                rowCount={children.length}
                rowHeight={getItemSize}
                rowRenderer={renderTile}
                width={width}
                className={className}
                isScrolling={isScrolling}
                onChildScroll={onChildScroll}
                scrollTop={scrollTop}
                overscanRowCount={3}
                onScroll={onScroll}
              />
            );
          }}
        </WindowScroller>
      )}
    </InfiniteLoader>
  );
};

export default GridComponent;
