import React from "react";
import PropTypes from "prop-types";
import StyledRow from "./StyledHistoryRowsLoader";
import RectangleSkeleton from "@docspace/components/skeletons/rectangle";

const HistoryRow = ({ id, className, style, ...rest }) => {
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
    <StyledRow id={id} className={className} style={style} gap="16px">
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
const HistoryRowsLoader = (props) => {
  return (
    <>
      <HistoryRow {...props} />
      <HistoryRow {...props} />
      <HistoryRow {...props} />
      <HistoryRow {...props} />
    </>
  );
};

HistoryRowsLoader.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};

HistoryRowsLoader.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
};

export default HistoryRowsLoader;
