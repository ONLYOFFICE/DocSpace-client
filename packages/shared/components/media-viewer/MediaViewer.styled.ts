import styled, { css } from "styled-components";

import { Base } from "@docspace/shared/themes";
import { DropDown } from "@docspace/shared/components/drop-down";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";

type StyledButtonScrollProps = {
  orientation: "left" | "right";
};

type StyledSwitchToolbarProps = {
  left?: boolean;
  isPDFFile?: boolean;
};

type StyledViewerContainerProps = {
  visible: boolean;
};

export const ControlBtn = styled.div`
  display: inline-block;
  height: 30px;
  line-height: 25px;
  margin: 5px;
  width: 40px;
  border-radius: 2px;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: ${(props) =>
      props.theme.mediaViewer.controlBtn.backgroundColor};
  }
`;

ControlBtn.defaultProps = { theme: Base };

export const StyledDropDown = styled(DropDown)`
  background: #333;
`;

export const StyledDropDownItem = styled(DropDownItem)`
  color: #fff;

  .drop-down-item_icon svg {
    path {
      fill: #fff !important;
    }
  }

  &:hover {
    background: #444;
  }
`;

export const StyledButtonScroll = styled.div<StyledButtonScrollProps>`
  z-index: 307;
  position: fixed;
  top: calc(50% - 20px);

  ${(props) => (props.orientation === "left" ? "left: 20px;" : "right: 20px;")}
`;

export const StyledMobileDetails = styled.div`
  z-index: 307;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 53px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );

  svg {
    path {
      fill: #fff;
    }
  }

  .mobile-close {
    position: fixed;
    left: 21px;
    top: 22px;
  }

  .mobile-context {
    position: fixed;
    right: 22px;
    top: 22px;
  }

  .title {
    font-weight: 600;
    margin-top: 6px;
    width: calc(100% - 100px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const StyledSwitchToolbar = styled.div<StyledSwitchToolbarProps>`
  height: 100%;
  z-index: 306;
  position: fixed;
  width: 73px;
  background: inherit;
  display: block;
  opacity: 0;
  transition: all 0.3s;

  ${(props) =>
    props.left ? "left: 0" : props.isPDFFile ? "right: 20px" : "right: 0"};

  &:hover {
    cursor: pointer;
    opacity: 1;
  }
`;

export const StyledViewerContainer = styled.div<StyledViewerContainerProps>`
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
