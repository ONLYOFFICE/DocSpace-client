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

import styled, { css, keyframes } from "styled-components";
import { injectDefaultTheme } from "../../../utils";

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StyledCircle = styled.div.attrs(injectDefaultTheme)<{
  percent: number;
  isAnimation?: boolean;
  inConversion?: boolean;
}>`
  .circle__mask,
  .circle__fill {
    width: 16px;
    height: 16px;
    position: absolute;
    border-radius: 50%;
  }

  ${(props) =>
    props.percent === 0 || (props.isAnimation && props.inConversion)
      ? css`
          .circle__fill {
            animation: ${rotate360} 2s linear infinite;
            transform: translate(0);
          }
        `
      : css`
          .circle__mask {
            clip: rect(0px, 16px, 16px, 8px);
          }

          .circle__fill {
            animation: fill-rotate ease-in-out none;
            transform: rotate(${props.percent * 1.8}deg);
          }
        `}

  .circle__mask .circle__fill {
    clip: rect(0px, 8px, 16px, 0px);
    background-color: var(
      --circle-fill-color,
      ${(props) => props.theme.filesPanels.upload.loadingButton.color}
    );
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

export default StyledCircle;
