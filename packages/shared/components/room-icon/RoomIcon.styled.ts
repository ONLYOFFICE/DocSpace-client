import styled, { css } from "styled-components";
import { Base, globalColors } from "../../themes";

export const StyledIcon = styled.div<{
  size: string;
  radius: string;
  isArchive?: boolean;
  color?: string;
  wrongImage: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;

  height: ${(props) => props.size};

  width: ${(props) => props.size};

  .room-background {
    height: ${(props) => props.size};

    width: ${(props) => props.size};

    border-radius: ${(props) => props.radius};
    vertical-align: middle;
    background: ${(props) =>
      props.isArchive
        ? props.theme.roomIcon.backgroundArchive
        : `#${props.color}`};
    position: absolute;
    opacity: ${(props) => props.theme.roomIcon.opacityBackground};
  }

  .room-title {
    font-size: 14px;
    font-weight: 700;
    line-height: 16px;
    color: ${(props) =>
      props.wrongImage && props.theme.isBase
        ? globalColors.black
        : globalColors.white};
    position: relative;
    ${(props) =>
      !props.theme.isBase &&
      !props.isArchive &&
      css`
        color: ${`#${props.color}`};
      `};
  }

  .room-icon_badge {
    position: absolute;
    margin-block: 24px 0;
    margin-inline: 24px 0;

    .room-icon-button {
      width: 12px;
      height: 12px;
      border: ${(props) => `1px solid ${props.theme.backgroundColor}`};
      border-radius: 50%;

      svg {
        path {
          fill: ${(props) => props.theme.backgroundColor};
        }
        rect {
          stroke: ${(props) => props.theme.backgroundColor};
        }
      }
    }
  }
`;

StyledIcon.defaultProps = { theme: Base };
