import React from "react";
import PropTypes from "prop-types";

import StyledButton from "./styled-selector-add-button";
import IconButton from "../icon-button";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/actions.head... Remove this comment to see the full error message
import ActionsHeaderTouchReactSvgUrl from "PUBLIC_DIR/images/actions.header.touch.react.svg?url";

const SelectorAddButton = (props: any) => {
  const { isDisabled, title, className, id, style, iconName } = props;

  const onClick = (e: any) => {
    !isDisabled && props.onClick && props.onClick(e);
  };

  return (
    <StyledButton
      isDisabled={isDisabled}
      title={title}
      onClick={onClick}
      className={className}
      id={id}
      style={style}
      {...props}
    >
      <IconButton
        // @ts-expect-error TS(2322): Type '{ size: number; iconName: any; isFill: boole... Remove this comment to see the full error message
        size={12}
        iconName={iconName}
        isFill={true}
        isDisabled={isDisabled}
        isClickable={!isDisabled}
      />
    </StyledButton>
  );
};

SelectorAddButton.propTypes = {
  /** Title text */
  title: PropTypes.string,
  /** Sets a callback function that is triggered when the button is clicked */
  onClick: PropTypes.func,
  /** Sets the button to present a disabled state */
  isDisabled: PropTypes.bool,
  /** Attribute className  */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Specifies the icon name */
  iconName: PropTypes.string,
};

SelectorAddButton.defaultProps = {
  isDisabled: false,
  iconName: ActionsHeaderTouchReactSvgUrl,
};

export default SelectorAddButton;
