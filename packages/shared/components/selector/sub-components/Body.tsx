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

import React, { useLayoutEffect, useRef, useState } from "react";
import InfiniteLoader from "react-window-infinite-loader";
import { VariableSizeList as List } from "react-window";
import { classNames } from "../../../utils";
import { RoomsType } from "../../../enums";
import { Nullable } from "../../../types";
import styles from "../Selector.module.scss";
import { Scrollbar } from "../../scrollbar";
import { Text } from "../../text";

import { SearchContext, SearchValueContext } from "../contexts/Search";
import { BreadCrumbsContext } from "../contexts/BreadCrumbs";
import { TabsContext } from "../contexts/Tabs";
import { SelectAllContext } from "../contexts/SelectAll";
import { InfoBarContext } from "../contexts/InfoBar";

import { BodyProps } from "../Selector.types";

import { InfoBar } from "./InfoBar";
import { Search } from "./Search";
import { SelectAll } from "./SelectAll";
import { EmptyScreen } from "./EmptyScreen";
import { BreadCrumbs } from "./BreadCrumbs";
import { Item } from "./Item";
import { Info } from "./Info";
import { VirtualScroll } from "./VirtualScroll";
import { Tabs } from "../../tabs";
import InputItem from "./InputItem";

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
  withInfoBadge,
  setInputItemVisible,
  inputItemVisible,
  injectedElement,

  isSSR,

  hideBackButton,
}: BodyProps) => {
  const infoBarRef = useRef<HTMLDivElement>(null);
  const injectedElementRef = useRef<HTMLElement>(null);
  const [infoBarHeight, setInfoBarHeight] = useState(0);
  const [injectedElementHeight, setInjectedElementHeight] = useState(0);

  const { withSearch } = React.use(SearchContext);
  const isSearch = React.use(SearchValueContext);
  const { withInfoBar } = React.use(InfoBarContext);

  const { withBreadCrumbs, isBreadCrumbsLoading } =
    React.useContext(BreadCrumbsContext);

  const { withTabs, tabsData, activeTabId } = React.use(TabsContext);

  const { withSelectAll } = React.use(SelectAllContext);

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

  const isShareFormEmpty =
    itemsCount === 0 &&
    !isSearch &&
    Boolean(items?.[0]?.isRoomsOnly) &&
    (Boolean(items?.[0]?.createDefineRoomType === RoomsType.FormRoom) ||
      Boolean(items?.[0]?.createDefineRoomType === RoomsType.VirtualDataRoom));

  const visibleInfoBar = !isShareFormEmpty && !isBreadCrumbsLoading;

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
  }, [withInfoBar, itemsCount, visibleInfoBar]);
  useLayoutEffect(() => {
    if (injectedElement) {
      const element = injectedElementRef.current;

      if (element) {
        const { height } = element.getBoundingClientRect();
        setInjectedElementHeight(height);
      }
    }
  }, [injectedElement, itemsCount]);

  let listHeight = bodyHeight - infoBarHeight - injectedElementHeight;

  const showSearch = withSearch && (isSearch || itemsCount > 0);
  const showSelectAll = (isMultiSelect && withSelectAll && !isSearch) || false;

  if (withPadding) {
    listHeight -= CONTAINER_PADDING;
  }

  if (showSearch) {
    listHeight -= SEARCH_HEIGHT;
  }
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

  const getFooterHeight = () => {
    if (withFooterCheckbox) return FOOTER_WITH_CHECKBOX_HEIGHT;
    if (withFooterInput) return FOOTER_WITH_NEW_NAME_HEIGHT;
    return FOOTER_HEIGHT;
  };

  const getHeaderHeight = () => {
    if (withTabs) return HEADER_HEIGHT;
    return HEADER_HEIGHT + CONTAINER_PADDING;
  };

  const cloneProps = { ref: injectedElementRef };

  const getItemSize = (index: number): number => {
    if (items[index]?.isSeparator) {
      return 16;
    }

    return 48;
  };

  return (
    <div
      ref={bodyRef}
      className={classNames(
        styles.body,
        {
          [styles.withHeaderAndFooter]: footerVisible && withHeader,
          [styles.withFooterOnly]: footerVisible && !withHeader,
          [styles.withHeaderOnly]: !footerVisible && withHeader,
          [styles.noHeaderFooter]: !footerVisible && !withHeader,
          [styles.withPadding]: !withTabs && withPadding,
        },
        "selector_body",
      )}
      style={
        {
          "--footer-height": `${getFooterHeight()}px`,
          "--header-height": `${getHeaderHeight()}px`,
        } as React.CSSProperties
      }
    >
      <InfoBar
        ref={infoBarRef}
        visible={visibleInfoBar}
        className={styles.selectorInfoBar}
      />
      <BreadCrumbs visible={!isShareFormEmpty} />

      {injectedElement ? React.cloneElement(injectedElement, cloneProps) : null}

      {withTabs && tabsData ? (
        <Tabs
          items={tabsData}
          selectedItemId={activeTabId}
          className={classNames(styles.tabs, "selector_body_tabs")}
        />
      ) : null}

      <Search isSearch={itemsCount > 0 || isSearch} />

      {withInfo && !isLoading ? (
        <Info
          withInfo={withInfo}
          infoText={infoText}
          withInfoBadge={withInfoBadge}
        />
      ) : null}

      {isLoading ? (
        <Scrollbar style={{ height: listHeight }}>{rowLoader}</Scrollbar>
      ) : itemsCount === 0 ? (
        <EmptyScreen
          withSearch={isSearch}
          items={items}
          inputItemVisible={inputItemVisible}
          hideBackButton={hideBackButton}
        />
      ) : (
        <>
          {descriptionText ? (
            <Text className={styles.bodyDescriptionText}>
              {descriptionText}
            </Text>
          ) : null}

          <SelectAll
            show={showSelectAll}
            isLoading={isLoading}
            rowLoader={rowLoader}
          />

          {isSSR && !bodyHeight ? (
            <Scrollbar
              style={
                {
                  height: `calc(100% - ${Math.abs(listHeight + CONTAINER_PADDING)}px)`,
                  overflow: "hidden",
                  "--scrollbar-padding-inline-end": 0,
                  "--scrollbar-padding-inline-end-mobile": 0,
                } as React.CSSProperties
              }
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    height: 48,
                    display: "flex",
                    alignItems: "stretch",
                  }}
                >
                  <Item
                    index={index}
                    style={{ flexGrow: 1 }}
                    data={{
                      items,
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
                  />
                </div>
              ))}
            </Scrollbar>
          ) : items.length === 2 && items[1]?.isInputItem ? (
            <InputItem
              defaultInputValue={savedInputValue ?? items[1].defaultInputValue}
              onAcceptInput={items[1].onAcceptInput}
              onCancelInput={items[1].onCancelInput}
              style={{}}
              color={items[1].color}
              roomType={items[1].roomType}
              cover={items[1].cover}
              icon={items[1].icon}
              setInputItemVisible={setInputItemVisible}
              setSavedInputValue={setSavedInputValue}
              placeholder={items[1].placeholder}
            />
          ) : (
            <InfiniteLoader
              ref={listOptionsRef}
              isItemLoaded={isItemLoaded}
              itemCount={totalItems}
              loadMoreItems={onLoadMoreItems}
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
                    inputItemVisible,
                    savedInputValue,
                    setSavedInputValue,
                    listHeight,
                  }}
                  itemSize={getItemSize}
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
    </div>
  );
};

export { Body };
