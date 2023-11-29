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

  .textOverflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const NOT_EXIST = "—";

const UsersTableRow = ({ t, displayName, email, isDuplicate, isChecked, toggleAccount }) => {
  return (
    <StyledTableRow checked={isChecked} onClick={toggleAccount}>
      <TableCell className="checkboxWrapper">
        <Checkbox onChange={toggleAccount} isChecked={isChecked} />
        <Text fontWeight={600} className="textOverflow">
          {displayName}
        </Text>
      </TableCell>

      <TableCell>
        <Text fontWeight={600} color="#a3a9ae" className="user-email textOverflow">
          {email}
        </Text>
      </TableCell>

      <TableCell>
        {isDuplicate ? (
          <Text fontWeight={600} color="#2db482" className="textOverflow">
            {t("Settings:ExistingAccount")}
          </Text>
        ) : (
          <Text fontWeight={600} color="#a3a9ae" className="textOverflow">
            {NOT_EXIST}
          </Text>
        )}
      </TableCell>
    </StyledTableRow>
  );
};

export default UsersTableRow;
