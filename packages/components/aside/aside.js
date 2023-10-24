import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { isMobile } from "react-device-detect";
import Scrollbar from "../scrollbar";
import {
  StyledAside,
  StyledControlContainer,
  StyledCrossIcon,
} from "./styled-aside";

const Aside = React.memo((props) => {
  const {
    visible,
    children,
    scale,
    zIndex,
    className,
    contentPaddingBottom,
    withoutBodyScroll,
    onClose,
  } = props;

  const [defaultAsideHeight, setDefaultAsideHeight] = useState(
    window?.visualViewport?.height ?? null
  );

  const [asideHeight, setAsideHeight] = useState(
    window?.visualViewport?.height ?? null
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const onOrientationChange = () => {
    const viewportHeight = window?.visualViewport?.height;
    const keyboardHeight =
      defaultAsideHeight !== viewportHeight
        ? defaultAsideHeight - viewportHeight
        : 0;

    setKeyboardHeight(keyboardHeight);
    setAsideHeight(defaultAsideHeight - keyboardHeight);
  };

  useEffect(() => {
    isMobile &&
      window?.visualViewport?.addEventListener("resize", onOrientationChange);

    return () => {
      isMobile &&
        window.removeEventListener("orientationchange", onOrientationChange);
    };
  });

  return (
    <StyledAside
      visible={visible}
      scale={scale}
      zIndex={zIndex}
      contentPaddingBottom={contentPaddingBottom}
      className={`${className} not-selectable aside`}
      asideHeight={asideHeight + "px"}
      keyboardHeight={keyboardHeight}
    >
      {/* <CloseButton  displayType="aside" zIndex={zIndex}/> */}
      {withoutBodyScroll ? (
        children
      ) : (
        <Scrollbar stype="mediumBlack">{children}</Scrollbar>
      )}

      {visible && (
        <StyledControlContainer className="close-button" onClick={onClose}>
          <StyledCrossIcon />
        </StyledControlContainer>
      )}
    </StyledAside>
  );
});

Aside.displayName = "Aside";

Aside.propTypes = {
  visible: PropTypes.bool,
  scale: PropTypes.bool,
  className: PropTypes.string,
  contentPaddingBottom: PropTypes.string,
  zIndex: PropTypes.number,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  withoutBodyScroll: PropTypes.bool,
  onClose: PropTypes.func,
};
Aside.defaultProps = {
  scale: false,
  zIndex: 400,
  withoutBodyScroll: false,
};

export default Aside;
