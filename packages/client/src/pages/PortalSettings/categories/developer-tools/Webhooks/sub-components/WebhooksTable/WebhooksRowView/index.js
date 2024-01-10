import styled from "styled-components";
import { inject, observer } from "mobx-react";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { RowContainer } from "@docspace/shared/components/row-container";

import WebhookRow from "./WebhookRow";

const StyledRowContainer = styled(RowContainer)`
  margin-top: 16px;
`;

const WebhooksRowView = (props) => {
  const {
    webhooks,
    sectionWidth,
    viewAs,
    setViewAs,
    openSettingsModal,
    openDeleteModal,
    currentDeviceType,
  } = props;

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  return (
    <StyledRowContainer useReactWindow={false}>
      {webhooks.map((webhook) => (
        <WebhookRow
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

export default inject(({ webhooksStore, setup, auth }) => {
  const { webhooks } = webhooksStore;
  const { currentDeviceType } = auth.settingsStore;
  const { viewAs, setViewAs } = setup;

  return {
    webhooks,
    viewAs,
    setViewAs,
    currentDeviceType,
  };
})(observer(WebhooksRowView));
