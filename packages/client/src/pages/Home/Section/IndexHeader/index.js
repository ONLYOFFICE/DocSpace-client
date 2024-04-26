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
import {
  mobile,
  tablet,
  getCorrectBorderRadius,
  getCorrectFourValuesStyle,
} from "@docspace/shared/utils";
import { Text } from "@docspace/shared/components/text";
import RoundedArrowSvgUrl from "PUBLIC_DIR/images/rounded arrow.react.svg?url";
import CrossIconSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";
import { IconButton } from "@docspace/shared/components/icon-button";

const StyledTableIndexMenu = styled.div`
  position: relative;

  background: ${(props) => props.theme.tableContainer.groupMenu.background};
  border-bottom: ${(props) =>
    props.theme.tableContainer.groupMenu.borderBottom};
  box-shadow: ${(props) => props.theme.tableContainer.groupMenu.boxShadow};
  border-radius: ${({ theme }) =>
    getCorrectBorderRadius("0px 0px 6px 6px", theme.interfaceDirection)};

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  margin: 0px 0px 0px -20px;
  padding: 0 20px 0 20px;
  height: 68px;

  z-index: 199;

  @media ${tablet} {
    height: 60px;
  }
  @media ${mobile} {
    height: 48px;
  }

  .table-header_index-separator {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? `border-left: ${props.theme.tableContainer.groupMenu.borderRight};`
        : `border-right: ${props.theme.tableContainer.groupMenu.borderRight};`}
    width: 1px;
    height: 21px;
    margin: ${({ theme }) =>
      getCorrectFourValuesStyle("0 16px 0 20px", theme.interfaceDirection)};

    @media ${tablet} {
      height: 36px;
    }

    @media ${mobile} {
      height: 20px;
    }
  }

  .table-header_reorder-icon {
    margin-right: 8px;
  }

  .table-header_index-container {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .table-header_reorder-container {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
`;

const TableIndexHeader = ({ setIsIndexEditingMode, t }) => {
  return (
    <StyledTableIndexMenu>
      <div className="table-header_index-container">
        <Text fontSize="14px" lineHeight="16px" fontWeight={600}>
          {t("Common:SortingIndex")}
        </Text>

        <div className="table-header_index-separator" />
        <div className="table-header_reorder-container">
          <IconButton
            className="table-header_reorder-icon"
            size="16"
            onClick={() => {}}
            iconName={RoundedArrowSvgUrl}
            isFill={true}
            isClickable={false}
          />
          <Text fontSize="12px" lineHeight="16px" fontWeight={600}>
            {t("Common:Reorder")}
          </Text>
        </div>
      </div>
      <IconButton
        className="table-header_cross-icon"
        size="16"
        onClick={() => setIsIndexEditingMode(false)}
        iconName={CrossIconSvgUrl}
        isFill={true}
        isClickable={false}
      />
    </StyledTableIndexMenu>
  );
};

export default TableIndexHeader;
