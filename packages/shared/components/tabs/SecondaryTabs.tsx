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

import React, { useRef, useEffect, useCallback, useState } from "react";
import classNames from "classnames";
import { ReactSVG } from "react-svg";
import { motion } from "framer-motion";
import { isMobile } from "react-device-detect";
import ArrowReactUrl from "PUBLIC_DIR/images/arrow.left.react.svg?url";
import { type TTabItem, type TabsProps } from "./Tabs.types";
import { Scrollbar as ScrollbarType } from "../scrollbar/custom-scrollbar";
import { Scrollbar } from "../scrollbar";
import { Text } from "../text";
import {
  MAX_TAB_WIDTH,
  TAB_PADDING,
  TABS_GAP,
  ARROW_WIDTH,
} from "./Tabs.constants";
import styles from "./Tabs.module.scss";
import useTabsHotkeys from "./hooks/useTabsHotkeys";
import { useViewTab } from "./hooks/useViewTab";
import { useInterfaceDirection } from "../../hooks/useInterfaceDirection";

const SecondaryTabs = (props: TabsProps) => {
  const {
    items,
    selectedItemId,
    stickyTop,
    onSelect,
    withoutStickyIntend = false,
    layoutId,
    isLoading,
    scaled,
    hotkeysId,
    ...rest
  } = props;

  const selectedItemIndex = !selectedItemId
    ? 0
    : items.findIndex((item) => item.id === selectedItemId);

  const [focusedTabIndex, setFocusedTabIndex] = useState(selectedItemIndex);
  const [hotkeysIsActive, setHotkeysIsActive] = useState(false);
  const [tabsCountInContainer, setTabsCountInContainer] = useState(0);

  useTabsHotkeys({
    enabledHotkeys: hotkeysIsActive,
    setHotkeysIsActive,
    items,
    focusedTabIndex,
    setFocusedTabIndex,
    onSelect,
    hotkeysId,
  });

  const { interfaceDirection } = useInterfaceDirection();

  const [referenceTabSize, setReferenceTabSize] = useState<number | null>(null);
  const [tabsIsOverflowing, setTabsIsOverflowing] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<ScrollbarType>(null);
  const tabItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const isViewFirstTab = useViewTab(scrollRef, tabsRef, 0);
  const isViewLastTab = useViewTab(scrollRef, tabsRef, items.length - 1);

  const scrollToTab = useCallback(
    (index: number): void => {
      if (!scrollRef.current || !tabsRef.current) return;

      const containerElement = scrollRef.current.scrollerElement;
      const tabElement = tabsRef.current.children[index] as HTMLDivElement;

      if (!containerElement || !tabElement) return;

      const containerWidth = containerElement.offsetWidth;
      const tabWidth = tabElement?.offsetWidth;
      const tabOffsetLeft = tabElement?.offsetLeft;
      const arrowsWidth = isMobile ? 0 : ARROW_WIDTH;

      if (tabOffsetLeft - TABS_GAP < containerElement.scrollLeft) {
        scrollRef.current.scrollTo(tabOffsetLeft - TABS_GAP - arrowsWidth);
      } else if (
        tabOffsetLeft + tabWidth >
        containerElement.scrollLeft + containerWidth
      ) {
        const tabsWidth = (tabsCountInContainer - 1) * tabWidth;
        scrollRef.current.scrollTo(
          tabOffsetLeft - TABS_GAP - arrowsWidth - tabsWidth,
        );
      }
    },
    [tabsCountInContainer],
  );

  useEffect(() => {
    if (isLoading) return;
    const widths = tabItemsRef.current.map((ref) =>
      ref ? ref.offsetWidth : 0,
    );

    const max = Math.max(...widths);

    setReferenceTabSize(
      max > MAX_TAB_WIDTH ? MAX_TAB_WIDTH : max - TAB_PADDING,
    );
  }, [setReferenceTabSize, isLoading]);

  useEffect(() => {
    if (tabsIsOverflowing) return;

    const tabsContainerWidth = tabsContainerRef.current?.offsetWidth ?? 0;

    if (tabsContainerWidth && referenceTabSize) {
      let maxTabsCount = Math.floor(
        tabsContainerWidth / (referenceTabSize + TABS_GAP + TAB_PADDING),
      );
      if (maxTabsCount < items.length) {
        setTabsIsOverflowing(true);

        if (isMobile) return;

        const arrowsWidth = ARROW_WIDTH * 2;

        maxTabsCount = Math.floor(
          (tabsContainerWidth - arrowsWidth) /
            (referenceTabSize + TABS_GAP + TAB_PADDING),
        );

        const size =
          Math.round(tabsContainerWidth - arrowsWidth) / maxTabsCount -
          TAB_PADDING -
          TABS_GAP;

        setReferenceTabSize(size);
        setTabsCountInContainer(maxTabsCount);
      }
    }
  }, [referenceTabSize, items.length, tabsIsOverflowing]);

  useEffect(() => {
    scrollToTab(selectedItemIndex);
  }, [selectedItemIndex, items, scrollToTab]);

  useEffect(() => {
    const tabsIsActive = !!document.activeElement?.classList.contains(
      `secondary-tabs-scroll-${hotkeysId}`,
    );

    setHotkeysIsActive(tabsIsActive);
  });

  const setSelectedItem = (selectedTabItem: TTabItem, index: number): void => {
    onSelect?.(selectedTabItem);
    setFocusedTabIndex(index);

    scrollToTab(index);
  };

  const classes = classNames({
    [styles.secondary]: true,
  });

  const onSelectPrev = () => {
    if (selectedItemIndex === 0) return;

    const prevItem = items[selectedItemIndex - 1];
    onSelect?.(prevItem);
  };

  const onSelectNext = () => {
    if (selectedItemIndex === items.length - 1) return;

    const nextItem = items[selectedItemIndex + 1];
    onSelect?.(nextItem);
  };

  const containerW =
    tabsIsOverflowing && referenceTabSize
      ? items.length * (referenceTabSize + TAB_PADDING) +
        ARROW_WIDTH +
        ARROW_WIDTH +
        items.length * TABS_GAP
      : null;

  const withArrows = tabsIsOverflowing && !isMobile;

  const renderContent = (
    <div
      id={layoutId}
      style={
        {
          "--tabs-count": items.length,
          "--tabs-width": `${containerW}px`,
        } as React.CSSProperties
      }
      className={classNames(
        styles.tabList,
        { [styles.withArrows]: withArrows },
        { [styles.referenceSize]: !!referenceTabSize },
        { [styles.scaled]: scaled },
        classes,
      )}
      ref={tabsRef}
    >
      {items.map((item, index) => {
        const isSelected = index === selectedItemIndex;
        const isFocused = hotkeysIsActive ? index === focusedTabIndex : false;

        return (
          <div
            key={item.id}
            ref={(el) => {
              tabItemsRef.current[index] = el;
            }}
            className={classNames(
              styles.tab,
              {
                [styles.selected]: isSelected,
                [styles.focused]: isFocused,
                [styles.disabled]: item.isDisabled,
              },
              classes,
            )}
            onClick={() => {
              if (index === selectedItemIndex) return;
              item.onClick?.();
              setSelectedItem(item, index);
            }}
            style={
              scaled
                ? {}
                : {
                    width: referenceTabSize ?? "fit-content",
                    minWidth: referenceTabSize ?? "unset",
                  }
            }
          >
            {item.iconName ? (
              <ReactSVG className={styles.tabIcon} src={item.iconName} />
            ) : null}

            {isSelected ? (
              <motion.span
                layoutId={layoutId ?? "motionLayoutId"}
                className={styles.motionBackground}
                transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              />
            ) : null}

            <Text
              as="span"
              fontWeight={600}
              truncate
              className={styles.tabText}
            >
              {item.name}
            </Text>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      ref={tabsContainerRef}
      className={classNames(styles.tabs, classes)}
      {...rest}
    >
      <div
        data-sticky
        className={classNames(styles.sticky, classes, "sticky")}
        style={{ top: stickyTop }}
      >
        {withArrows ? (
          <ReactSVG
            className={classNames(styles.arrowIcon, styles.arrowLeft, {
              [styles.disabled]: selectedItemIndex === 0,
            })}
            src={ArrowReactUrl}
            onClick={onSelectPrev}
          />
        ) : null}

        {!isViewFirstTab ? (
          <div
            className={classNames(styles.blurAhead, classes)}
            dir={interfaceDirection}
            data-direction={interfaceDirection}
          />
        ) : null}

        <Scrollbar
          ref={scrollRef}
          autoHide={false}
          noScrollY
          paddingInlineEnd="0"
          scrollBodyClassName={`secondary-tabs-scroll-${hotkeysId}`}
          className={classNames(styles.scroll, classes)}
        >
          {renderContent}
        </Scrollbar>

        {!isViewLastTab ? (
          <div
            className={classNames(styles.blurBack, classes)}
            dir={interfaceDirection}
            data-direction={interfaceDirection}
          />
        ) : null}

        {withArrows ? (
          <ReactSVG
            className={classNames(styles.arrowIcon, styles.arrowRight, {
              [styles.disabled]: selectedItemIndex === items.length - 1,
            })}
            src={ArrowReactUrl}
            onClick={onSelectNext}
          />
        ) : null}
      </div>

      {withoutStickyIntend ? null : (
        <div className={classNames(styles.stickyIndent, "sticky-indent")} />
      )}
      {items[selectedItemIndex]?.content ? (
        <div
          style={{ overflow: "hidden" }}
          className={`${styles.tabsBody} tabs-body`}
        >
          {items[selectedItemIndex].content}
        </div>
      ) : null}
    </div>
  );
};

export { SecondaryTabs };
