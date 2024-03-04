import React from "react";

import { Text } from "../text";

import StyledProgressBar from "./ProgressBar.styled";
import { ProgressBarProps } from "./ProgressBar.types";

const ProgressBar = ({
  percent,
  label,
  isInfiniteProgress,
  ...rest
}: ProgressBarProps) => {
  const progressPercent = percent > 100 ? 100 : percent;

  // console.log("ProgressBar render");
  return (
    <>
      <Text
        className="progress-bar_full-text"
        fontSize="12px"
        fontWeight="400"
        lineHeight="16px"
        title={label}
      >
        {label}
      </Text>
      <StyledProgressBar
        {...rest}
        percent={progressPercent}
        data-testid="progress-bar"
      >
        {isInfiniteProgress ? (
          <div className="progress-bar_animation" />
        ) : (
          <div className="progress-bar_percent" />
        )}
      </StyledProgressBar>
    </>
  );
};

export { ProgressBar };
