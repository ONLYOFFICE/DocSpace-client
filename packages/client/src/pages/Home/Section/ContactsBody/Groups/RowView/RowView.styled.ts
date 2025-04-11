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
import { isMobile, isTablet } from "react-device-detect";

import {
  RowContainer,
  Row,
  RowContent,
} from "@docspace/shared/components/rows";
import { globalColors } from "@docspace/shared/themes";
import { tablet } from "@docspace/shared/utils/device";

const marginStyles = css`
  margin-inline: -24px;
  padding-inline: 24px;

  @media ${tablet} {
    margin-inline: -16px;
    padding-inline: 16px;
  }
`;

const marginStylesGroupRowContainer = css`
  margin-inline-end: -48px !important;

  @media ${tablet} {
    margin-inline-end: -32px !important;
  }
`;

export const GroupsRowContainer = styled(RowContainer)`
  .row-selected + .row-wrapper:not(.row-selected) {
    .group-row {
      ${marginStyles}
    }
  }

  .row-wrapper:not(.row-selected) + .row-selected {
    .group-row {
      ${marginStyles}
    }
  }

  .row-list-item:first-child {
    .group-row {
      border-top: 2px solid transparent;
    }

    .row-selected {
      .group-row {
        border-top-color: ${(props) =>
          `${props.theme.filesSection.tableView.row.borderColor} !important`};
      }
    }
  }

  .row-list-item {
    margin-top: -1px;
  }
`;

export const GroupsRowWrapper = styled.div<{
  isChecked?: boolean;
  isActive?: boolean;
  value?: string;
}>`
  .group-item {
    border: 1px solid transparent;
    border-inline: none;
    margin-inline-start: 0;
    height: 100%;
    group-select: none;
    position: relative;
    outline: none;
    background: none !important;

    ${(props) =>
      (props.isChecked || props.isActive) && marginStylesGroupRowContainer};

    ${!isMobile &&
    css`
      :hover {
        ${marginStylesGroupRowContainer}
      }
    `}
  }
`;

const checkedStyle = css`
  background: ${({ theme }) => theme.filesSection.rowView.checkedBackground};
  margin-inline-start: -24px;
  padding-inline: 24px;

  @media ${tablet} {
    margin-inline-start: -16px;
    padding-inline: 16px;
  }
`;

export const GroupsRow = styled(Row)<{ checked?: boolean; isActive?: boolean }>`
  &.table-row {
    ${({ checked, isActive }) => (checked || isActive) && checkedStyle};

    ${!isMobile &&
    css`
      &:hover {
        ${checkedStyle}
      }
    `}

    .row_content {
      height: 58px;
      justify-content: center;
    }

    height: 59px;

    border-top: ${(props) =>
      `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
    border-bottom: ${(props) =>
      `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};

    box-sizing: border-box;
    margin-top: -1px;

    position: unset;

    -webkit-tap-highlight-color: ${globalColors.tapHighlight};
    .styled-element {
      height: 32px;
      margin-inline-end: 12px;
    }
    .group-row-element {
      display: flex;
      width: 32px;
      height: 32px;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      line-height: 16px;
      background: ${(props) =>
        props.theme.filesSection.tableView.row.backgroundGroup};
      color: ${(props) => props.theme.filesSection.tableView.row.color};
      border-radius: 50%;
    }
  }
`;

export const GroupsRowContent = styled(RowContent)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;

  ${isTablet &&
  css`
    .row-main-container-wrapper {
      align-self: start;
    }
  `}

  @media ${tablet} {
    .row-main-container-wrapper {
      width: 100%;
      display: flex;
      -webkit-box-pack: justify;
      justify-content: space-between;
      max-width: inherit;
      margin: 0;
    }

    .badges {
      flex-direction: row-reverse;
      margin-inline-end: 12px;
      margin-top: -1px;
    }
  }
`;
