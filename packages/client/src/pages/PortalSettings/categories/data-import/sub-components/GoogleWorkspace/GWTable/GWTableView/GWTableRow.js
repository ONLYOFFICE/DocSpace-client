import TableRow from "@docspace/components/table-container/TableRow";
import TableCell from "@docspace/components/table-container/TableCell";
import Text from "@docspace/components/text";
import styled from "styled-components";

const StyledWrapper = styled.div`
  display: contents;
`;

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

const GWTableRow = ({ hideColumns, displayName, email, dublicate }) => {
  const handleRowClick = (e) => {
    if (
      e.target.closest(".checkbox") ||
      e.target.closest(".table-container_row-checkbox") ||
      e.target.closest(".type-combobox") ||
      e.target.closest(".table-container_row-context-menu-wrapper") ||
      e.target.closest(".toggleButton") ||
      e.detail === 0
    ) {
      return;
    }
  };

  return (
    <StyledWrapper onClick={handleRowClick}>
      <StyledTableRow hideColumns={hideColumns}>
        <TableCell>
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
    </StyledWrapper>
  );
};

export default GWTableRow;
