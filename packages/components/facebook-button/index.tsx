import React from "react";
import PropTypes from "prop-types";
import equal from "fast-deep-equal/react";

import Text from "../text";
import StyledFacebookButton from "./styled-facebook-button";
import { ReactSVG } from "react-svg";
// eslint-disable-next-line no-unused-vars

class FacebookButton extends React.Component {
  shouldComponentUpdate(nextProps: any) {
    return !equal(this.props, nextProps);
  }

  render() {
    // @ts-expect-error TS(2339): Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { label, iconName, ...otherProps } = this.props;
    return (
      <StyledFacebookButton {...otherProps}>
        <ReactSVG className="iconWrapper" src={iconName} />
        {label && (
          // @ts-expect-error TS(2322): Type '{ children: any; as: string; className: stri... Remove this comment to see the full error message
          <Text as="span" className="social_button_text">
            {label}
          </Text>
        )}
      </StyledFacebookButton>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
FacebookButton.propTypes = {
  label: PropTypes.string,
  iconName: PropTypes.string,
  tabIndex: PropTypes.number,
  isDisabled: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onClick: PropTypes.func,
  $iconOptions: PropTypes.object,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
FacebookButton.defaultProps = {
  tabIndex: -1,
  isDisabled: false,
  $iconOptions: {},
};

export default FacebookButton;
