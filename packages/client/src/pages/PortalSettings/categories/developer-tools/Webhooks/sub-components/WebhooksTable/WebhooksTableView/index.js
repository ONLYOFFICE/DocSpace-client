// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import styled from "styled-components";
import { inject, observer } from "mobx-react";
import { useState, useRef } from "react";
import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { TableBody, TableContainer } from "@docspace/shared/components/table";
import { injectDefaultTheme } from "@docspace/shared/utils";

import WebhooksTableRow from "./WebhooksTableRow";
import WebhookTableHeader from "./WebhookTableHeader";

const TableWrapper = styled(TableContainer).attrs(injectDefaultTheme)`
  margin-top: 16px;

  .header-container-text {
    font-size: 12px;
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

        margin-inline-start: -24px;
        padding-inline-start: 24px;
      }

      .table-container_row-context-menu-wrapper {
        margin-inline-end: -20px;
        padding-inline-end: 20px;
      }
    }
  }
`;

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

export default inject(({ webhooksStore, setup, settingsStore, userStore }) => {
  const { webhooks, loadWebhooks } = webhooksStore;

  const { viewAs, setViewAs } = setup;
  const { id: userId } = userStore.user;
  const { currentDeviceType } = settingsStore;

  return {
    webhooks,
    viewAs,
    setViewAs,
    loadWebhooks,
    userId,
    currentDeviceType,
  };
})(observer(WebhooksTableView));
