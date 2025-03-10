// (c) Copyright Ascensio System SIA 2009-2025
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

import styled, { keyframes } from "styled-components";
import { globalColors } from "../../../themes";

export const keyFrameBlue = (props: {
  colorStep_1: string;
  colorStep_2: string;
  colorStep_3: string;
  colorStep_4: string;
}) => keyframes`
    0%   { background: ${globalColors.redRomb};               top: 120px; }
    10%  { background: ${props.colorStep_1};  top: 120px; }
    14%  { background: ${props.colorStep_2};  top: 120px; }
    15%  { background: ${props.colorStep_2};  top: 0;     }
    20%  { background: ${props.colorStep_3};              }
    30%  { background: ${props.colorStep_4};              }
    40%  { top: 120px;                                    }
    100% { background: ${globalColors.redRomb};               top: 120px; }
`;

export const keyFrameRed = (props: {
  colorStep_1: string;
  colorStep_2: string;
  colorStep_3: string;
}) => keyframes`
    0%   { background: ${globalColors.blueRomb};               top: 100px; opacity: 1; }
    10%  { background: ${props.colorStep_1};  top: 100px; opacity: 1; }
    14%  { background: ${props.colorStep_2};  top: 100px; opacity: 1; }
    15%  { background: ${props.colorStep_2};  top: 0;     opacity: 1; }
    20%  { background: ${props.colorStep_2};  top: 0;     opacity: 0; }
    45%  { background: ${props.colorStep_3};  top: 0;                 }
    100% { background: ${globalColors.blueRomb};               top: 100px;             }
`;

export const keyFrameGreen = (props: {
  colorStep_1: string;
  colorStep_2: string;
  colorStep_3: string;
  colorStep_4: string;
}) => keyframes`
    0%   { background: ${globalColors.greenRomb};               top: 110px; opacity: 1; }
    10%  { background: ${props.colorStep_1};  top: 110px; opacity: 1; }
    14%  { background: ${props.colorStep_2};  top: 110px; opacity: 1; }
    15%  { background: ${props.colorStep_2};  top: 0;     opacity: 1; }
    20%  { background: ${props.colorStep_2};  top: 0;     opacity: 0; }
    25%  { background: ${props.colorStep_3};  top: 0;     opacity: 1; }
    30%  { background: ${props.colorStep_4};                          }
    70%  { top: 110px;                                                }
    100% { background: ${globalColors.greenRomb};               top: 110px;             }
`;

const Romb = styled.div<{ size: string }>`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  -ms-transform: rotate(135deg) skew(20deg, 20deg);
  -webkit-transform: rotate(135deg) skew(20deg, 20deg);
  -moz-transform: rotate(135deg) skew(20deg, 20deg);
  -o-transform: rotate(135deg) skew(20deg, 20deg);
  background: red;
  border-radius: 6px;
  animation: movedown 3s infinite ease;
  -moz-animation: movedown 3s infinite ease;
  -webkit-animation: movedown 3s infinite ease;
  -o-animation: movedown 3s infinite ease;
  -ms-animation: movedown 3s infinite ease;
  position: absolute;

  background: ${(props) =>
    (props.color === "blue" && globalColors.blueRomb) ||
    (props.color === "red" && globalColors.redRomb) ||
    (props.color === "green" && globalColors.greenRomb)};

  z-index: ${(props) =>
    (props.color === "blue" && "1") ||
    (props.color === "red" && "3") ||
    (props.color === "green" && "2")};

  animation: ${(props) =>
      (props.color === "blue" && keyFrameBlue(props.theme.rombsLoader.blue)) ||
      (props.color === "red" && keyFrameRed(props.theme.rombsLoader.red)) ||
      (props.color === "green" && keyFrameGreen(props.theme.rombsLoader.green))}
    2s ease-in-out 0s infinite;
`;

const Rombs = ({ size = "40px" }: { size?: string }) => (
  <>
    <Romb color="blue" size={size} data-testid="rombs-loader" />

    <Romb color="green" size={size} />

    <Romb color="red" size={size} />
  </>
);

export { Rombs };
