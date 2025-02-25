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

import styled from "styled-components";
import { injectDefaultTheme } from "../../../utils";

const StyledPreparationPortalProgress = styled.div.attrs(injectDefaultTheme)<{
  percent?: number;
}>`
  .preparation-portal_progress {
    display: flex;
    margin-bottom: 16px;
    position: relative;
    .preparation-portal_progress-bar {
      padding: 2px;
      box-sizing: border-box;
      border-radius: 6px;
      width: 100%;
      height: 24px;
      background-color: ${(props) =>
        props.theme.preparationPortalProgress.backgroundColor};
    }
    .preparation-portal_progress-line {
      border-radius: 5px;
      width: ${(props) => props.percent}%;
      height: 20px;
      transition-property: width;
      transition-duration: 0.9s;
    }
    .preparation-portal_percent {
      position: absolute;
      font-size: 14px;
      font-weight: 600;
      color: ${(props) =>
        props.percent && props.percent > 50
          ? props.theme.preparationPortalProgress.colorPercentBig
          : props.theme.preparationPortalProgress.colorPercentSmall};
      top: 2px;
      inset-inline-start: calc(50% - 9px);
    }
  }
`;

export default StyledPreparationPortalProgress;
