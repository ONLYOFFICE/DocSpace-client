import React from "react";
import PropTypes from "prop-types";
import equal from "fast-deep-equal/react";

import DropDown from "../drop-down";
import DropDownItem from "../drop-down-item";
import {
  StyledSpan,
  StyledText,
  StyledTextWithExpander,
  StyledLinkWithDropdown,
  Caret,
} from "./styled-link-with-dropdown";
import { isMobileOnly } from "react-device-detect";
import Scrollbar from "../scrollbar";
import { ReactSVG } from "react-svg";
import { classNames } from "../utils/classNames";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/expander-dow... Remove this comment to see the full error message
import ExpanderDownReactSvgUrl from "PUBLIC_DIR/images/expander-down.react.svg?url";

class LinkWithDropdown extends React.Component {
  ref: any;
  constructor(props: any) {
    super(props);

    this.state = {
      isOpen: props.isOpen,
      orientation: window.orientation,
    };

    this.ref = React.createRef();
  }

  setIsOpen = (isOpen: any) => this.setState({ isOpen: isOpen });

  onOpen = () => {
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
    if (this.props.isDisabled) return;
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.setIsOpen(!this.state.isOpen);
  };

  onClose = (e: any) => {
    if (this.ref.current.contains(e.target)) return;

    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.setIsOpen(!this.state.isOpen);
  };

  onSetOrientation = () => {
    this.setState({
      orientation: window.orientation,
    });
  };

  componentDidMount() {
    window.addEventListener("orientationchange", this.onSetOrientation);
  }

  componentDidUpdate(prevProps: any) {
    // @ts-expect-error TS(2339): Property 'dropdownType' does not exist on type 'Re... Remove this comment to see the full error message
    if (this.props.dropdownType !== prevProps.dropdownType) {
      // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
      if (this.props.isOpen !== prevProps.isOpen) {
        // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
        this.setIsOpen(this.props.isOpen);
      }
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    } else if (this.props.isOpen !== prevProps.isOpen) {
      // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
      this.setIsOpen(this.props.isOpen);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("orientationchange", this.onSetOrientation);
  }

  onClickDropDownItem = (e: any) => {
    const { key } = e.currentTarget.dataset;
    // @ts-expect-error TS(2339): Property 'data' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const item = this.props.data.find((x: any) => x.key === key);
    // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
    this.setIsOpen(!this.state.isOpen);
    item && item.onClick && item.onClick(e);
  };

  onCheckManualWidth = () => {
    const padding = 32;
    const width = this.ref.current
      ?.querySelector(".text")
      .getBoundingClientRect().width;

    return width + padding + "px";
  };

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !equal(this.props, nextProps) || !equal(this.state, nextState);
  }

