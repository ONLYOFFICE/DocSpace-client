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
import { mobile, tablet } from "@docspace/shared/utils";

const StyledUsersTitle = styled.div`
  min-height: 80px;
  height: 80px;
  max-height: 104px;
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 16px;
  position: sticky;
  top: 0;
  margin-inline-start: -20px;
  padding-block: 24px;
  padding-inline: 20px 0;
  background: ${(props) => props.theme.infoPanel.backgroundColor};
  z-index: 100;

  @media ${tablet} {
    width: 440px;
    padding: 24px 20px;
  }

  @media ${mobile} {
    width: calc(100vw - 32px);
    padding-inline-end: 0;
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
      margin-inline-start: 8px;
    }

    .info-text__name {
      font-weight: 700;
      font-size: 16px;
      line-height: 22px;
    }

    .info-text__email {
      font-weight: 600;
      font-size: 13px;
      line-height: 20px;
      color: ${(props) => props.theme.infoPanel.nameColor};
      user-select: text;
    }

    .sso-badge,
    .ldap-badge {
      margin-top: 8px;
    }
  }

  .context-button {
    margin-inline-start: auto;
  }
`;

const StyledUsersContent = styled.div`
  margin-block: 0;
  margin-inline: 0 auto;

  .data__header {
    width: 100%;
    padding: 24px 0;

    .header__text {
      font-weight: 600;
      font-size: 14px;
      line-height: 16px;
    }
  }

  .data__body {
    display: grid;
    grid-template-rows: 28px 28px 28px 1fr;
    grid-template-columns: fit-content(50%) 1fr;
    grid-gap: 0 24px;
    align-items: center;

    .type-combobox {
      margin-inline-start: -8px;

      .combo-button {
        padding-inline-start: 8px;
      }

      .backdrop-active {
        height: 100%;
        width: 100%;
        z-index: 1000;
      }
    }

    .info_field {
      line-height: 20px;

      padding: 4px 0;
    }

    .info_field_groups {
      margin-top: 8px;
      height: 100%;
    }

    .info_groups {
      align-self: start;
      margin-top: 4px;
      display: flex;
      flex-direction: column;
      align-items: start;
      justify-content: center;
      overflow: hidden;
    }
  }
`;

export { StyledUsersTitle, StyledUsersContent };
