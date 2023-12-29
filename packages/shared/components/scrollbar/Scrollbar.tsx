import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";

import { classNames } from "../../utils";

import StyledScrollbar from "./Scrollbar.styled";
import { ScrollbarProps } from "./Scrollbar.types";

const Scrollbar = React.forwardRef((props: ScrollbarProps, ref) => {
  const {
    id,
    onScroll,
    autoHide,
    hideTrackTimer,
    scrollclass,
    fixedSize,
    ...rest
  } = props;

  const defaultTheme = useTheme();
  const interfaceDirection = defaultTheme?.interfaceDirection;

  const [isScrolling, setIsScrolling] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const timerId = useRef<null | ReturnType<typeof setTimeout>>();

  const isRtl = interfaceDirection === "rtl";

  const showTrack = () => {
    if (timerId.current) clearTimeout(timerId.current);

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
  const renderScroller = (libProps: {
    elementRef: React.RefObject<HTMLDivElement>;
  }) => {
    const { elementRef, ...restLibProps } = libProps;
    return (
      <div
        {...restLibProps}
        className={classNames("scroller", scrollclass || "") || "scroller"}
        ref={elementRef}
        onScroll={onScroll}
      />
    );
  };

  useEffect(() => {
    return () => {
      if (timerId.current) clearTimeout(timerId.current);
    };
  }, []);

  return (
    <StyledScrollbar
      {...rest}
      id={id}
      data-testid="scrollbar"
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

Scrollbar.displayName = "Scrollbar";

Scrollbar.defaultProps = {
  autoHide: false,
  hideTrackTimer: 500,
  fixedSize: false,
};

export { Scrollbar };
