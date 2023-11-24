import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

import { classNames } from "../utils/classNames";
import { isMobile } from "../utils/device";
import StyledScrollbar from "./styled-scrollbar";
import { useTheme } from "styled-components";

const scrollbarTypes = {
  smallWhite: {
    thumbV: {
      width: "2px",
      marginLeft: "2px",
      borderRadius: "inherit",
    },
    thumbH: {
      height: "2px",
      marginTop: "2px",
      borderRadius: "inherit",
    },
    trackV: {
      width: "2px",
      background: "transparent",
    },
    trackH: {
      height: "2px",
      background: "transparent",
    },
    content: { outline: "none", WebkitOverflowScrolling: "auto" },
  },
  smallBlack: {
    thumbV: {
      width: "3px",
      marginLeft: "2px",
      borderRadius: "inherit",
    },
    thumbH: {
      height: "3px",
      marginTop: "2px",
      borderRadius: "inherit",
    },
    trackV: {
      width: "3px",
      background: "transparent",
    },
    trackH: {
      height: "3px",
      background: "transparent",
    },
    content: { outline: "none", WebkitOverflowScrolling: "auto" },
  },
  mediumBlack: {
    thumbV: {
      width: "8px",
      borderRadius: "inherit",
    },
    thumbH: {
      height: "8px",
      borderRadius: "inherit",
    },
    trackV: {
      width: "8px",
      background: "transparent",
    },
    trackH: {
      height: "8px",
      background: "transparent",
    },
    content: {
      outline: "none",
      WebkitOverflowScrolling: "auto",
    },
  },
  preMediumBlack: {
    thumbV: {
      width: "5px",
      borderRadius: "inherit",
      cursor: "default",
    },
    thumbH: {
      height: "5px",
      borderRadius: "inherit",
      cursor: "default",
    },
    trackV: {
      width: "5px",
      background: "transparent",
    },
    trackH: {
      height: "5px",
      background: "transparent",
    },
    content: { outline: "none", WebkitOverflowScrolling: "auto" },
  },
};

const Scrollbar = React.forwardRef((props, ref) => {
  const {
    // @ts-expect-error TS(2339): Property 'id' does not exist on type '{}'.
    id,
    // @ts-expect-error TS(2339): Property 'onScroll' does not exist on type '{}'.
    onScroll,
    // @ts-expect-error TS(2339): Property 'autoHide' does not exist on type '{}'.
    autoHide,
    // @ts-expect-error TS(2339): Property 'hideTrackTimer' does not exist on type '... Remove this comment to see the full error message
    hideTrackTimer,
    // @ts-expect-error TS(2339): Property 'scrollclass' does not exist on type '{}'... Remove this comment to see the full error message
    scrollclass,
    // @ts-expect-error TS(2339): Property 'stype' does not exist on type '{}'.
    stype,
    // @ts-expect-error TS(2339): Property 'noScrollY' does not exist on type '{}'.
    noScrollY,
    ...rest
  } = props;

  // @ts-expect-error TS(2339): Property 'interfaceDirection' does not exist on ty... Remove this comment to see the full error message
  const { interfaceDirection } = useTheme();
  const [isScrolling, setIsScrolling] = useState();
  const [isMouseOver, setIsMouseOver] = useState();
  const timerId = useRef();

  const isRtl = interfaceDirection === "rtl";

  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const scrollbarType = scrollbarTypes[stype] ?? {};

  const showTrack = () => {
    clearTimeout(timerId.current);
    // @ts-expect-error TS(2345): Argument of type 'true' is not assignable to param... Remove this comment to see the full error message
    setIsScrolling(true);
  };

  const hideTrack = () => {
    // @ts-expect-error TS(2322): Type 'Timeout' is not assignable to type 'undefine... Remove this comment to see the full error message
    timerId.current = setTimeout(() => {
      // @ts-expect-error TS(2345): Argument of type 'false' is not assignable to para... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2345): Argument of type 'true' is not assignable to param... Remove this comment to see the full error message
    setIsMouseOver(true);
  };

  const onMouseLeave = () => {
    hideTrack();
    // @ts-expect-error TS(2345): Argument of type 'false' is not assignable to para... Remove this comment to see the full error message
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
  const renderScroller = (libProps: any) => {
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

  const disableScrolling = noScrollY
    ? {
        height: "0",
      }
    : {};

  return (
    <StyledScrollbar
      {...rest}
      id={id}
      disableTracksWidthCompensation
      rtl={isRtl}
      ref={ref}
      {...scrollAutoHideHandlers}
      onScrollStart={onScrollStart}
      wrapperProps={{ className: "scroll-wrapper" }}
      scrollerProps={{ renderer: renderScroller }}
      contentProps={{
        tabIndex: -1,
        className: "scroll-body",
        style: {
          ...scrollbarType.content,
          paddingRight: !isRtl && (isMobile() ? "8px" : "17px"),
          paddingLeft: isRtl && (isMobile() ? "8px" : "17px"),
        },
      }}
      thumbYProps={{
        className: "nav-thumb-vertical",
        style: scrollbarType.thumbV,
      }}
      thumbXProps={{
        className: "nav-thumb-horizontal",
        style: scrollbarType.thumbH,
      }}
      // Add 1px margin to vertical track to avoid scrollbar lib crashing when event.clientX equals 0
      trackYProps={{
        style: {
          ...scrollbarType.trackV,
          ...tracksAutoHideStyles,
          marginLeft: isRtl ? "1px" : "0",
          marginRight: isRtl ? "0" : "1px",
          ...disableScrolling,
        },
        ...tracksAutoHideHandlers,
      }}
      trackXProps={{
        style: {
          ...scrollbarType.trackH,
          ...tracksAutoHideStyles,
          direction: "ltr",
        },
        ...tracksAutoHideHandlers,
      }}
    />
  );
});

Scrollbar.propTypes = {
  /** Scrollbar style type */
  // @ts-expect-error TS(2322): Type '{ stype: PropTypes.Requireable<string>; clas... Remove this comment to see the full error message
  stype: PropTypes.string,
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
};

Scrollbar.defaultProps = {
  // @ts-expect-error TS(2322): Type '{ stype: string; autoHide: boolean; hideTrac... Remove this comment to see the full error message
  stype: "mediumBlack",
  autoHide: false,
  hideTrackTimer: 500,
};

export default Scrollbar;
