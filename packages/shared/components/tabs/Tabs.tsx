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

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "styled-components";

import { Scrollbar as ScrollbarType } from "../scrollbar/custom-scrollbar";

import { useViewTab } from "./hooks/useViewTab";

import {
  ScrollbarTabs,
  StyledTabs,
  Tab,
  TabBadge,
  TabList,
  TabSubLine,
  TabText,
} from "./Tabs.styled";
import { TabsProps, TTabItem } from "./Tabs.types";
import { TabsTypes } from "./Tabs.enums";
import { OFFSET_RIGHT, OFFSET_LEFT } from "./Tabs.constants";

const Tabs = (props: TabsProps) => {
  const {
    items,
    selectedItemId,
    selectedItems = [],
    type = TabsTypes.Primary,
    stickyTop,
    onSelect,
    multiple = false,
    ...rest
  } = props;

  const theme = useTheme();

  const selectedItemIndex = !selectedItemId
    ? 0
    : items.findIndex((item) => item.id === selectedItemId);

  const [currentItem, setCurrentItem] = useState(selectedItemIndex);
  const [multipleItems, setMultipleItems] = useState(selectedItems);

  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<ScrollbarType>(null);

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

      if (theme.interfaceDirection === "ltr") {
        if (tabOffsetLeft - OFFSET_LEFT < containerElement.scrollLeft) {
          scrollRef.current.scrollTo(tabOffsetLeft - OFFSET_LEFT);
        } else if (
          tabOffsetLeft + tabWidth >
          containerElement.scrollLeft + containerWidth
        ) {
          scrollRef.current.scrollTo(
            tabOffsetLeft - containerWidth + tabWidth + OFFSET_RIGHT,
          );
        }

        return;
      }

      const rect = tabElement?.getBoundingClientRect();

      if (rect.left - OFFSET_LEFT < 0) {
        scrollRef.current.scrollTo(
          -(
            Math.abs(rect.left) +
            OFFSET_LEFT +
            Math.abs(containerElement.scrollLeft)
          ),
        );
      } else if (rect.right > containerWidth && !!containerElement.scrollLeft) {
        scrollRef.current.scrollTo(
          rect.right -
            containerWidth +
            containerElement.scrollLeft +
            OFFSET_RIGHT,
        );
      }
    },
    [theme.interfaceDirection],
  );

  useEffect(() => {
    if (!multiple) setCurrentItem(selectedItemIndex);

    scrollToTab(selectedItemIndex);
  }, [selectedItemIndex, items, scrollToTab, multiple]);

  const setSelectedItem = (selectedTabItem: TTabItem, index: number): void => {
    if (multiple) {
      const indexOperation = () => {
        const newArray = [...multipleItems];

        const deletionIndex = newArray.indexOf(index);

        if (deletionIndex !== -1) {
          newArray.splice(deletionIndex, 1);

          return newArray;
        }

        newArray.push(index);
        return newArray;
      };

      const updatedActiveTab = indexOperation();

      setMultipleItems(updatedActiveTab);
      onSelect?.(selectedTabItem);
      return;
    }

    setCurrentItem(index);
    onSelect?.(selectedTabItem);

    scrollToTab(index);
  };

  const renderContent = (
    <TabList ref={tabsRef} $type={type} multiple={multiple}>
      {items.map((item, index) => {
        const isActive = multiple
          ? multipleItems.indexOf(index) !== -1
          : index === currentItem;
        const showBadge = type === TabsTypes.Primary && !!item.badge;

        return (
          <Tab
            key={item.id}
            isActive={isActive}
            isDisabled={item?.isDisabled}
            $type={type}
            multiple={multiple}
            onClick={() => {
              item.onClick?.();
              setSelectedItem(item, index);
            }}
          >
            <TabText>{item.name}</TabText>
            <TabSubLine isActive={isActive} $type={type} />
            {showBadge && (
              <TabBadge className="tab-badge">{item.badge}</TabBadge>
            )}
          </Tab>
        );
      })}
    </TabList>
  );
  return (
    <StyledTabs {...rest} stickyTop={stickyTop} multiple={multiple}>
      {multiple && renderContent}

      {!multiple && (
        <div className="sticky">
          {!isViewFirstTab && <div className="blur-ahead" />}

          <ScrollbarTabs
            ref={scrollRef}
            autoHide={false}
            noScrollY
            $type={type}
          >
            {renderContent}
          </ScrollbarTabs>

          {!isViewLastTab && <div className="blur-back" />}
        </div>
      )}
      <div className="sticky-indent" />
      {!multiple && (
        <div className="tabs-body">{items[currentItem]?.content}</div>
      )}
    </StyledTabs>
  );
};

export { Tabs };
