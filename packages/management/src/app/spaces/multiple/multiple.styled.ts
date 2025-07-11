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

"use client";

import styled, { css } from "styled-components";

import {
  RowContainer,
  Row,
  RowContent,
} from "@docspace/shared/components/rows";
import { desktop, mobile } from "@docspace/shared/utils";

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 16px;

  @media ${mobile} {
    width: calc(100% - 32px);
  }
`;

export const StyledRowContainer = styled(RowContainer)`
  @media ${desktop} {
    max-width: 620px;

    .row_content {
      max-width: 508px;
    }
  }
  max-width: 100%;
  border-width: 1px;
  border-style: solid;
  border-color: ${(props) => props.theme?.rowContainer?.borderColor};
  border-bottom: none;
  border-radius: 6px;
`;

export const StyledSpaceRow = styled(Row)`
  padding: 4px 0;

  .styled-element {
    width: 32px;
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-right: 20px;`
        : `margin-left: 20px`}
  }

  .row_context-menu-wrapper {
    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `margin-left: 18px;`
        : `margin-right: 18px;`}
  }

  .logo-icon > div {
    svg {
      width: 32px;
      height: 32px;
    }
  }
`;

export const StyledRowContent = styled(RowContent)<{
  isWizardCompleted: boolean;
}>`
  padding-bottom: 10px;

  .row-main-container-wrapper {
    display: flex;
    justify-content: flex-start;
  }

  .user-container-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;

    .arrow-icon > div,
    .arrow-icon > div > svg {
      width: 12px;
      height: 12px;
      path {
        fill: ${(props) => props.theme.color};
      }
    }

    ${(props) =>
      !props.isWizardCompleted &&
      css`
        .domain-text {
          color: ${({ theme }) => theme.management.textColor};
        }
      `}
  }

  .mainIcons {
    height: 20px;
  }

  .mainIcons:empty {
    height: 0px;
  }

  .spaces_row-current,
  .complete-setup {
    color: ${({ theme }) => theme.management.textColor};
  }

  .row-content_tablet-side-info {
    font-size: 12px;
  }

  @media ${mobile} {
    display: flex;
    align-items: center;

    .row-main-container-wrapper {
      flex-direction: column;
    }

    .mainIcons {
      align-self: flex-start;
    }

    .row-content_tablet-side-info {
      display: none;
    }
  }
`;

export const StyledDomainSettings = styled.div`
  min-width: 350px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .field-container {
    margin-bottom: 4px !important;
  }

  @media ${mobile} {
    max-width: 100%;
  }
`;
