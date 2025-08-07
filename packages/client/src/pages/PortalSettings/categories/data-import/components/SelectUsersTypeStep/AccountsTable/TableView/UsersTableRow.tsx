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

import { useRef } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { TableRow, TableCell } from "@docspace/shared/components/table";

import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/shared/components/combobox";
import {
  InjectedTypeSelectTableRowProps,
  TypeSelectTableRowProps,
} from "../../../../types";

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    padding-inline-end: 30px;
    text-overflow: ellipsis;
  }

  .username {
    font-size: 13px;
    font-weight: 600;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-email {
    margin-inline-end: 5px;
    font-size: 13px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-type {
    .combo-button {
      border: none;
      padding: 4px 8px;
      justify-content: flex-start;
      background-color: transparent;
    }

    .combo-button-label {
      color: ${(props) =>
        props.theme.client.settings.migration.comboBoxLabelColor};
    }

    .combo-buttons_arrow-icon {
      flex: initial;
      margin-inline-end: 0px;
    }

    svg {
      path {
        fill: ${(props) =>
          props.theme.client.settings.migration.comboBoxLabelColor};
      }
    }
  }
`;

const UsersTableRow = (props: TypeSelectTableRowProps) => {
  const {
    id,
    displayName,
    email,
    typeOptions,
    isChecked,
    toggleAccount,
    type,
    changeUserType,
  } = props as InjectedTypeSelectTableRowProps;
  const userTypeRef = useRef<HTMLDivElement>(null);

  const onSelectUser = (option: TOption) => {
    changeUserType(id, String(option.key));
  };

  const selectedOption: TOption = typeOptions.find(
    (option) => option.key === type,
  ) || { key: "", label: "" };

  const handleAccountToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !e.target.closest(".dropdown-container") &&
      !userTypeRef.current?.contains(e.target)
    ) {
      toggleAccount();
    }
  };

  return (
    <StyledTableRow>
      <TableCell className="checkboxWrapper">
        <Checkbox isChecked={isChecked} onChange={handleAccountToggle} />
        <Text className="username" truncate>
          {displayName}
        </Text>
      </TableCell>

      <TableCell>
        <div ref={userTypeRef}>
          <ComboBox
            className="user-type"
            selectedOption={selectedOption}
            options={typeOptions}
            onSelect={onSelectUser}
            scaled
            size={ComboBoxSize.content}
            displaySelectedOption
            modernView
            manualWidth="auto"
            dataTestId="user_type_combobox"
          />
        </div>
      </TableCell>

      <TableCell>
        <Text className="user-email">{email}</Text>
      </TableCell>
    </StyledTableRow>
  );
};

export default inject<TStore>(({ importAccountsStore }) => {
  const { changeUserType } = importAccountsStore;

  return {
    changeUserType,
  };
})(observer(UsersTableRow));
