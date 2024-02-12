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
