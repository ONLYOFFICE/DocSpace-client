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

import styled, { css } from "styled-components";

import { mobile, tablet, desktop } from "@docspace/shared/utils";

const StyledOverflowText = css`
  white-space: pre-wrap;
  display: -webkit-box;
  display: -moz-box;
  display: -ms-box;
  word-break: break-word;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const StyledInfoPanelBody = styled.div`
  height: auto;
  padding-block: 0 24px;
  padding-inline: 20px 3px;
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
    padding-block: 0;
    padding-inline: 16px 8px;
  }
`;

const StyledTitle = styled.div<{ withBottomBorder: boolean }>`
  position: sticky;
  top: 0;
  z-index: 100;
  padding-block: 24px;
  padding-inline: 20px 0;
  margin-inline-start: -20px;
  padding-inline-end: 20px;

  background: ${(props) => props.theme.infoPanel.backgroundColor};

  display: flex;
  flex-wrap: no-wrap;
  flex-direction: row;
  align-items: center;
  height: 32px;

  .info_title-icons {
    display: flex;
    margin-inline-start: auto;
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

  .info-panel_header-text {
    margin: 0 8px;
  }

  .text {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    max-height: 44px;
    margin: 0 8px;

    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    text-align: start;
  }

  .file-extension {
    color: ${(props) => props.theme.filesSection.tableView.fileExstColor};
  }

  .free-label {
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;

    margin-block: 0;
    margin-inline: auto 0;
  }

  ${(props) =>
    props.withBottomBorder &&
    css`
      width: calc(100% + 20px);
      margin: 0 -20px;
      padding-block: 23px;
      padding-inline: 20px 0;
      border-bottom: solid 1px ${props.theme.infoPanel.borderColor};
    `}

  @media ${desktop} {
    width: 360px;
  }

  @media ${tablet} {
    width: 440px;
    padding: 24px 20px;
  }

  @media ${mobile} {
    width: calc(100vw - 24px);
    padding-block: 24px;
    padding-inline: 16px 12px;

    ${(props) =>
      props.withBottomBorder &&
      css`
        width: calc(100% + 16px);
        padding-block: 23px;
        padding-inline: 16px 0;
        margin: 0 -16px;
      `}
  }
`;

const StyledSearchContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  inset-inline: 0 -20px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 68px;
  padding: 0 16px;
  border-radius: 0 0 6px 6px;
  background-color: ${(props) => props.theme.infoPanel.backgroundColor};
  z-index: 101;
  box-shadow: ${({ theme }) => theme.infoPanel.search.boxShadow};

  @media ${tablet} {
    inset-inline: 0;
  }

  @media ${mobile} {
    inset-inline: 0 -14px;
  }
`;

const StyledLink = styled.div`
  display: flex;
  padding: 8px 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  a,
  .link {
    font-size: 13px;
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

    -webkit-box-align: baseline;
    align-items: baseline;

    .property-title {
      font-size: 13px;
    }

    .property-content {
      max-width: 100%;
      margin: auto 0;
      font-weight: 600;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .property-tag_list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      .property-tag {
        max-width: 195px;
        margin: 0;

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
        ${StyledOverflowText}
      }
    }
  }

  .info_details_comments {
    align-items: start;
  }

  .info_details_lifetime {
    .property-content {
      ${StyledOverflowText}
    }
  }
`;

export {
  StyledInfoPanelBody,
  StyledTitle,
  StyledSearchContainer,
  StyledSubtitle,
  StyledProperties,
  StyledLink,
};
