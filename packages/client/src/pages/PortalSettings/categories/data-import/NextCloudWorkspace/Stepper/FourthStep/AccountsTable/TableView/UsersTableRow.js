import { useRef } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";
import ComboBox from "@docspace/components/combobox";

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    padding-right: 30px;
    text-overflow: ellipsis;
  }

  .user-email {
    display: flex;
    gap: 8px;
    path {
      fill: #a3a9ae;
    }
  }

  .email-input {
    max-width: 357.67px;
  }

  .textOverflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .role-type-selector {
    .combo-button {
      border: none;
      padding: 0;
      justify-content: flex-start;
      background-color: transparent;
    }

    .combo-button-label {
      color: #a3a9ae;
    }

    .combo-buttons_arrow-icon {
      flex: initial;
      margin-left: 0;
    }

    svg {
      path {
        fill: #a3a9ae;
      }
    }
  }
`;

const UsersTableRow = ({
  id,
  displayName,
  email,
  typeOptions,
  isChecked,
  toggleAccount,
  type,
  changeUserType,
}) => {
  const roleSelectorRef = useRef();

  const onSelectUser = (e) => {
    changeUserType(id, e.key);
  };

  const selectedOption = typeOptions.find((option) => option.key === type) || {};

  const handleAccountToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.target.closest(".dropdown-container") ||
      roleSelectorRef.current?.contains(e.target) ||
      toggleAccount();
  };

  return (
    <StyledTableRow checked={isChecked} onClick={handleAccountToggle}>
      <TableCell className="checkboxWrapper">
        <Checkbox isChecked={isChecked} onChange={handleAccountToggle} />
        <Text fontWeight={600} className="textOverflow">
          {displayName}
        </Text>
      </TableCell>

      <TableCell>
        <div ref={roleSelectorRef}>
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
        <Text lineHeight="20px" fontWeight={600} color="#A3A9AE" className="textOverflow">
          {email}
        </Text>
      </TableCell>
    </StyledTableRow>
  );
};

export default inject(({ importAccountsStore }) => {
  const { changeUserType } = importAccountsStore;

  return {
    changeUserType,
  };
})(observer(UsersTableRow));
