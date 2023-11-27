import React from "react";
import PropTypes from "prop-types";

import TextInput from "../text-input";
import { Icons } from "../icons";
import IconButton from "../icon-button";
import {
  StyledInputGroup,
  StyledChildrenBlock,
  StyledIconBlock,
} from "./styled-input-block";

//const iconNames = Object.keys(Icons);

class InputBlock extends React.Component {
  constructor(props: any) {
    super(props);
  }
  onIconClick = (e: any) => {
    if (
      // @ts-expect-error TS(2339): Property 'onIconClick' does not exist on type 'Rea... Remove this comment to see the full error message
      typeof this.props.onIconClick === "function" /*&& !this.props.isDisabled*/
    )
      // @ts-expect-error TS(2339): Property 'onIconClick' does not exist on type 'Rea... Remove this comment to see the full error message
      this.props.onIconClick(e);
  };
  onChange = (e: any) => {
    // @ts-expect-error TS(2339): Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
    if (typeof this.props.onChange === "function") this.props.onChange(e);
  };

  render() {
    let iconButtonSize = 0;
    const {
      // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Readon... Remove this comment to see the full error message
      hasError,
      // @ts-expect-error TS(2339): Property 'hasWarning' does not exist on type 'Read... Remove this comment to see the full error message
      hasWarning,
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      isDisabled,
      // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
      scale,
      // @ts-expect-error TS(2339): Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      size,
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      className,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      style,
      // @ts-expect-error TS(2339): Property 'children' does not exist on type 'Readon... Remove this comment to see the full error message
      children,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error TS(2339): Property 'name' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      name,
      // @ts-expect-error TS(2339): Property 'type' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      type,
      // @ts-expect-error TS(2339): Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
      value,
      // @ts-expect-error TS(2339): Property 'placeholder' does not exist on type 'Rea... Remove this comment to see the full error message
      placeholder,
      // @ts-expect-error TS(2339): Property 'tabIndex' does not exist on type 'Readon... Remove this comment to see the full error message
      tabIndex,
      // @ts-expect-error TS(2339): Property 'maxLength' does not exist on type 'Reado... Remove this comment to see the full error message
      maxLength,
      // @ts-expect-error TS(2339): Property 'onBlur' does not exist on type 'Readonly... Remove this comment to see the full error message
      onBlur,
      // @ts-expect-error TS(2339): Property 'onFocus' does not exist on type 'Readonl... Remove this comment to see the full error message
      onFocus,
      // @ts-expect-error TS(2339): Property 'onKeyDown' does not exist on type 'Reado... Remove this comment to see the full error message
      onKeyDown,
      // @ts-expect-error TS(2339): Property 'isReadOnly' does not exist on type 'Read... Remove this comment to see the full error message
      isReadOnly,
      // @ts-expect-error TS(2339): Property 'isAutoFocussed' does not exist on type '... Remove this comment to see the full error message
      isAutoFocussed,
      // @ts-expect-error TS(2339): Property 'autoComplete' does not exist on type 'Re... Remove this comment to see the full error message
      autoComplete,
      // @ts-expect-error TS(2339): Property 'mask' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      mask,
      // @ts-expect-error TS(2339): Property 'keepCharPositions' does not exist on typ... Remove this comment to see the full error message
      keepCharPositions,
      // @ts-expect-error TS(2339): Property 'iconName' does not exist on type 'Readon... Remove this comment to see the full error message
      iconName,
      // @ts-expect-error TS(2339): Property 'iconColor' does not exist on type 'Reado... Remove this comment to see the full error message
      iconColor,
      // @ts-expect-error TS(2339): Property 'hoverColor' does not exist on type 'Read... Remove this comment to see the full error message
      hoverColor,
      // @ts-expect-error TS(2339): Property 'isIconFill' does not exist on type 'Read... Remove this comment to see the full error message
      isIconFill,
      // @ts-expect-error TS(2339): Property 'onIconClick' does not exist on type 'Rea... Remove this comment to see the full error message
      onIconClick,
      // @ts-expect-error TS(2339): Property 'iconSize' does not exist on type 'Readon... Remove this comment to see the full error message
      iconSize,
      // @ts-expect-error TS(2339): Property 'theme' does not exist on type 'Readonly<... Remove this comment to see the full error message
      theme,
      // @ts-expect-error TS(2339): Property 'forwardedRef' does not exist on type 'Re... Remove this comment to see the full error message
      forwardedRef,
      // @ts-expect-error TS(2339): Property 'onClick' does not exist on type 'Readonl... Remove this comment to see the full error message
      onClick,
      // @ts-expect-error TS(2339): Property 'iconButtonClassName' does not exist on t... Remove this comment to see the full error message
      iconButtonClassName,
      // @ts-expect-error TS(2339): Property 'iconNode' does not exist on type 'Readon... Remove this comment to see the full error message
      iconNode,
      ...props
    } = this.props;

    if (typeof iconSize == "number" && iconSize > 0) {
      iconButtonSize = iconSize;
    } else {
      switch (size) {
        case "base":
          iconButtonSize = 16;
          break;
        case "middle":
          iconButtonSize = 18;
          break;
        case "big":
          iconButtonSize = 21;
          break;
        case "huge":
          iconButtonSize = 24;
          break;
      }
    }
    return (
      <StyledInputGroup
        hasError={hasError}
        hasWarning={hasWarning}
        isDisabled={isDisabled}
        scale={scale}
        size={size}
        className={className}
        style={style}
        color={iconColor}
        hoverColor={hoverColor}
      >
        <div className="prepend">
          <StyledChildrenBlock className="prepend-children">
            {children}
          </StyledChildrenBlock>
        </div>
        <TextInput
          id={id}
          className={className}
          name={name}
          type={type}
          value={value}
          onClick={onClick}
          isDisabled={isDisabled}
          hasError={hasError}
          hasWarning={hasWarning}
          placeholder={placeholder}
          tabIndex={tabIndex}
          maxLength={maxLength}
          onBlur={onBlur}
          onFocus={onFocus}
          isReadOnly={isReadOnly}
          isAutoFocussed={isAutoFocussed}
          autoComplete={autoComplete}
          size={size}
          scale={scale}
          onChange={this.onChange}
          onKeyDown={onKeyDown}
          withBorder={false}
          mask={mask}
          keepCharPositions={keepCharPositions}
          forwardedRef={forwardedRef}
          {...props}
        />
        {
          //iconNames.includes(iconName) && (
          <div className="append">
            <StyledIconBlock
              className={`input-block-icon ${iconButtonClassName}`}
              //isDisabled={isDisabled}
              onClick={this.onIconClick}
              // @ts-expect-error TS(2769): No overload matches this call.
              isClickable={typeof onIconClick === "function"}
            >
              <IconButton
                // @ts-expect-error TS(2322): Type '{ size: number; iconNode: any; iconName: any... Remove this comment to see the full error message
                size={iconButtonSize}
                iconNode={iconNode}
                iconName={iconName}
                isFill={isIconFill}
                //isDisabled={isDisabled}
                isClickable={typeof onIconClick === "function"}
                color={iconColor}
                hoverColor={hoverColor}
              />
            </StyledIconBlock>
          </div>
        }
      </StyledInputGroup>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
InputBlock.propTypes = {
  /** Used as HTML `id` property */
  id: PropTypes.string,
  /** Forwarded ref */
  forwardedRef: PropTypes.object,
  /** Used as HTML `name` property */
  name: PropTypes.string,
  /** Supported type of the input fields.  */
  type: PropTypes.oneOf(["text", "password"]),
  /** Defines max length of value */
  maxLength: PropTypes.number,
  /** Placeholder text for the input */
  placeholder: PropTypes.string,
  /** Accepts css tab-index */
  tabIndex: PropTypes.number,
  /** input text mask */
  mask: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  /** Allows to add or delete characters without changing the positions of the existing characters.*/
  keepCharPositions: PropTypes.bool,
  /** Supported size of the input fields. */
  size: PropTypes.oneOf(["base", "middle", "big", "huge", "large"]),
  /** Indicates that the input field has scale */
  scale: PropTypes.bool,
  /** The callback function that is required when the input is not read only. The function is called with the new value. Parent should pass it back as `value` */
  onChange: PropTypes.func,
  /** The callback function that is called when the field is blurred  */
  onBlur: PropTypes.func,
  /** The callback function that is called when the field is focused  */
  onFocus: PropTypes.func,
  /** Focuses on the input field on initial render */
  isAutoFocussed: PropTypes.bool,
  /** Indicates that the field cannot be used (e.g not authorised, or changes not saved) */
  isDisabled: PropTypes.bool,
  /** Indicates that the field is displaying read-only content  */
  isReadOnly: PropTypes.bool,
  /** Indicates the input field has an error */
  hasError: PropTypes.bool,
  /** Indicates the input field has a warning */
  hasWarning: PropTypes.bool,
  /** Used as HTML `autocomplete` */
  autoComplete: PropTypes.string,
  /** Value of the input */
  value: PropTypes.string,
  /** Path to icon */
  iconName: PropTypes.string,
  /** Specifies the icon color  */
  iconColor: PropTypes.string,
  /** Icon color on hover action */
  hoverColor: PropTypes.string,
  /** Size icon */
  iconSize: PropTypes.number,
  /** Determines if icon fill is needed */
  isIconFill: PropTypes.bool,
  /** The callback function that is triggered when the icon is clicked */
  onIconClick: PropTypes.func,

  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts css style  */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Sets the classNaame of the icon button */
  iconButtonClassName: PropTypes.string,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
InputBlock.defaultProps = {
  type: "text",
  maxLength: 255,
  size: "base",
  scale: false,
  tabIndex: -1,
  hasError: false,
  hasWarning: false,
  autoComplete: "off",

  value: "",
  iconName: "",
  isIconFill: false,
  isDisabled: false,
  keepCharPositions: false,
  iconButtonClassName: "",
};

export default InputBlock;
