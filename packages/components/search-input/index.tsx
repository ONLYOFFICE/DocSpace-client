import React from "react";
import PropTypes from "prop-types";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/cross.react.... Remove this comment to see the full error message
import CrossIconReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/search.react... Remove this comment to see the full error message
import SearchIconReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
import InputBlock from "../input-block";
import StyledSearchInput from "./styled-search-input";
import { ReactSVG } from "react-svg";

class SearchInput extends React.Component {
  forwardedRef: any;
  timerId: any;
  constructor(props: any) {
    super(props);

    this.forwardedRef = props.forwardedRef || React.createRef();
    this.timerId = null;

    this.state = {
      inputValue: props.value,
    };
  }

  clearSearch = () => {
    this.setState({
      inputValue: "",
    });
    // @ts-expect-error TS(2339): Property 'onClearSearch' does not exist on type 'R... Remove this comment to see the full error message
    typeof this.props.onClearSearch === "function" &&
      // @ts-expect-error TS(2339): Property 'onClearSearch' does not exist on type 'R... Remove this comment to see the full error message
      this.props.onClearSearch();
  };

  onInputChange = (e: any) => {
    this.setState({
      inputValue: e.target.value,
    });
    // @ts-expect-error TS(2339): Property 'autoRefresh' does not exist on type 'Rea... Remove this comment to see the full error message
    if (this.props.autoRefresh) this.setSearchTimer(e.target.value);
  };

  setSearchTimer = (value: any) => {
    clearTimeout(this.timerId);
    this.timerId = setTimeout(() => {
      // @ts-expect-error TS(2339): Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
      this.props.onChange(value);
      clearTimeout(this.timerId);
      this.timerId = null;
    // @ts-expect-error TS(2339): Property 'refreshTimeout' does not exist on type '... Remove this comment to see the full error message
    }, this.props.refreshTimeout);
  };
  componentDidUpdate(prevProps: any) {
    // @ts-expect-error TS(2339): Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
    if (this.props.value != prevProps.value) {
      // @ts-expect-error TS(2339): Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
      this.setState({ inputValue: this.props.value });
      return true;
    }
  }

  render() {
    //console.log("Search input render");
    let clearButtonSize = 16;
    // @ts-expect-error TS(2339): Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    switch (this.props.size) {
      case "base":
        clearButtonSize =
          // @ts-expect-error TS(2339): Property 'inputValue' does not exist on type 'Read... Remove this comment to see the full error message
          !!this.state.inputValue || this.props.showClearButton ? 12 : 16;
        break;
      case "middle":
        clearButtonSize =
          // @ts-expect-error TS(2339): Property 'inputValue' does not exist on type 'Read... Remove this comment to see the full error message
          !!this.state.inputValue || this.props.showClearButton ? 16 : 18;
        break;
      case "big":
        clearButtonSize =
          // @ts-expect-error TS(2339): Property 'inputValue' does not exist on type 'Read... Remove this comment to see the full error message
          !!this.state.inputValue || this.props.showClearButton ? 18 : 22;
        break;
      case "huge":
        clearButtonSize =
          // @ts-expect-error TS(2339): Property 'inputValue' does not exist on type 'Read... Remove this comment to see the full error message
          !!this.state.inputValue || this.props.showClearButton ? 22 : 24;
        break;
    }

    // @ts-expect-error TS(2339): Property 'inputValue' does not exist on type 'Read... Remove this comment to see the full error message
    const showCrossIcon = !!this.state.inputValue || this.props.showClearButton;

    const iconNode = (
      <>
        {showCrossIcon && (
          <ReactSVG
            className="icon-button_svg not-selectable"
            src={CrossIconReactSvgUrl}
          />
        )}

        {!showCrossIcon && (
          <ReactSVG
            className="icon-button_svg not-selectable"
            src={SearchIconReactSvgUrl}
          />
        )}
      </>
    );

    return (
      <StyledSearchInput
        // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
        theme={this.props.theme}
        // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
        className={this.props.className}
        // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
        style={this.props.style}
        // @ts-expect-error TS(2769): No overload matches this call.
        isScale={this.props.scale}
      >
        // @ts-expect-error TS(2322): Type '{ children: any; theme: any; className: stri... Remove this comment to see the full error message
        <InputBlock
          // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
          theme={this.props.theme}
          className="search-input-block"
          forwardedRef={this.forwardedRef}
          // @ts-expect-error TS(2339): Property 'onClick' does not exist on type 'Readonl... Remove this comment to see the full error message
          onClick={this.props.onClick}
          // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
          id={this.props.id}
          // @ts-expect-error TS(2339): Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
          name={this.props.name}
          // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
          isDisabled={this.props.isDisabled}
          iconNode={iconNode}
          iconButtonClassName={
            // @ts-expect-error TS(2339): Property 'inputValue' does not exist on type 'Read... Remove this comment to see the full error message
            !!this.state.inputValue || this.props.showClearButton
              ? "search-cross"
              : "search-loupe"
          }
          isIconFill={true}
          iconSize={clearButtonSize}
          onIconClick={
            // @ts-expect-error TS(2339): Property 'inputValue' does not exist on type 'Read... Remove this comment to see the full error message
            !!this.state.inputValue || this.props.showClearButton
              ? this.clearSearch
              : undefined
          }
          // @ts-expect-error TS(2339): Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
          size={this.props.size}
          scale={true}
          // @ts-expect-error TS(2339): Property 'inputValue' does not exist on type 'Read... Remove this comment to see the full error message
          value={this.state.inputValue}
          // @ts-expect-error TS(2339): Property 'placeholder' does not exist on type 'Rea... Remove this comment to see the full error message
          placeholder={this.props.placeholder}
          onChange={this.onInputChange}
        >
          // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
          {this.props.children}
        </InputBlock>
      </StyledSearchInput>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SearchInput.propTypes = {
  /** Used as HTML `id` property */
  id: PropTypes.string,
  /** Forwarded ref */
  forwardedRef: PropTypes.object,
  /** Sets the unique element name */
  name: PropTypes.string,
  /** Accepts class */
  className: PropTypes.string,
  /** Supported size of the input fields. */
  size: PropTypes.oneOf(["base", "middle", "big", "huge"]),
  /** Input value */
  value: PropTypes.string,
  /** Indicates that the input field has scale  */
  scale: PropTypes.bool,
  /** Placeholder text for the input */
  placeholder: PropTypes.string,
  /** Sets a callback function that allows handling the component's changing events */
  onChange: PropTypes.func,
  /** Sets a callback function that is triggered when the clear icon of the search input is clicked */
  onClearSearch: PropTypes.func,
  /** Indicates that the field cannot be used (e.g not authorized, or the changes have not been saved) */
  isDisabled: PropTypes.bool,
  /** Displays the Clear Button */
  showClearButton: PropTypes.bool,
  /** Sets the refresh timeout of the input  */
  refreshTimeout: PropTypes.number,
  /** Sets the input to refresh automatically */
  autoRefresh: PropTypes.bool,
  /** Child elements */
  children: PropTypes.any,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
SearchInput.defaultProps = {
  autoRefresh: true,
  size: "base",
  value: "",
  scale: false,
  isDisabled: false,
  refreshTimeout: 1000,
  showClearButton: false,
};

export default SearchInput;
