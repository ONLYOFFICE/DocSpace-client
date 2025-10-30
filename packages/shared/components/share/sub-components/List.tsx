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
import { useEventListener } from "../../../hooks/useEventListener";
import type { TUser } from "../../../api/people/types";

import { Text } from "../../text";
import ScrollbarContext from "../../scrollbar/custom-scrollbar/ScrollbarContext";

import styles from "../Share.module.scss";
import { ListProps } from "../Share.types";

const itemSize = 48;
const shareLinkItemSize = 68;
const SHARE_HEADER_HEIGHT = 36;
const GENERAL_LINK_HEADER_HEIGHT = 28;

const List: FC<ListProps> = (props) => {
  const {
    hasNextPage,
    itemCount,
    loadNextPage,
    linksBlockLength,
    withoutTitlesAndLinks,
    children,
  } = props;

  const listRef = useRef<VirtualizedList>(null);
  const scrollContext = use(ScrollbarContext);
  const scrollElement = scrollContext.parentScrollbar?.scrollerElement;

  const scrollRef = useRef<HTMLDivElement>(scrollElement);

  const list = useMemo(() => {
    const temp: React.ReactElement<{
      isShareLink?: boolean;
      "data-share"?: boolean;
      user: TUser;
      index?: number;
    }>[] = [];

    React.Children.map(children, (item) => {
      temp.push(
        item as React.ReactElement<{
          isShareLink?: boolean;
          "data-share"?: boolean;
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

    // First item is links header. Its size is different from link item size
    const linksBlockHeight = linksBlockLength
      ? GENERAL_LINK_HEADER_HEIGHT + (linksBlockLength - 1) * shareLinkItemSize
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
