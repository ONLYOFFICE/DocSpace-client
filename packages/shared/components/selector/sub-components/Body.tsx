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

import React, { useLayoutEffect, useRef, useState } from "react";
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from "react-window";

import { RoomsType } from "../../../enums";
import { Nullable } from "../../../types";

import { Scrollbar } from "../../scrollbar";
import { Text } from "../../text";

import { SearchContext, SearchValueContext } from "../contexts/Search";
import { BreadCrumbsContext } from "../contexts/BreadCrumbs";
import { TabsContext } from "../contexts/Tabs";
import { SelectAllContext } from "../contexts/SelectAll";
import { InfoBarContext } from "../contexts/InfoBar";

import { StyledBody, StyledTabs } from "../Selector.styled";
import { BodyProps } from "../Selector.types";

import { InfoBar } from "./InfoBar";
import { Search } from "./Search";
import { SelectAll } from "./SelectAll";
import { EmptyScreen } from "./EmptyScreen";
import { BreadCrumbs } from "./BreadCrumbs";
import { Item } from "./Item";
import { Info } from "./Info";
import { VirtualScroll } from "./VirtualScroll";

const CONTAINER_PADDING = 16;
const HEADER_HEIGHT = 54;
const TABS_HEIGHT = 33;
const BREAD_CRUMBS_HEIGHT = 38;
const SEARCH_HEIGHT = 44;
const INFO_BLOCK_MARGIN = 12;
const BODY_DESCRIPTION_TEXT_HEIGHT = 32;
const SELECT_ALL_HEIGHT = 61;
const FOOTER_HEIGHT = 73;
const FOOTER_WITH_NEW_NAME_HEIGHT = 145;
const FOOTER_WITH_CHECKBOX_HEIGHT = 181;

