import React, { Component } from "react";
import PropTypes from "prop-types";

import Text from "../text";
import { NavItem, Label, StyledScrollbar } from "./styled-tabs-container";

import { ColorTheme, ThemeType } from "../ColorTheme";

class TabContainer extends Component {
  arrayRefs: any;
  scrollRef: any;
  constructor(props: any) {
    super(props);

    this.arrayRefs = [];
    const countElements = props.elements.length;

    let item = countElements;
    while (item !== 0) {
      this.arrayRefs.push(React.createRef());
      item--;
    }

    this.state = {
      // @ts-expect-error TS(2339): Property 'selectedItem' does not exist on type 'Re... Remove this comment to see the full error message
      activeTab: this.props.selectedItem,
      onScrollHide: true,
    };

    this.scrollRef = React.createRef();
  }

  titleClick = (index: any, item: any, ref: any) => {
    // @ts-expect-error TS(2339): Property 'activeTab' does not exist on type 'Reado... Remove this comment to see the full error message
    if (this.state.activeTab !== index) {
      this.setState({ activeTab: index });
      let newItem = Object.assign({}, item);
      delete newItem.content;
      // @ts-expect-error TS(2339): Property 'onSelect' does not exist on type 'Readon... Remove this comment to see the full error message
      this.props.onSelect && this.props.onSelect(newItem);

      this.setTabPosition(index, ref);
    }
  };

  getWidthElements = () => {
    const arrayWidths = [];
    const length = this.arrayRefs.length - 1;
    let widthItem = 0;
    while (length + 1 !== widthItem) {
      arrayWidths.push(this.arrayRefs[widthItem].current.offsetWidth);
      widthItem++;
    }

    return arrayWidths;
  };

  shouldComponentUpdate(nextProps: any, nextState: any) {
    // @ts-expect-error TS(2339): Property 'activeTab' does not exist on type 'Reado... Remove this comment to see the full error message
    const { activeTab, onScrollHide } = this.state;
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
    const { isDisabled, elements } = this.props;
    if (
      activeTab === nextState.activeTab &&
      isDisabled === nextProps.isDisabled &&
      onScrollHide === nextState.onScrollHide &&
      elements === nextProps.elements
    ) {
      return false;
    }
    return true;
  }

  componentDidMount() {
    // @ts-expect-error TS(2339): Property 'activeTab' does not exist on type 'Reado... Remove this comment to see the full error message
    const { activeTab } = this.state;
    if (activeTab !== 0 && this.arrayRefs[activeTab].current !== null) {
      this.setPrimaryTabPosition(activeTab);
    }
  }

  setTabPosition = (index: any, currentRef: any) => {
    const scrollElement = this.scrollRef.current;
    if (!scrollElement) return;

    const arrayOfWidths = this.getWidthElements(); //get tabs widths
    const scrollLeft = scrollElement.scrollLeft; // get scroll position relative to left side
    const staticScroll = scrollElement.scrollWidth; //get static scroll width
    const containerWidth = scrollElement.clientWidth; //get main container width
    const currentTabWidth = currentRef.current.offsetWidth;
    const marginRight = 8;

    //get tabs of left side
    let leftTabs = 0;
    let leftFullWidth = 0;
    while (leftTabs !== index) {
      leftTabs++;
      leftFullWidth += arrayOfWidths[leftTabs] + marginRight;
    }
    leftFullWidth += arrayOfWidths[0] + marginRight;

    //get tabs of right side
    let rightTabs = this.arrayRefs.length - 1;
    let rightFullWidth = 0;
    while (rightTabs !== index - 1) {
      rightFullWidth += arrayOfWidths[rightTabs] + marginRight;
      rightTabs--;
    }

    //Out of range of left side
    if (leftFullWidth > containerWidth + scrollLeft) {
      let prevIndex = index - 1;
      let widthBlocksInContainer = 0;
      while (prevIndex !== -1) {
        widthBlocksInContainer += arrayOfWidths[prevIndex] + marginRight;
        prevIndex--;
      }

      const difference = containerWidth - widthBlocksInContainer;
      const currentContainerWidth = currentTabWidth;

      scrollElement.scrollTo(
        difference * -1 + currentContainerWidth + marginRight
      );
    }
    //Out of range of left side
    else if (rightFullWidth > staticScroll - scrollLeft) {
      scrollElement.scrollTo(staticScroll - rightFullWidth);
    }
  };

  setPrimaryTabPosition = (index: any) => {
    const scrollElement = this.scrollRef.current;
    if (!scrollElement) return;

    const arrayOfWidths = this.getWidthElements(); //get tabs widths
    const marginRight = 8;
    let rightTabs = this.arrayRefs.length - 1;
    let rightFullWidth = 0;
    while (rightTabs !== index - 1) {
      rightFullWidth += arrayOfWidths[rightTabs] + marginRight;
      rightTabs--;
    }
    rightFullWidth -= marginRight;
    scrollElement.scrollTo(scrollElement.scrollWidth - rightFullWidth);
  };

  onMouseEnter = () => {
    this.setState({ onScrollHide: false });
  };

  onMouseLeave = () => {
    this.setState({ onScrollHide: true });
  };

  onClick = (index: any, item: any) => {
    this.titleClick(index, item, this.arrayRefs[index]);
  };

  render() {
    //console.log("Tabs container render");

    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
    const { isDisabled, elements } = this.props;
    // @ts-expect-error TS(2339): Property 'activeTab' does not exist on type 'Reado... Remove this comment to see the full error message
    const { activeTab, onScrollHide } = this.state;

    return (
      <>
        <StyledScrollbar
          autoHide={onScrollHide}
          className="scrollbar"
          ref={this.scrollRef}
        >
          <NavItem className="className_items">
            {elements.map((item, index) => (
              <ColorTheme
                {...this.props}
                id={item.id}
                themeId={ThemeType.TabsContainer}
                onMouseMove={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                ref={this.arrayRefs[index]}
                onClick={() => this.onClick(index, item)}
                key={item.key}
                selected={activeTab === index}
                isDisabled={isDisabled}
              >
                <Text fontWeight={600} className="title_style" fontSize="13px">
                  {item.title}
                </Text>
              </ColorTheme>
            ))}
          </NavItem>
        </StyledScrollbar>
        <div>{elements[activeTab].content}</div>
      </>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
TabContainer.propTypes = {
  /** Child elements */
  // @ts-expect-error TS(2339): Property 'PropTypes' does not exist on type 'typeo... Remove this comment to see the full error message
  elements: PropTypes.PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  /** Disables the TabContainer  */
  isDisabled: PropTypes.bool,
  /** Sets a callback function that is triggered when the title is selected */
  onSelect: PropTypes.func,
  /** Selected title of tabs container */
  selectedItem: PropTypes.number,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
TabContainer.defaultProps = {
  selectedItem: 0,
};

export default TabContainer;
