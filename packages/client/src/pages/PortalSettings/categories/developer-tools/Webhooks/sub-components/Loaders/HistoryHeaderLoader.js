import React from "react";

import styled from "styled-components";
import Loaders from "@docspace/common/components/Loaders";

const LoaderWrapper = styled.div`
  width: 100%;
  margin-top: 5px;
  margin-bottom: 17px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .filterButton,
  .configName {
    border-radius: 3px;
  }
`;

export const HistoryHeaderLoader = () => {
  return (
    <LoaderWrapper>
      <Loaders.Rectangle width="118px" height="22px" className="configName" />

      <Loaders.Rectangle width="32px" height="22px" className="filterButton" />
    </LoaderWrapper>
  );
};
