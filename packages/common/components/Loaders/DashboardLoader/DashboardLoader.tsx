import React from "react";
import Rectangle from "../RectangleLoader";

import {
  ColumnContainer,
  ColumnBody,
  ColumnHeader,
  ColumnActions,
} from "../../Column/Column.styled";
import {
  DashboardLoaderContainer,
  LoadersCircle,
  LoadersTitle,
  LoadersUser,
} from "./DashboardLoader.styled";

function DashboardLoader() {
  const columns = [
    Array(7).fill(null),
    Array(3).fill(null),
    Array(5).fill(null),
    Array(6).fill(null),
    Array(5).fill(null),
  ];

  return (
    <DashboardLoaderContainer>
      {columns.map((items, idColumn) => (
        <ColumnContainer key={idColumn}>
          <ColumnHeader>
            <LoadersCircle
              width="12px"
              height="12px"
              x="6px"
              y="6px"
              radius="6px"
            />
            <LoadersTitle width="93px" height="16px" />
            <LoadersUser width="81px" height="20px" />
            <ColumnActions>
              <Rectangle width="16px" height="16px" />
            </ColumnActions>
          </ColumnHeader>
          <ColumnBody>
            {items.map((_, idCard) => (
              <Rectangle
                key={`${idColumn}-${idCard}`}
                width="264px"
                height="107px"
              />
            ))}
          </ColumnBody>
        </ColumnContainer>
      ))}
    </DashboardLoaderContainer>
  );
}

export default DashboardLoader;
