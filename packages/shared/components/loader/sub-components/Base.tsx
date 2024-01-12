import React from "react";

import {
  LoadingLabel,
  LoadingWrapper,
  DotWrapper,
  Dot,
} from "../Loader.styled";

const LoadingDots = (props: {
  color?: string;
  size?: string;
  label?: string;
}) => {
  const { label, size, ...rest } = props;

  const numberSize = Number(size?.replace("px", "")) || 18;

  return (
    <LoadingWrapper size={size || "18px"} {...rest}>
      <LoadingLabel>{label}</LoadingLabel>
      <DotWrapper>
        <Dot size={numberSize} {...rest} delay="0s" />
        <Dot size={numberSize} {...rest} delay=".2s" />
        <Dot size={numberSize} {...rest} delay=".4s" />
      </DotWrapper>
    </LoadingWrapper>
  );
};

LoadingDots.defaultProps = {
  size: "18px",
  label: "Loading content, please wait",
  color: "",
};

export { LoadingDots };
