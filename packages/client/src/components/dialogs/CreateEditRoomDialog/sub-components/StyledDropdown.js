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

import { injectDefaultTheme, mobile } from "@docspace/shared/utils";

import { DropDown } from "@docspace/shared/components/drop-down";
import { globalColors } from "@docspace/shared/themes";

const StyledDropDownWrapper = styled.div`
  width: 100%;
  position: relative;
`;

const StyledDropDown = styled(DropDown).attrs(injectDefaultTheme)`
  margin-top: ${(props) => (props.marginTop ? props.marginTop : "4px")};
  padding: 6px 0;
  background: ${(props) =>
    props.theme.createEditRoomDialog.dropdown.background};
  border: 1px solid
    ${(props) => props.theme.createEditRoomDialog.dropdown.borderColor};
  box-shadow: 0px 12px 40px ${globalColors.popupShadow};
  border-radius: 3px;
  overflow: hidden;
  ${(props) => !props.hasItems && "visibility: hidden"};

  width: 446px;
  max-width: 446px;
  .dropdown-item {
    min-width: 446px;
  }

  @media ${mobile} {
    width: calc(100vw - 34px);
    max-width: calc(100vw - 34px);
    .dropdown-item {
      min-width: calc(100vw - 34px);
    }
  }

  .ScrollbarsCustom {
    .track-vertical {
      height: 100% !important;
    }
    .scroll-body {
      padding-bottom: unset !important;
    }
  }

  .dropdown-item {
    height: 32px !important;
    max-height: 32px !important;
    cursor: pointer;
    box-sizing: border-box;
    width: 100%;
    padding: 6px 8px;
    font-weight: 400;
    font-size: 13px;
    line-height: 20px;

    display: block;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      background: ${(props) =>
        props.theme.createEditRoomDialog.dropdown.item.hoverBackground};
    }

    &-separator {
      height: 7px !important;
      max-height: 7px !important;
    }
  }
`;

export { StyledDropDownWrapper, StyledDropDown };
