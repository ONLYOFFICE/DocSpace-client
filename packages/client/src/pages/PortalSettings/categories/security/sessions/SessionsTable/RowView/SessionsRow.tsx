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

import { Base } from "@docspace/shared/themes";
import { tablet } from "@docspace/shared/utils";
import { Row } from "@docspace/shared/components/row";

import withSessionsContent from "SRC_DIR/HOCs/withSessionsContent";

import { SessionsTableRowProps } from "../../SecuritySessions.types";
import SessionsRowContent from "./SessionsRowContent";

const marginStyles = css`
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  padding-right: 24px;

  @media ${tablet} {
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const checkedStyle = css`
  background: ${(props) => props.theme.filesSection.rowView.checkedBackground};
  ${marginStyles}
`;

const Wrapper = styled.div`
  .user-item {
    border: 1px solid transparent;
    border-left: none;
    border-right: none;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 0;
          `
        : css`
            margin-left: 0;
          `}
    height: 100%;
    user-select: none;

    position: relative;
    outline: none;
    background: none !important;
  }
`;

Wrapper.defaultProps = { theme: Base };

const StyledRow = styled(Row)<{ $isActive?: boolean }>`
  ${(props) => (props.checked || props.$isActive) && checkedStyle};

  ${!isMobile &&
  css`
    :hover {
      cursor: pointer;
      ${checkedStyle};

      margin-top: -3px;
      padding-bottom: 1px;
      border-top: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
      border-bottom: ${(props) =>
        `1px ${props.theme.filesSection.tableView.row.borderColor} solid`};
    }
  `}

  position: unset;
  margin-top: -2px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

  .styled-element {
    height: 32px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 12px;
          `
        : css`
            margin-right: 12px;
          `}
  }
`;

const SessionsRow = (props: SessionsTableRowProps) => {
  const {
    t,
    item,
    isChecked,
    isActive,
    onRowClick,
    onRowContextClick,
    contextOptions,
    getContextModel,
    onCheckBoxSelect,
    avatarElement,
    statusText,
    sectionWidth,
  } = props;

  return (
    <Wrapper
      className={`user-item row-wrapper ${isChecked || isActive ? "row-selected" : ""}`}
    >
      <div className="user-item">
        <StyledRow
          key={item.userId}
          element={avatarElement}
          onSelect={onCheckBoxSelect}
          checked={isChecked}
          mode="modern"
          className="user-row"
          contextOptions={contextOptions}
          onRowClick={onRowClick}
          onContextClick={onRowContextClick}
          getContextModel={getContextModel}
          $isActive={isActive}
        >
          <SessionsRowContent
            item={item}
            sectionWidth={sectionWidth}
            fromDateAgo={statusText}
          />
        </StyledRow>
      </div>
    </Wrapper>
  );
};

export default withSessionsContent(SessionsRow);
