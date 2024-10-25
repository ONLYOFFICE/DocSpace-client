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

import React from "react";
import styled, { css } from "styled-components";

import RadioButtonReactSvg from "PUBLIC_DIR/images/radiobutton.react.svg";
import RadioButtonCheckedReactSvg from "PUBLIC_DIR/images/radiobutton.checked.react.svg";

import {
  NoUserSelect,
  commonIconsStyles,
  injectDefaultTheme,
} from "../../utils";

export const RadioButtonIcon = styled(RadioButtonReactSvg)`
  ${commonIconsStyles}
`;
export const RadioButtonCheckedIcon = styled(RadioButtonCheckedReactSvg)`
  ${commonIconsStyles}
`;

const ClearLabel = ({
  spacing,
  isDisabled,
  orientation,
  ...props
}: {
  spacing?: string;
  isDisabled?: boolean;
  orientation?: "horizontal" | "vertical";
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) => <label {...props} />;

const Label = styled(ClearLabel).attrs(injectDefaultTheme)`
  display: flex;
  align-items: center;
  position: relative;
  margin: 0;

  ${NoUserSelect};

  cursor: ${(props) => !props.isDisabled && "pointer"};

  .radio-button {
    margin-inline-end: ${({ theme }) => theme.radioButton.marginBeforeLabel};

    path {
      fill: ${(props) =>
        props.isDisabled
          ? props.theme.radioButton.disableBackground
          : props.theme.radioButton.background};
    }
  }
  .radio-button_text {
    color: ${(props) =>
      props.isDisabled
        ? props.theme.radioButton.textDisableColor
        : props.theme.radioButton.textColor};
  }

  ${(props) =>
    props.isDisabled
      ? css`
          cursor: default;
          path:first-child {
            stroke: ${props.theme.radioButton.disableBorderColor};
          }
          path:nth-child(even) {
            fill: ${props.theme.radioButton.disableFillColor};
          }
        `
      : css`
          cursor: pointer;
          svg {
            path:first-child {
              stroke: ${props.theme.radioButton.borderColor};
            }
            path:nth-child(even) {
              fill: ${props.theme.radioButton.fillColor};
            }
          }

          &:hover {
            svg {
              path:first-child {
                stroke: ${props.theme.radioButton.hoverBorderColor};
              }
            }
          }
        `}

  &:not(:first-child) {
    ${(props) =>
      props.orientation === "horizontal" &&
      `margin-inline-start: ${props.spacing};`};
  }

  &:not(:last-child) {
    ${(props) =>
      props.orientation === "vertical" &&
      css`
        margin-bottom: ${props.spacing};
      `};
  }
`;
const Input = styled.input`
  position: absolute;
  z-index: -1;
  opacity: 0.0001;
`;

export { Label, Input };
