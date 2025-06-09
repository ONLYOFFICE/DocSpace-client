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

import React from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { TableRow, TableCell } from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";
import getCorrectDate from "@docspace/shared/utils/getCorrectDate";

import { UnavailableStyles } from "../../../../utils/commonSettingsStyles";

const StyledPeopleRow = styled(TableRow)`
  .table-container_cell {
    height: 46px;
    max-height: 46px;
  }

  .table-container_row-checkbox-wrapper {
    padding-inline-start: 4px;
    min-width: 46px;

    .table-container_row-checkbox {
      margin-inline-start: -4px;
      padding-block: 16px;
      padding-inline: 12px 0;
    }
  }

  .link-with-dropdown-group {
    margin-inline-end: 12px;
  }

  .table-cell_username {
    margin-inline-end: 12px;
  }
  ${(props) => props.isSettingNotPaid && UnavailableStyles}
`;

const PeopleTableRow = (props) => {
  const { item, contextOptionsProps, isSettingNotPaid, locale } = props;
  const { email, position } = item;
  const dateStr = getCorrectDate(locale, item.date);

  return (
    <StyledPeopleRow
      key={item.id}
      {...contextOptionsProps}
      isSettingNotPaid={isSettingNotPaid}
    >
      <TableCell>
        <Text
          type="page"
          title={position}
          fontSize="12px"
          fontWeight={600}
          truncate
          className="settings_unavailable"
        >
          {item.user}
        </Text>
      </TableCell>
      <TableCell>
        <Text
          type="page"
          title={position}
          fontSize="12px"
          fontWeight={600}
          truncate
          className="settings_unavailable"
        >
          {dateStr}
        </Text>
      </TableCell>
      <TableCell>
        <Text
          type="page"
          title={email}
          fontSize="12px"
          fontWeight={600}
          className="settings_unavailable"
        >
          {item.context}
        </Text>
      </TableCell>

      <TableCell>
        <Text
          type="page"
          title={email}
          fontSize="12px"
          fontWeight={600}
          className="settings_unavailable"
        >
          {item.action}
        </Text>
      </TableCell>
    </StyledPeopleRow>
  );
};

export default inject(({ settingsStore, userStore }) => {
  const { culture } = settingsStore;
  const { user } = userStore;
  const locale = (user && user.cultureName) || culture || "en";

  return {
    locale,
  };
})(observer(PeopleTableRow));
