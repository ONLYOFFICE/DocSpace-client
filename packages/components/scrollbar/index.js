import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import { classNames } from "../utils/classNames";
import StyledScrollbar from "./styled-scrollbar";
import { useTheme } from "styled-components";

const Scrollbar = React.forwardRef((props, ref) => {
  const {
    id,
    onScroll,
    autoHide,
    hideTrackTimer,
    scrollclass,
    fixedSize,
    ...rest
  } = props;

  const { interfaceDirection } = useTheme();
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const timerId = useRef();

  const isRtl = interfaceDirection === "rtl";

  const showTrack = () => {
    clearTimeout(timerId.current);
    setIsScrolling(true);
  };

  const hideTrack = () => {
    timerId.current = setTimeout(() => {
      setIsScrolling(false);
    }, hideTrackTimer);
  };

  const onScrollStart = () => showTrack();

  const onScrollStop = () => {
    if (isMouseOver) return;
    hideTrack();
  };

  const onMouseEnter = () => {
    showTrack();
    setIsMouseOver(true);
  };

  const onMouseLeave = () => {
    hideTrack();
    setIsMouseOver(false);
  };

  const scrollAutoHideHandlers = autoHide
    ? { onScrollStart, onScrollStop }
    : {};
  const tracksAutoHideHandlers = autoHide ? { onMouseEnter, onMouseLeave } : {};
  const tracksAutoHideStyles = autoHide
    ? {
        opacity: !isScrolling ? 0 : 1,
        transition: "opacity 0.4s ease-in-out",
      }
    : {};

  // onScroll handler placed here on Scroller element to get native event instead of parameters that library put
  const renderScroller = (libProps) => {
    const { elementRef, ...restLibProps } = libProps;
    return (
      <div
        {...restLibProps}
        className={classNames("scroller", scrollclass)}
        ref={elementRef}
        onScroll={onScroll}
      />
    );
  };

  useEffect(() => {
    return () => clearTimeout(timerId.current);
  }, []);

  return (
    <StyledScrollbar
      {...rest}
      id={id}
      disableTracksWidthCompensation
      $fixedSize={fixedSize}
      rtl={isRtl}
      ref={ref}
      {...scrollAutoHideHandlers}
      onScrollStart={onScrollStart}
      wrapperProps={{ className: "scroll-wrapper" }}
      scrollerProps={{ renderer: renderScroller }}
      contentProps={{ className: "scroll-body" }}
      thumbYProps={{ className: "thumb thumb-vertical" }}
      thumbXProps={{ className: "thumb thumb-horizontal" }}
      trackYProps={{
        className: "track track-vertical",
        style: { ...tracksAutoHideStyles },
        ...tracksAutoHideHandlers,
      }}
      trackXProps={{
        className: "track track-horizontal",
        style: { ...tracksAutoHideStyles },
        ...tracksAutoHideHandlers,
      }}
    />
  );
});

Scrollbar.propTypes = {
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts id  */
  id: PropTypes.string,
  /** Accepts css style  */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Enable tracks auto hiding.  */
  autoHide: PropTypes.bool,
  /** Track auto hiding delay in ms.  */
  hideTrackTimer: PropTypes.number,
  /** Fix scrollbar size. */
  fixedSize: PropTypes.bool,
  /** Disable vertical scrolling. */
  noScrollY: PropTypes.bool,
  /** Disable horizontal scrolling. */
  noScrollX: PropTypes.bool,
};

Scrollbar.defaultProps = {
  autoHide: false,
  hideTrackTimer: 500,
  fixedSize: false,
};

export default Scrollbar;
