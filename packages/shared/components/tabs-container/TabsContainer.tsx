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

import { Text } from "../text";

import {
  NavItem,
  StyledLabelTheme,
  StyledScrollbar,
} from "./TabsContainer.styled";
import { TElement, TabsContainerProps } from "./TabsContainer.types";

const TabsContainer = ({
  elements,
  isDisabled,
  onSelect,
  selectedItem = 0,
}: TabsContainerProps) => {
  const arrayRefs = React.useRef<HTMLDivElement[]>([]);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const [state, setState] = React.useState({
    activeTab: selectedItem,
    onScrollHide: true,
  });

  React.useEffect(() => {
    const countElements = elements.length;
    let item = countElements;
    while (item !== 0) {
      arrayRefs.current.push();
      item -= 1;
    }
  }, [elements]);

  const getWidthElements = () => {
    const arrayWidths = [];
    const length = arrayRefs.current.length - 1;
    let widthItem = 0;
    while (length + 1 !== widthItem) {
      arrayWidths.push(arrayRefs.current[widthItem].offsetWidth);
      widthItem += 1;
    }

    return arrayWidths;
  };

  const setTabPosition = (index: number, currentRef: HTMLDivElement) => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const arrayOfWidths = getWidthElements(); // get tabs widths
    const scrollLeft = scrollElement.scrollLeft; // get scroll position relative to left side
    const staticScroll = scrollElement.scrollWidth; // get static scroll width
    const containerWidth = scrollElement.clientWidth; // get main container width
    const currentTabWidth = currentRef.offsetWidth;
    const marginRight = 8;

    // get tabs of left side
    let leftTabs = 0;
    let leftFullWidth = 0;
    while (leftTabs !== index) {
      leftTabs += 1;
      leftFullWidth += arrayOfWidths[leftTabs] + marginRight;
    }
    leftFullWidth += arrayOfWidths[0] + marginRight;

    // get tabs of right side
    let rightTabs = arrayRefs.current.length - 1;
    let rightFullWidth = 0;
    while (rightTabs !== index - 1) {
      rightFullWidth += arrayOfWidths[rightTabs] + marginRight;
      rightTabs -= 1;
    }

    // Out of range of left side
    if (leftFullWidth > containerWidth + scrollLeft) {
      let prevIndex = index - 1;
      let widthBlocksInContainer = 0;
      while (prevIndex !== -1) {
        widthBlocksInContainer += arrayOfWidths[prevIndex] + marginRight;
        prevIndex -= 1;
      }

      const difference = containerWidth - widthBlocksInContainer;
      const currentContainerWidth = currentTabWidth;

      scrollElement.scrollTo({
        left: difference * -1 + currentContainerWidth + marginRight,
      });
    }
    // Out of range of left side
    else if (rightFullWidth > staticScroll - scrollLeft) {
      scrollElement.scrollTo({ left: staticScroll - rightFullWidth });
    }
  };

  const titleClick = (index: number, item: TElement, ref: HTMLDivElement) => {
    if (state.activeTab !== index) {
      setState((s) => ({ ...s, activeTab: index }));
      const newItem = { ...item };
      delete newItem.content;
      onSelect?.(newItem);

      setTabPosition(index, ref);
    }
  };

  const onClick = (index: number, item: TElement) => {
    titleClick(index, item, arrayRefs.current[index]);
  };

  const setPrimaryTabPosition = React.useCallback((index: number) => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const arrayOfWidths = getWidthElements(); // get tabs widths
    const marginRight = 8;
    let rightTabs = arrayRefs.current.length - 1;
    let rightFullWidth = 0;
    while (rightTabs !== index - 1) {
      rightFullWidth += arrayOfWidths[rightTabs] + marginRight;
      rightTabs -= 1;
    }
    rightFullWidth -= marginRight;
    scrollElement.scrollTo({
      left: scrollElement.scrollWidth - rightFullWidth,
    });
  }, []);

  React.useEffect(() => {
    if (state.activeTab !== 0 && arrayRefs.current[state.activeTab] !== null) {
      setPrimaryTabPosition(state.activeTab);
    }
  }, [setPrimaryTabPosition, state.activeTab]);

  const onMouseEnter = () => {
    setState((s) => ({ ...s, onScrollHide: false }));
  };

  const onMouseLeave = () => {
    setState((s) => ({ ...s, onScrollHide: true }));
  };

  return (
    <>
      <StyledScrollbar
        autoHide={state.onScrollHide}
        className="scrollbar"
        // @ts-expect-error error from custom scrollbar
        ref={scrollRef}
      >
        <NavItem className="className_items">
          {elements.map((item, index) => (
            <StyledLabelTheme
              id={item.id}
              onMouseMove={onMouseEnter}
              onMouseLeave={onMouseLeave}
              ref={(ref) => {
                if (ref) arrayRefs.current.push(ref);
              }}
              onClick={() => onClick(index, item)}
              key={item.key}
              selected={state.activeTab === index}
              isDisabled={isDisabled}
            >
              <Text fontWeight={600} className="title_style" fontSize="13px">
                {item.title}
              </Text>
            </StyledLabelTheme>
          ))}
        </NavItem>
      </StyledScrollbar>
      <div className="tabs_body">{elements[state.activeTab].content}</div>
    </>
  );
};

export { TabsContainer };
