import React from "react";
import { isMobileOnly, isIOS } from "react-device-detect";
import PropTypes from "prop-types";
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
  const [windowHeight, setWindowHeight] = React.useState(window.innerHeight);
  const contentRef = React.useRef(null);
  const diffRef = React.useRef(null);
  const visualPageTop = React.useRef(0);

  React.useEffect(() => {
    if (isMobileOnly && isIOS) {
      window.visualViewport.addEventListener("resize", onResize);
      window.visualViewport.addEventListener("scroll", onResize);
    }
    return () => {
      window.visualViewport.removeEventListener("resize", onResize);
      window.visualViewport.removeEventListener("scroll", onResize);
    };
  }, []);

  const onResize = (e) => {
    if (!contentRef.current) return;

    if (e?.type === "resize") {
      let diff = windowHeight - e.target.height - e.target.pageTop;

      visualPageTop.current = e.target.pageTop;

      contentRef.current.style.bottom = `${diff}px`;
      contentRef.current.style.height = `${
        e.target.height - 64 + e.target.pageTop
      }px`;
      contentRef.current.style.position = "fixed";

      diffRef.current = diff;
    } else if (e?.type === "scroll") {
      const diff = window.visualViewport.pageTop ? 0 : visualPageTop.current;

      contentRef.current.style.bottom = `${diffRef.current + diff}px`;
      contentRef.current.style.height = `${
        window.visualViewport.height - 64 + diff
      }px`;
      contentRef.current.style.position = "fixed";
    }
  };

  return (
    <StyledAside
      visible={visible}
      scale={scale}
      zIndex={zIndex}
      contentPaddingBottom={contentPaddingBottom}
      className={`${className} not-selectable aside`}
      forwardRef={contentRef}
    >
      {/* <CloseButton  displayType="aside" zIndex={zIndex}/> */}
      {withoutBodyScroll ? children : <Scrollbar>{children}</Scrollbar>}

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
