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

import styled from "styled-components";

import { injectDefaultTheme } from "@docspace/shared/utils";

export const GroupMember = styled.div.attrs(injectDefaultTheme)<{
  isExpect: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;

  .avatar {
    min-width: 32px;
    min-height: 32px;
  }

  .user_body-wrapper {
    overflow: auto;
  }

  .info,
  .role-email {
    display: flex;
  }

  .info {
    flex-direction: column;

    .info-box {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .name {
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    ${(props) =>
      props.isExpect && `color: ${props.theme.infoPanel.members.isExpectName}`};
  }

  .email {
    color: ${({ theme }) => theme.sideBarRow.metaDataColor};
    font-size: 12px;
    line-height: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .me-label {
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    color: ${(props) => props.theme.infoPanel.members.meLabelColor};
    padding-inline-start: 8px;
    margin-inline-start: -8px;
  }

  .individual-rights-tooltip {
    margin-inline-start: auto;
  }

  .role-wrapper {
    font-weight: 600;
    font-size: 13px;
    line-height: 20px;
    white-space: nowrap;

    .disabled-role-combobox {
      color: ${(props) =>
        props.theme.infoPanel.members.disabledRoleSelectorColor};

      margin-inline-end: 16px;
    }

    .combo-button {
      padding: 0 8px;
    }
  }
`;
