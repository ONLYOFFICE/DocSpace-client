import React, { useEffect } from "react";
import styled from "styled-components";
import { inject, observer } from "mobx-react";

import { isMobile } from "react-device-detect";

import RowContainer from "@docspace/components/row-container";

import Row from "./Row";

const StyledRowContainer = styled(RowContainer)`
  margin-top: 16px;
`;

const RowView = (props) => {
  const {
    webhooks,
    sectionWidth,
    viewAs,
    setViewAs,
    openSettingsModal,
    openDeleteModal,
  } = props;

  useEffect(() => {
    if (viewAs !== "table" && viewAs !== "row") return;

    if (sectionWidth < 1025 || isMobile) {
      viewAs !== "row" && setViewAs("row");
    } else {
      viewAs !== "table" && setViewAs("table");
    }
  }, [sectionWidth]);

  return (
    <StyledRowContainer useReactWindow={false}>
      {webhooks.map((webhook) => (
        <Row
          key={webhook.id}
          webhook={webhook}
          sectionWidth={sectionWidth}
          openSettingsModal={openSettingsModal}
          openDeleteModal={openDeleteModal}
        />
      ))}
    </StyledRowContainer>
  );
};

export default inject(({ webhooksStore, setup }) => {
  const { webhooks } = webhooksStore;

  const { viewAs, setViewAs } = setup;

  return {
    webhooks,
    viewAs,
    setViewAs,
  };
})(observer(RowView));
