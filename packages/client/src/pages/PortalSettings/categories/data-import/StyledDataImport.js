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

import styled from "styled-components";
import { tablet, mobile } from "@docspace/shared/utils/device";

const WorkspacesContainer = styled.div`
  max-width: 700px;
  margin-top: 1px;

  @media ${tablet} {
    max-width: 675px;
  }

  @media ${mobile} {
    max-width: 100%;
  }

  .data-import-description {
    color: ${(props) => props.theme.client.settings.migration.descriptionColor};
    line-height: 20px;
    margin-bottom: 20px;
    max-width: 675px;
  }

  .data-import-subtitle {
    margin-bottom: 21px;
    font-weight: 600;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .workspace-list {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 20px;
  }

  .workspace-item {
    background: ${(props) =>
      props.theme.client.settings.migration.workspaceBackground};
    border: ${(props) => props.theme.client.settings.migration.workspaceBorder};
    border-radius: 6px;
    width: 340px;
    height: 64px;
    box-sizing: border-box;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    &:hover {
      border-color: #4781d1;
    }

    &:active {
      background-color: ${(props) =>
        props.theme.client.settings.migration.workspaceBackground};
    }

    @media ${tablet} {
      width: 327.5px;
    }

    @media ${mobile} {
      width: 100%;
    }

    .workspace-logo {
      display: flex;
      align-items: center;
    }
  }
`;

export { WorkspacesContainer };
