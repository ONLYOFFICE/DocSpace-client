import React from "react";
import { MobileView } from "./StyledProfileView";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { CircleSkeleton } from "@docspace/shared/skeletons";

const MobileViewLoader = ({ ...rest }) => {
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
    <MobileView>
      <CircleSkeleton
        className="avatar"
        title={title}
        x="62"
        y="62"
        radius="62"
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
      <div className="info">
        <RectangleSkeleton
          title={title}
          height="58"
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
          height="58"
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
          height="58"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      </div>
      <div className="block">
        <RectangleSkeleton
          title={title}
          width="78"
          height="20"
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
          height="32"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      </div>

      <div className="notifications">
        <RectangleSkeleton
          title={title}
          width="101"
          height="22"
          className="title"
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
          height="32"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      </div>

      <div className="theme">
        <RectangleSkeleton
          title={title}
          className="theme-title"
          width="129"
          height="22"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />

        <div className="flex">
          <RectangleSkeleton
            title={title}
            width="16"
            height="16"
            className="check-box"
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
            width="124"
            height="20"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
        </div>

        <div className="theme-selection">
          <RectangleSkeleton
            title={title}
            width="291"
            height="32"
            className="theme-description"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />

          <div className="check-box-container">
            <div className="flex">
              <CircleSkeleton
                title={title}
                className="check-box"
                x="8"
                y="8"
                radius="8"
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="124"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
            <div className="flex">
              <CircleSkeleton
                title={title}
                className="check-box"
                x="8"
                y="8"
                radius="8"
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
              <RectangleSkeleton
                title={title}
                width="124"
                height="20"
                borderRadius={borderRadius}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                backgroundOpacity={backgroundOpacity}
                foregroundOpacity={foregroundOpacity}
                speed={speed}
                animate={animate}
              />
            </div>
          </div>
        </div>
      </div>
    </MobileView>
  );
};

export default MobileViewLoader;
