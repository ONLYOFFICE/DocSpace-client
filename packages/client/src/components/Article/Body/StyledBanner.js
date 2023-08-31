import styled from "styled-components";
import commonIconsStyles from "@docspace/components/utils/common-icons-style";
import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg";

export const StyledIframe = styled.iframe`
  border: none;
  height: 100%;
  width: 100%;
`;

export const StyledAction = styled.div`
  position: absolute;
  right: 8px;
  top: 8px;
  background: inherit;
  display: inline-block;
  border: none;
  font-size: inherit;
  color: "#333";
  cursor: pointer;
  text-decoration: underline;
`;

export const StyledCrossIcon = styled(CrossReactSvg)`
  ${commonIconsStyles}

  path {
    fill: #fff;
  }
`;
