import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";

import { classNames } from "../../utils";

import StyledScrollbar from "./Scrollbar.styled";
import { ScrollbarProps } from "./Scrollbar.types";
import { Scrollbar } from "./custom-scrollbar";

const ScrollbarComponent = React.forwardRef<Scrollbar, ScrollbarProps>(
  (props, ref) => {
    const {
      id,
      onScroll,
      autoHide = false,
      hideTrackTimer = 500,
      scrollclass,
      fixedSize = false,
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
    const tracksAutoHideHandlers = autoHide
      ? { onMouseEnter, onMouseLeave }
      : {};
    const tracksAutoHideStyles = autoHide
      ? {
          opacity: !isScrolling ? 0 : 1,
          transition: "opacity 0.4s ease-in-out",
        }
      : {};

    // onScroll handler placed here on Scroller element to get native event instead of parameters that library put
    const renderScroller = React.useCallback(
      (libProps: { elementRef?: React.LegacyRef<HTMLDivElement> }) => {
        const { elementRef, ...restLibProps } = libProps;

        return (
          <div
            {...restLibProps}
            key="scroll-renderer-div"
            className={classNames("scroller", scrollclass || "") || "scroller"}
            ref={elementRef}
            onScroll={onScroll}
          />
        );
      },
      [onScroll, scrollclass],
    );

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
        ref={ref}
      />
    );
  },
);

ScrollbarComponent.displayName = "Scrollbar";

export { ScrollbarComponent };
