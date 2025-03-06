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

import { mobile } from "@docspace/shared/utils";
import styled from "styled-components";

export const Location = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const LocationHeader = styled.div`
  .main {
    width: 100%;
    max-width: 700px;
    font-size: 13px;
    font-weight: 400;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
    line-height: 20px;
    margin-bottom: 8px;
  }

  .third-party-link {
    display: inline-block;
    font-weight: 600;
  }
`;

export const LocationSubheader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
`;

export const LocationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;

  .form-inputs {
    width: 100%;
    max-width: 350px;

    @media ${mobile} {
      max-width: 100%;
    }

    display: flex;
    flex-direction: column;
    gap: 16px;

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        line-height: 20px;
      }

      .icon-button {
        display: none;
      }

      .password-input {
        .icon-button {
          background-color: ${(props) => props.theme.input.backgroundColor};
          display: block;
          margin: -5px;
          padding: 5px;
        }
      }
    }

    .checkbox {
      margin-top: 4px;

      svg {
        margin-inline-end: 8px;
      }
    }

    .password-field-wrapper {
      width: 100%;
    }

    .group-label {
      display: flex;
      gap: 4px;
      line-height: 20px;
    }

    .label-subtitle {
      color: ${(props) => props.theme.client.settings.common.descriptionColor};
    }

    .subtitle {
      color: ${(props) => props.theme.client.settings.integration.textColor};
      font-size: 12px;
    }
  }
`;
