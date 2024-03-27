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

import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import styled, { css } from "styled-components";
import Base from "@docspace/shared/themes/base";
import { ComboBox } from "@docspace/shared/components/combobox";
import { mobile } from "@docspace/shared/utils";

export const LanguageFilter = styled.div`
  width: 41px;
  box-sizing: border-box;

  .dropdown-container {
    width: 100%;
    box-sizing: border-box;
    margin-top: 4px;
  }
`;

export const LanguangeComboBox = styled(ComboBox)`
  width: 41px;
  padding: 0;
  box-sizing: border-box;

  .combo-button {
    padding: 8px;
    gap: 4px;

    .optionalBlock {
      margin: 0;
      & > div {
        width: 16px;
        height: 16px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .combo-button-label {
      display: none;
    }

    .combo-buttons_arrow-icon {
      margin: 0;
    }
  }
`;

export const LanguageFilterSelectedItem = styled(DropDownItem)`
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;

  .drop-down-icon {
    margin: 0;
    width: 16px;
    height: 16px;
    & > div {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

export const LanguageFilterItem = styled(DropDownItem)`
  height: 32px;
  width: 41px;
  box-sizing: border-box;
  padding: 8px;

  display: flex;
  align-items: center;
  justify-content: center;

  ${({ isSelected, theme }) =>
    isSelected &&
    css`
      background-color: ${theme.dropDownItem.hoverBackgroundColor};
    `}

  .drop-down-icon {
    margin: 0;
    width: 16px;
    height: 16px;
    line-height: 0 !important;
  }

  @media ${mobile} {
    height: 36px;
    width: 100%;
    justify-content: start;
    gap: 8px;
  }
`;

LanguageFilterItem.defaultProps = { theme: Base };
