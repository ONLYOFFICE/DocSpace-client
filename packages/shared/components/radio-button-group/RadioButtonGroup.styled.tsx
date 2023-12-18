import React from "react";
import styled, { css } from "styled-components";

const ClearDiv = ({
  orientation,
  width,
  ...props
}: {
  orientation?: "horizontal" | "vertical";
  width?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) => <div {...props} />;

const StyledDiv = styled(ClearDiv)`
  .subtext {
    margin-top: 16px;
    margin-bottom: 8px;
  }

  ${(props) =>
    (props.orientation === "horizontal" &&
      css`
        display: flex;
      `) ||
    (props.orientation === "vertical" &&
      css`
        display: inline-block;
      `)};

  width: ${(props) => props.width};
`;

export default StyledDiv;
