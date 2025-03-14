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

const StyledLdapPage = styled.div`
  box-sizing: border-box;
  max-width: ${(props) => (props.isSmallWindow ? "100%" : "700px")};
  width: 100%;

  .intro-text {
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  .settings_unavailable-box {
    margin: 8px 0 24px 0;
  }

  .ldap-disclaimer {
    font-size: 12px;
  }

  .toggle {
    position: static;
    margin-top: 1px;
    .toggle-button-text {
      font-size: 14px;
      font-weight: 600;
      position: relative;
      bottom: 2px;
    }
  }

  .toggle-caption {
    display: flex;
    flex-direction: column;
    gap: 4px;
    .toggle-caption_title {
      display: flex;
      .toggle-caption_title_badge {
        margin-inline-start: 4px;
        cursor: auto;
      }
    }
  }

  .hide-button {
    margin-inline-start: 12px;
  }

  .ldap_checkbox-container {
    box-sizing: border-box;
    margin: 20px 0 20px 0;

    .ldap_radio_buttons_group {
      display: grid;
      grid-template-rows: 1fr 1fr;
      grid-gap: 6px;
      margin-top: 12px;

      .ldap_checkbox-header {
        display: flex;
        align-items: baseline;
        .help-icon {
          padding-inline-start: 6px;
          position: relative;
          bottom: 4px;
        }
      }
    }
  }

  .ldap_connection-container {
    box-sizing: border-box;
    margin: 20px 0 28px;
    display: grid;
    grid-gap: 12px;
  }

  .ldap_attribute-mapping {
    box-sizing: border-box;
    margin-top: 16px;
    margin-bottom: 12px;
    display: grid;
    grid-gap: 12px;
  }

  .ldap_users-type-box {
    box-sizing: border-box;
    margin: 24px 0;

    .ldap_users-type-box-title {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 0 0 12px 0;

      .ldap_users-type-title {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        gap: 4px;
      }
    }
  }

  .access-selector-wrapper {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 12px;

    @media ${mobile} {
      width: 100%;
      grid-template-columns: 1fr 0;
      grid-gap: 0;
    }

    .access-selector {
      margin-inline-end: 0 !important;
      margin-top: -4px;
    }
  }

  .group_membership-header,
  .ldap_authentication-header,
  .ldap_advanced-settings-header {
    display: flex;
    align-items: baseline;
    .help-icon {
      padding-inline-start: 6px;
      position: relative;
      bottom: 2px;
    }
  }

  .group_membership-container {
    box-sizing: border-box;
    margin-top: 18px;
    margin-bottom: 12px;
    display: grid;
    grid-gap: 12px;
  }

  .group_membership-container,
  .ldap_attribute-mapping,
  .ldap_connection-container,
  .ldap_authentication {
    ${(props) =>
      !props.isMobileView &&
      css`
        grid-template-columns: 1fr 1fr;
      `}
  }

  .ldap_cron-title {
    margin-top: 20px;
  }

  .ldap_cron-container {
    margin: 12px 0;
  }

  .ldap_group-filter {
    ${(props) =>
      !props.isMobileView &&
      css`
        grid-column: span 2;
      `}
  }

  .ldap_connection_type-text,
  .ldap_attribute-mapping-text {
    display: flex;
    align-items: baseline;

    .help-icon {
      margin-inline-start: 4px;
    }
  }

  .ldap_authentication {
    box-sizing: border-box;
    margin: 16px 0;
    display: grid;
    grid-gap: 12px;
  }
  .ldap_advanced-settings {
    box-sizing: border-box;
    p:first-child {
      margin-bottom: 16px;
    }

    .ldap_checkbox-send-welcome-email {
      margin-bottom: 8px;
    }

    margin-bottom: ${(props) => (props.isMobileView ? "40" : "28")}px;
  }

  .ldap_sync-container {
    ${(props) =>
      !props.isMobileView &&
      css`
        margin: 16px 0;

        .sync-description {
          margin-top: 8px;
        }
      `}
  }

  .ldap_progress-container {
    box-sizing: border-box;
    margin-top: 16px;
    height: 32px;
    width: 350px;

    ${(props) =>
      props.isMobileView &&
      css`
        padding-inline-start: 16px;
      `}
  }

  .manual-sync-button,
  .auto-sync-button {
    margin-top: 16px;
  }

  .field-label {
    .help-icon {
      padding-inline-start: 2px;
      position: relative;
      bottom: 0px;
    }
  }

  @media ${mobile} {
    .ldap-disclaimer {
      margin-top: 24px;
    }
  }
`;

export default StyledLdapPage;
