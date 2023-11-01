import React, { useState, useCallback, useEffect, memo } from "react";
import styled, { useTheme } from "styled-components";
import { FixedSizeList as List, areEqual } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import { isMobile } from "@docspace/components/utils/device";
import throttle from "lodash/throttle";
import Loaders from "@docspace/common/components/Loaders";
import CustomScrollbarsVirtualList from "@docspace/components/scrollbar/custom-scrollbars-virtual-list";

const StyledMembersList = styled.div`
  height: 100vh;
  height: calc(100vh - 333px);
`;

const Item = memo(({ data, index, style }) => {
  const item = data[index];

  if (!item) {
    return (
      <div style={{ ...style, width: "calc(100% - 20px)", margin: "0 -16px" }}>
        <Loaders.SelectorRowLoader
          isMultiSelect={false}
          isContainer={true}
          isUser={true}
        />
      </div>
    );
  }

  return (
    <div key={item.id} style={{ ...style, width: "calc(100% - 20px)" }}>
      {item}
    </div>
  );
}, areEqual);

const itemSize = 48;

const MembersList = (props) => {
  const { hasNextPage, itemCount, loadNextPage, children } = props;

  const list = [];

  React.Children.map(children, (item) => {
    list.push(item);
  });

  const { interfaceDirection } = useTheme();

  const itemsCount = hasNextPage ? list.length + 1 : list.length;

  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());

  const [offsetTop, setOffsetTop] = useState(0);

  const onResize = throttle(() => {
    const isMobileView = isMobile();
    setIsMobileView(isMobileView);
    setOffset();
  }, 300);

  const setOffset = () => {
    const rect = document
      .getElementById("infoPanelMembersList")
      ?.getBoundingClientRect();

    setOffsetTop(Math.ceil(rect?.top) + 2 + "px");
  };

  useEffect(() => {
    setOffset();
  }, [list]);

  useEffect(() => {
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  });

  const isItemLoaded = useCallback(
    (index) => {
      return !hasNextPage || index < itemsCount;
    },
    [hasNextPage, itemsCount]
  );

  const loadMoreItems = useCallback(
    async (startIndex) => {
      setIsNextPageLoading(true);
      if (!isNextPageLoading) {
        await loadNextPage(startIndex - 1);
      }
      setIsNextPageLoading(false);
    },
    [isNextPageLoading, loadNextPage]
  );

  return (
    <StyledMembersList id="infoPanelMembersList">
      <AutoSizer>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={hasNextPage ? itemCount + 1 : itemCount}
            loadMoreItems={loadMoreItems}
          >
            {({ onItemsRendered, ref }) => {
              const listWidth = isMobileView ? width + 16 : width + 20; // for scroll

              return (
                <List
                  direction={interfaceDirection}
                  ref={ref}
                  width={listWidth}
                  height={height}
                  itemCount={itemsCount}
                  itemSize={itemSize}
                  itemData={list}
                  outerElementType={CustomScrollbarsVirtualList}
                  onItemsRendered={onItemsRendered}
                >
                  {Item}
                </List>
              );
            }}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </StyledMembersList>
  );
};

export default MembersList;
