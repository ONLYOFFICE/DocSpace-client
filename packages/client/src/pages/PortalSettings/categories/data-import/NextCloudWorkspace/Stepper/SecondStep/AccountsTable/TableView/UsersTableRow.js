import React from "react";
import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";
import Checkbox from "@docspace/components/checkbox";
import styled from "styled-components";

const StyledTableRow = styled(TableRow)`
  .table-container_cell {
    padding-right: 30px;
    text-overflow: ellipsis;
  }

  .user-email {
    margin-right: 5px;
  }
`;

const UsersTableRow = ({ displayName, email, isDuplicate, isChecked, toggleAccount }) => {
  return (
    <StyledTableRow checked={isChecked} onClick={toggleAccount}>
      <TableCell>
        <Checkbox onChange={toggleAccount} isChecked={isChecked} />
        <Text fontWeight={600}>{displayName}</Text>
      </TableCell>

      <TableCell>
        <Text fontWeight={600} color="#a3a9ae" className="user-email">
          {email}
        </Text>
      </TableCell>

      <TableCell>
        {isDuplicate ? (
          <Text fontWeight={600} color="#2db482">
            Existing account
          </Text>
        ) : (
          <Text fontWeight={600} color="#a3a9ae">
            -
          </Text>
        )}
      </TableCell>
    </StyledTableRow>
  );
};

export default UsersTableRow;
