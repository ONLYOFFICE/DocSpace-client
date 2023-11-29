import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { flip, shift, offset } from "@floating-ui/dom";
import { Tooltip as ReactTooltip } from "react-tooltip";

import Portal from "../portal";
import StyledTooltip from "./styled-tooltip";

const defaultOffset = 4;
const globalCloseEvents = {
  escape: true,
  resize: true,
  scroll: true,
  clickOutsideAnchor: true,
};

const Tooltip = forwardRef((props, ref) => {
  const {
    id,
    place,
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
  } = props;

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
      theme={props.theme}
      className={className}
      style={style}
      color={color}
      maxWidth={maxWidth}
    >
      <ReactTooltip
        id={id}
        ref={ref}
        float={float}
        place={place}
        isOpen={isOpen}
        noArrow={noArrow}
        render={getContent}
        clickable={clickable}
        afterShow={afterShow}
        afterHide={afterHide}
        offset={props.offset}
        opacity={props.opacity}
        openEvents={openEvents}
        positionStrategy="fixed"
        closeEvents={closeEvents}
        openOnClick={openOnClick}
        anchorSelect={anchorSelect}
        className="__react_component_tooltip"
        globalCloseEvents={globalCloseEvents}
        imperativeModeOnly={props.imperativeModeOnly}
        middlewares={[
          offset(props.offset ?? defaultOffset),
          flip({
            crossAxis: false,
            fallbackAxisSideDirection: place,
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
});

Tooltip.propTypes = {
  /** Used as HTML id property  */
  id: PropTypes.string,
  /** Global tooltip placement */
  place: PropTypes.oneOf(["top", "right", "bottom", "left"]),
  /** Sets a callback function that generates the tip content dynamically */
  getContent: PropTypes.func,
  /** A function to be called after the tooltip is hidden */
  afterHide: PropTypes.func,
  /** A function to be called after the tooltip is shown */
  afterShow: PropTypes.func,
  /** Space between the tooltip element and anchor element (arrow not included in calculation) */
  offset: PropTypes.number,
  /** Child elements */
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Background color of the tooltip  */
  color: PropTypes.string,
  /** Maximum width of the tooltip */
  maxWidth: PropTypes.string,
  /** The tooltip can be controlled or uncontrolled, this attribute cannot be used to handle show and hide tooltip outside tooltip */
  isOpen: PropTypes.bool,
  /** Allow interaction with elements inside the tooltip */
  clickable: PropTypes.bool,
  /** Controls whether the tooltip should open when clicking (true) or hovering (false) the anchor element */
  openOnClick: PropTypes.bool,
  /** Tooltip will follow the mouse position when it moves inside the anchor element */
  float: PropTypes.bool,
  /** The selector for the anchor elements */
  anchorSelect: PropTypes.string,
  /** Tooltip arrow will not be shown */
  noArrow: PropTypes.bool,
  /**Change the opacity of the tooltip */
  opacity: PropTypes.number,
  /** When enabled, default tooltip behavior is disabled. */
  imperativeModeOnly: PropTypes.bool,
};

Tooltip.defaultProps = {
  place: "top",
  noArrow: true,
  opacity: 1,
};

export default Tooltip;
