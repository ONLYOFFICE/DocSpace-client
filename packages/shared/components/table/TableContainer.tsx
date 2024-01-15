import React from "react";

import { StyledTableContainer } from "./Table.styled";
import { TableContainerProps } from "./Table.types";

const TableContainer = (props: TableContainerProps) => {
  const { forwardedRef, useReactWindow, ...rest } = props;

  return (
    <StyledTableContainer
      id="table-container"
      className="table-container"
      ref={forwardedRef}
      useReactWindow={useReactWindow}
      {...rest}
    />
  );
};

export { TableContainer };
