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
import { Base, globalColors } from "../../themes";
import { ProgressBarMobileDefaultStyles } from "./ProgressPanel.types";

const StyledProgressBarContainer = styled.div<{ isUploading?: boolean }>`
  display: ${(props) => (props.isUploading ? "flex" : "none")};

  align-items: center;

  flex-wrap: wrap;

  width: 100%;

  box-sizing: border-box;

  height: 48px;

  .progress-container {
    width: 100%;

    display: flex;

    align-items: center;
    justify-content: space-between;

    .progress_main-container {
      display: flex;
      gap: 8px;
      width: 100%;
    }
    .progress-header {
      width: 50%;

      line-height: 16px;
      color: ${(props) => props.theme.progressPanel.textColor};
    }
    .progress-loader {
      margin: auto;
      width: 12px;
      height: 12px;
      border: 1px solid transparent;
      border-radius: 50%;
      background-image: linear-gradient(rgb(85, 95, 101), rgb(85, 95, 101)),
        conic-gradient(
          from 0.25turn at 50% 30%,
          rgb(85, 95, 101),
          10deg,
          rgb(85, 95, 101),
          140deg,
          white
        );
      background-origin: border-box;
      background-clip: content-box, border-box;
      animation: loader 1.3s linear infinite;
    }
    @keyframes loader {
      100% {
        transform: rotate(360deg);
      }
    }
    /* .progress_info-container {
      width: 50%;

      display: flex;
      align-items: center;

      .progress_count {
        width: calc(100% - 26px);

        line-height: 16px;
        color: ${(props) => props.theme.mainButtonMobile.textColor};

        text-align: right;
        margin-inline-end: 12px;
      }

      .progress_icon {
        svg {
          path {
            fill: ${(props) => props.theme.mainButtonMobile.bar.icon};
          }
        }
      }
    } */
  }
`;

const StyledMobileProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${(props) =>
    props.theme.mainButtonMobile.mobileProgressBarBackground};
  border-radius: 2px;
`;

const StyledProgress = styled.div<{ uploadPercent: number; error: boolean }>`
  width: ${(props) => props.uploadPercent}%;
  height: 4px;
  opacity: 1;
  background: ${(props) =>
    props.error
      ? props.theme.progressPanel.progress.errorFinish
      : props.uploadPercent < 100
        ? props.theme.progressPanel.progress.inAction
        : props.theme.progressPanel.progress.successFinish};
`;

export { StyledProgressBarContainer, StyledMobileProgressBar, StyledProgress };
