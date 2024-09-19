import hexRgb from "hex-rgb";
import styled, { css } from "styled-components";
import { Base, globalColors } from "../../themes";

const COVER_DEFAULT_SIZE = 20;

const StyledIcon = styled.div<{
  size: string;
  radius: string;
  isArchive?: boolean;
  color?: string;
  wrongImage: boolean;
  withHover: boolean;
  coverSize: number;
}>`
  display: flex;
  z-index: 2;
  justify-content: center;
  align-items: center;

  height: ${(props) => props.size};

  width: ${(props) => props.size};

  ${(props) =>
    props.withEditing &&
    css`
      position: relative;
    `};

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

  .room-icon-cover {
    z-index: 1;
    svg {
      opacity: 1;
      transition: all 0.2s ease;
      transform: ${(props) =>
        props.coverSize &&
        `scale(${props.coverSize / COVER_DEFAULT_SIZE}) translateY(0)`};
      path {
        fill: #fff;
      }
    }

    div:first-child {
      display: flex;
      justify-content: center;
      align-items: center;
      height: ${(props) => `${props.coverSize}px`};
      width: ${(props) => `${props.coverSize}px`};
    }
  }

  ${(props) =>
    !props.theme.isBase &&
    props.color &&
    css`
      .room-icon-cover {
        svg {
          path {
            fill: ${`#${props.color}`};
          }
        }
      }
    `}

  .room-title {
    font-size: 14px;
    font-weight: 700;
    line-height: 16px;
    transition: all 0.2s ease;
    opacity: 1;
    transform: translateY(0);
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

  .room-icon-container {
    width: 32px;
    height: 32px;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .room-icon_hover {
    z-index: 2;
    position: absolute;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.2s ease;
  }

  ${(props) =>
    props.withHover &&
    css`
      cursor: pointer;

      &:hover {
        .hover-class {
          filter: brightness(80%);
        }

        .room-icon_hover {
          opacity: 1;
          transform: translateY(0px);
        }

        .room-title {
          opacity: 0;
          transform: translateY(-20px);
        }

        .room-icon-cover svg {
          opacity: 0;
          transform: translateY(-30px);
        }
      }
    `}
`;

StyledIcon.defaultProps = { theme: Base };

const EditWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: ${(props) => props.theme.itemIcon.editIconColor};
  border-radius: 50%;
  position: absolute;
  bottom: -6px;
  right: -6px;

  .open-edit-logo-icon {
    &:hover {
      cursor: pointer;
    }
  }
`;

export { StyledIcon, EditWrapper };
