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

const StyledSsoPage = styled.div`
  max-width: 100%;
  box-sizing: border-box;
  outline: none;

  .intro-text {
    width: 100%;
    max-width: 700px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
    margin-bottom: 20px;
    line-height: 20px;
  }

  .field-input {
    ::placeholder {
      font-size: 13px;
      font-weight: 400;
    }
  }

  .field-label-icon {
    align-items: center;
    margin-bottom: 4px;
  }

  .xml-input {
    .field-label-icon {
      margin-bottom: 8px;
      max-width: 350px;
    }

    .field-label {
      font-weight: 400;
    }
  }

  .or-text {
    margin: 0 24px;
  }

  .radio-button-group {
    margin-inline-start: 24px;
  }

  .combo-button-label {
    max-width: 100%;
  }

  .save-button {
    margin-inline-end: 8px;
  }

  .download-button {
    width: fit-content;
  }

  .service-provider-settings {
    box-sizing: border-box;
    display: ${(props) => (!props.hideSettings ? "none" : "block")};
  }

  .sp-metadata {
    box-sizing: border-box;
    display: ${(props) => (!props.hideMetadata ? "none" : "block")};
  }

  .metadata-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 16px;
    max-width: 350px;

    .input {
      width: 350px;
    }

    .label > div {
      display: inline-flex;
      margin-inline-start: 4px;
    }
  }
`;

export default StyledSsoPage;
