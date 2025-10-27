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

import { DropDown } from "@docspace/shared/components/drop-down";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { injectDefaultTheme, mobile, tablet } from "@docspace/shared/utils";

export const CategoryFilterMobileWrapper = styled.div`
  width: 100%;
  max-width: 280px;
  position: relative;

  .combo-button-label {
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
  }

  @media ${tablet} {
    max-width: 100%;
  }

  @media ${mobile} {
    position: static;
  }
`;

export const CategoryFilterMobile = styled(DropDown)`
  position: fixed;
  top: 36px;
  inset-inline-start: 0;
  width: 100%;

  padding: 6px 0;
  height: ${({ forsedHeight }) => forsedHeight};

  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media ${mobile} {
    top: auto;
    bottom: 0;
  }

  .section-scroll,
  .scroll-body {
    padding-inline-end: 0 !important;
  }
`;

export const CategoryFilterItemMobile = styled(DropDownItem).attrs(
  injectDefaultTheme,
)`
  width: 100%;
  height: 36px;
  box-sizing: border-box;

  font-size: 13px;
  font-weight: 600;
  line-height: 20px;

  padding: 8px 16px;

  ${({ isSeparator }) =>
    isSeparator &&
    css`
      margin: 6px 16px;
    `}

  .submenu-arrow {
    margin-block: 0;
    margin-inline: auto 0;

    svg {
      height: 12px;
      width: 12px;
    }

    ${({ isMobileOpen }) =>
      isMobileOpen &&
      css`
        transform: rotate(270deg);
      `}
  }
`;
