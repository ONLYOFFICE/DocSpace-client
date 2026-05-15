// (c) Copyright Ascensio System SIA 2009-2026
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
