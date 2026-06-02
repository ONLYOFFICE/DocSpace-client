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

import React, {
  useState,
  useCallback,
  use,
  FC,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  InfiniteLoader,
  WindowScroller,
  List as VirtualizedList,
  IndexRange,
} from "react-virtualized";
import classNames from "classnames";

import { RowLoader } from "../../../skeletons/selector";
import { GENERAL_LINK_HEADER_KEY } from "../../../constants";
import { useEventListener } from "@docspace/ui-kit/hooks/useEventListener";
import type { TUser } from "../../../api/people/types";

import { Text } from "@docspace/ui-kit/components/text";
import { ScrollbarContext } from "@docspace/ui-kit/components/scrollbar";

import styles from "../Share.module.scss";
import { ListProps } from "../Share.types";

const itemSize = 48;
const shareLinkItemSize = 68;
const SHARE_HEADER_HEIGHT = 36;
const GENERAL_LINK_HEADER_HEIGHT = 28;
const RESTRICTED_BAR_HEIGHT = 64;

const List: FC<ListProps> = (props) => {
  const {
    hasNextPage,
    itemCount,
    loadNextPage,
    linksBlockLength,
    withoutTitlesAndLinks,
    restrictedBarVisible,
    children,
  } = props;

  const listRef = useRef<VirtualizedList>(null);
  const scrollContext = use(ScrollbarContext);
  const scrollElement = scrollContext.parentScrollbar?.scrollerElement;

  const scrollRef = useRef<HTMLDivElement | null>(scrollElement ?? null);

  const list = useMemo(() => {
    const temp: React.ReactElement<{
      isShareLink?: boolean;
      "data-share"?: boolean;
      "data-restricted-bar"?: boolean;
      user: TUser;
      index?: number;
    }>[] = [];

    React.Children.map(children, (item) => {
      temp.push(
        item as React.ReactElement<{
          isShareLink?: boolean;
          "data-share"?: boolean;
          "data-restricted-bar"?: boolean;
          user: TUser;
          index?: number;
        }>,
      );
    });

    return temp;
  }, [children]);

  const listOfTitles = list
    .filter(
      (x) => x.props.user && "isTitle" in x.props.user && x.props.user?.isTitle,
    )
    .map((item) => {
      return {
        displayName:
          "displayName" in item.props.user ? item.props.user?.displayName : "",
        index: item.props.index!,
        key: item.key,
      };
    });

  useEffect(() => {
    if (listRef.current) {
      listRef.current.recomputeRowHeights();
    }
  }, [list]);

  const renderRow = ({
    key,
    index,
    style,
  }: {
    key: string;
    index: number;
    style: React.CSSProperties;
  }) => {
    const item = list[index];

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

  const itemsCount = hasNextPage ? list.length + 1 : list.length;

  const [isNextPageLoading, setIsNextPageLoading] = useState(false);

  const isItemLoaded = useCallback(
    ({ index }: { index: number }) => {
      return !hasNextPage || index < itemsCount;
    },
    [hasNextPage, itemsCount],
  );

  const loadMoreItems = useCallback(
    async (params: IndexRange) => {
      setIsNextPageLoading(true);
      if (!isNextPageLoading) {
        await loadNextPage(params);
      }
      setIsNextPageLoading(false);
    },
    [isNextPageLoading, loadNextPage],
  );

  const getItemSize = ({ index }: { index: number }) => {
    const elem = list[index];

    if (elem?.key === "share-header") {
      return SHARE_HEADER_HEIGHT;
    }

    if (elem?.key === GENERAL_LINK_HEADER_KEY) {
      return GENERAL_LINK_HEADER_HEIGHT;
    }

    if (elem?.props?.["data-restricted-bar"]) {
      return RESTRICTED_BAR_HEIGHT;
    }

    if (elem?.props?.isShareLink || elem?.props?.["data-share"]) {
      return shareLinkItemSize;
    }

    return itemSize;
  };

  const onScroll = (e: Event) => {
    const header = document.getElementById("members-list-header");

    if (!header) {
      return;
    }

    const headerTitle = header.children[0] as HTMLDivElement;
    const scrollOffset = (e.target as HTMLDivElement).scrollTop;

    // First item is links header. Its size is different from link item size.
    // Second item may be the restricted bar (also different size).
    const restrictedBarOffset = restrictedBarVisible ? RESTRICTED_BAR_HEIGHT : 0;
    const linkItemsCount = linksBlockLength - 1 - (restrictedBarVisible ? 1 : 0);
    const linksBlockHeight = linksBlockLength
      ? GENERAL_LINK_HEADER_HEIGHT +
        restrictedBarOffset +
        Math.max(0, linkItemsCount) * shareLinkItemSize
      : 0;

    Object.keys(listOfTitles).forEach((titleIndex) => {
      const title = listOfTitles[+titleIndex];
      const titleOffsetTop =
        linksBlockHeight + (title.index - linksBlockLength) * itemSize;

      if (scrollOffset > titleOffsetTop) {
        if (title.displayName) headerTitle.innerText = title.displayName;
        header.style.display = "flex";
      } else if (scrollOffset <= linksBlockHeight) {
        header.style.display = "none";
      }
    });
  };

  useEventListener("scroll", onScroll, scrollRef);

  if (!scrollElement) {
    return null;
  }

  return (
    <div className={styles.mainStyles}>
      {!withoutTitlesAndLinks ? (
        <div
          id="members-list-header"
          className={classNames("members-list-header", styles.userTypeHeader)}
        >
          <Text className="members-list-header_title title" />
        </div>
      ) : null}
      <div className={styles.membersList}>
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
                      ref={(ref) => {
                        registerChild(ref);
                        listRef.current = ref;
                      }}
                      height={height}
                      onRowsRendered={onRowsRendered}
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
    </div>
  );
};

export default List;
