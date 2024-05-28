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

import React from "react";

import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from "react-window";

import { Scrollbar } from "../../scrollbar";
import { Text } from "../../text";

import { Search } from "./Search";
import { SelectAll } from "./SelectAll";
import { EmptyScreen } from "./EmptyScreen";
import { BreadCrumbs } from "./BreadCrumbs";

import { StyledBody, StyledTabs } from "../Selector.styled";
import { BodyProps } from "../Selector.types";
import { Item } from "./Item";
import { Info } from "./Info";
import { VirtualScroll } from "./VirtualScroll";

const CONTAINER_PADDING = 16;
const HEADER_HEIGHT = 54;
const TABS_HEIGHT = 40;
const BREAD_CRUMBS_HEIGHT = 38;
const SEARCH_HEIGHT = 44;
const BODY_DESCRIPTION_TEXT_HEIGHT = 32;
const SELECT_ALL_HEIGHT = 61;
const FOOTER_HEIGHT = 73;
const FOOTER_WITH_NEW_NAME_HEIGHT = 145;
const FOOTER_WITH_CHECKBOX_HEIGHT = 181;

const Body = ({
  footerVisible,
  isSearch,
  isAllIndeterminate,
  isAllChecked,
  searchPlaceholder,
  setIsSearch,
  searchValue,
  onSearch,
  onClearSearch,
  items,
  onSelect,
  isMultiSelect,
  withSelectAll,
  selectAllLabel,
  selectAllIcon,
  onSelectAll,
  emptyScreenImage,
  emptyScreenHeader,
  emptyScreenDescription,
  searchEmptyScreenImage,
  searchEmptyScreenHeader,
  searchEmptyScreenDescription,
  loadMoreItems,
  hasNextPage,
  totalItems,
  renderCustomItem,
  isLoading,
  searchLoader,
  rowLoader,
  withBreadCrumbs,
  breadCrumbs,
  onSelectBreadCrumb,
  breadCrumbsLoader,
  withSearch,
  isBreadCrumbsLoading,
  isSearchLoading,
  withFooterInput,
  withFooterCheckbox,
  descriptionText,
  withHeader,

  withTabs,
  tabsData,
  activeTabId,

  withInfo,
  infoText,
  setInputItemVisible,
}: BodyProps) => {
  const [bodyHeight, setBodyHeight] = React.useState(0);

  const bodyRef = React.useRef<HTMLDivElement>(null);
  const listOptionsRef = React.useRef<null | InfiniteLoader>(null);

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
      setBodyHeight(bodyRef.current.offsetHeight);
    }
  }, []);

  const isItemLoaded = React.useCallback(
    (index: number) => {
      return !hasNextPage || index < itemsCount;
    },
    [hasNextPage, itemsCount],
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
    resetCache();
  }, [resetCache, hasNextPage]);

  let listHeight = bodyHeight - CONTAINER_PADDING;

  if (withSearch || isSearch || itemsCount > 0) listHeight -= SEARCH_HEIGHT;
  if (withTabs) listHeight -= TABS_HEIGHT;
  if (withInfo) {
    const infoEl = document.getElementById("selector-info-text");
    if (infoEl) {
      const height = infoEl.getClientRects()[0].height;
      listHeight -= height;
    }
  }

  if (withBreadCrumbs) listHeight -= BREAD_CRUMBS_HEIGHT;

  if (isMultiSelect && withSelectAll && !isSearch)
    listHeight -= SELECT_ALL_HEIGHT;

  if (descriptionText) listHeight -= BODY_DESCRIPTION_TEXT_HEIGHT;

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
      headerHeight={HEADER_HEIGHT}
      footerVisible={footerVisible}
      withHeader={withHeader}
      withTabs={withTabs}
    >
      {withBreadCrumbs ? (
        isBreadCrumbsLoading ? (
          breadCrumbsLoader
        ) : (
          <BreadCrumbs
            withBreadCrumbs
            isBreadCrumbsLoading={isLoading}
            breadCrumbs={breadCrumbs}
            breadCrumbsLoader={breadCrumbsLoader}
            onSelectBreadCrumb={onSelectBreadCrumb}
          />
        )
      ) : null}

      {withTabs && tabsData && (
        <StyledTabs
          startSelect={0}
          data={tabsData}
          forsedActiveItemId={activeTabId}
        />
      )}

      {isSearchLoading || isBreadCrumbsLoading ? (
        searchLoader
      ) : withSearch && (itemsCount > 0 || isSearch) ? (
        <Search
          placeholder={searchPlaceholder}
          value={searchValue}
          onSearch={onSearch}
          onClearSearch={onClearSearch}
          setIsSearch={setIsSearch}
        />
      ) : null}

      {withInfo && !isLoading && (
        <Info withInfo={withInfo} infoText={infoText} />
      )}

      {isLoading ? (
        <Scrollbar style={{ height: listHeight }}>{rowLoader}</Scrollbar>
      ) : itemsCount === 0 ? (
        <EmptyScreen
          withSearch={isSearch}
          image={emptyScreenImage}
          header={emptyScreenHeader}
          description={emptyScreenDescription}
          searchImage={searchEmptyScreenImage}
          searchHeader={searchEmptyScreenHeader}
          searchDescription={searchEmptyScreenDescription}
          items={items}
        />
      ) : (
        <>
          {!!descriptionText && (
            <Text className="body-description-text">{descriptionText}</Text>
          )}
          {isMultiSelect && withSelectAll && !isSearch ? (
            isLoading ? (
              rowLoader
            ) : (
              <SelectAll
                withSelectAll
                selectAllIcon={selectAllIcon}
                selectAllLabel={selectAllLabel}
                isAllChecked={isAllChecked}
                isAllIndeterminate={isAllIndeterminate}
                onSelectAll={onSelectAll}
              />
            )
          ) : null}

          {bodyHeight && (
            <InfiniteLoader
              ref={listOptionsRef}
              isItemLoaded={isItemLoaded}
              itemCount={totalItems}
              loadMoreItems={loadMoreItems}
            >
              {({ onItemsRendered, ref }) => (
                <List
                  className="items-list"
                  height={listHeight}
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
          )}
        </>
      )}
    </StyledBody>
  );
};

export { Body };
