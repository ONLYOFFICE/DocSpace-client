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

import { Base } from "@docspace/shared/themes";
import { mobile, tablet, desktop } from "@docspace/shared/utils";

const StyledInfoPanelBody = styled.div`
  height: auto;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding: 0px 20px 24px 3px;
        `
      : css`
          padding: 0px 3px 24px 20px;
        `}
  color: ${(props) => props.theme.infoPanel.textColor};
  background-color: ${(props) => props.theme.infoPanel.backgroundColor};

  .no-item {
    text-align: center;
  }

  .current-folder-loader-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    height: 96px;
    margin-top: 116.56px;
  }

  @media ${mobile} {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 0px 16px 0 8px;
          `
        : css`
            padding: 0px 8px 0 16px;
          `}
  }
`;

const StyledTitle = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding: 24px 20px 24px 0px;
          margin-right: -20px;
        `
      : css`
          padding: 24px 0 24px 20px;
          margin-left: -20px;
        `}

  background: ${(props) => props.theme.infoPanel.backgroundColor};

  display: flex;
  flex-wrap: no-wrap;
  flex-direction: row;
  align-items: center;
  height: 32px;

  .info_title-icons {
    display: flex;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: auto;
          `
        : css`
            margin-left: auto;
          `}
    /* theme.interfaceDirection */
    gap: 14px;
    .icon {
      cursor: pointer;
      path,
      rect {
        fill: ${(props) => props.theme.infoPanel.members.iconColor};
      }
      &:hover {
        path,
        rect {
          fill: ${(props) => props.theme.infoPanel.members.iconHoverColor};
        }
      }
    }
  }

  img {
    &.icon {
      display: flex;
      align-items: center;
      svg {
        height: 32px;
        width: 32px;
      }
    }
    &.is-room {
      border-radius: 6px;
      outline: 1px solid ${(props) => props.theme.itemIcon.borderColor};
    }
  }

  .text {
    font-weight: 600;
    font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
    line-height: 22px;
    max-height: 44px;
    margin: 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .free-label {
    font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
    font-weight: 600;
    line-height: 16px;

    margin: ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? "0 auto 0 0" : "0 0 0 auto"};
  }

  ${(props) =>
    props.withBottomBorder &&
    css`
      width: calc(100% + 20px);
      margin: 0 -20px 0 -20px;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              padding: 23px 23px 23px 0;
            `
          : css`
              padding: 23px 0 23px 20px;
            `}
      border-bottom: ${(props) =>
        `solid 1px ${props.theme.infoPanel.borderColor}`};
    `}

  @media ${desktop} {
    max-width: 360px;
  }

  @media ${tablet} {
    width: 440px;
    padding: 24px 20px 24px 20px;
  }

  @media ${mobile} {
    width: calc(100vw - 24px);
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding: 24px 16px 24px 0;
          `
        : css`
            padding: 24px 0 24px 16px;
          `}

    ${(props) =>
      props.withBottomBorder &&
      css`
        width: calc(100% + 16px);
        ${(props) =>
          props.theme.interfaceDirection === "rtl"
            ? css`
                padding: 23px 16px 23px 0;
              `
            : css`
                padding: 23px 0 23px 16px;
              `}
        margin: 0 -16px 0 -16px;
      `}
  }
`;

const StyledSearchContainer = styled.div`
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 68px;
  width: 100%;
  padding: 0 16px;
  border-radius: 0 0 6px 6px;
  background-color: ${(props) => props.theme.infoPanel.backgroundColor};
  z-index: 101;
  box-shadow: ${({ theme }) => theme.infoPanel.search.boxShadow};
`;

const StyledLink = styled.div`
  display: flex;
  padding: 8px 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  a,
  .link {
    font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    font-weight: 600;
    line-height: 15px;
  }
`;

const StyledSubtitle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding: 24px 0;
`;

const StyledProperties = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  padding-bottom: 20px;

  .property {
    width: 100%;
    display: grid;
    grid-template-columns: 120px 1fr;
    grid-column-gap: 24px;

    -webkit-box-align: center;
    align-items: center;

    .property-title {
      font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
    }

    .property-content {
      max-width: 100%;
      margin: auto 0;
      font-weight: 600;
      font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .property-tag_list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      .property-tag {
        background: red;
        max-width: 195px;
        margin: 0;
        background: ${(props) => props.theme.infoPanel.details.tagBackground};
        p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .property-comment_editor {
      &-display {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .edit_toggle {
          cursor: pointer;
          display: flex;
          flex-direction: row;
          gap: 6px;
          &-icon {
            svg {
              width: 12px;
              height: 12px;
              path {
                fill: ${(props) =>
                  props.theme.infoPanel.details.commentEditorIconColor};
              }
            }
          }
          &-text {
            text-decoration: underline;
            text-decoration-style: dashed;
            text-underline-offset: 2px;
          }
        }
      }

      &-editor {
        display: flex;
        flex-direction: column;
        gap: 8px;
        &-buttons {
          display: flex;
          flex-direction: row;
          gap: 4px;
        }
      }

      .property-content {
        white-space: pre-wrap;
        display: -webkit-box;
        display: -moz-box;
        display: -ms-box;
        word-break: break-word;
        overflow: hidden;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
    }
  }

  .info_details_comments {
    align-items: start;
  }
`;

StyledInfoPanelBody.defaultProps = { theme: Base };
StyledTitle.defaultProps = { theme: Base };

export {
  StyledInfoPanelBody,
  StyledTitle,
  StyledSearchContainer,
  StyledSubtitle,
  StyledProperties,
  StyledLink,
};
