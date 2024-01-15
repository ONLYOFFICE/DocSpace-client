import styled, { css } from "styled-components";
import { Base } from "@docspace/shared/themes";

type StyledViewerContainerProps = {
  visible: boolean;
};

const StyledViewerContainer = styled.div<StyledViewerContainerProps>`
  color: ${(props) => props.theme.mediaViewer.color};
  display: ${(props) => (props.visible ? "block" : "none")};
  overflow: hidden;
  span {
    position: fixed;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 0;
            margin-left: 10px;
          `
        : css`
            right: 0;
            margin-right: 10px;
          `}
    bottom: 5px;
    z-index: 305;
  }
  .deleteBtnContainer,
  .downloadBtnContainer {
    display: block;
    width: 16px;
    height: 16px;
    margin: 4px 12px;
    line-height: 19px;
    svg {
      path {
        fill: ${(props) => props.theme.mediaViewer.fill};
      }
    }
  }
  .details {
    z-index: 307;
    padding-top: 21px;
    height: 64px;
    width: 100%;
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.8) 100%
    );
    position: fixed;
    top: 0;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            right: 0;
          `
        : css`
            left: 0;
          `}
    .title {
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      font-size: 20px;
      font-weight: 600;
      text-overflow: ellipsis;
      width: calc(100% - 50px);
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding-right: 16px;
            `
          : css`
              padding-left: 16px;
            `}
      box-sizing: border-box;
      color: ${(props) => props.theme.mediaViewer.titleColor};
    }
  }
  .mediaPlayerClose {
    position: fixed;
    top: 13px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 12px;
          `
        : css`
            right: 12px;
          `}
    height: 17px;
    &:hover {
      background-color: transparent;
    }
    svg {
      path {
        fill: ${(props) => props.theme.mediaViewer.iconColor};
      }
    }
  }

  .containerVideo {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
  }
`;

StyledViewerContainer.defaultProps = { theme: Base };

export default StyledViewerContainer;