  render() {
    // console.log("LinkWithDropdown render");
    const {
      // @ts-expect-error TS(2339): Property 'isSemitransparent' does not exist on typ... Remove this comment to see the full error message
      isSemitransparent,
      // @ts-expect-error TS(2339): Property 'dropdownType' does not exist on type 'Re... Remove this comment to see the full error message
      dropdownType,
      // @ts-expect-error TS(2339): Property 'isTextOverflow' does not exist on type '... Remove this comment to see the full error message
      isTextOverflow,
      // @ts-expect-error TS(2339): Property 'fontSize' does not exist on type 'Readon... Remove this comment to see the full error message
      fontSize,
      // @ts-expect-error TS(2339): Property 'fontWeight' does not exist on type 'Read... Remove this comment to see the full error message
      fontWeight,
      // @ts-expect-error TS(2339): Property 'color' does not exist on type 'Readonly<... Remove this comment to see the full error message
      color,
      // @ts-expect-error TS(2339): Property 'isBold' does not exist on type 'Readonly... Remove this comment to see the full error message
      isBold,
      // @ts-expect-error TS(2339): Property 'title' does not exist on type 'Readonly<... Remove this comment to see the full error message
      title,
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      className,
      // @ts-expect-error TS(2339): Property 'data' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      data,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      style,
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      isDisabled,
      // @ts-expect-error TS(2339): Property 'directionY' does not exist on type 'Read... Remove this comment to see the full error message
      directionY,
      // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
      theme,
      // @ts-expect-error TS(2339): Property 'hasScroll' does not exist on type 'Reado... Remove this comment to see the full error message
      hasScroll,
      // @ts-expect-error TS(2339): Property 'withExpander' does not exist on type 'Re... Remove this comment to see the full error message
      withExpander,
      // @ts-expect-error TS(2339): Property 'dropDownClassName' does not exist on typ... Remove this comment to see the full error message
      dropDownClassName,
      ...rest
    } = this.props;

    const showScroll = hasScroll && isMobileOnly;
    // @ts-expect-error TS(2339): Property 'orientation' does not exist on type 'Rea... Remove this comment to see the full error message
    const scrollHeight = this.state.orientation === 90 ? 100 : 250;

    const dropDownItem = data.map((item: any) => <DropDownItem
      className="drop-down-item"
      id={item.key}
      key={item.key}
      {...item}
      onClick={this.onClickDropDownItem}
      data-key={item.key}
      textOverflow={isTextOverflow}
    />);

    const styledText = (
      <StyledText
        className="text"
        isTextOverflow={isTextOverflow}
        truncate={isTextOverflow}
        fontSize={fontSize}
        fontWeight={fontWeight}
        color={color}
        isBold={isBold}
        title={title}
        dropdownType={dropdownType}
        isDisabled={isDisabled}
        withTriangle
      >
        // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
        {this.props.children}
      </StyledText>
    );

    return (
      <StyledSpan
        // @ts-expect-error TS(2769): No overload matches this call.
        $isOpen={this.state.isOpen}
        className={className}
        id={id}
        style={style}
        ref={this.ref}
      >
        <span onClick={this.onOpen}>
          <StyledLinkWithDropdown
            isSemitransparent={isSemitransparent}
            dropdownType={dropdownType}
            color={color}
            isDisabled={isDisabled}
          >
            {withExpander ? (
              // @ts-expect-error TS(2769): No overload matches this call.
              <StyledTextWithExpander isOpen={this.state.isOpen}>
                {styledText}
                <ReactSVG className="expander" src={ExpanderDownReactSvgUrl} />
              </StyledTextWithExpander>
            ) : (
              styledText
            )}
          </StyledLinkWithDropdown>
        </span>
        // @ts-expect-error TS(2769): No overload matches this call.
        <DropDown
          className={classNames("fixed-max-width", dropDownClassName)}
          manualWidth={showScroll ? this.onCheckManualWidth() : null}
          // @ts-expect-error TS(2339): Property 'isOpen' does not exist on type 'Readonly... Remove this comment to see the full error message
          open={this.state.isOpen}
          withArrow={false}
          forwardedRef={this.ref}
          directionY={directionY}
          isDropdown={false}
          clickOutsideAction={this.onClose}
          {...rest}
        >
          {showScroll ? (
            // @ts-expect-error TS(2322): Type '{ children: any; className: string; style: {... Remove this comment to see the full error message
            <Scrollbar
              className="scroll-drop-down-item"
              style={{
                height: scrollHeight,
              }}
            >
              {dropDownItem}
            </Scrollbar>
          ) : (
            dropDownItem
          )}
        </DropDown>
      </StyledSpan>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
LinkWithDropdown.propTypes = {
  /** Link color in all states - hover, active, visited */
  color: PropTypes.string,
  /** Array of objects, each can contain `<DropDownItem />` props */
  data: PropTypes.array,
  /** Dropdown type 'alwaysDashed' always displays a dotted style and an arrow icon,
   * appearDashedAfterHover displays a dotted style and icon arrow only  on hover */
  dropdownType: PropTypes.oneOf(["alwaysDashed", "appearDashedAfterHover"]),
  /** Displays the expander */
  withExpander: PropTypes.bool,
  /** Link font size */
  fontSize: PropTypes.string,
  /** Link font weight */
  fontWeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Sets font weight */
  isBold: PropTypes.bool,
  /** Sets css-property 'opacity' to 0.5. Usually applied for the users with "pending" status */
  isSemitransparent: PropTypes.bool,
  /** Activates or deactivates _text-overflow_ CSS property with ellipsis (' … ') value */
  isTextOverflow: PropTypes.bool,
  /** Link title */
  title: PropTypes.string,
  /** Sets open prop */
  isOpen: PropTypes.bool,
  /** Children element */
  children: PropTypes.any,
  /** Accepts css class */
  className: PropTypes.string,
  /** Sets the classNaame of the drop down */
  dropDownClassName: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Sets disabled view */
  isDisabled: PropTypes.bool,
  /** Sets the opening direction relative to the parent */
  directionY: PropTypes.oneOf(["bottom", "top", "both"]),
  /** Displays the scrollbar */
  hasScroll: PropTypes.bool,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
LinkWithDropdown.defaultProps = {
  data: [],
  dropdownType: "alwaysDashed",
  fontSize: "13px",
  isBold: false,
  isSemitransparent: false,
  isTextOverflow: true,
  isOpen: false,
  className: "",
  isDisabled: false,
  hasScroll: false,
  withExpander: false,
};

export default LinkWithDropdown;
