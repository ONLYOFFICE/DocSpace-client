import { useRef } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { TableRow } from "@docspace/shared/components/table";
import { TableCell } from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { ComboBox } from "@docspace/shared/components/combobox";

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    padding-right: 30px;
    text-overflow: ellipsis;
  }

  .username {
    font-size: 13px;
    font-weight: 600;
    color: ${(props) => props.theme.client.settings.migration.subtitleColor};
  }

  .user-email {
    margin-right: 5px;
    font-size: 13px;
    font-weight: 600;
    color: ${(props) =>
      props.theme.client.settings.migration.tableRowTextColor};
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
      margin-right: 0px;
    }

    svg {
      path {
        fill: ${(props) =>
          props.theme.client.settings.migration.comboBoxLabelColor};
      }
    }
  }
`;

const UsersTypeTableRow = ({
  id,
  displayName,
  email,
  typeOptions,
  isChecked,
  toggleAccount,
  type,
  changeUserType,
}) => {
  const userTypeRef = useRef();

  const onSelectUser = (e) => {
    changeUserType(id, e.key);
  };

  const selectedOption =
    typeOptions.find((option) => option.key === type) || {};

  const handleAccountToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.closest(".dropdown-container") ||
      userTypeRef.current?.contains(e.target) ||
      toggleAccount();
  };

  return (
    <StyledTableRow checked={isChecked} onClick={handleAccountToggle}>
      <TableCell className="checkboxWrapper">
        <Checkbox isChecked={isChecked} onChange={handleAccountToggle} />
        <Text className="username">{displayName}</Text>
      </TableCell>

      <TableCell>
        <div ref={userTypeRef}>
          <ComboBox
            className="user-type"
            selectedOption={selectedOption}
            options={typeOptions}
            onSelect={onSelectUser}
            scaled
            size="content"
            displaySelectedOption
            modernView
            manualWidth="fit-content"
          />
        </div>
      </TableCell>

      <TableCell>
        <Text className="user-email">{email}</Text>
      </TableCell>
    </StyledTableRow>
  );
};

export default inject(({ importAccountsStore }) => {
  const { changeUserType } = importAccountsStore;

  return {
    changeUserType,
  };
})(observer(UsersTypeTableRow));
