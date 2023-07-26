import { useState } from "react";
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

  .mr-8 {
    margin-right: 8px;
  }

  .textOverflow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const UsersTableRow = ({ displayName, email, dublicate }) => {
  const [isChecked, setIsChecked] = useState(false);

  const onChangeCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  return (
    <StyledTableRow checked={isChecked}>
      <TableCell>
        <Checkbox
          className="checkbox"
          onChange={onChangeCheckbox}
          isChecked={isChecked}
        />
        <Text as="span" fontWeight={600} className="mr-8 textOverflow">
          {displayName}
        </Text>
      </TableCell>
      <TableCell>
        <Text
          as="span"
          fontSize="11px"
          color="#A3A9AE"
          fontWeight={600}
          className="textOverflow"
        >
          {email}
        </Text>
      </TableCell>
      <TableCell>
        <Text
          as="span"
          fontSize="11px"
          color="#A3A9AE"
          fontWeight={600}
          className="textOverflow"
        >
          {dublicate}
        </Text>
      </TableCell>
    </StyledTableRow>
  );
};

export default UsersTableRow;
