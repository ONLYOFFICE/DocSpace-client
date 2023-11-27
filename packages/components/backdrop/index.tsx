import React from "react";
import PropTypes from "prop-types";

import StyledBackdrop from "./styled-backdrop";

class Backdrop extends React.Component {
  backdropRef: any;
  constructor(props: any) {
    super(props);

    this.state = {
      needBackdrop: false,
      needBackground: false,
    };

    this.backdropRef = React.createRef();
  }

  componentDidUpdate(prevProps: any) {
    if (
      // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
      prevProps.visible !== this.props.visible ||
      // @ts-expect-error TS(2339): Property 'isAside' does not exist on type 'Readonl... Remove this comment to see the full error message
      prevProps.isAside !== this.props.isAside ||
      // @ts-expect-error TS(2339): Property 'withBackground' does not exist on type '... Remove this comment to see the full error message
      prevProps.withBackground !== this.props.withBackground
    ) {
      this.checkingExistBackdrop();
    }
  }

  componentDidMount() {
    this.checkingExistBackdrop();
  }

  checkingExistBackdrop = () => {
    // @ts-expect-error TS(2339): Property 'visible' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { visible, isAside, withBackground, withoutBlur, withoutBackground } =
      this.props;
    if (visible) {
      const isTablet = window.innerWidth < 1024;
      const backdrops = document.querySelectorAll(".backdrop-active");

      const needBackdrop =
        backdrops.length < 1 || (isAside && backdrops.length <= 2);

      let needBackground =
        needBackdrop && ((isTablet && !withoutBlur) || withBackground);

      if (isAside && needBackdrop && !withoutBackground) needBackground = true;

      this.setState({
        needBackdrop: needBackdrop,
        needBackground: needBackground,
      });
    } else {
      this.setState({
        needBackground: false,
        needBackdrop: false,
      });
    }
  };

  modifyClassName = () => {
    // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
    const { className } = this.props;
    let modifiedClass = "backdrop-active not-selectable";

    if (className) {
      if (typeof className !== "string") {
        if (!className.includes(modifiedClass)) {
          modifiedClass = className.push(modifiedClass);
        } else {
          modifiedClass = className;
        }
      } else {
        modifiedClass += ` ${className}`;
      }
    }

    return modifiedClass;
  };

  onTouchHandler = (e: any) => {
    // @ts-expect-error TS(2339): Property 'isModalDialog' does not exist on type 'R... Remove this comment to see the full error message
    const { isModalDialog } = this.props;
    !isModalDialog && e.preventDefault();
    this.backdropRef.current.click();
  };

  render() {
    // @ts-expect-error TS(2339): Property 'needBackdrop' does not exist on type 'Re... Remove this comment to see the full error message
    const { needBackdrop, needBackground } = this.state;
    // @ts-expect-error TS(2339): Property 'isAside' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { isAside, visible } = this.props;

    const modifiedClassName = this.modifyClassName();

    return visible && (needBackdrop || isAside) ? (
      <StyledBackdrop
        {...this.props}
        ref={this.backdropRef}
        className={modifiedClassName}
        // @ts-expect-error TS(2769): No overload matches this call.
        needBackground={needBackground}
        visible={visible}
        onTouchMove={this.onTouchHandler}
        onTouchEnd={this.onTouchHandler}
      />
    ) : null;
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
Backdrop.propTypes = {
  /** Sets visible or hidden */
  visible: PropTypes.bool,
  /** CSS z-index */
  zIndex: PropTypes.number,
  /** Accepts class */
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  /** Accepts id */
  id: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Displays the background. *The background is not displayed if the viewport width is more than 1024 */
  withBackground: PropTypes.bool,
  /** Must be true if used with Aside component */
  isAside: PropTypes.bool,
  /** Must be true if used with Context menu */
  withoutBlur: PropTypes.bool,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
Backdrop.defaultProps = {
  visible: false,
  zIndex: 203,
  withBackground: false,
  isAside: false,
  isModalDialog: false,
  withoutBlur: false,
};

export default Backdrop;
