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
import { mobile } from "@docspace/shared/utils";

export const StyledFooter = styled.div`
  .session-logout {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    font-weight: 600;
  }
  .icon-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 4px;
          `
        : css`
            margin-left: 4px;
          `}
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2px;
`;

export const TableHead = styled.thead`
  font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  line-height: 16px;
`;

export const TableRow = styled.tr`
  display: table-row;
`;

export const TableHeaderCell = styled.th`
  border-top: 1px solid ${(props) => props.theme.activeSessions.borderColor};
  border-bottom: 1px solid ${(props) => props.theme.activeSessions.borderColor};
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          text-align: right;
        `
      : css`
          text-align: left;
        `}
  font-weight: 600;
  padding: 12px 0;
  color: #a3a9ae;
  position: relative;
  border-top: 0;

  :not(:first-child):before {
    content: "";
    position: absolute;
    top: 17px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            right: -8px;
          `
        : css`
            left: -8px;
          `}
    width: 1px;
    height: 10px;
    background: ${(props) => props.theme.activeSessions.sortHeaderColor};
  }
`;

export const TableBody = styled.tbody`
  font-size: ${(props) => props.theme.getCorrectFontSize("11px")};
`;

export const TableDataCell = styled.td`
  border-top: 1px solid ${(props) => props.theme.activeSessions.borderColor};
  border-bottom: 1px solid ${(props) => props.theme.activeSessions.borderColor};
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          text-align: right;
        `
      : css`
          text-align: left;
        `}
  font-weight: 600;
  padding: 14px 0;
  color: #a3a9ae;

  .tick-icon {
    svg {
      path {
        fill: ${(props) => props.theme.activeSessions.tickIconColor};
      }
    }
  }

  .remove-icon {
    svg {
      path {
        fill: ${(props) => props.theme.activeSessions.removeIconColor};
      }
    }
  }

  @media ${mobile} {
    .session-browser {
      position: relative;
      top: 4px;
      max-width: 150px;
      display: inline-block;
      margin-left: 0 !important;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      span {
        width: 100%;
      }
    }
  }

  :first-child {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    color: ${(props) => props.theme.activeSessions.color};
    span {
      color: #a3a9ae;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 5px;
            `
          : css`
              margin-left: 5px;
            `}
    }
  }

  .session-date {
    position: relative;

    ${(props) =>
      props.theme.interfaceDirection === "ltr"
        ? css`
            margin-right: 8px;
            margin-left: 0 !important;
            :after {
              content: "";
              position: absolute;
              top: 4px;
              right: -8px;
              width: 1px;
              height: 12px;
              background: ${(props) =>
                props.theme.activeSessions.sortHeaderColor};
            }
          `
        : css`
            margin-left: 8px;
            margin-right: 0 !important;
          `}
  }

  .session-ip {
    position: relative;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        :after {
          content: "";
          position: absolute;
          top: 4px;
          right: -8px;
          width: 1px;
          height: 12px;
          background: ${(props) => props.theme.activeSessions.sortHeaderColor};
        }
      `}
  }

  :last-child {
    text-align: center;
  }
  .remove-icon {
    svg {
      cursor: pointer;
      width: 20px;
      height: 20px;
      path {
        fill: #a3a9ae;
      }
    }
  }
`;
