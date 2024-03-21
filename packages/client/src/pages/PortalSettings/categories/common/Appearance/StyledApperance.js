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

import { mobile } from "@docspace/shared/utils";
import PlusThemeSvgUrl from "PUBLIC_DIR/images/plus.theme.svg?url";
import styled, { css } from "styled-components";

const StyledComponent = styled.div`
  width: 100%;
  max-width: 575px;

  .header {
    font-weight: 700;
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    line-height: 22px;
  }

  .preview-header {
    padding-bottom: 20px;
  }

  .theme-standard-container {
    padding-top: 21px;
  }

  .theme-name {
    font-size: ${(props) => props.theme.getCorrectFontSize("15px")};
    line-height: 16px;
    font-weight: 600;
  }

  .theme-container {
    padding: 12px 0 24px 0;
    display: flex;
  }

  .custom-themes {
    display: flex;
  }

  .theme-add {
    width: 46px;
    height: 46px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 12px;
          `
        : css`
            margin-right: 12px;
          `}
    border-radius: 8px;
    cursor: pointer;
    background: ${(props) => (props.theme.isBase ? "#eceef1" : "#474747")}
      url(${PlusThemeSvgUrl}) no-repeat center;
  }

  .add-theme {
    background: #d0d5da;
    padding-top: 16px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-right: 16px;
          `
        : css`
            padding-left: 16px;
          `}
    box-sizing: border-box;
  }

  .buttons-container {
    display: flex;
    padding-top: 24px;

    .button:not(:last-child) {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 8px;
            `
          : css`
              margin-right: 8px;
            `}
    }
    @media ${mobile} {
      .button {
        width: 100%;
      }
    }

    ${({ isShowDeleteButton }) =>
      isShowDeleteButton &&
      css`
        @media ${mobile} {
          flex-direction: column;
          gap: 8px;
          margin: 0;

          .button:not(:last-child) {
            margin-right: 0px;
          }
        }
      `}
  }

  .check-img {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 16px 15px 0 0;
          `
        : css`
            padding: 16px 0 0 15px;
          `}
    svg path {
      fill: ${(props) => props.colorCheckImg};
    }
  }
`;

const StyledTheme = styled.div`
  width: 46px;
  height: 46px;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: 12px;
        `
      : css`
          margin-right: 12px;
        `}
  border-radius: 8px;
  cursor: pointer;

  .check-hover {
    visibility: hidden;
  }

  &:hover {
    .check-hover {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding: 16px 15px 0 0;
            `
          : css`
              padding: 16px 0 0 15px;
            `}
      visibility: visible;
      opacity: 0.5;
      svg path {
        fill: ${(props) => props.colorCheckImgHover};
      }
    }
  }
`;
export { StyledComponent, StyledTheme };
