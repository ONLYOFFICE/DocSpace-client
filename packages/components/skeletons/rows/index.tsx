import React from "react";
import RowSkeleton from "./row";
import PropTypes from "prop-types";

const RowsSkeleton = ({
  count,
  ...props
}: any) => {
  const items = [];

  for (var i = 0; i < count; i++) {
    items.push(<RowSkeleton key={`row_loader_${i}`} {...props} />);
  }
  return <div>{items}</div>;
};

RowsSkeleton.propTypes = {
  count: PropTypes.number,
};

RowsSkeleton.defaultProps = {
  count: 25,
};
export default RowsSkeleton;
