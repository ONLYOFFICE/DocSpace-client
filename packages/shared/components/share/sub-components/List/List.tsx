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

import { FC, use, useCallback, useRef, useState } from "react";

import {
  InfiniteLoader,
  WindowScroller,
  List as VirtualizedList,
  Index,
} from "react-virtualized";

import { useEventListener } from "../../../../hooks/useEventListener";

import { RowLoader } from "../../../../skeletons/selector";

import { Text } from "../../../text";
import ScrollbarContext from "../../../scrollbar/custom-scrollbar/ScrollbarContext";

import styles from "./List.module.scss";
import type { ListRenderRowProps, ListProps } from "./List.types";

export const List: FC<ListProps> = ({
  hasNextPage,
  itemCount,
  loadNextPage,
  children,
}) => {
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const itemsCount = hasNextPage ? itemCount + 1 : itemCount;

  const scrollContext = use(ScrollbarContext);

  const scrollElement = scrollContext.parentScrollbar?.scrollerElement;

  const isItemLoaded = useCallback(
    ({ index }: { index: number }) => {
      return !hasNextPage || index < itemsCount;
    },
    [hasNextPage, itemsCount],
  );

  const loadMoreItems = useCallback(async () => {
    setIsNextPageLoading(true);
    if (!isNextPageLoading) {
      await loadNextPage();
    }
    setIsNextPageLoading(false);
  }, [isNextPageLoading, loadNextPage]);

  const getItemSize = ({ index }: Index) => {
    const item = children[index];

    if (!item) {
      return 0;
    }

    if (item.key?.includes("header")) {
      return 28;
    }

    return 68;
  };

  const onScroll = useCallback(() => {
    const header = headerRef.current;

    if (!header) {
      return;
    }

    const headerTitle = header.children[0] as HTMLDivElement;
    const scrollOffset = (scrollElement as HTMLDivElement).scrollTop;
  }, [scrollElement]);

  useEventListener("scroll", onScroll, scrollElement);

  const renderRow = ({ key, index, style }: ListRenderRowProps) => {
    const item = children[index];

    if (!item) {
      return (
        <div
          key={key}
          className="members-list-item members-list-loader-item"
          style={style}
          data-testid={`info_panel_members_loader_item_${index}`}
        >
          <RowLoader isMultiSelect={false} isContainer isUser />
        </div>
      );
    }

    return (
      <div
        className="members-list-item"
        key={key}
        style={style}
        data-testid={`info_panel_members_list_item_${index}`}
      >
        {item}
      </div>
    );
  };

  return (
    <>
      <div className={styles.listHeader} ref={headerRef}>
        <Text className={styles.title} />
      </div>
      <div className={styles.container}>
        <InfiniteLoader
          isRowLoaded={isItemLoaded}
          rowCount={itemCount}
          loadMoreRows={loadMoreItems}
        >
          {({ onRowsRendered, registerChild }) => {
            return (
              <WindowScroller scrollElement={scrollElement}>
                {({ height, isScrolling, scrollTop }) => {
                  if (height === undefined) {
                    height = scrollElement.getBoundingClientRect().height;
                  }

                  const width = scrollElement.getBoundingClientRect().width;

                  return (
                    <VirtualizedList
                      autoHeight
                      height={height}
                      onRowsRendered={onRowsRendered}
                      ref={registerChild}
                      rowCount={itemsCount}
                      rowHeight={getItemSize}
                      rowRenderer={renderRow}
                      width={width}
                      isScrolling={isScrolling}
                      overscanRowCount={3}
                      scrollTop={scrollTop}
                      // React virtualized sets "LTR" by default.
                      style={{ direction: "inherit" }}
                      tabIndex={null}
                      className={styles.list}
                    />
                  );
                }}
              </WindowScroller>
            );
          }}
        </InfiniteLoader>
      </div>
    </>
  );
};
