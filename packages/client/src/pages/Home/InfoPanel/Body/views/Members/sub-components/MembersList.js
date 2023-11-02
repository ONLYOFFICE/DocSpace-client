import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import styled, { useTheme } from "styled-components";
import { FixedSizeList as List, areEqual } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import Loaders from "@docspace/common/components/Loaders";
import CustomScrollbarsVirtualList from "@docspace/components/scrollbar/custom-scrollbars-virtual-list";
import { isMobile } from "@docspace/components/utils/device";

const StyledMembersList = styled.div`
  height: 100%;
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
  const { hasNextPage, itemCount, loadNextPage, showPublicRoomBar, children } =
    props;

  const list = [];

  React.Children.map(children, (item) => {
    list.push(item);
  });

  const { interfaceDirection } = useTheme();

  const itemsCount = hasNextPage ? list.length + 1 : list.length;

  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());

  const [bodyHeight, setBodyHeight] = useState(0);
  const bodyRef = useRef(null);

  const onBodyResize = useCallback(() => {
    if (bodyRef && bodyRef.current) {
      const infoPanelContainer =
        document.getElementsByClassName("info-panel-scroll");

      const containerHeight = infoPanelContainer[0]?.clientHeight ?? 0;
      const offsetTop = bodyRef?.current?.offsetTop ?? 0;
      const containerMargin = 2;
      const bodyHeight = containerHeight - offsetTop - containerMargin;

      setBodyHeight(bodyHeight);
    }

    if (isMobile()) {
      setIsMobileView(true);
    } else {
      setIsMobileView(false);
    }
  }, [bodyRef?.current?.offsetHeight]);

  useEffect(() => {
    window.addEventListener("resize", onBodyResize);
    return () => {
      window.removeEventListener("resize", onBodyResize);
    };
  }, []);

  useEffect(() => {
    onBodyResize();
  }, [showPublicRoomBar, list.length]);

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
    <StyledMembersList ref={bodyRef}>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={hasNextPage ? itemCount + 1 : itemCount}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => {
          const listWidth = isMobileView
            ? "calc(100% + 16px)"
            : "calc(100% + 20px)"; // for scroll

          return (
            <List
              direction={interfaceDirection}
              ref={ref}
              width={listWidth}
              height={bodyHeight}
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
    </StyledMembersList>
  );
};

export default MembersList;
