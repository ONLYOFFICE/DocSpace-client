import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { useState, useRef } from "react";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { Base } from "@docspace/shared/themes";
import { TableBody } from "@docspace/shared/components";
import { TableContainer } from "@docspace/shared/components";

import WebhooksTableRow from "./WebhooksTableRow";
import WebhookTableHeader from "./WebhookTableHeader";

const TableWrapper = styled(TableContainer)`
  margin-top: 16px;

  .header-container-text {
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  }

  .table-container_header {
    position: absolute;
  }

  .table-list-item {
    margin-top: -1px;
    &:hover {
      cursor: pointer;
      background-color: ${(props) =>
        props.theme.filesSection.tableView.row.backgroundActive};

      .table-container_cell {
        margin-top: -1px;
        border-top: ${(props) =>
          `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};

        margin-left: -24px;
        padding-left: 24px;
      }

      .table-container_row-context-menu-wrapper {
        margin-right: -20px;
        padding-right: 20px;
      }
    }
  }
`;

TableWrapper.defaultProps = { theme: Base };

const TABLE_VERSION = "5";
const COLUMNS_SIZE = `webhooksConfigColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelWebhooksConfigColumnsSize_ver-${TABLE_VERSION}`;

const WebhooksTableView = (props) => {
  const {
    webhooks,
    loadWebhooks,
    sectionWidth,
    viewAs,
    setViewAs,
    openSettingsModal,
    openDeleteModal,
    userId,
    currentDeviceType,
  } = props;

  const tableRef = useRef(null);
  const [hideColumns, setHideColumns] = useState(false);

  useViewEffect({
    view: viewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <TableWrapper forwardedRef={tableRef} useReactWindow>
      <WebhookTableHeader
        sectionWidth={sectionWidth}
        tableRef={tableRef}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        setHideColumns={setHideColumns}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        infoPanelVisible={false}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        filesLength={webhooks.length}
        fetchMoreFiles={loadWebhooks}
        hasMoreFiles={false}
        itemCount={webhooks.length}
      >
        {webhooks.map((webhook, index) => (
          <WebhooksTableRow
            key={webhook.id}
            webhook={webhook}
            index={index}
            openSettingsModal={openSettingsModal}
            openDeleteModal={openDeleteModal}
            hideColumns={hideColumns}
          />
        ))}
      </TableBody>
    </TableWrapper>
  );
};

export default inject(({ webhooksStore, setup, auth }) => {
  const { webhooks, loadWebhooks } = webhooksStore;

  const { viewAs, setViewAs } = setup;
  const { id: userId } = auth.userStore.user;
  const { currentDeviceType } = auth.settingsStore;

  return {
    webhooks,
    viewAs,
    setViewAs,
    loadWebhooks,
    userId,
    currentDeviceType,
  };
})(observer(WebhooksTableView));
