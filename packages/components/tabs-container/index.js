import React, { Component } from "react";
import PropTypes from "prop-types";

import Text from "../text";
import { NavItem, StyledScrollbar } from "./styled-tabs-container";

import { ColorTheme, ThemeType } from "../ColorTheme";

class TabContainer extends Component {
  constructor(props) {
    super(props);

    this.arrayRefs = [];
    const countElements = props.elements.length;

    let item = countElements;
    while (item !== 0) {
      this.arrayRefs.push(React.createRef());
      item--;
    }

    const { multiple, selectedItem } = this.props;
    const selectedIem = multiple ? [selectedItem] : selectedItem;

    this.state = {
      activeTab: selectedIem,
      onScrollHide: true,
    };

    this.scrollRef = React.createRef();
  }

  titleClick = (index, item, ref) => {
    const { multiple, onSelect } = this.props;
    const { activeTab } = this.state;

    const setSelection = () => {
      let newItem = Object.assign({}, item);
      delete newItem.content;
      onSelect && onSelect(newItem);
    };

    if (multiple) {
      const indexOperation = () => {
        let tempArray = [...activeTab];

        if (activeTab.indexOf(index) !== -1) {
          return activeTab.filter((item) => item !== index);
        }

        tempArray.push(index);
        return tempArray;
      };

      const updatedActiveTab = indexOperation();

      this.setState({ activeTab: updatedActiveTab });
      setSelection();
      return;
    }

    if (activeTab !== index) {
      this.setState({ activeTab: index });
      setSelection();

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

  shouldComponentUpdate(nextProps, nextState) {
    const { activeTab, onScrollHide } = this.state;
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
    const { activeTab } = this.state;
    if (activeTab !== 0 && this.arrayRefs[activeTab].current !== null) {
      this.setPrimaryTabPosition(activeTab);
    }
  }

  setTabPosition = (index, currentRef) => {
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

  setPrimaryTabPosition = (index) => {
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

  onClick = (index, item) => {
    this.titleClick(index, item, this.arrayRefs[index]);
  };

  render() {
    //console.log("Tabs container render");

    const { isDisabled, elements, withBodyScroll, multiple, withBorder } =
      this.props;
    const { activeTab, onScrollHide } = this.state;

    const content = (
      <NavItem className="className_items" withBodyScroll={withBodyScroll}>
        {elements.map((item, index) => {
          const isSelected = multiple
            ? activeTab.indexOf(index) !== -1
            : activeTab === index;

          return (
            <ColorTheme
              {...this.props}
              id={item.id}
              themeId={ThemeType.TabsContainer}
              onMouseMove={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}
              ref={this.arrayRefs[index]}
              onClick={() => this.onClick(index, item)}
              key={item.key}
              selected={isSelected}
              isDisabled={isDisabled}
              multiple={multiple}
              withBorder={withBorder}
            >
              <Text fontWeight={600} className="title_style" fontSize="13px">
                {item.title}
              </Text>
            </ColorTheme>
          );
        })}
      </NavItem>
    );

    return (
      <>
        {withBodyScroll ? (
          <StyledScrollbar
            autoHide={onScrollHide}
            stype="preMediumBlack"
            className="scrollbar"
            ref={this.scrollRef}
          >
            {content}
          </StyledScrollbar>
        ) : (
          content
        )}
        <div>{elements[activeTab]?.content}</div>
      </>
    );
  }
}

TabContainer.propTypes = {
  /** Child elements */
  elements: PropTypes.PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  /** Disables the TabContainer  */
  isDisabled: PropTypes.bool,
  /** Sets a callback function that is triggered when the title is selected */
  onSelect: PropTypes.func,
  /** Selected title of tabs container */
  selectedItem: PropTypes.number,
  /** Enables Body scroll */
  withBodyScroll: PropTypes.bool,
  /** Enables multiple select  */
  multiple: PropTypes.bool,
  /** Indicates that component contain border */
  withBorder: PropTypes.bool,
};

TabContainer.defaultProps = {
  selectedItem: 0,
  withBodyScroll: true,
  multiple: false,
  withBorder: false,
};

export default TabContainer;
