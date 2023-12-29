import React from "react";

import StyledRowContainer from "./RowContainer.styled";
import { InfiniteLoaderComponent } from "../infinite-loader";
import { RowContainerProps } from "./RowContainer.types";

const RowContainer = (props: RowContainerProps) => {
  const {
    manualHeight,
    itemHeight = 50,
    children,
    useReactWindow = true,
    id = "rowContainer",
    className,
    style,
    onScroll,
    filesLength,
    itemCount,
    fetchMoreFiles,
    hasMoreFiles,
  } = props;

  return (
    <StyledRowContainer
      id={id}
      className={className}
      style={style}
      manualHeight={manualHeight}
      useReactWindow={useReactWindow}
      data-testid="row-container"
    >
      {useReactWindow ? (
        <InfiniteLoaderComponent
          className="List"
          viewAs="row"
          hasMoreFiles={hasMoreFiles}
          filesLength={filesLength}
          itemCount={itemCount}
          loadMoreItems={fetchMoreFiles}
          itemSize={itemHeight}
          onScroll={onScroll}
        >
          {children}
        </InfiniteLoaderComponent>
      ) : (
        children
      )}
    </StyledRowContainer>
  );
};

export { RowContainer };
