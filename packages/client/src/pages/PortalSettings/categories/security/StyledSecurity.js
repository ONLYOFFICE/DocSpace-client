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

import { Base } from "@docspace/shared/themes";
import { mobile } from "@docspace/shared/utils";

export const MainContainer = styled.div`
  width: 100%;

  .subtitle {
    margin-bottom: 20px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  .settings_tabs {
    padding-bottom: 16px;
  }

  .page_loader {
    position: fixed;

    ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? `right: 50%;` : `left: 50%;`}
  }

  .category-item-description {
    margin-top: 8px;
    max-width: 700px;

    .link-learn-more {
      display: inline-block;
      margin: 4px 0 16px 0;
      font-weight: 600;
    }

    p {
      color: ${(props) => props.theme.client.settings.common.descriptionColor};
    }

    @media ${mobile} {
      padding-right: 8px;
    }
  }
`;

MainContainer.defaultProps = { theme: Base };

export const StyledCategoryWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  margin-bottom: 8px;
  align-items: center;
`;

export const StyledTooltip = styled.div`
  .subtitle {
    margin-bottom: 10px;
  }
`;

export const LearnMoreWrapper = styled.div`
  display: none;

  .link-learn-more {
    font-weight: 600;
  }

  p {
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  @media ${mobile} {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    padding-right: 8px;
    line-height: 20px;
  }

  .page-subtitle {
    color: ${(props) =>
      props.theme.client.settings.security.descriptionColor} !important;
  }

  .learn-subtitle {
    margin-bottom: 10px;
  }
`;

export const StyledBruteForceProtection = styled.div`
  width: 100%;

  .brute-force-protection-input {
    width: 100%;
    max-width: 350px;
  }

  .error-label {
    font-size: ${(props) => props.theme.getCorrectFontSize("10px")};
  }

  .save-cancel-buttons {
    margin-top: 24px;
  }

  .input-container {
    margin-bottom: 8px;
    margin-right: 8px;
  }

  .mobile-description {
    margin-bottom: 12px;
  }

  .description {
    max-width: 700px;
    padding-bottom: 19px;

    .page-subtitle {
      line-height: 20px;
      padding-right: 8px;
      color: ${(props) =>
        props.theme.client.settings.security.descriptionColor};
      padding-bottom: 7px;
    }

    .link {
      line-height: 15px;
      font-weight: 600;

      text-decoration: underline;
    }

    @media ${mobile} {
      padding-bottom: 20px;
    }
  }
`;
