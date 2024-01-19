import styled, { css } from "styled-components";
import { Base } from "../../themes";
import { IconButtonProps } from "./IconButton.types";

const StyledOuter = styled.div<IconButtonProps>`
  width: ${(props) => (props.size ? `${props.size}px` : "20px")};
  height: ${(props) => (props.size ? `${props.size}px` : "20px")};
  cursor: ${(props) =>
    props.isDisabled || !props.isClickable ? "default" : "pointer"};
  line-height: 0;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  ${(props) =>
    props.isStroke &&
    css`
      svg {
        &:not(:root) {
          width: 100%;
          height: 100%;
        }
        path {
          stroke: ${props.color || props.theme.iconButton.color};
        }
      }
      &:hover {
        svg {
          path {
            stroke: ${props.isDisabled
              ? props.theme.iconButton.color
              : props.color || props.theme.iconButton.hoverColor};
          }
        }
      }
    `}

  ${(props) =>
    props.isFill &&
    !props.isStroke &&
    css`
      svg {
        &:not(:root) {
          width: 100%;
          height: 100%;
        }
        path {
          fill: ${props.color || props.theme.iconButton.color};
        }
      }
      &:hover {
        svg {
          path {
            fill: ${props.isDisabled
              ? props.theme.iconButton.color
              : props.color || props.theme.iconButton.hoverColor};
          }
        }
      }
    `}
`;

StyledOuter.defaultProps = { theme: Base };

export default StyledOuter;
