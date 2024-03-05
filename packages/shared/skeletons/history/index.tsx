import React from "react";
import StyledRow from "./History.styled";

import { RectangleSkeleton } from "../rectangle";
import type { HistoryProps } from "./History.types";

const History = ({ id, className, style, ...rest }: HistoryProps) => {
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
    <StyledRow id={id} className={className} style={style}>
      <RectangleSkeleton
        className="history-loader-file-link"
        title={title}
        width="100%"
        height="18"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
      <RectangleSkeleton
        className="history-loader-file-date"
        title={title}
        width="100%"
        height="18"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
      <RectangleSkeleton
        className="history-loader-options"
        title={title}
        width="100%"
        height="18"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />

      <RectangleSkeleton
        className="history-loader-comment"
        title={title}
        width="100%"
        height="18"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
      <RectangleSkeleton
        className="history-loader-restore-btn"
        title={title}
        width="100%"
        height="18"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
      <RectangleSkeleton
        className="history-loader-download-btn"
        title={title}
        width="100%"
        height="18"
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        backgroundOpacity={backgroundOpacity}
        foregroundOpacity={foregroundOpacity}
        speed={speed}
        animate={animate}
      />
    </StyledRow>
  );
};
const HistoryRowsSkeleton = (props: HistoryProps) => {
  return (
    <>
      <History {...props} />
      <History {...props} />
      <History {...props} />
      <History {...props} />
    </>
  );
};

export default HistoryRowsSkeleton;
