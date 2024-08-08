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

import React from "react";
import styled, { css } from "styled-components";
import { isMobile } from "react-device-detect";

import { Row } from "@docspace/shared/components/row";
import { Base, globalColors } from "@docspace/shared/themes";

import withContent from "SRC_DIR/HOCs/withPeopleContent";

import UserContent from "./userContent";
import { mobile, tablet } from "@docspace/shared/utils";

const marginStyles = css`
  margin-inline-start: -24px;
  padding-inline: 24px;

  @media ${tablet} {
    margin-inline-start: -16px;
    padding-inline: 16px;
  }
`;

const marginStylesUserRowContainer = css`
  margin-inline-end: -48px !important;

  @media ${tablet} {
    margin-inline-end: -32px !important;
  }
`;

const checkedStyle = css`
  background: ${(props) => props.theme.filesSection.rowView.checkedBackground};
  ${marginStyles}
`;

const StyledWrapper = styled.div`
  .user-item {
    border: 1px solid transparent;
    border-inline: none;
    margin-inline-start: 0;
    height: 100%;
    user-select: none;

    position: relative;
    outline: none;
    background: none !important;
  }

  .user-row-container {
    ${(props) =>
      (props.checked || props.isActive) && marginStylesUserRowContainer};

    ${!isMobile &&
    css`
      :hover {
        ${marginStylesUserRowContainer}
      }
    `}
  }
`;

StyledWrapper.defaultProps = { theme: Base };

const StyledSimpleUserRow = styled(Row)`
  ${(props) => (props.checked || props.isActive) && checkedStyle};

  .row_content {
    height: 58px;
  }

  height: 59px;

  border-top: ${(props) =>
    `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
  border-bottom: ${(props) =>
    `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};

  box-sizing: border-box;
  margin-top: -1px;

  ${!isMobile &&
  css`
    :hover {
      ${checkedStyle}
    }
  `}

  position: unset;
  -webkit-tap-highlight-color: ${globalColors.tapHighlight};

  .styled-element {
    height: 32px;
    margin-inline-end: 12px;
  }
`;

const SimpleUserRow = (props) => {
  const {
    item,
    sectionWidth,
    getContextModel,
    checkedProps,
    onContentRowSelect,
    onUserContextClick,
    element,
    isActive,
    value,
  } = props;

  const isChecked = checkedProps.checked;

  const onRowContextClick = React.useCallback(
    (rightMouseButtonClick) => {
      onUserContextClick?.(item, !rightMouseButtonClick);
    },
    [item, onUserContextClick],
  );

  return (
    <StyledWrapper
      className={`user-item row-wrapper ${
        isChecked || isActive ? "row-selected" : ""
      } ${item.id}`}
      value={value}
      checked={isChecked}
      isActive={isActive}
    >
      <div className="user-item user-row-container">
        <StyledSimpleUserRow
          key={item.id}
          data={item}
          element={element}
          onSelect={onContentRowSelect}
          checked={isChecked}
          isActive={isActive}
          sectionWidth={sectionWidth}
          mode={"modern"}
          className={"user-row"}
          onContextClick={onRowContextClick}
          withoutBorder={true}
          contextOptions={item.options}
          getContextModel={getContextModel}
        >
          <UserContent {...props} />
        </StyledSimpleUserRow>
      </div>
    </StyledWrapper>
  );
};

export default withContent(SimpleUserRow);
