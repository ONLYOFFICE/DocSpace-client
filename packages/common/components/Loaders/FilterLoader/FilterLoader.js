import React from "react";
import PropTypes from "prop-types";
import StyledFilter from "./StyledFilterLoader";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const FilterLoader = ({ id, className, style, ...rest }) => {
  const {
    title,
    height,
    borderRadius,
    backgroundColor,
    foregroundColor,
    backgroundOpacity,
    foregroundOpacity,
    speed,
    animate,
  } = rest;

  return (
    <StyledFilter id={id} className={className} style={style}>
      <RectangleSkeleton
        title={title}
        height={height}
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
      <RectangleSkeleton
        title={title}
        height={height}
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
    </StyledFilter>
  );
};

FilterLoader.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

FilterLoader.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
};

export default FilterLoader;
