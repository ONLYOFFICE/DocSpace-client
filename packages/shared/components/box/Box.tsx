import React from "react";
import { BoxProps } from "./Box.types";
import { StyledBox } from "./Box.styled";

function Box(props: BoxProps) {
  const { as } = props;
  return <StyledBox {...props} as={as || "div"} data-testid="box" />;
}

Box.defaultProps = {
  displayProp: "block",
};

export { Box };
