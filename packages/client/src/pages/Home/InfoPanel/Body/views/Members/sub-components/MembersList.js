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

import React, { useState, useCallback, useEffect, use } from "react";
import styled from "styled-components";
import { InfiniteLoader, WindowScroller, List } from "react-virtualized";
import { RowLoader } from "@docspace/shared/skeletons/selector";

import { mobile } from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import ScrollbarContext from "@docspace/shared/components/scrollbar/custom-scrollbar/ScrollbarContext";
import { GENERAL_LINK_HEADER_KEY } from "@docspace/shared/constants";
import { zIndex } from "@docspace/shared/themes";
import { StyledUserTypeHeader } from "../../../styles/members";

const MainStyles = styled.div`
  #members-list-header {
    display: none;
    position: fixed;
    height: 52px;
    width: calc(100% - 32px);
    padding: 0;
    z-index: ${zIndex.content};
    background: ${(props) => props.theme.infoPanel.backgroundColor};

    @media ${mobile} {
      padding-inline-end: 16px;
    }
  }
`;

const StyledMembersList = styled.div`
  height: 100%;
`;

const StyledList = styled(List)`
  width: calc(100% + 20px) !important;
  margin-bottom: 24px;

  overflow: visible !important;

  .members-list-item {
    // doesn't require mirroring for RTL
    left: unset !important;
    inset-inline-start: 0;
    width: calc(100% - 20px) !important;
  }

  .members-list-loader-item {
    margin: 0 -16px;
  }

  @media ${mobile} {
    width: calc(100% + 16px) !important;
    margin-bottom: 48px;
  }
`;

const itemSize = 48;
const shareLinkItemSize = 68;
const GENERAL_LINK_HEADER_HEIGHT = 38;

const MembersList = (props) => {
  const {
    hasNextPage,
    itemCount,
    loadNextPage,
    linksBlockLength,
    withoutTitlesAndLinks,
    children,
  } = props;

  const scrollContext = use(ScrollbarContext);
  const scrollElement = scrollContext.parentScrollbar?.scrollerElement;

  const list = [];

  React.Children.map(children, (item) => {
    list.push(item);
  });

  const listOfTitles = list
    .filter((x) => x.props.user?.isTitle)
    .map((item) => {
      return {
        displayName: item.props.user.displayName,
        index: item.props.index,
      };
    });

  const renderRow = ({ key, index, style }) => {
    const item = list[index];

    if (!item) {
      return (
        <div
          key={key}
          className="members-list-item members-list-loader-item"
          style={style}
        >
          <RowLoader isMultiSelect={false} isContainer isUser />
        </div>
      );
    }

    return (
      <div className="members-list-item" key={key} style={style}>
        {item}
      </div>
    );
  };

  const itemsCount = hasNextPage ? list.length + 1 : list.length;

  const [isNextPageLoading, setIsNextPageLoading] = useState(false);

  const isItemLoaded = useCallback(
    ({ index }) => {
      return !hasNextPage || index < itemsCount;
    },
    [hasNextPage, itemsCount],
  );

  const loadMoreItems = useCallback(
    async ({ startIndex }) => {
      setIsNextPageLoading(true);
      if (!isNextPageLoading) {
        await loadNextPage(startIndex - 1);
      }
      setIsNextPageLoading(false);
    },
    [isNextPageLoading, loadNextPage],
  );

  const getItemSize = ({ index }) => {
    const elem = list[index];

    if (elem?.key === GENERAL_LINK_HEADER_KEY) {
      return GENERAL_LINK_HEADER_HEIGHT;
    }

    if (elem?.props?.isShareLink) {
      return shareLinkItemSize;
    }

    return itemSize;
  };

  const onScroll = (e) => {
    const header = document.getElementById("members-list-header");

    if (!header) {
      return;
    }

    const headerTitle = header.children[0];
    const scrollOffset = e.target.scrollTop;

    // First item is links header. Its size is different from link item size
    const linksBlockHeight = linksBlockLength
      ? GENERAL_LINK_HEADER_HEIGHT + (linksBlockLength - 1) * shareLinkItemSize
      : 0;

    Object.keys(listOfTitles).forEach((titleIndex) => {
      const title = listOfTitles[titleIndex];
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

  useEffect(() => {
    if (withoutTitlesAndLinks) return;

    scrollElement?.addEventListener("scroll", onScroll);

    return () => {
      scrollElement?.removeEventListener("scroll", onScroll);
    };
  }, [scrollElement, linksBlockLength, withoutTitlesAndLinks]);

  if (!scrollElement) {
    return null;
  }

  return (
    <MainStyles>
      {!withoutTitlesAndLinks ? (
        <StyledUserTypeHeader
          id="members-list-header"
          className="members-list-header"
        >
          <Text className="members-list-header_title title" />
        </StyledUserTypeHeader>
      ) : null}
      <StyledMembersList>
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
                    <StyledList
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
                    />
                  );
                }}
              </WindowScroller>
            );
          }}
        </InfiniteLoader>
      </StyledMembersList>
    </MainStyles>
  );
};

export default MembersList;
