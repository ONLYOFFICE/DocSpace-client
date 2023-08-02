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
    font-size: 13px;
    font-weight: 600;
    color: #a3a9ae;
  }

  .user-type {
    font-size: 13px;
    font-weight: 600;
    color: #a3a9ae;
  }
`;

const UsersTypeTableRow = ({
  id,
  displayName,
  email,
  type,
  isChecked,
  checkbox,
  onChangeCheckbox,
}) => {
  const onChange = (e) => {
    onChangeCheckbox(id, e.target.checked);
  };

  return (
    <StyledTableRow checked={isChecked}>
      <TableCell>
        <Checkbox isChecked={checkbox.includes(id)} onChange={onChange} />
        <Text fontWeight={600}>{displayName}</Text>
      </TableCell>

      <TableCell>
        <Text className="user-type">{type}</Text>
      </TableCell>

      <TableCell>
        <Text className="user-email">{email}</Text>
      </TableCell>
    </StyledTableRow>
  );
};

export default UsersTypeTableRow;
