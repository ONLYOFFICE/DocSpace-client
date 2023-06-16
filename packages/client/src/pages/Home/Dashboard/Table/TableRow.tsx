import { useMemo, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isMobile } from "react-device-detect";

import {
  BoardTableRow,
  TableCellQueue,
  TableRowContainer,
} from "./Table.styled";

import TableCell from "@docspace/components/table-container/TableCell";
import { Badge } from "@docspace/components";
import Checkbox from "@docspace/components/checkbox";
import Link from "@docspace/components/link";

import Icon from "../Icon";

import { TableRowProps } from "./Table.porps";
import { ParamType } from "../types";

function TableRow({ queue, title, id, roleType, color, badge }: TableRowProps) {
  const { room } = useParams<ParamType>();
  const navigate = useNavigate();

  const href = useMemo(
    () => room && `/rooms/shared/${room}/dashboard/${id}`,

    [room, id]
  );

  const onClickLink = (event: MouseEvent) => {
    event.preventDefault();

    if (href) {
      navigate(href);
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("onChange", event);
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
            href={href}
            title={title}
            isTextOverflow
            fontSize="13px"
            fontWeight="600"
            noHover={isMobile}
            onClick={onClickLink}
            enableUserSelect={false}
            className="table-cell_role"
          >
            {title}
          </Link>

          <Badge
            fontSize="9px"
            maxWidth="5px"
            fontWeight={800}
            lineHeight="12px"
            label={badge}
            borderRadius="100%"
          />
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
