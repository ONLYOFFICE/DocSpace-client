import { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { isMobile } from "react-device-detect";
import { useTranslation } from "react-i18next";

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
import { classNames } from "@docspace/components/utils/classNames";

function TableRow({ role, getModel }: TableRowProps) {
  const {
    id,
    type,
    color,
    badge,
    title,
    isActive,
    isChecked,
    queueNumber,
    onChecked,
    onClickBadge,
    onContentRowCLick,
  } = role;

  const navigate = useNavigate();
  const { t } = useTranslation();

  const onClickLink = (event: MouseEvent) => {
    event.preventDefault();

    navigate(role.url);
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
    onContentRowCLick(role, !isChecked);
  };
  const onRowContextClick = (withSelect?: boolean) => {
    if (withSelect === undefined) return;

    onContentRowCLick(role, false, withSelect);
  };

  return (
    <TableRowContainer
      id={id.toString()}
      className={
        classNames("role-item", {
          ["table-row-selected"]: isChecked || isActive,
        }) as string
      }
    >
      <BoardTableRow
        className="table-row"
        checked={isChecked}
        isActive={isActive}
        contextOptions={role.contextOptionsModel}
        getContextModel={() => getModel(role, t)}
        onClick={onRowClick}
        fileContextClick={onRowContextClick}
        title={title}
      >
        <TableCell
          className="table-container_role-name-cell"
          forwardedRef={undefined}
        >
          <TableCell
            hasAccess
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
            href={role.url}
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
            {queueNumber}
          </TableCellQueue>
        </TableCell>
      </BoardTableRow>
    </TableRowContainer>
  );
}

export default TableRow;
