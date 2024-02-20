import React from "react";
import { isMobileOnly, isIOS } from "react-device-detect";
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList as List } from "react-window";

import { CustomScrollbarsVirtualList, Scrollbar } from "../../scrollbar";
import { Text } from "../../text";

import { Search } from "./Search";
import { SelectAll } from "./SelectAll";
import { EmptyScreen } from "./EmptyScreen";
import { BreadCrumbs } from "./BreadCrumbs";

import { StyledBody, StyledTabs } from "../Selector.styled";
import { BodyProps } from "../Selector.types";
import { Item } from "./Item";

const CONTAINER_PADDING = 16;
const HEADER_HEIGHT = 54;
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
}: BodyProps) => {
  const [bodyHeight, setBodyHeight] = React.useState(0);

  const bodyRef = React.useRef<HTMLDivElement>(null);
  const listOptionsRef = React.useRef<null | InfiniteLoader>(null);

  const itemsCount = hasNextPage ? items.length + 1 : items.length;

  const resetCache = React.useCallback(() => {
    if (listOptionsRef && listOptionsRef.current) {
      listOptionsRef.current.resetloadMoreItemsCache(true);
    }
  }, []);

  const onBodyResize = React.useCallback(
    (e?: Event) => {
      const target = e ? (e.target as VisualViewport) : null;
      if (target && target.height && isMobileOnly && isIOS) {
        let height = target.height - 64 - HEADER_HEIGHT;

        if (footerVisible) {
          height -= withFooterCheckbox
            ? FOOTER_WITH_CHECKBOX_HEIGHT
            : withFooterInput
              ? FOOTER_WITH_NEW_NAME_HEIGHT
              : FOOTER_HEIGHT;
        }
        setBodyHeight(height);
        return;
      }
      if (bodyRef && bodyRef.current) {
        setBodyHeight(bodyRef.current.offsetHeight);
      }
    },
    [footerVisible, withFooterCheckbox, withFooterInput],
  );

  const isItemLoaded = React.useCallback(
    (index: number) => {
      return !hasNextPage || index < itemsCount;
    },
    [hasNextPage, itemsCount],
  );

  React.useEffect(() => {
    window.addEventListener("resize", onBodyResize);
    if (isMobileOnly && isIOS)
      window.visualViewport?.addEventListener("resize", onBodyResize);
    return () => {
      window.removeEventListener("resize", onBodyResize);
      window.visualViewport?.removeEventListener("resize", onBodyResize);
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
            breadCrumbs={breadCrumbs}
            onSelectBreadCrumb={onSelectBreadCrumb}
            isLoading={isLoading}
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
      ) : withSearch ||
        (itemsCount > 0 && withSearch) ||
        (withSearch && isSearch) ? (
        <Search
          placeholder={searchPlaceholder}
          value={searchValue}
          onSearch={onSearch}
          onClearSearch={onClearSearch}
          setIsSearch={setIsSearch}
        />
      ) : null}

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
        />
      ) : (
        <>
          {!!descriptionText && (
            <Text className="body-description-text">{descriptionText}</Text>
          )}
          {isMultiSelect && withSelectAll && !isSearch && (
            <SelectAll
              label={selectAllLabel}
              icon={selectAllIcon}
              isChecked={isAllChecked}
              isIndeterminate={isAllIndeterminate}
              onSelectAll={onSelectAll}
              isLoading={isLoading}
              rowLoader={rowLoader}
            />
          )}

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
                    items,
                    onSelect,
                    isMultiSelect: isMultiSelect || false,
                    rowLoader,
                    isItemLoaded,
                    renderCustomItem,
                  }}
                  itemSize={48}
                  onItemsRendered={onItemsRendered}
                  ref={ref}
                  outerElementType={CustomScrollbarsVirtualList}
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
