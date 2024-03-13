import styled, { css } from "styled-components";
import { isMobile } from "react-device-detect";

import { mobile, tablet } from "../../utils";

import { Base } from "../../themes";
import { DropDown } from "../drop-down";
import { DropDownItem } from "../drop-down-item";
import { FloatingButton } from "../floating-button";
import { ProgressBarMobileDefaultStyles } from "./MainButtonMobile.types";

const StyledFloatingButton = styled(FloatingButton)`
  position: relative;
  z-index: 1010;
  background: ${(props) => props.theme.mainButtonMobile.buttonColor};
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  .circle__background {
    background: ${(props) => props.theme.mainButtonMobile.buttonColor};
  }

  .circle__mask + div {
    display: flex;
    align-items: center;
    justify-content: center;

    div {
      padding-top: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  ${(props) =>
    props.percent === 0 &&
    css`
      .circle__mask {
        clip: none;
      }

      .circle__fill {
        animation: none;
        transform: none;
        background: none !important;
      }
    `}

  .circle__mask .circle__fill {
    background-color: ${(props) =>
      props.theme.mainButtonMobile.circleBackground};
  }

  svg {
    path {
      fill: ${(props) => props.theme.mainButtonMobile.iconFill};
    }
  }
`;
StyledFloatingButton.defaultProps = { theme: Base };

const mobileDropDown = css`
  @media ${mobile} {
    width: ${(props) => props.theme.mainButtonMobile.dropDown.mobile.width};
  }

  right: ${(props) => props.theme.mainButtonMobile.dropDown.mobile.right};
  ${(props) =>
    props.theme.interfaceDirection === "rtl" &&
    css`
      left: ${props.theme.mainButtonMobile.dropDown.mobile.right};
      right: unset;
    `}
  bottom: ${(props) => props.theme.mainButtonMobile.dropDown.mobile.bottom};

  .dialog-background-scroll {
    background: ${(props) => props.theme.backgroundColor} !important;
  }
  .section-scroll {
    background: ${(props) =>
      props.theme.mainButtonMobile.buttonOptions.backgroundColor};
  }
`;

const StyledRenderItem = styled.div`
  background: ${(props) => props.theme.backgroundColor};
`;

const StyledDropDown = styled(DropDown)<{ heightProp?: string }>`
  position: ${(props) => props.theme.mainButtonMobile.dropDown.position};
  width: ${(props) => props.theme.mainButtonMobile.dropDown.width};
  max-width: calc(100vw - 48px);

  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          left: ${props.theme.mainButtonMobile.dropDown.right};
        `
      : css`
          right: ${props.theme.mainButtonMobile.dropDown.right};
        `}
  bottom: ${(props) => props.theme.mainButtonMobile.dropDown.bottom};

  z-index: ${(props) => props.theme.mainButtonMobile.dropDown.zIndex};
  height: auto;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  padding: 0px;

  @media ${tablet} {
    height: ${(props) => props.heightProp};
  }

  @media ${mobile} {
    ${mobileDropDown}
  }

  .section-scroll,
  .scroll-body {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-left: 0px !important;`
        : `padding-right: 0px !important;`}
  }

  .separator-wrapper {
    padding: 12px 24px;
  }

  .is-separator {
    height: 1px !important;
    width: calc(100% - 48px);
    padding: 0 !important;
    margin: 12px 24px !important;
    background-color: ${(props) =>
      props.theme.mainButtonMobile.dropDown.separatorBackground};
  }

  .drop-down-item-button {
    color: ${(props) => props.theme.mainButtonMobile.dropDown.buttonColor};

    svg {
      path[fill] {
        fill: ${(props) => props.theme.mainButtonMobile.dropDown.buttonColor};
      }

      path[stroke] {
        stroke: ${(props) => props.theme.mainButtonMobile.dropDown.buttonColor};
      }
    }

    &:hover {
      background-color: ${(props) =>
        isMobile
          ? props.theme.mainButtonMobile.buttonOptions.backgroundColor
          : props.theme.mainButtonMobile.dropDown.hoverButtonColor};
    }
  }

  .action-mobile-button {
    width: 100%;
    background-color: ${(props) =>
      props.theme.mainButtonMobile.dropDown.backgroundActionMobile};
    border-radius: 3px;
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    display: block;
  }
`;

StyledDropDown.defaultProps = { theme: Base };

const StyledDropDownItem = styled(DropDownItem)`
  padding: 6px 23px;

  .drop-down-icon {
    height: 22px;
  }
`;

const StyledButtonOptions = styled.div<{ withoutButton?: boolean }>`
  padding: 16px 0;
  background-color: ${(props) =>
    props.withoutButton
      ? props.theme.mainButtonMobile.buttonWrapper.background
      : props.theme.mainButtonMobile.buttonOptions.backgroundColor};
  color: ${(props) => props.theme.mainButtonMobile.buttonOptions.color};

  .sublevel {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-right: 48px;`
        : `padding-left: 48px;`}
  }
  .main-button_drop-down {
    color: ${(props) => props.theme.mainButtonMobile.dropDown.buttonColor};

    svg {
      path[fill] {
        fill: ${(props) => props.theme.mainButtonMobile.dropDown.buttonColor};
      }

      path[stroke] {
        stroke: ${(props) => props.theme.mainButtonMobile.dropDown.buttonColor};
      }
    }

    background-color: transparent;

    @media (hover: hover) {
      &:hover {
        background-color: ${(props) =>
          isMobile
            ? props.theme.mainButtonMobile.buttonOptions.backgroundColor
            : props.theme.mainButtonMobile.dropDown.hoverButtonColor};
      }
    }
  }
