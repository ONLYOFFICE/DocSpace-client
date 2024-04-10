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
import { Text } from "@docspace/shared/components/text";

const StyledText = styled(Text)`
  display: inline-block;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: 12px;
        `
      : css`
          margin-right: 12px;
        `}
`;

const StyledTypeCell = styled(StyledText)`
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" &&
    css`
      display: flex;
      justify-content: flex-start;

      span {
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .type {
        flex-shrink: 0;
        flex-grow: 1;
        flex-basis: 0;
      }

      .extension {
        flex-shrink: 1;
        flex-grow: 0;
      }
    `}
`;

const StyledAuthorCell = styled.div`
  display: flex;
  width: 100%;
  overflow: hidden;

  .author-avatar-cell {
    width: 16px;
    min-width: 16px;
    height: 16px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 8px;
          `
        : css`
            margin-right: 8px;
          `}
  }
`;

export { StyledText, StyledAuthorCell, StyledTypeCell };
