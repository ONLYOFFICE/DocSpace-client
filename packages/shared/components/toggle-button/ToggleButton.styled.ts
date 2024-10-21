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

import styled, { css } from "styled-components";

import { globalColors } from "../../themes";
import { injectDefaultTheme, NoUserSelect } from "../../utils";

import {
  ContainerToggleButtonThemeProps,
  StyledToggleButtonProps,
} from "./ToggleButton.types";

const Container = styled.div`
  display: inline-block;
`;

const ToggleButtonContainer = styled.label.attrs(
  injectDefaultTheme,
)<StyledToggleButtonProps>`
  position: absolute;
  -webkit-appearance: none;
  align-items: start;
  outline: none;
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  ${NoUserSelect};

  display: grid;
  grid-template-columns: min-content auto;
  grid-gap: 8px;

  ${(props) =>
    props.isDisabled
      ? css`
          cursor: default;
        `
      : css`
          cursor: pointer;
        `}

  svg {
    ${(props) =>
      props.isChecked
        ? css`
            rect {
              fill: ${props.isDisabled && props.theme.isBase
                ? props.theme.toggleButton.fillColorOff
                : props.theme.toggleButton.fillColorDefault} !important;

              &:hover {
                opacity: ${!props.isDisabled && "0.85"};
              }
            }

            circle {
              fill: ${props.theme.toggleButton.fillCircleColor};

              opacity: ${props.isDisabled && "0.6"};
            }

            opacity: ${props.isDisabled && "0.6"};
          `
        : css`
            rect {
              fill: ${props.theme.toggleButton.fillColorOff};
            }
            circle {
              fill: ${props.theme.toggleButton.fillCircleColorOff};

              opacity: ${props.isDisabled && "0.6"};
            }

            opacity: ${props.isDisabled && "0.6"};

            &:hover {
              rect {
                fill: ${!props.isDisabled &&
                props.theme.toggleButton.hoverFillColorOff};
              }
            }
          `}
    ${(props) =>
      props.theme.interfaceDirection === "rtl" && "transform: scaleX(-1);"}
  }

  .toggle-button {
    min-width: 28px;
  }

  .toggle-button-text {
    color: ${(props) =>
      props.isDisabled
        ? props.theme.text.disableColor
        : props.theme.text.color};
  }
`;

const HiddenInput = styled.input`
  opacity: 0.0001;
  position: absolute;
  inset-inline-end: 0;
  z-index: -1;
`;

const ContainerToggleButtonTheme = styled(
  Container,
)<ContainerToggleButtonThemeProps>`
  ${({ $currentColorScheme, isChecked, isDisabled, theme }) =>
    $currentColorScheme &&
    css`
      ${ToggleButtonContainer} {
        svg {
          rect {
            fill: ${isChecked && $currentColorScheme.main?.accent} !important;
          }

          circle {
            fill: ${(isChecked &&
              isDisabled &&
              theme.isBase &&
              globalColors.white) ||
            (isChecked && $currentColorScheme.text?.accent)};
          }
        }
      }
    `}
`;

export {
  ToggleButtonContainer,
  HiddenInput,
  Container,
  ContainerToggleButtonTheme,
};
