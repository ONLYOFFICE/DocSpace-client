// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import styled, { keyframes, css } from "styled-components";

import { desktop, tablet } from "../../utils/device";
import { DefaultStylesProps } from "./FloatingButton.types";
import { injectDefaultTheme } from "../../utils";

const MIN_PERCENTAGE_FOR_DISPLAYING_UPLOADING_INDICATOR = 3;

const StyledCircleWrap = styled.div.attrs(injectDefaultTheme)`
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

const StyledFloatingButtonWrapper = styled.div<{ showTwoProgress?: boolean }>`
  @media ${desktop} {
    position: absolute;
    z-index: 300;
    inset-inline-end: 0;

    bottom: ${(props) => (props.showTwoProgress ? "96px" : "0")};

    width: 100px;
    height: 70px;
  }

  .layout-progress-bar_close-icon {
    display: none;
    position: absolute;
    cursor: pointer;

    inset-inline-end: 77px;
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
    inset-inline: 0;
    bottom: 0;
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

const StyledFloatingButton = styled.div.attrs(injectDefaultTheme)`
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

const IconBox = styled.div.attrs(injectDefaultTheme)`
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

const StyledAlertIcon = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;

  inset-inline-start: 20px;
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
    background: ${color || $currentColorScheme.main?.accent} !important;

    .circle__background {
      background: ${color || $currentColorScheme.main?.accent} !important;
    }

    .icon-box {
      svg {
        path {
          fill: ${$currentColorScheme.text?.accent};
        }
      }
    }

    .circle__mask .circle__fill {
      background-color: ${!displayProgress
        ? "transparent !important"
        : $currentColorScheme.text?.accent};
    }
  `;

const StyledFloatingButtonTheme = styled(StyledCircleWrap)(getDefaultStyles);

export { StyledFloatingButtonTheme };
