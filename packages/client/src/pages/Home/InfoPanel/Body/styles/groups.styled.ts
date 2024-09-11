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

export const GroupsContent = styled.div<{}>`
  padding-top: 128px;
  margin-inline-start: auto;

  .group-member {
    height: 48px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .avatar {
    }

    .main-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: start;

      .name-wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;

        .name {
          max-width: 180px;
          font-size: 14px;
          font-weight: 600;
          line-height: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .badge {
        }
      }

      .email {
        max-width: 180px;
        color: ${(props) => props.theme.infoPanel.groups.textColor};
        font-size: 12px;
        line-height: 16px;
        font-style: normal;
        font-weight: 400;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .context-btn-wrapper {
      display: flex;
      flex-direction: row;
      gap: 16px;
      margin-inline-start: auto;
      .group-manager-tag {
        white-space: nowrap;
        color: ${(props) => props.theme.infoPanel.groups.tagColor};
        font-size: 12px;
        font-weight: 600;
        line-height: 16px;
      }
    }
  }
`;