const Body = ({
  footerVisible,

  items,
  onSelect,
  isMultiSelect,

  loadMoreItems,
  hasNextPage,
  totalItems,
  renderCustomItem,
  isLoading,

  rowLoader,

  withFooterInput,
  withFooterCheckbox,
  descriptionText,
  withHeader,
  withPadding,

  withInfo,
  infoText,
  setInputItemVisible,
  inputItemVisible,
}: BodyProps) => {
  console.log("===init===");
  console.log(items.length);
  const infoBarRef = useRef<HTMLDivElement>(null);
  const [infoBarHeight, setInfoBarHeight] = useState(0);

  const { withSearch } = React.useContext(SearchContext);
  const isSearch = React.useContext(SearchValueContext);
  const { withInfoBar } = React.useContext(InfoBarContext);

  const { withBreadCrumbs } = React.useContext(BreadCrumbsContext);

  const { withTabs, tabsData, activeTabId } = React.useContext(TabsContext);

  const { withSelectAll } = React.useContext(SelectAllContext);

  const [bodyHeight, setBodyHeight] = React.useState(0);
  const [savedInputValue, setSavedInputValue] =
    React.useState<Nullable<string>>(null);

  const bodyRef = React.useRef<HTMLDivElement>(null);
  const listOptionsRef = React.useRef<null | InfiniteLoader>(null);
  const resizeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const isEmptyInput =
    items.length === 2 && items[1].isInputItem && items[0].isCreateNewItem;

  const itemsCount = hasNextPage
    ? items.length + 1
    : items.length === 1 && items[0].isCreateNewItem
      ? 0
      : isEmptyInput
        ? 1
        : items.length;

  const resetCache = React.useCallback(() => {
    if (listOptionsRef && listOptionsRef.current) {
      listOptionsRef.current.resetloadMoreItemsCache(true);
    }
  }, []);

  const onBodyResize = React.useCallback(() => {
    if (bodyRef && bodyRef.current) {
      resizeTimerRef.current = setTimeout(() => {
        if (bodyRef.current) {
          setBodyHeight(bodyRef.current.offsetHeight);
        }
      }, 20);
    }
  }, []);

  const isItemLoaded = React.useCallback(
    (index: number) => {
      return !hasNextPage || index < itemsCount;
    },
    [hasNextPage, itemsCount],
  );

  const onLoadMoreItems = React.useCallback(
    (startIndex: number) => {
      // first page loads in selector's useEffect
      if (startIndex === 1) return;

      loadMoreItems(startIndex);
    },
    [loadMoreItems],
  );

  React.useEffect(() => {
    window.addEventListener("resize", onBodyResize);

    return () => {
      window.removeEventListener("resize", onBodyResize);
    };
  }, [onBodyResize]);

  React.useEffect(() => {
    onBodyResize();
  }, [isLoading, footerVisible, onBodyResize]);

  React.useEffect(() => {
    return () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    resetCache();
  }, [resetCache, hasNextPage]);

  // scroll to top after changing tab
  React.useEffect(() => {
    if (!withTabs) return;
    const scrollElement = document.querySelector(".selector-body-scroll");

    if (scrollElement) {
      scrollElement.scrollTo(0, 0);
    }
  }, [withTabs, activeTabId]);

  useLayoutEffect(() => {
    if (withInfoBar && itemsCount !== 0) {
      const infoEl = infoBarRef.current;

      if (infoEl) {
        const { height } = infoEl.getBoundingClientRect();
        setInfoBarHeight(height + CONTAINER_PADDING);
      }
    }
  }, [withInfoBar, itemsCount]);

  let listHeight = 500 - CONTAINER_PADDING - infoBarHeight;

  const showSearch = withSearch && (isSearch || itemsCount > 0);
  const showSelectAll = (isMultiSelect && withSelectAll && !isSearch) || false;

  if (showSearch) listHeight -= SEARCH_HEIGHT;
  if (withTabs) listHeight -= TABS_HEIGHT;
  if (withInfo) {
    const infoEl = document.getElementById("selector-info-text");
    if (infoEl) {
      const height = infoEl.getClientRects()[0].height + INFO_BLOCK_MARGIN;
      listHeight -= height;
    }
  }

  if (withBreadCrumbs) listHeight -= BREAD_CRUMBS_HEIGHT;

  if (showSelectAll) listHeight -= SELECT_ALL_HEIGHT;

  if (descriptionText) listHeight -= BODY_DESCRIPTION_TEXT_HEIGHT;

  const isShareFormEmpty =
    itemsCount === 0 &&
    Boolean(items?.[0]?.isRoomsOnly) &&
    Boolean(items?.[0]?.createDefineRoomType === RoomsType.FormRoom);

  console.log(bodyHeight);

  return (
    <StyledBody
      ref={bodyRef}
      footerHeight={
        withFooterCheckbox
          ? FOOTER_WITH_CHECKBOX_HEIGHT
          : withFooterInput
            ? FOOTER_WITH_NEW_NAME_HEIGHT
            : FOOTER_HEIGHT
      }
      className="selector_body"
      headerHeight={
        withTabs ? HEADER_HEIGHT : HEADER_HEIGHT + CONTAINER_PADDING
      }
      footerVisible={footerVisible}
      withHeader={withHeader}
      withTabs={withTabs}
      withPadding={withPadding}
    >
      <InfoBar ref={infoBarRef} visible={itemsCount !== 0} />
      <BreadCrumbs visible={!isShareFormEmpty} />

      {withTabs && tabsData ? (
        <StyledTabs
          items={tabsData}
          selectedItemId={activeTabId}
          className="selector_body_tabs"
        />
      ) : null}

      <Search isSearch={itemsCount > 0 || isSearch} />

      {withInfo && !isLoading ? (
        <Info withInfo={withInfo} infoText={infoText} />
      ) : null}

      {isLoading ? (
        <Scrollbar style={{ height: "auto" }}>{rowLoader}</Scrollbar>
      ) : itemsCount === 0 ? (
        <EmptyScreen
          withSearch={isSearch}
          items={items}
          inputItemVisible={inputItemVisible}
        />
      ) : (
        <>
          {descriptionText ? (
            <Text className="body-description-text">{descriptionText}</Text>
          ) : null}

          <SelectAll
            show={showSelectAll}
            isLoading={isLoading}
            rowLoader={rowLoader}
          />

          {bodyHeight || true ? (
            <InfiniteLoader
              ref={listOptionsRef}
              isItemLoaded={isItemLoaded}
              itemCount={totalItems}
              loadMoreItems={onLoadMoreItems}
            >
              {({ onItemsRendered, ref }) => (
                <List
                  className="items-list"
                  height={bodyHeight ? listHeight : 50}
                  width="100%"
                  itemCount={itemsCount}
                  itemData={{
                    items: isEmptyInput ? [items[1]] : items,
                    onSelect,
                    isMultiSelect: isMultiSelect || false,
                    rowLoader,
                    isItemLoaded,
                    renderCustomItem,
                    setInputItemVisible,
                    inputItemVisible,
                    savedInputValue,
                    setSavedInputValue,
                    listHeight,
                  }}
                  itemSize={48}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                  outerElementType={VirtualScroll}
                >
                  {Item}
                </List>
              )}
            </InfiniteLoader>
          ) : null}
        </>
      )}
    </StyledBody>
  );
};

export { Body };
