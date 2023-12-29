import React from "react";

import { Text } from "../text";

import StyledProgressBar from "./ProgressBar.styled";
import { ProgressBarProps } from "./ProgressBar.types";

const ProgressBar = ({ percent, label, ...rest }: ProgressBarProps) => {
  const progressPercent = percent > 100 ? 100 : percent;

  // console.log("ProgressBar render");
  return (
    <StyledProgressBar
      {...rest}
      percent={progressPercent}
      data-testid="progress-bar"
    >
      <div className="progress-bar_percent" />
      <Text
        className="progress-bar_full-text"
        fontSize="12px"
        fontWeight="400"
        lineHeight="16px"
        title={label}
      >
        {label}
      </Text>
    </StyledProgressBar>
  );
};

export { ProgressBar };
