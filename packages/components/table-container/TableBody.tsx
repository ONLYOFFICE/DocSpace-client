import React from "react";
import { StyledTableBody } from "./StyledTableContainer";
import InfiniteLoaderComponent from "../infinite-loader";

const TableBody = (props: any) => {
  const {
    columnStorageName,
    columnInfoPanelStorageName,
    fetchMoreFiles,
    children,
    filesLength,
    hasMoreFiles,
    itemCount,
    itemHeight,
    useReactWindow,
    onScroll,
    infoPanelVisible,
  } = props;

  return useReactWindow ? (
    <StyledTableBody
      // @ts-expect-error TS(2769): No overload matches this call.
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

TableBody.defaultProps = {
  itemHeight: 41,
  useReactWindow: false,
  infoPanelVisible: false,
};

export default TableBody;
