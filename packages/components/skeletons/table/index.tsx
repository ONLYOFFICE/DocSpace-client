import React from "react";
import TableRow from "./row";
import PropTypes from "prop-types";

const TableSkeleton = ({
  count,
  ...props
}: any) => {
  const items = [];

  for (var i = 0; i < count; i++) {
    items.push(<TableRow key={`row_loader_${i}`} {...props} />);
  }
  return <div>{items}</div>;
};

TableSkeleton.propTypes = {
  count: PropTypes.number,
};

TableSkeleton.defaultProps = {
  count: 25,
};
export default TableSkeleton;
