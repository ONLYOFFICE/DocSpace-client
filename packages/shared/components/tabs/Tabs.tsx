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

import { useState, useRef, MutableRefObject } from "react";
import { useTheme } from "styled-components";
import { StyledTabs, Tab, TabList, TabPanel, TabSubLine } from "./Tabs.styled";
import { TabsProps, TTabItem } from "./Tabs.types";
import { ThemeTabs } from "./Tabs.enums";
import { OFFSET_RIGHT, OFFSET_LEFT } from "./Tabs.constants";
import { useViewTab } from "./hooks/useViewTab";

const Tabs = (props: TabsProps) => {
  const {
    items,
    theme = ThemeTabs.Primary,
    onSelect,
    selectedItem = 0,
  } = props;

  const globalTheme = useTheme();
  const tabsRef = useRef() as MutableRefObject<HTMLDivElement>;

  const [currentItem, setCurrentItem] = useState<TTabItem>(items[selectedItem]);

  const isViewFirstTab = useViewTab(tabsRef, 0);
  const isViewLastTab = useViewTab(tabsRef, items.length - 1);

  const scrollToTab = (index: number) => {
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

  const setSelectedItem = (selectedTabItem: TTabItem, index: number) => {
    setCurrentItem(selectedTabItem);
    scrollToTab(index);
    onSelect?.(selectedTabItem);
  };

  return (
    <StyledTabs>
      {!isViewFirstTab && <div className="blur-ahead" />}
      <TabList $theme={theme} ref={tabsRef}>
        {items.map((item, index) => {
          const isActive = item.id === currentItem.id;
          return (
            <Tab
              key={item.id}
              isActive={isActive}
              isDisabled={item?.isDisabled}
              $currentColorScheme={globalTheme.currentColorScheme}
              $theme={theme}
              onClick={() => {
                item.onClick?.();
                setSelectedItem(item, index);
              }}
            >
              {item.name}
              <TabSubLine
                isActive={isActive}
                $currentColorScheme={globalTheme.currentColorScheme}
                $theme={theme}
              />
            </Tab>
          );
        })}
      </TabList>
      {!isViewLastTab && <div className="blur-back" />}
      <div className="sticky-indent" />

      <TabPanel>{currentItem?.content}</TabPanel>
    </StyledTabs>
  );
};

export { Tabs };
