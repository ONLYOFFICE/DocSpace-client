// (c) Copyright Ascensio System SIA 2010-2024
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

import { Base } from "../../themes";
import { mobile } from "../../utils";

import { ComboBox } from "../combobox";

const StyledWrapper = styled(ComboBox)`
  .combo-button {
    padding-left: 8px;
    padding-right: 8px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl" &&
      css`
        padding-left: 8px;
        padding-right: 8px;
      `}
  }

  @media ${mobile} {
    .backdrop-active {
      top: -64px;
      z-index: 560;
    }
    .dropdown-container {
      z-index: 561;
    }
  }
`;

StyledWrapper.defaultProps = { theme: Base };

const StyledItem = styled.div`
  width: auto;

  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  align-content: center;

  padding: 7px 0px;

  line-height: 16px;
  font-style: normal;
`;

StyledItem.defaultProps = { theme: Base };

const StyledItemDescription = styled.div`
  margin: 1px 0px;

  font-size: ${(props) => props.theme.getCorrectFontSize("13px")};
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
  color: ${(props) => props.theme.accessRightSelect.descriptionColor};
`;

StyledItemDescription.defaultProps = { theme: Base };

const StyledItemIcon = styled.img`
  margin-right: 8px;
`;

const StyledItemContent = styled.div`
  width: 100%;
  white-space: normal;
`;

const StyledItemTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export {
  StyledItemTitle,
  StyledItemContent,
  StyledItemIcon,
  StyledItemDescription,
  StyledItem,
  StyledWrapper,
};
