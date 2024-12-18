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

interface StyledHeaderContainerProps {
  withoutBorder?: boolean;
  headerHeight?: string;
}

export const StyledHeaderContainer = styled.div<StyledHeaderContainerProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin: 0 16px;
  height: ${(props) => (props.headerHeight ? props.headerHeight : "53px")};
  min-height: ${(props) => (props.headerHeight ? props.headerHeight : "53px")};
  position: relative;

  .additional-icons-container {
    display: flex;
    margin-inline: 16px 16px;
    gap: 16px;
  }

  .heading {
    font-family: ${(props) => props.theme.fontFamily};
    color: ${(props) => props.theme.modalDialog.textColor};
    font-weight: 700;
    font-size: 21px;
  }

  .arrow-button {
    margin-inline: 0 12px;

    svg {
      ${({ theme }) =>
        theme.interfaceDirection === "rtl" && `transform: scaleX(-1);`}
    }
  }
  .close-button {
    margin-inline: auto 0;
    min-width: 17px;
  }
  .header-component {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  ${(props) =>
    !props.withoutBorder &&
    css`
      ::after {
        content: "";
        border-bottom: ${(props) =>
          `1px solid ${props.theme.modalDialog.headerBorderColor}`};
        width: calc(100% + 32px);
        position: absolute;
        inset-inline-end: -16px;
        bottom: 0;
      }
    `}
`;
