import {
  BoardTableRow,
  TableCellQueue,
  TableRowContainer,
} from "./Table.styled";

import TableCell from "@docspace/components/table-container/TableCell";
import Checkbox from "@docspace/components/checkbox";
import Link from "@docspace/components/link";

import Icon from "../Icon";

import { TableRowProps } from "./Table.porps";

function TableRow({ queue, title, id, roleType, color }: TableRowProps) {
  const onChange = (e: any) => {
    console.log("onChange", e);
  };

  return (
    <TableRowContainer id={id.toString()}>
      <BoardTableRow contextOptions={[{ key: "Separator", isSeparator: true }]}>
        <TableCell
          className="table-container_role-name-cell"
          forwardedRef={undefined}
        >
          <TableCell
            hasAccess={true}
            className="table-container_row-checkbox-wrapper"
            checked={false}
            forwardedRef={undefined}
          >
            <div className="table-container_element">
              <Icon size="small" roleType={roleType} color={color} />
            </div>
            <Checkbox
              className="table-container_row-checkbox"
              onChange={onChange}
              isChecked={false}
            />
          </TableCell>

          <Link
            type="page"
            fontWeight="600"
            fontSize="13px"
            isTextOverflow
            className="table-cell_role"
            noHover
            enableUserSelect={false}
          >
            {title}
          </Link>
        </TableCell>

        <TableCell className="table-cell_queue-number" forwardedRef={undefined}>
          <TableCellQueue className="table-cell_queue-number_color">
            {queue}
          </TableCellQueue>
        </TableCell>
      </BoardTableRow>
    </TableRowContainer>
  );
}

export default TableRow;
