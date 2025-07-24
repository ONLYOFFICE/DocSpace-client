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

const StyledBodyContent = styled.div`
  .api-key_name {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 16px;
  }

  .api-key_name-body-container {
    display: flex;
    gap: 4px;
    margin-top: 16px;
  }

  .api-key_lifetime {
    display: flex;
  }

  .api-key_toggle {
    margin-inline-start: auto;
    margin-inline-end: 28px;
  }

  .api-key_lifetime-description {
    color: ${(props) => props.theme.text.disableColor};
  }

  .api-key_lifetime-input-block {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .api-key_lifetime-input {
    max-width: 100px;
  }

  .sticky-indent {
    display: none;
  }

  .api-key_permission-tab {
    width: 100%;
  }

  .api-key_permission-container {
    display: grid;
    grid-template-columns: 1fr minmax(50px, auto) minmax(50px, auto);
    gap: 8px 0;
  }

  .separator {
    padding: 15px 0px 9px;
    margin-bottom: 6px;
    border-bottom: ${(props) => props.theme.oauth.clientForm.headerBorder};
  }

  .api-key_permission-container-text {
    display: flex;
    justify-content: center;
  }

  .api-key_permission-checkbox {
    justify-content: center;
    margin-left: 12px;

    cursor: pointer !important;
  }

  .api-key_permission-row {
    margin-bottom: 8px;
  }
`;

export { StyledBodyContent };
