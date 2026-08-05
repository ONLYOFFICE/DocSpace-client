/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { inject, observer } from "mobx-react";
import { useState, useRef } from "react";
import useViewEffect from "@docspace/ui-kit/hooks/useViewEffect";

import { TableBody, TableContainer } from "@docspace/ui-kit/components/table";

import WebhooksTableRow from "./WebhooksTableRow";
import WebhookTableHeader from "./WebhookTableHeader";

import styles from "../WebhooksTable.styled.module.scss";

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
    <TableContainer className={styles.tableWrapper} forwardedRef={tableRef} useReactWindow>
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
    </TableContainer>
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
