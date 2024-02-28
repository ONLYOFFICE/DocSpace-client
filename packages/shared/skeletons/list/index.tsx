import React from "react";

import ListItemLoader from "./List.item";
import { StyledList } from "./List.styled";
import type { ListLoaderProps } from "./List.types";

const ListLoader = ({ count = 25, ...props }: ListLoaderProps) => {
  const items = [];

  for (let i = 0; i < count; i += 1) {
    items.push(<ListItemLoader key={`list_loader_${i}`} {...props} />);
  }
  return <StyledList className="list-loader-wrapper">{items}</StyledList>;
};

export default ListLoader;
