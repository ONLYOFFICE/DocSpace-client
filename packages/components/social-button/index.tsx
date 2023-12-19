import React from "react";
import PropTypes from "prop-types";
import equal from "fast-deep-equal/react";

import Text from "../text";
import StyledSocialButton from "./styled-social-button";
import { ReactSVG } from "react-svg";
// eslint-disable-next-line no-unused-vars

class SocialButton extends React.Component {
  shouldComponentUpdate(nextProps: any) {
    return !equal(this.props, nextProps);
  }

  render() {
    // @ts-expect-error TS(2339): Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { label, iconName, IconComponent, isConnect, ...otherProps } =
      this.props;
    return (
      <StyledSocialButton isConnect={isConnect} {...otherProps}>
        {IconComponent ? (
          <IconComponent className="iconWrapper" />
        ) : (
          <ReactSVG className="iconWrapper" src={iconName} />
        )}
        {label && (
          <Text as="div" className="social_button_text">
            {label}
          </Text>
        )}
      </StyledSocialButton>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SocialButton.propTypes = {
  /** Button text */
  label: PropTypes.string,
  /** Button icon */
  iconName: PropTypes.string,
  /** Accepts tabindex prop */
  tabIndex: PropTypes.number,
  /** Sets the button to present a disabled state */
  isDisabled: PropTypes.bool,
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Sets a callback function that is triggered when the button is clicked */
  onClick: PropTypes.func,
  /** Accepts the icon options  */
  $iconOptions: PropTypes.object,
  /** Sets the image size. Contains the small and the basic size options */
  size: PropTypes.oneOf(["base", "small"]),
  /** Changes the button style if the user is connected to the social network account */
  isConnect: PropTypes.bool,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
SocialButton.defaultProps = {
  label: "",
  iconName: "SocialButtonGoogleIcon",
  tabIndex: -1,
  isDisabled: false,
  $iconOptions: {},
  size: "base",
  isConnect: false,
};

export default SocialButton;
