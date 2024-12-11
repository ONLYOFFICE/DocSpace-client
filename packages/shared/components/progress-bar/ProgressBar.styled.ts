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

import styled, { keyframes } from "styled-components";
import { injectDefaultTheme } from "../../utils";

const StyledProgressBarContainer = styled.div.attrs(injectDefaultTheme)`
  .progress-bar_full-text {
    display: block;
    margin-top: 8px;
  }

  .progress-bar_status-text {
    display: block;
    color: ${(props) => props.theme.progressBar.color.status} !important;
  }

  .progress-bar_status-error {
    display: block;
    color: ${(props) => props.theme.progressBar.color.error} !important;
  }
`;

const getLoadingAnimation = (dir: "ltr" | "rtl") => {
  const isRtl = dir === "rtl";
  const startValue = isRtl ? "50%" : "-50%";
  const endValue = isRtl ? "-400%" : "400%";

  return keyframes`
 0% {
    transform: translateX(${startValue});
  }

  100% {
    transform: translateX(${endValue});
  }
`;
};

const StyledProgressBar = styled.div.attrs(injectDefaultTheme)<{
  percent: number;
}>`
  width: 100%;
  height: 4px;
  overflow: hidden;
  border-radius: 3px;
  margin-bottom: 8px;
  background-color: ${(props) => props.theme.progressBar.backgroundColor};

  .progress-bar_percent {
    float: inline-start;
    overflow: hidden;
    max-height: 4px;
    min-height: 4px;
    transition: width 0.6s ease;
    border-radius: 3px;
    width: ${(props) => props.percent}%;
    background: ${(props) => props.theme.progressBar.percent.background};
  }

  .progress-bar_animation {
    height: 100%;
    width: 25%;
    border-radius: 3px;
    background: ${(props) => props.theme.progressBar.percent.background};
    animation: ${({ theme }) => getLoadingAnimation(theme.interfaceDirection)}
      2s linear infinite;
  }
`;

export { StyledProgressBarContainer, StyledProgressBar };
