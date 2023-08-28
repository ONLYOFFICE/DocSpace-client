import { useState, useRef } from "react";
import styled from "styled-components";

import AccessRightSelect from "@docspace/components/access-right-select";
import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";

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
      padding: 0;
      justify-content: flex-start;
      background-color: transparent;
    }

    .combo-button-label {
      color: ${(props) =>
        props.theme.client.settings.migration.tableRowTextColor};
    }

    .combo-buttons_arrow-icon {
      flex: initial;
      margin-left: 0;
    }

    svg {
      path {
        fill: ${(props) =>
          props.theme.client.settings.migration.tableRowTextColor};
      }
    }
  }
`;

const UsersTypeTableRow = ({
  displayName,
  email,
  typeOptions,
  isChecked,
  toggleAccount,
}) => {
  const [selectUserType, setSelectUserType] = useState(typeOptions[2]);
  const userTypeRef = useRef();

  const handleAccountToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.closest(".dropdown-container") ||
      userTypeRef.current?.contains(e.target) ||
      toggleAccount(e);
  };

  return (
    <StyledTableRow checked={isChecked} onClick={handleAccountToggle}>
      <TableCell>
        <Checkbox isChecked={isChecked} onChange={handleAccountToggle} />
        <Text className="username">{displayName}</Text>
      </TableCell>

      <TableCell>
        <div ref={userTypeRef}>
          <AccessRightSelect
            accessOptions={typeOptions}
            selectedOption={selectUserType}
            scaledOptions={false}
            scaled={false}
            manualWidth="fit-content"
            className="user-type"
            onSelect={setSelectUserType}
          />
        </div>
      </TableCell>

      <TableCell>
        <Text className="user-email">{email}</Text>
      </TableCell>
    </StyledTableRow>
  );
};

export default UsersTypeTableRow;
