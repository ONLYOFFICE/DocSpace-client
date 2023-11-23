import React from "react";
import { BoxProps } from "./Box.types";
import { StyledBox } from "./Box.styled";

const Box = (props: BoxProps) => (
  <StyledBox {...props} as={props.as || "div"} data-testid={props.testId} />
);

Box.defaultProps = {
  displayProp: "block",
};

export { Box };
