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

import { desktop, isDesktop } from "../../utils";

const StyledRow = styled.div`
  width: 100%;
  height: 32px;
  display: grid;
  grid-template-columns: 32px 1fr 16px;
  grid-template-rows: 1fr;
  grid-column-gap: ${isDesktop() ? "8px" : "12px"};
  margin-bottom: ${isDesktop() ? "16px" : "26px"};
  justify-items: center;
  align-items: center;
`;

const StyledBox = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 16px;
  grid-row-gap: 2px;
  justify-items: ${({ theme }) =>
    theme.interfaceDirection === "rtl" ? `right` : `left`};
  align-items: left;
  box-sizing: border-box;

  ${({ theme }) =>
    theme.interfaceDirection === "rtl"
      ? `padding-left: ${isDesktop() ? "8px" : "12px"};`
      : `padding-right: ${isDesktop() ? "8px" : "12px"};`}

  .first-row-content__mobile {
    max-width: 384px;
    height: 16px;
  }

  .second-row-content__mobile {
    max-width: 176px;
    width: 50%;
  }

  @media ${desktop} {
    grid-template-rows: 16px;
    grid-row-gap: 0;

    .first-row-content__mobile {
      max-width: none;
      height: 20px;
      width: 100%;
    }

    .second-row-content__mobile {
      display: none;
    }
  }
`;

export { StyledRow, StyledBox };
