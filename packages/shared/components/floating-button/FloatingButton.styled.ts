import styled, { keyframes, css } from "styled-components";

import { desktop, tablet } from "../../utils/device";
import { Base } from "../../themes";
import { DefaultStylesProps } from "./FloatingButton.types";

const MIN_PERCENTAGE_FOR_DISPLAYING_UPLOADING_INDICATOR = 3;

const StyledCircleWrap = styled.div`
  position: relative;
  z-index: 500;
  width: 48px;
  height: 48px;
  background: ${(props) =>
    props.color ? props.color : props.theme.floatingButton?.backgroundColor};
  border-radius: 50%;
  cursor: pointer;
  box-shadow: ${(props) => props.theme.floatingButton?.boxShadow};
`;

StyledCircleWrap.defaultProps = { theme: Base };

const StyledFloatingButtonWrapper = styled.div<{ showTwoProgress?: boolean }>`
  @media ${desktop} {
    position: absolute;
    z-index: 300;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            left: 0;
          `
        : css`
            right: 0;
          `}

    bottom: ${(props) => (props.showTwoProgress ? "96px" : "0")};

    width: 100px;
    height: 70px;
  }

  .layout-progress-bar_close-icon {
    display: none;
    position: absolute;
    cursor: pointer;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? `left: 77px;` : `right: 77px;`}
    bottom: 33px;
  }
  &:hover {
    .layout-progress-bar_close-icon {
      display: block;
    }
    @media ${tablet} {
      .layout-progress-bar_close-icon {
        display: none;
      }
    }
  }

  @media ${tablet} {
    .layout-progress-bar_close-icon {
      display: none;
    }
  }
`;

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledCircle = styled.div<{ percent: number; displayProgress?: boolean }>`
  .circle__mask,
  .circle__fill {
    width: 42px;
    height: 42px;
    position: absolute;
    border-radius: 50%;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  ${(props) =>
    props.percent > MIN_PERCENTAGE_FOR_DISPLAYING_UPLOADING_INDICATOR
      ? css`
          .circle__mask {
            clip: rect(0px, 42px, 42px, 21px);
          }

          .circle__fill {
            animation: fill-rotate ease-in-out none;

            transform: rotate(${props.percent * 1.8}deg);
          }
        `
      : css`
          .circle__fill {
            animation: ${rotate360} 2s linear infinite;
            transform: translate(0);
          }
        `}

  .circle__mask .circle__fill {
    clip: rect(0px, 21px, 42px, 0px);
    background-color: ${(props) =>
      !props.displayProgress
        ? "transparent !important"
        : props.theme.floatingButton?.color};
  }

  .circle__mask.circle__full {
    animation: fill-rotate ease-in-out none;

    transform: rotate(${(props) => props.percent * 1.8}deg);
  }

  @keyframes fill-rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(${(props) => props.percent * 1.8}deg);
    }
  }
`;

const StyledFloatingButton = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${(props) =>
    props.color ? props.color : props.theme.floatingButton?.backgroundColor};
  text-align: center;
  margin: 5px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`;

StyledFloatingButton.defaultProps = { theme: Base };

const IconBox = styled.div`
  // padding-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    path {
      fill: ${(props) => props.theme.floatingButton?.fill};
    }
  }
`;

IconBox.defaultProps = { theme: Base };

const StyledAlertIcon = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `right: 20px;` : `left: 20px;`}
  top: 0px;

  svg {
    circle {
      fill: ${(props) => props.theme.floatingButton?.alert.fill};
    }
    path {
      fill: ${(props) => props.theme.floatingButton?.alert.path};
    }
  }
`;

export {
  StyledFloatingButtonWrapper,
  StyledCircle,
  StyledCircleWrap,
  StyledFloatingButton,
  StyledAlertIcon,
  IconBox,
};

const getDefaultStyles = ({
  $currentColorScheme,
  color,
  displayProgress,
}: DefaultStylesProps) =>
  $currentColorScheme &&
  css`
    background: ${color || $currentColorScheme.main.accent} !important;

    .circle__background {
      background: ${color || $currentColorScheme.main.accent} !important;
    }

    .icon-box {
      svg {
        path {
          fill: ${$currentColorScheme.text.accent};
        }
      }
    }

    .circle__mask .circle__fill {
      background-color: ${!displayProgress
        ? "transparent !important"
        : $currentColorScheme.text.accent};
    }
  `;

StyledCircleWrap.defaultProps = { theme: Base };

const StyledFloatingButtonTheme = styled(StyledCircleWrap)(getDefaultStyles);

export { StyledFloatingButtonTheme };
