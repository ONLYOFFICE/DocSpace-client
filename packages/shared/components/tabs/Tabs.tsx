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

import React, { useState, useRef, useEffect } from "react";

import { useViewTab } from "./hooks/useViewTab";

import { StyledTabs, Tab, TabList, TabSubLine } from "./Tabs.styled";
import { TabsProps, TTabItem } from "./Tabs.types";
import { TabsTypes } from "./Tabs.enums";
import { OFFSET_RIGHT, OFFSET_LEFT, INDEX_NOT_FOUND } from "./Tabs.constants";

const Tabs = (props: TabsProps) => {
  const {
    items,
    selectedItemId,
    type = TabsTypes.Primary,
    stickyTop,
    onSelect,
    ...rest
  } = props;

  let selectedItemIndex = items.findIndex((item) => item.id === selectedItemId);
  if (selectedItemIndex === INDEX_NOT_FOUND) {
    selectedItemIndex = 0;
  }

  const [currentItem, setCurrentItem] = useState<TTabItem>(
    items[selectedItemIndex],
  );

  const tabsRef = useRef<HTMLDivElement>(null);
  const isViewFirstTab = useViewTab(tabsRef, 0);
  const isViewLastTab = useViewTab(tabsRef, items.length - 1);

  useEffect(() => {
    setCurrentItem(items[selectedItemIndex]);
  }, [selectedItemIndex, items]);

  const scrollToTab = (index: number): void => {
    if (!tabsRef.current) return;

    const tabElement = tabsRef.current.children[index] as HTMLElement;
    const containerWidth = tabsRef.current.offsetWidth;
    const tabWidth = tabElement.offsetWidth;
    const tabOffsetLeft = tabElement.offsetLeft;

    if (tabOffsetLeft - OFFSET_LEFT < tabsRef.current.scrollLeft) {
      tabsRef.current.scrollTo({
        left: tabOffsetLeft - OFFSET_LEFT,
        behavior: "smooth",
      });
    } else if (
      tabOffsetLeft + tabWidth >
      tabsRef.current.scrollLeft + containerWidth
    ) {
      tabsRef.current.scrollTo({
        left: tabOffsetLeft - containerWidth + tabWidth + OFFSET_RIGHT,
        behavior: "smooth",
      });
    }
  };

  const setSelectedItem = (selectedTabItem: TTabItem, index: number): void => {
    setCurrentItem(selectedTabItem);
    scrollToTab(index);
    onSelect?.(selectedTabItem);
  };

  return (
    <StyledTabs {...rest} stickyTop={stickyTop}>
      <div className="sticky">
        {!isViewFirstTab && <div className="blur-ahead" />}
        <TabList $type={type} ref={tabsRef}>
          {items.map((item, index) => {
            const isActive = item.id === currentItem.id;
            return (
              <Tab
                key={item.id}
                isActive={isActive}
                isDisabled={item?.isDisabled}
                $type={type}
                onClick={() => {
                  item.onClick?.();
                  setSelectedItem(item, index);
                }}
              >
                {item.name}
                <TabSubLine isActive={isActive} $type={type} />
              </Tab>
            );
          })}
        </TabList>
        {!isViewLastTab && <div className="blur-back" />}
      </div>
      <div className="sticky-indent" />

      <div className="tabs-body">{currentItem?.content}</div>
    </StyledTabs>
  );
};

export { Tabs };
