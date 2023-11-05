import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { inject, observer } from "mobx-react";

import { useViewEffect } from "@docspace/common/hooks";

import { isMobile } from "@docspace/components/utils/device";
import RowContainer from "@docspace/components/row-container";
import { Base } from "@docspace/components/themes";

import HistoryRow from "./HistoryRow";

const StyledRowContainer = styled(RowContainer)`
  margin-top: 11px;

  .row-list-item {
    cursor: pointer;
    padding-inline-end: ${() => (isMobile() ? "5px" : "15px")};
  }
  .row-item::after {
    bottom: -3px;
  }

  .row-list-item:has(.selected-row-item) {
    background-color: ${(props) =>
      props.theme.isBase ? "#f3f4f4" : "#3D3D3D"};
  }
`;

StyledRowContainer.defaultProps = { theme: Base };

const HistoryRowView = (props) => {
  const {
    historyItems,
    sectionWidth,
    viewAs,
    setViewAs,
    hasMoreItems,
    totalItems,
    fetchMoreItems,
    historyFilters,
    formatFilters,
    currentDeviceType,
  } = props;
  const { id } = useParams();

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const fetchMoreFiles = () => {
    const params = historyFilters === null ? {} : formatFilters(historyFilters);
    fetchMoreItems({ ...params, configId: id });
  };

  return (
    <StyledRowContainer
      filesLength={historyItems.length}
      fetchMoreFiles={fetchMoreFiles}
      hasMoreFiles={hasMoreItems}
      itemCount={totalItems}
      draggable
      useReactWindow={true}
      itemHeight={59}
    >
      {historyItems.map((item) => (
        <HistoryRow
          key={item.id}
          historyItem={item}
          sectionWidth={sectionWidth}
        />
      ))}
    </StyledRowContainer>
  );
};

export default inject(({ setup, webhooksStore, auth }) => {
  const { viewAs, setViewAs } = setup;
  const {
    historyItems,
    fetchMoreItems,
    hasMoreItems,
    totalItems,
    historyFilters,
    formatFilters,
  } = webhooksStore;

  const { currentDeviceType } = auth.settingsStore;
  return {
    viewAs,
    setViewAs,
    historyItems,
    fetchMoreItems,
    hasMoreItems,
    totalItems,
    historyFilters,
    formatFilters,
    currentDeviceType,
  };
})(observer(HistoryRowView));
