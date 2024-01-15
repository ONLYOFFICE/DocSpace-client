import React from "react";

import { StyledTableCell } from "../Table.styled";
import { TableCellProps } from "../Table.types";

const TableCell = ({ className, forwardedRef, ...rest }: TableCellProps) => {
  return (
    <StyledTableCell
      className={`${className} table-container_cell`}
      ref={forwardedRef}
      {...rest}
    />
  );
};

export { TableCell };
