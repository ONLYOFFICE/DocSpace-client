import React from "react";
import PropTypes from "prop-types";
import { StyledRow } from "./StyledListLoader";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const ListItemLoader = ({
  id,
  className,
  style,
  withoutFirstRectangle,
  withoutLastRectangle,
  ...rest
}) => {
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

  return (
    <StyledRow
      id={id}
      className={className}
      style={style}
      withoutFirstRectangle={withoutFirstRectangle}
      withoutLastRectangle={withoutLastRectangle}
    >
      {!withoutFirstRectangle && (
        <RectangleSkeleton
          title={title}
          width="16"
          height="16"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
          className="list-loader_rectangle"
        />
      )}

      <RectangleSkeleton
        className="list-loader_rectangle-content"
        title={title}
        width="100%"
        height="100%"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />

      <RectangleSkeleton
        className="list-loader_rectangle-row"
        title={title}
        height="16px"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />

      {!withoutLastRectangle && (
        <RectangleSkeleton
          title={title}
          width="16"
          height="16"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      )}
    </StyledRow>
  );
};

ListItemLoader.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  withoutFirstRectangle: PropTypes.bool,
  withoutLastRectangle: PropTypes.bool,
};

ListItemLoader.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
  withoutFirstRectangle: false,
  withoutLastRectangle: false,
};

export default ListItemLoader;
