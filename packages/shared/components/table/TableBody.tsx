import React from "react";

import { InfiniteLoaderComponent } from "../infinite-loader";

import { StyledTableBody } from "./Table.styled";
import { TableBodyProps } from "./Table.types";

const TableBody = (props: TableBodyProps) => {
  const {
    columnStorageName,
    columnInfoPanelStorageName,
    fetchMoreFiles,
    children,
    filesLength,
    hasMoreFiles,
    itemCount,
    itemHeight = 41,
    useReactWindow = true,
    onScroll,
    infoPanelVisible = false,
  } = props;

  return useReactWindow ? (
    <StyledTableBody
      useReactWindow={useReactWindow}
      className="table-container_body"
      infoPanelVisible={infoPanelVisible}
    >
      <InfiniteLoaderComponent
        className="TableList"
        viewAs="table"
        hasMoreFiles={hasMoreFiles}
        filesLength={filesLength}
        itemCount={itemCount}
        loadMoreItems={fetchMoreFiles}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        itemSize={itemHeight}
        onScroll={onScroll}
        infoPanelVisible={infoPanelVisible}
      >
        {children}
      </InfiniteLoaderComponent>
    </StyledTableBody>
  ) : (
    <StyledTableBody className="table-container_body" {...props} />
  );
};

export { TableBody };
