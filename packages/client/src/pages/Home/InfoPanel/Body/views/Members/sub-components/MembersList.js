import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import styled, { useTheme } from "styled-components";
import { FixedSizeList as List, areEqual } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { RowLoader } from "@docspace/shared/skeletons/selector";
import { CustomScrollbarsVirtualList } from "@docspace/shared/components/scrollbar";
import { isMobile } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import { StyledUserTypeHeader } from "../../../styles/members";

const MainStyles = styled.div`
  #members-list-header {
    display: none;
    position: fixed;
    height: 52px;
    width: calc(100% - 32px);
    max-width: 440px;
    padding: 0;
    z-index: 1;
    background: ${(props) => props.theme.infoPanel.backgroundColor};
  }
`;

const StyledMembersList = styled.div`
  height: 100%;
`;

const Item = memo(({ data, index, style }) => {
  const item = data[index];

  if (!item) {
    return (
      <div style={{ ...style, width: "calc(100% - 20px)", margin: "0 -16px" }}>
        <RowLoader isMultiSelect={false} isContainer={true} isUser={true} />
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
  const {
    hasNextPage,
    itemCount,
    loadNextPage,
    showPublicRoomBar,
    linksBlockLength,
    children,
  } = props;

  const list = [];

  React.Children.map(children, (item) => {
    list.push(item);
  });

  const listOfTitles = list
    .filter((x) => x.props.isTitle)
    .map((item) => {
      return {
        displayName: item.props.user.displayName,
        index: item.props.index,
      };
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
      const containerMargin = 26; //
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
    [hasNextPage, itemsCount],
  );

  const loadMoreItems = useCallback(
    async (startIndex) => {
      setIsNextPageLoading(true);
      if (!isNextPageLoading) {
        await loadNextPage(startIndex - 1);
      }
      setIsNextPageLoading(false);
    },
    [isNextPageLoading, loadNextPage],
  );

  const onScroll = (e) => {
    const header = document.getElementById("members-list-header");
    const headerTitle = header.children[0];

    for (let titleIndex in listOfTitles) {
      const title = listOfTitles[titleIndex];
      const titleOffsetTop = title.index * itemSize;

      if (e.scrollOffset > titleOffsetTop) {
        if (title.displayName) headerTitle.innerText = title.displayName;
        header.style.display = "flex";
      } else if (e.scrollOffset <= linksBlockLength * itemSize) {
        header.style.display = "none";
      }
    }
  };

  return (
    <MainStyles>
      <StyledUserTypeHeader
        id="members-list-header"
        className="members-list-header"
      >
        <Text className="members-list-header_title title" />
      </StyledUserTypeHeader>
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
                onScroll={onScroll}
              >
                {Item}
              </List>
            );
          }}
        </InfiniteLoader>
      </StyledMembersList>
    </MainStyles>
  );
};

export default MembersList;
