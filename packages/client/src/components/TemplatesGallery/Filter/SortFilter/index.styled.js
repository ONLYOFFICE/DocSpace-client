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

import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { mobile } from "@docspace/shared/utils";
import styled, { css } from "styled-components";
import { ComboBox } from "@docspace/shared/components/combobox";

export const SortButton = styled.div`
  .combo-button {
    background: ${(props) =>
      props.theme.filterInput.sort.background} !important;

    .icon-button_svg {
      cursor: pointer;
    }
  }

  .sort-combo-box {
    width: 32px;
    height: 32px;
    padding: 0;
    margin: 0;

    .dropdown-container {
      top: 102%;
      bottom: auto;
      min-width: 200px;
      margin-top: 3px;

      /* @media ${mobile} {
        position: absolute;
        width: 100%;
        bottom: 0;
        inset-inline-end: 0;
        top: auto;
        border-end-start-radius: 0;
        border-end-end-radius: 0;
      }*/
    }

    .optionalBlock {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0 16px;
    }

    .combo-buttons_arrow-icon {
      display: none;
    }

    .backdrop-active {
      display: none;
    }
  }
`;

export const SortComboBox = styled(ComboBox)`
  @media ${mobile} {
    /* position: static; */
  }
`;

export const SortDropdownItem = styled(DropDownItem)`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 200px;
  line-height: 30px;

  .sortorder-arrow {
    width: 16px;
    height: 16px;
    display: flex;
    visibility: hidden;
    cursor: pointer;

    path {
      fill: ${(props) => props.theme.filterInput.sort.sortFill};
    }
  }

  &:hover {
    .sortorder-arrow {
      visibility: visible;
    }
  }

  ${({ isSelected, theme }) =>
    isSelected
      ? css`
          background: ${theme.filterInput.sort.hoverBackground};
          cursor: auto;
          .sortorder-arrow {
            visibility: visible;
          }
        `
      : css`
          .sortorder-arrow {
            pointer-events: none;
          }
        `}

  ${({ $isDescending }) =>
    !$isDescending &&
    css`
      .sortorder-arrow {
        transform: rotate(180deg);
      }
    `}
`;
