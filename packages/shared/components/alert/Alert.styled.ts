import styled, { css } from "styled-components";

import ArrowRightIcon from "PUBLIC_DIR/images/arrow.right.react.svg";
import CrossReactSvg from "PUBLIC_DIR/images/cross.react.svg";

import { commonIconsStyles } from "../../utils";

const StyledAlertComponent = styled.div<{
  borderColor: string;
  needArrowIcon?: boolean;
  titleColor?: string;
}>`
  width: 100%;
  position: relative;
  border: ${(props) => `1px solid ${props.borderColor}`};
  border-radius: 6px;
  padding: 12px;
  ${(props) => !!props.onClick && "cursor:pointer"};
  display: grid;

  grid-template-columns: ${(props) =>
    props.needArrowIcon ? "1fr 16px" : "1fr"};

  .main-content {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    gap: 4px;
  }

  .alert-component_title {
    color: ${(props) => props.titleColor};
  }
  .alert-component_icons {
    margin: auto 0;
  }
`;

const StyledArrowRightIcon = styled(ArrowRightIcon)`
  margin: auto 0;
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
  path {
    fill: ${(props) => props.theme.alertComponent.iconColor};
  }
`;
const StyledCrossIcon = styled(CrossReactSvg)`
  position: absolute;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? css`
          left: 0px;
          margin-left: 8px;
        `
      : css`
          right: 0px;
          margin-right: 8px;
        `}
  margin-top: 8px;
  cursor: pointer;

  ${commonIconsStyles}
  path {
    fill: ${(props) => props.color};
  }
`;

export { StyledAlertComponent, StyledArrowRightIcon, StyledCrossIcon };
