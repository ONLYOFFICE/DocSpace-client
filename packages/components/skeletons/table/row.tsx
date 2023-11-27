import React from "react";
import PropTypes from "prop-types";
import { StyledRow, StyledBox1, StyledBox2 } from "./styled";
import RectangleSkeleton from "../rectangle";

const TableRow = ({
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

  return (
    <StyledRow
      id={id}
      className={className}
      style={style}
      // @ts-expect-error TS(2769): No overload matches this call.
      gap={isRectangle ? "8px" : "16px"}
    >
      <StyledBox1>
        <RectangleSkeleton
          // @ts-expect-error TS(2322): Type '{ className: string; title: any; width: stri... Remove this comment to see the full error message
          className="rectangle-content"
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
      </StyledBox1>
      <StyledBox2 className="row-content">
        <RectangleSkeleton
          // @ts-expect-error TS(2322): Type '{ className: string; title: any; height: str... Remove this comment to see the full error message
          className="first-row-content__mobile"
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
        <RectangleSkeleton
          // @ts-expect-error TS(2322): Type '{ className: string; title: any; height: str... Remove this comment to see the full error message
          className="second-row-content__mobile"
          title={title}
          height="12px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      </StyledBox2>
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
    </StyledRow>
  );
};

TableRow.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  isRectangle: PropTypes.bool,
};

TableRow.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
  isRectangle: true,
};

export default TableRow;
