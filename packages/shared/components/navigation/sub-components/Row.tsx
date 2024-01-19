import React from "react";
import Item from "./Item";

import { TRowData } from "../Navigation.types";

const Row = React.memo(
  ({
    data,
    index,
    style,
  }: {
    data: TRowData;
    index: number;
    style: React.CSSProperties;
  }) => {
    const isRoot = index === data[0].length - 1;
    return (
      <Item
        key={data[0][index].id}
        id={data[0][index].id}
        title={data[0][index].title}
        isRootRoom={data[0][index].isRootRoom}
        isRoot={isRoot}
        onClick={data[1]}
        withLogo={data[2].withLogo}
        currentDeviceType={data[2].currentDeviceType}
        style={{ ...style }}
      />
    );
  },
);

Row.displayName = "Row";

export default Row;
