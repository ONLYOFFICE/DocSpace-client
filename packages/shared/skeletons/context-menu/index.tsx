import React from "react";
import PropTypes from "prop-types";
import { isDesktop } from "../../utils/device";
import {StyledContextMenu} from "../context-menu/styled";
import RectangleSkeleton from "../rectangle";

const ContextMenuSkeleton = ({
  id,
  className,
  style,
  isRectangle,
  ...rest
}: any) => {
  const {
    title,
    borderRadius,
    backgroundColor,
    foregroundColor,
    backgroundOpacity,
    foregroundOpacity,
    speed,
    animate,
  } = rest;

  const isDesktopView = isDesktop();

  return (
    <StyledContextMenu id={id} className={className} style={style}>
      <RectangleSkeleton
        // @ts-expect-error TS(2322): Type '{ className: string; title: any; width: stri... Remove this comment to see the full error message
        className="rectangle-content"
        title={title}
        width="16px"
        height="16px"
        borderRadius="3px"
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
      <RectangleSkeleton
        // @ts-expect-error TS(2322): Type '{ className: string; title: any; width: stri... Remove this comment to see the full error message
        className="context-menu-rectangle"
        title={title}
        width={isDesktopView ? "97px" : "102px"}
        height={isDesktopView ? "16px" : "20px"}
        borderRadius="3px"
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
    </StyledContextMenu>
  );
};

ContextMenuSkeleton.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  isRectangle: PropTypes.bool,
};

ContextMenuSkeleton.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
  isRectangle: true,
};

export default ContextMenuSkeleton;
