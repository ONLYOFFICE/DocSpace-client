import React from "react";
import { flip, shift, offset } from "@floating-ui/dom";
import { Tooltip as ReactTooltip } from "react-tooltip";

import { Portal } from "../portal";

import StyledTooltip from "./Tooltip.styled";
import {
  TooltipProps,
  TFallbackAxisSideDirection,
  TTooltipPlace,
} from "./Tooltip.types";
import { DEFAULT_OFFSET } from "./Tooltip.constants";

export { TFallbackAxisSideDirection, TTooltipPlace };

const Tooltip = ({
  id,
  place = "top",
  getContent,
  children,
  afterShow,
  afterHide,
  className,
  style,
  color,
  maxWidth,
  anchorSelect,
  clickable,
  openOnClick,
  isOpen,
  float,
  noArrow = true,
  fallbackAxisSideDirection,
  ...rest
}: TooltipProps) => {
  const globalCloseEvents = {
    escape: true,
    resize: true,
    scroll: true,
    clickOutsideAnchor: true,
  };

  const openEvents = {
    click: openOnClick,
    mouseenter: !openOnClick,
  };

  const closeEvents = {
    click: openOnClick,
    mouseleave: !openOnClick,
  };

  const renderTooltip = () => (
    <StyledTooltip
      className={className}
      style={style}
      color={color}
      maxWidthProp={maxWidth}
      data-testid="tooltip"
    >
      <ReactTooltip
        id={id}
        opacity={1}
        float={float}
        place={place}
        isOpen={isOpen}
        noArrow={noArrow}
        render={getContent}
        clickable={clickable}
        afterShow={afterShow}
        afterHide={afterHide}
        offset={rest.offset}
        openEvents={openEvents}
        positionStrategy="fixed"
        closeEvents={closeEvents}
        openOnClick={openOnClick}
        anchorSelect={anchorSelect}
        className="__react_component_tooltip"
        globalCloseEvents={globalCloseEvents}
        middlewares={[
          offset(rest.offset ?? DEFAULT_OFFSET),
          flip({
            crossAxis: false,
            fallbackAxisSideDirection,
          }),
          shift(),
        ]}
      >
        {children}
      </ReactTooltip>
    </StyledTooltip>
  );

  const tooltip = renderTooltip();

  return <Portal element={tooltip} />;
};

export { Tooltip };
