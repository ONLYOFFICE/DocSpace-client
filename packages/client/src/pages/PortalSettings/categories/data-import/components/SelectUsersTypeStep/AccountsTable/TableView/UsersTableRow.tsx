/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useRef } from "react";
import { inject, observer } from "mobx-react";

import { TableRow, TableCell } from "@docspace/ui-kit/components/table";

import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/ui-kit/components/combobox";
import {
  InjectedTypeSelectTableRowProps,
  TypeSelectTableRowProps,
} from "../../../../types";
import styles from "../../../../StyledDataImport.module.scss";

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

  const checkIsClickOnUserTypeSelect = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (
      (e.target as HTMLElement).closest(".dropdown-container") ||
      userTypeRef.current?.contains(e.target as HTMLElement)
    ) {
      return true;
    }
    return false;
  };

  const checkIsClickOnUserSelect = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => {
    if ((e.target as HTMLElement).closest(".user-select")) {
      return true;
    }
    return false;
  };

  const onRowClick = (
    e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const isClickOnUserTypeSelect = checkIsClickOnUserTypeSelect(e);
    const isClickOnUserSelect = checkIsClickOnUserSelect(e);

    if (!isClickOnUserTypeSelect && !isClickOnUserSelect) {
      toggleAccount();
    }
  };

  return (
    <TableRow className={styles.styledTableRowType} onClick={onRowClick}>
      <TableCell className="checkboxWrapper">
        <Checkbox
          onChange={() => toggleAccount()}
          isChecked={isChecked}
          label={displayName}
          truncate
          className="user-select"
        />
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
            directionY="both"
            manualWidth="auto"
            dataTestId="user_type_combobox"
          />
        </div>
      </TableCell>

      <TableCell>
        <Text className="user-email">{email}</Text>
      </TableCell>
    </TableRow>
  );
};

export default inject<TStore>(({ importAccountsStore }) => {
  const { changeUserType } = importAccountsStore;

  return {
    changeUserType,
  };
})(observer(UsersTableRow));
