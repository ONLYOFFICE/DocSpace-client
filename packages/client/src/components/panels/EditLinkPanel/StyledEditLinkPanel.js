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
import { Scrollbar } from "@docspace/shared/components/scrollbar";

const StyledEditLinkBodyContent = styled.div`
  padding: 4px 0px 0px;

  .edit-link_link-block {
    padding: 16px 16px 20px;

    .edit-link-text {
      display: inline-flex;
      margin-bottom: 8px;
    }

    .edit-link_required-icon {
      display: inline-flex;
      color: ${(props) => props.theme.editLink.requiredColor};
      margin-inline-start: 2px;
    }

    .edit-link_link-input {
      margin-bottom: 8px;
      margin-top: 16px;

      -webkit-text-fill-color: ${({ theme }) =>
        theme.editLink.editInputColor} !important;
      color: ${({ theme }) => theme.editLink.editInputColor};
    }
  }

  .edit-link-toggle-block {
    padding: 0 16px 20px;
    border-top: ${(props) => props.theme.filesPanels.sharing.borderBottom};

    .edit-link-toggle-header {
      display: flex;
      padding-top: 20px;
      padding-bottom: 8px;
      gap: 8px;

      .edit-link-toggle {
        margin-inline: auto 28px;
      }
    }
    .edit-link_password-block {
      margin-top: 8px;
    }

    .password-field-wrapper {
      width: 100%;
    }
  }

  .edit-link-toggle-description {
    color: ${({ theme }) => theme.editLink.text.color};
  }

  .edit-link-toggle-description_expired {
    color: ${({ theme }) => theme.editLink.text.errorColor};
  }

  .edit-link_password-block {
    width: 100%;
    display: flex;

    .edit-link_password-input {
      width: 100%;
    }

    .edit-link_generate-icon {
      margin-block: 16px 0;
      margin-inline: 8px 0;
    }
  }

  .edit-link-panel {
    .scroll-body {
      padding-inline-end: 0 !important;
    }
  }

  .field-label-icon {
    display: none;
  }

  .edit-link_password-links {
    display: flex;
    gap: 12px;
    margin-top: -8px;
  }

  .edit-link_header {
    padding: 0 16px;
    border-bottom: ${(props) => props.theme.filesPanels.sharing.borderBottom};

    .edit-link_heading {
      font-weight: 700;
      font-size: 18px;
    }
  }

  .public-room_date-picker {
    padding-top: 8px;
    ${({ isExpired }) =>
      isExpired &&
      css`
        color: ${({ theme }) => theme.datePicker.errorColor};
      `};
  }
`;

const StyledScrollbar = styled(Scrollbar)`
  position: relative;
  padding: 16px 0;
  height: calc(100% - 150px) !important;
`;

const StyledButtons = styled.div`
  box-sizing: border-box;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 10px;

  position: absolute;
  bottom: 0px;
  width: 100%;
  background: ${(props) => props.theme.filesPanels.sharing.backgroundButtons};
  border-top: ${(props) => props.theme.filesPanels.sharing.borderTop};
`;

export {
  // StyledEditLinkPanel,
  StyledScrollbar,
  StyledButtons,
  StyledEditLinkBodyContent,
};
