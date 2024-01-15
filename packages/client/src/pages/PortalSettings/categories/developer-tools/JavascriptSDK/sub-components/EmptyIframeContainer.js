import React from "react";
import styled from "styled-components";

import { RectangleSkeleton } from "@docspace/shared/skeletons/rectangle";
import { Base } from "@docspace/shared/themes";

const StyledContainer = styled.div`
  width: ${(props) => props.width + "%"};
  height: ${(props) => props.height + "px"};

  display: flex;
  justify-content: center;
  align-items: center;

  border: 1px solid ${(props) => props.theme.plugins.borderColor};
  border-radius: 6px;

  .emptyIframeText {
    position: absolute;
    font-size: 44px;
    font-weight: 700;
    line-height: 59.92px;
    color: ${(props) => props.theme.text.emailColor};
  }
`;
StyledContainer.defaultProps = { theme: Base };

const EmptyIframeContainer = ({ text, width, height }) => {
  return (
    <StyledContainer width={width} height={height}>
      <RectangleSkeleton height={height} borderRadius="6px" />
      <span className="emptyIframeText">{text}</span>
    </StyledContainer>
  );
};

export default EmptyIframeContainer;
