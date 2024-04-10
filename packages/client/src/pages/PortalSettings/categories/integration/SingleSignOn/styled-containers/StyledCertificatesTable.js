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

import styled from "styled-components";

const StyledCertificatesTable = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: 12px;

  .header {
    display: grid;
    align-items: center;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 40px;

    border-bottom: ${(props) =>
      props.theme.client.settings.integration.sso.border};

    &-cell:nth-child(n + 2) {
      display: flex;
      align-items: center;

      border-left: 1px solid #d0d5da;
      height: 13px;
      padding-left: 8px;
    }
  }

  .row {
    max-width: 520px;
    width: 100%;
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 11px 0 10px;
    border-bottom: ${(props) =>
      props.theme.client.settings.integration.sso.border};

    .column {
      display: flex;
      flex-direction: column;
      width: 100%;

      .column-row {
        display: flex;
      }
    }

    .context-btn {
      justify-self: flex-end;
    }
  }
`;

export default StyledCertificatesTable;
