import React from "react";
import PropTypes from "prop-types";
import {
  StyledTreeFolder,
  StyledContainer,
  StyledBox,
} from "./StyledTreeFolderLoader";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";
import TreeNodeLoader from "../TreeNodeLoader";

const TreeFolderLoader = ({ id, className, style, ...rest }) => {
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
    <StyledBox id={id} className={className} style={style}>
      <StyledTreeFolder>
        <TreeNodeLoader {...rest} />
        <TreeNodeLoader {...rest} />
        <TreeNodeLoader {...rest} />
      </StyledTreeFolder>

      <StyledTreeFolder>
        <TreeNodeLoader {...rest} />
        <TreeNodeLoader {...rest} />
        <TreeNodeLoader {...rest} />
      </StyledTreeFolder>

      <StyledTreeFolder>
        <TreeNodeLoader {...rest} />
      </StyledTreeFolder>

      <StyledContainer>
        <RectangleSkeleton
          title={title}
          width="100%"
          height="48"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      </StyledContainer>
    </StyledBox>
  );
};

TreeFolderLoader.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

TreeFolderLoader.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
};

export default TreeFolderLoader;
