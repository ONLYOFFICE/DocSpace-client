// (c) Copyright Ascensio System SIA 2010-2024
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
import { Base } from "@docspace/shared/themes";
import { mobile, tablet } from "@docspace/shared/utils";

const StyledAccountsItemTitle = styled.div`
  min-height: 80px;
  height: 80px;
  max-height: 104px;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 16px;
  position: fixed;
  margin-top: -128px;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: -20px;
          padding: 24px 20px 24px 0;
        `
      : css`
          margin-left: -20px;
          padding: 24px 0 24px 20px;
        `}
  width: calc(100% - 40px);
  background: ${(props) => props.theme.infoPanel.backgroundColor};
  z-index: 100;

  @media ${tablet} {
    width: 440px;
    padding: 24px 20px 24px 20px;
  }

  @media ${mobile} {
    width: calc(100vw - 32px);
  }

  .avatar {
    min-width: 80px;
  }

  .info-panel__info-text {
    display: flex;
    flex-direction: column;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .info-panel__info-wrapper {
      display: flex;
      flex-direction: row;
    }

    .badges {
      height: 22px;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: 8px;
            `
          : css`
              margin-left: 8px;
            `}
    }

    .info-text__name {
      font-weight: 700;
      font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
      line-height: 22px;
    }

    .info-text__email {
      font-weight: 600;
      font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
      line-height: 20px;
      color: ${(props) => props.theme.text.disableColor};
      user-select: text;
    }

    .sso-badge {
      margin-top: 8px;
    }
  }

  .context-button {
    padding-top: 24px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: auto;
          `
        : css`
            margin-left: auto;
          `}
  }
`;

StyledAccountsItemTitle.defaultProps = { theme: Base };

const StyledAccountContent = styled.div`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin: 128px 0 0 auto;
        `
      : css`
          margin: 128px auto 0 0;
        `}

  .data__header {
    width: 100%;
    padding: 24px 0;

    .header__text {
      font-weight: 600;
      font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
      line-height: 16px;
    }
  }

  .data__body {
    display: grid;
    grid-template-rows: 28px 28px 28px 1fr;
    grid-template-columns: 80px 1fr;
    grid-gap: 0 24px;
    align-items: center;

    .type-combobox {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: -8px;
            `
          : css`
              margin-left: -8px;
            `}

      .combo-button {
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                padding-right: 8px;
              `
            : css`
                padding-left: 8px;
              `}
      }

      .backdrop-active {
        height: 100%;
        width: 100%;
        z-index: 1000;
      }
    }

    .info_field {
      line-height: 20px;
      height: 20px;
      padding: 4px 0;
    }

    .info_field_groups {
      height: 100%;
    }

    .info_groups {
      display: flex;
      flex-direction: column;
      align-items: start;
      justify-content: center;
    }
  }
`;

export { StyledAccountsItemTitle, StyledAccountContent };
