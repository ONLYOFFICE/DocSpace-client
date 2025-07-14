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
import { ComboBox } from "@docspace/shared/components/combobox";
import { injectDefaultTheme } from "@docspace/shared/utils";

export const CategoryFilterWrapper = styled.div`
  position: relative;
  width: 220px;
  height: 32px;
  box-sizing: border-box;
`;

export const CategoryFilter = styled(ComboBox)`
  width: 220px;
  box-sizing: border-box;
  padding: 0;

  .combo-button-label {
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;
  }

  .dropdown-container {
    margin-top: 4px;
  }
`;

export const CategoryFilterItem = styled(DropDownItem).attrs(
  injectDefaultTheme,
)`
  width: 220px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  box-sizing: border-box;
  padding: 8px 12px;

  font-size: 12px;
  font-weight: 600;
  line-height: 16px;

  span {
    width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    // logical property won't work here (dir: auto)
    text-align: ${({ theme }) =>
      theme.interfaceDirection !== "rtl" ? `left` : `right`};
  }

  .submenu-arrow {
    margin: 0;
    svg {
      height: 12px;
      width: 12px;
    }
  }
`;

export const CategoryFilterSubList = styled(DropDown).attrs(injectDefaultTheme)`
  position: absolute;
  top: 0;
  margin-top: ${({ marginTop }) => marginTop};
  padding: 4px 0;

  inset-inline-start: calc(100% + 4px);

  max-height: 296px;
  max-width: auto;

  visibility: hidden;
  ${({ open, isSubHovered }) =>
    open &&
    css`
      &:hover {
        visibility: visible;
      }
      ${isSubHovered &&
      css`
        visibility: visible;
      `}
    `}

  &:before {
    content: "";
    position: absolute;

    inset-inline-start: -4px;

    top: 0;
    width: 6px;
    height: 100%;
  }
`;

export const CategoryFilterSubListItem = styled(DropDownItem)`
  width: 208px;
  height: 36px;

  box-sizing: border-box;
  padding: 8px 16px;

  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
`;
