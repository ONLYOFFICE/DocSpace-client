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
import { tablet } from "@docspace/shared/utils";

export const StyledHeader = styled.div`
  position: relative;

  display: flex;
  align-items: center;

  .action-button {
    width: 100%;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-direction: row;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 17px;
          `
        : css`
            margin-left: 17px;
          `}
    @media ${tablet} {
      flex-direction: row-reverse;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: auto;
            `
          : css`
              margin-left: auto;
            `}
      & > div:first-child {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                padding: 8px 0px 8px 16px;
                margin-left: -16px;
              `
            : css`
                padding: 8px 16px 8px 0px;
                margin-right: -16px;
              `}
      }
    }

    .tariff-bar {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: auto;
            `
          : css`
              margin-left: auto;
            `}
    }
  }
  .arrow-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        transform: scaleX(-1);
      `}
    @media ${tablet} {
      padding: 8px 16px 8px 16px;
      margin-left: -16px;
      margin-right: -16px;
    }

    padding-top: 1px;
    width: 17px;
    min-width: 17px;
  }

  .header-headline {
    white-space: nowrap;
    line-height: 25px;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 17px;
          `
        : css`
            margin-left: 17px;
          `}
  }
`;
