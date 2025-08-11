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

import { tablet, mobile } from "@docspace/shared/utils";

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: ${(props) => props.theme.profile.themePreview.border};
  border-radius: 12px;
  height: 284px;
  width: 318px;
  overflow: hidden;

  @media ${tablet} {
    width: 100%;
  }

  .card-header {
    padding: 11px 19px;
    border-bottom: ${(props) => props.theme.profile.themePreview.border};
    line-height: 20px;
  }

  .floating-btn {
    bottom: 100px !important;
    inset-inline-end: 16px !important;
  }
`;

export const StyledWrapperInterfaceTheme = styled.div`
  width: 100%;
  max-width: 660px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .system-theme-checkbox {
    display: inline-flex;
  }

  .checkbox {
    height: 20px;
    margin-inline-end: 8px !important;
  }

  .system-theme-description {
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    padding-inline-start: 24px;
    max-width: 295px;
    color: ${(props) => props.theme.profile.themePreview.descriptionColor};
  }

  .themes-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;

    @media ${mobile} {
      display: none;
    }
  }

  .mobile-themes-container {
    display: none;

    @media ${mobile} {
      display: flex;
      padding-inline-start: 30px;
    }
  }
`;
