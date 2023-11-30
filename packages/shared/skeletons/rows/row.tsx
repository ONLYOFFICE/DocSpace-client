import React from "react";
import PropTypes from "prop-types";
import { StyledRow, StyledBox } from "./styled";
import RectangleSkeleton from "../rectangle";
import CircleSkeleton from "../circle";

const RowSkeleton = ({
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
    <StyledRow id={id} className={className} style={style}>
      <>
        {isRectangle ? (
          <RectangleSkeleton
            // @ts-expect-error TS(2322): Type '{ className: string; title: any; width: stri... Remove this comment to see the full error message
            className="rectangle-content"
            title={title}
            width="32px"
            height="32px"
            borderRadius={borderRadius}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
        ) : (
          <CircleSkeleton
            title={title}
            x="16"
            y="16"
            width="32"
            height="32"
            radius="16"
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            backgroundOpacity={backgroundOpacity}
            foregroundOpacity={foregroundOpacity}
            speed={speed}
            animate={animate}
          />
        )}
      </>
      <StyledBox className="row-content">
        <RectangleSkeleton
          // @ts-expect-error TS(2322): Type '{ className: string; title: any; borderRadiu... Remove this comment to see the full error message
          className="first-row-content__mobile"
          title={title}
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
          height="16px"
          borderRadius={borderRadius}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
          backgroundOpacity={backgroundOpacity}
          foregroundOpacity={foregroundOpacity}
          speed={speed}
          animate={animate}
        />
      </StyledBox>

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

RowSkeleton.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  isRectangle: PropTypes.bool,
};

RowSkeleton.defaultProps = {
  id: undefined,
  className: undefined,
  style: undefined,
  isRectangle: true,
};

export default RowSkeleton;
