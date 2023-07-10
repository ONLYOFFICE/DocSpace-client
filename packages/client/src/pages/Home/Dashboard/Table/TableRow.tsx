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
import { classNames } from "@docspace/components/utils/classNames";

function TableRow({ role }: TableRowProps) {
  const {
    queue,
    title,
    id,
    type,
    color,
    badge,
    isChecked,
    onChecked,
    contextOptions,
    onClickBadge,
    onContentRowCLick,
  } = role;

  const { roomId } = useParams<ParamType>();
  const navigate = useNavigate();

  const href = useMemo(
    () => roomId && `/rooms/shared/${roomId}/role/${id}`,

    [roomId, id]
  );

  const onClickLink = (event: MouseEvent) => {
    event.preventDefault();

    if (href) {
      navigate(href);
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChecked(role, event.target.checked);
  };

  const onRowClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (
      !(event.target instanceof HTMLElement) ||
      event.target.closest(".checkbox") ||
      event.target.closest(".table-container_row-checkbox") ||
      event.target.closest(".type-combobox") ||
      event.target.closest(".paid-badge") ||
      event.target.closest(".pending-badge") ||
      event.target.closest(".disabled-badge") ||
      event.detail === 0
    ) {
      return;
    }

    console.log("Ckick", { role, isChecked });

    onContentRowCLick(role, !isChecked);
  };

  // const contextOptions = contextOptions;

  return (
    <TableRowContainer
      id={id.toString()}
      className={
        classNames("role-item", {
          ["table-row-selected"]: isChecked,
        }) as string
      }
    >
      <BoardTableRow
        className="table-row"
        checked={isChecked}
        contextOptions={contextOptions}
        onClick={onRowClick}
      >
        <TableCell
          className="table-container_role-name-cell"
          forwardedRef={undefined}
        >
          <TableCell
            hasAccess={true}
            className="table-container_row-checkbox-wrapper"
            checked={isChecked}
            forwardedRef={undefined}
          >
            <div className="table-container_element">
              <Icon size="small" type={type} color={color} />
            </div>
            <Checkbox
              className="table-container_row-checkbox"
              onChange={onChange}
              isChecked={isChecked}
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
            onClick={onClickBadge}
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
