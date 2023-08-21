import React, { useState, useRef } from "react";
import styled from "styled-components";

import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";

import AccessRightSelect from "@docspace/components/access-right-select";
import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";

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

const UsersTableRow = ({ displayName, email, isChecked, toggleAccount }) => {
  const data = [
    {
      key: "key1",
      label: "DocSpace admin",
    },
    {
      key: "key2",
      label: "Room admin",
    },
    {
      key: "key3",
      label: "Power user",
    },
  ];

  const roleSelectorRef = useRef();
  const [selectedType, setSelectedType] = useState(data[2]);

  const handleAccountToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    Array.from(e.target?.parentElement?.parentElement?.parentElement?.classList || []).includes(
      "access-right-item",
    ) ||
      roleSelectorRef.current?.contains(e.target) ||
      toggleAccount(e);
  };

  return (
    <StyledTableRow checked={isChecked} onClick={handleAccountToggle}>
      <TableCell>
        <Checkbox onChange={handleAccountToggle} isChecked={isChecked} />
        <Text fontWeight={600} className="textOverflow">
          {displayName}
        </Text>
      </TableCell>

      <TableCell>
        <div ref={roleSelectorRef}>
          <AccessRightSelect
            accessOptions={data}
            selectedOption={selectedType}
            scaledOptions={false}
            scaled={false}
            manualWidth="fit-content"
            className="role-type-selector"
            onSelect={setSelectedType}
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

export default UsersTableRow;
