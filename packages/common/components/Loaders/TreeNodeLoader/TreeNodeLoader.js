import React from "react";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";
import CircleSkeleton from "@docspace/components/skeletons/circle";

const TreeNodeLoader = ({
  title,
  borderRadius,
  backgroundColor,
  foregroundColor,
  backgroundOpacity,
  foregroundOpacity,
  speed,
  animate,
  withRectangle = false,
}) => {
  return (
    <>
      <CircleSkeleton
        title={title}
        height="32"
        radius="3"
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />

      {withRectangle && (
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
          className="tree-node-loader_additional-rectangle"
        />
      )}

      <RectangleSkeleton
        title={title}
        width="100%"
        height="24"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
    </>
  );
};

export default TreeNodeLoader;
