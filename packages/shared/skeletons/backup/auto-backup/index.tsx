import React from "react";
import { RectangleSkeleton } from "../../rectangle";

import StyledAutoBackup from "./AutoBackup.styled";
import type { AutoBackupLoaderProps } from "./AutoBackup.types";

const AutoBackupLoader = ({
  id,
  className,
  style,
  ...rest
}: AutoBackupLoaderProps) => {
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
    <StyledAutoBackup>
      <div className="auto-backup-loader_main">
        <RectangleSkeleton
          className="auto-backup-loader_title"
          title={title}
          width="100%"
          height="22"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />

        <RectangleSkeleton
          className="auto-backup-loader_title-description"
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
          className="auto-backup-loader_toggle"
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
      </div>

      <div className="auto-backup-loader_menu">
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
        <RectangleSkeleton
          className="auto-backup-loader_option"
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
        <div />
        <RectangleSkeleton
          className="auto-backup-loader_option-description"
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
        <div />
        <RectangleSkeleton
          className="auto-backup-loader_option-description-second"
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
        <div />
        <RectangleSkeleton
          className="auto-backup-loader_option-description-third"
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
        <div />
        <RectangleSkeleton
          className="auto-backup-loader_option-description-fourth"
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
      </div>
    </StyledAutoBackup>
  );
};

export default AutoBackupLoader;
