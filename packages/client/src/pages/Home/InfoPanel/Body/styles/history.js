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
import { zIndex } from "@docspace/shared/themes";
import { injectDefaultTheme } from "@docspace/shared/utils";

const strikethroughStyles = css`
  color: ${(props) => props.theme.infoPanel.history.renamedItemColor};
  text-decoration: line-through;
`;

const StyledHistoryList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledHistorySubtitle = styled.div.attrs(injectDefaultTheme)`
  position: sticky;
  background: ${(props) => props.theme.infoPanel.backgroundColor};
  top: 80px;
  z-index: ${zIndex.sticky};

  padding: 16px 0 12px;
  font-weight: 600;
  font-size: 13px;
  line-height: 20px;
  color: ${(props) => props.theme.infoPanel.history.subtitleColor};
`;

const StyledHistoryBlock = styled.div.attrs(injectDefaultTheme)`
  width: 100%;
  display: flex;
  gap: 8px;
  padding: 8px 0;

  ${({ withBottomDivider, theme }) =>
    withBottomDivider &&
    ` border-bottom: solid 1px ${theme.infoPanel.borderColor}; `}

  .avatar {
    min-width: 32px;
  }

  .info {
    width: 100%;
    overflow: hidden;

    .title {
      font-size: 14px;
      font-weight: 600;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 4px;

      .name {
        font-weight: 600;
        font-size: 14px;
      }

      .date {
        white-space: nowrap;
        display: inline-block;
        align-self: flex-start;
        margin-inline-start: auto;
        font-weight: 600;
        font-size: 12px;
        color: ${(props) => props.theme.infoPanel.history.dateColor};
      }

      .users-counter {
        margin-bottom: 1px;
        font-weight: 600;
        font-size: 14px;
      }
    }
    .without-break {
      word-break: unset;
    }

    .action-title {
      white-space: nowrap;
      &-text {
        font-size: 14px;
        font-weight: 600;
        white-space: wrap;
      }

      .text-combined {
        white-space: nowrap;
        padding-right: 4px;
      }
    }
  }
`;

const StyledHistoryDisplaynameBlock = styled.div`
  .name {
    color: ${(props) => props.theme.infoPanel.history.subtitleColor};
  }
`;

const StyledHistoryBlockMessage = styled.span.attrs(injectDefaultTheme)`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;

  gap: 4px;
  max-width: 100%;

  .main-message {
    max-width: 100%;
    padding-inline-end: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 0px 4px;
  }

  strong {
    max-width: 100%;
    display: inline-block;
    vertical-align: top;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .folder-label,
  .source-folder-label {
    max-width: 100%;
    color: ${(props) => props.theme.infoPanel.history.locationIconColor};
    text-wrap: wrap;
  }

  .source-folder-label {
    color: ${(props) => props.theme.infoPanel.history.messageColor};
  }

  .old-role {
    color: ${(props) => props.theme.infoPanel.history.oldRoleColor};
    font-weight: 600;
    text-decoration: line-through;
  }
`;

const StyledHistoryLink = styled.div`
  width: fit-content;
  max-width: 100%;
  display: inline-flex;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .text {
    font-size: 14px;
    font-weight: 600;
    display: inline-block;
  }

  .link {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    text-decoration: underline dashed;
    text-underline-offset: 2px;
  }

  .space {
    display: inline-block;
    width: 4px;
    height: 15px;
  }
`;

const StyledHistoryBlockTagList = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
`;

const StyledHistoryBlockFilesList = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  border-radius: 3px;
`;

const StyledHistoryBlockFile = styled.div.attrs(injectDefaultTheme)`
  padding: 4px 0px;
  display: flex;
  gap: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: start;

  .icon {
    width: 24px;
    height: 24px;
    margin-inline-end: 5px;
    svg {
      width: 24px;
      height: 24px;
    }
  }

  .item-wrapper,
  .old-item-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid
      ${(props) => props.theme.infoPanel.history.itemBorderColor};
    border-radius: 6px;
    padding: 6px 8px;

    &:hover {
      cursor: pointer;
      background-color: ${(props) =>
        props.theme.infoPanel.history.fileBackgroundColor};
    }
  }

  .old-item-wrapper {
    border: none;
    &:hover {
      cursor: auto;
      background-color: transparent;
    }
  }

  .item-title {
    font-weight: 600;
    font-size: 13px;
    display: flex;
    min-width: 0;
    gap: 0;

    .name {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .exst {
      flex-shrink: 0;
      color: ${(props) => props.theme.infoPanel.history.fileExstColor};
    }

    &.old-item-value {
      .name {
        ${strikethroughStyles}
      }
      .exst {
        ${strikethroughStyles}
      }
    }
  }

  .old-item-title {
    .name,
    .exst {
      ${strikethroughStyles}
    }
  }

  .location-btn {
    margin-inline-start: 8px;
    min-width: 16px;
    opacity: 0;
  }

  &:hover {
    .location-btn {
      opacity: 1;
    }
  }

  .index {
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
  }

  .change-index {
    display: flex;
    align-items: center;
    gap: 4px;

    .arrow-index {
      transform: rotate(-90deg);

      path {
        fill: ${(props) => props.theme.infoPanel.history.renamedItemColor};
      }
    }

    .old-index {
      ${strikethroughStyles}
    }
  }
`;

const StyledHistoryBlockExpandLink = styled.div`
  cursor: pointer;
  font-weight: 400;
  font-size: 13px;
  line-height: 20px;

  &.files-list-expand-link {
    margin-top: 8px;
    margin-inline-start: 5px;
  }

  &.user-list-expand-link {
    display: inline-block;
    position: relative;
    top: 0;
  }

  strong {
    font-weight: 600;
    text-decoration: underline;
    text-decoration-style: dashed;
    text-underline-offset: 2px;
  }
`;

export {
  StyledHistoryList,
  StyledHistorySubtitle,
  StyledHistoryLink,
  StyledHistoryBlock,
  StyledHistoryBlockMessage,
  StyledHistoryBlockFilesList,
  StyledHistoryBlockFile,
  StyledHistoryBlockTagList,
  StyledHistoryBlockExpandLink,
  StyledHistoryDisplaynameBlock,
};