`;

StyledButtonOptions.defaultProps = { theme: Base };

const StyledContainerAction = styled.div`
  padding: 16px 0px;

  .sublevel {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-right: 48px;`
        : `padding-left: 48px;`}
  }
`;

const StyledButtonWrapper = styled.div<{
  isOpenButton?: boolean;
  isUploading?: boolean;
}>`
  padding: 0 24px 34px;

  display: ${(props) => (props.isOpenButton ? "none" : "block")};
  background-color: ${(props) =>
    props.isUploading
      ? props.theme.mainButtonMobile?.buttonWrapper.uploadingBackground
      : props.theme.mainButtonMobile?.buttonWrapper.background};
`;

StyledButtonWrapper.defaultProps = { theme: Base };

const StyledProgressContainer = styled.div<{ isUploading?: boolean }>`
  display: ${(props) => (props.isUploading ? "flex" : "none")};
  flex-direction: column;
  background-color: ${(props) =>
    props.isUploading
      ? props.theme.mainButtonMobile?.buttonWrapper.uploadingBackground
      : props.theme.mainButtonMobile?.buttonWrapper.background};
  cursor: default;
  padding: 0 24px 34px;
`;

StyledProgressContainer.defaultProps = {
  theme: Base,
};

StyledButtonWrapper.defaultProps = { theme: Base };

const StyledProgressBarContainer = styled.div<{ isUploading?: boolean }>`
  display: ${(props) => (props.isUploading ? "flex" : "none")};

  align-items: center;

  flex-wrap: wrap;

  width: 100%;

  box-sizing: border-box;

  height: 60px;
  padding-top: 26px;

  .progress-container {
    width: 100%;

    display: flex;

    align-items: center;
    justify-content: space-between;

    .progress-header {
      width: 50%;

      line-height: 16px;

      color: ${(props) => props.theme.mainButtonMobile.textColor};
      &:hover {
        cursor: pointer;
      }
    }

    .progress_info-container {
      width: 50%;

      display: flex;
      align-items: center;

      .progress_count {
        width: calc(100% - 26px);

        line-height: 16px;
        color: ${(props) => props.theme.mainButtonMobile.textColor};

        text-align: right;
        margin-right: 12px;
        ${(props) =>
          props.theme.interfaceDirection === "rtl" &&
          css`
            margin-left: 12px;
            margin-right: 0px;
          `}
      }

      .progress_icon {
        svg {
          path {
            fill: ${(props) => props.theme.mainButtonMobile.bar.icon};
          }
        }
      }
    }
  }
`;

StyledProgressBarContainer.defaultProps = { theme: Base };

const StyledMobileProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${(props) =>
    props.theme.mainButtonMobile.mobileProgressBarBackground};
  border-radius: 2px;
  margin-top: 14px;
`;

StyledMobileProgressBar.defaultProps = { theme: Base };

const StyledBar = styled.div<{ uploadPercent: number }>`
  width: ${(props) => props.uploadPercent}%;
  height: 4px;
  opacity: 1;
`;

const StyledAlertIcon = styled.div`
  position: absolute;
  z-index: 1010;
  width: 12px;
  height: 12px;
  top: 10px;
  ${(props) =>
    props.theme.interfaceDirection === "rtl" ? "left: 10px;" : "right: 10px;"}
`;

StyledBar.defaultProps = { theme: Base };

export {
  StyledFloatingButton,
  StyledDropDown,
  StyledDropDownItem,
  StyledContainerAction,
  StyledProgressBarContainer,
  StyledMobileProgressBar,
  StyledProgressContainer,
  StyledBar,
  StyledButtonWrapper,
  StyledButtonOptions,
  StyledAlertIcon,
  StyledRenderItem,
};

const getDefaultProgressStyles = ({
  $currentColorScheme,
  theme,
  error,
}: ProgressBarMobileDefaultStyles) =>
  $currentColorScheme &&
  css`
    background: ${error
      ? theme.mainButtonMobile.bar.errorBackground
      : theme.isBase
        ? $currentColorScheme?.main?.accent
        : "#FFFFFF"};
  `;

const StyledProgressBarTheme = styled(StyledBar)(getDefaultProgressStyles);

export { StyledProgressBarTheme };
