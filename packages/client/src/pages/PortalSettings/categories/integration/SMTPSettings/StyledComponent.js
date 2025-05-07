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

import { mobile } from "@docspace/shared/utils";

const StyledComponent = styled.div`
  max-width: 700px;

  .smtp-settings_description {
    margin-bottom: 8px;
    max-width: 700px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
    line-height: 20px;

    ${(props) =>
      props.withoutExternalLink &&
      css`
        margin-bottom: 20px;
      `};
  }

  .smtp-settings_main-title {
    .link-learn-more {
      display: inline-block;
      margin-bottom: 20px;
      font-weight: 600;
    }
  }
  .smtp-settings_title {
    display: flex;

    span {
      margin-inline-start: 2px;
    }
  }
  .smtp-settings_input {
    margin-bottom: 16px;
    margin-top: 4px;
    max-width: 350px;

    @media ${mobile} {
      max-width: 100%;
    }

    .field-label-icon {
      display: none;
    }
  }
  .smtp-settings_auth {
    margin: 24px 0;

    .smtp-settings_login {
      margin-top: 16px;
    }
    .smtp-settings_toggle {
      position: static;
    }
  }

  .smtp_settings_checkbox {
    width: fit-content;
  }
`;

const ButtonStyledComponent = styled.div`
  margin-top: 20px;

  display: flex;
  gap: 8px;

  @media ${mobile} {
    display: grid;
    gap: 8px;
    grid-template-columns: 1fr;
  }
`;
export { StyledComponent, ButtonStyledComponent };
