import React from "react";
import PropTypes from "prop-types";
import {
  StyledTile,
  StyledBottom,
  StyledMainContent,
} from "./StyledTileLoader";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

const TileLoader = ({
  isFolder,
  title,
  borderRadius,
  backgroundColor,
  foregroundColor,
  backgroundOpacity,
  foregroundOpacity,
  speed,
  animate,
  ...rest
}) => {
  return isFolder ? (
    <StyledTile {...rest} isFolder>
      <StyledBottom className="bottom-content" isFolder>
        <RectangleSkeleton
          className="first-content"
          title={title}
          width="100%"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={true}
        />
        <RectangleSkeleton
          className="second-content"
          title={title}
          height="22px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={true}
        />
        <RectangleSkeleton
          className="option-button"
          title={title}
          height="16px"
          width="16px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={true}
        />
      </StyledBottom>
    </StyledTile>
  ) : (
    <StyledTile {...rest}>
      <StyledMainContent>
        <RectangleSkeleton
          className="main-content"
          title={title}
          height="156px"
          borderRadius={borderRadius ? borderRadius : "0"}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={true}
        />
      </StyledMainContent>

      <StyledBottom className="bottom-content">
        <RectangleSkeleton
          className="first-content"
          title={title}
          width="100%"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={true}
        />
        <RectangleSkeleton
          className="second-content"
          title={title}
          height="22px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={true}
        />
        <RectangleSkeleton
          className="option-button"
          title={title}
          height="16px"
          width="16px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={true}
        />
      </StyledBottom>
    </StyledTile>
  );
};

TileLoader.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  isRectangle: PropTypes.bool,
  isFolder: PropTypes.bool,
};

TileLoader.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
  isRectangle: true,
  isFolder: false,
};

export default TileLoader;
