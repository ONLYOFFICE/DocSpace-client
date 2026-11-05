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

import SettingsIcon from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import HistoryIcon from "PUBLIC_DIR/images/history.react.svg?url";
import DeleteIcon from "PUBLIC_DIR/images/delete.react.svg?url";

import { useCallback, useMemo, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import useViewEffect from "@onlyoffice/apps-ui-kit/hooks/useViewEffect";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";

import type { TWebhook } from "SRC_DIR/store/WebhooksStore";
import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";
import { useStickyHeaderTop } from "SRC_DIR/components/DataTable/useStickyHeaderTop";

import styles from "../WebhooksTable.styled.module.scss";

import { getWebhooksColumns } from "./webhooksColumns";

const COLUMN_WIDTHS = "webhooksConfigColumnsWidths_ver-1";

// What a click on these leaves to them instead of opening the history.
const NOT_OPENING = [
  ".table-container_row-context-menu-wrapper",
  ".toggleButton",
].join(",");

type TStores = Pick<
  TStore,
  "webhooksStore" | "setup" | "settingsStore" | "userStore"
>;

type TWebhooksTableViewProps = {
  openSettingsModal: () => void;
  openDeleteModal: () => void;
};

type InjectedProps = TWebhooksTableViewProps & {
  webhooks: TWebhook[];
  viewAs: string;
  setViewAs: (view: string) => void;
  currentDeviceType: TStores["settingsStore"]["currentDeviceType"];
  userId: string;
  isAdmin: boolean;
  toggleEnabled: TStores["webhooksStore"]["toggleEnabled"];
  setCurrentWebhook: TStores["webhooksStore"]["setCurrentWebhook"];
};

const getRowKey = (webhook: TWebhook) => webhook.id;

/** The webhooks of the portal on the ui-kit DataTable. */
const WebhooksTableView = ({
  webhooks,
  viewAs,
  setViewAs,
  currentDeviceType,
  userId,
  isAdmin,
  toggleEnabled,
  setCurrentWebhook,
  openSettingsModal,
  openDeleteModal,
}: InjectedProps) => {
  const { t } = useTranslation(["Webhooks", "Common"]);
  const navigate = useNavigate();

  useViewEffect({ view: viewAs, setView: setViewAs, currentDeviceType });

  const columns = useMemo(
    () => getWebhooksColumns(t, isAdmin, toggleEnabled),
    [t, isAdmin, toggleEnabled],
  );

  const widthStorage = useMemo(
    () => createLocalStorageWidths(`${COLUMN_WIDTHS}=${userId}`),
    [userId],
  );

  const getRowProps = useCallback(
    (webhook: TWebhook): DataTableRowState => {
      const openHistory = () =>
        navigate(`${window.location.pathname}/${webhook.id}`);

      const options: ContextMenuModel[] = [
        {
          key: "Settings dropdownItem",
          label: t("Common:Settings"),
          icon: SettingsIcon,
          onClick: () => {
            setCurrentWebhook(webhook);
            openSettingsModal();
          },
          dataTestId: "webhook_settings_item",
        },
        {
          key: "Webhook history dropdownItem",
          label: t("WebhookHistory"),
          icon: HistoryIcon,
          onClick: openHistory,
          dataTestId: "webhook_history_item",
        },
        { key: "Separator dropdownItem", isSeparator: true },
        {
          key: "Delete webhook dropdownItem",
          label: t("DeleteWebhook"),
          icon: DeleteIcon,
          onClick: () => {
            setCurrentWebhook(webhook);
            openDeleteModal();
          },
          dataTestId: "webhook_delete_item",
        },
      ];

      return {
        className: styles.webhooksRow,
        contextMenu: { options, testId: "webhook_table_contextmenu" },
        onClick: (e) => {
          const target = e.target as Element;
          if (target.closest(NOT_OPENING) || e.detail === 0) return;
          openHistory();
        },
      };
    },
    [t, navigate, setCurrentWebhook, openSettingsModal, openDeleteModal],
  );

  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef, { belowPinned: true });

  return (
    <DataTable<TWebhook>
      ref={tableRef}
      ariaLabel={t("Webhooks")}
      columns={columns}
      rows={webhooks}
      getRowKey={getRowKey}
      getRowProps={getRowProps}
      widthStorage={widthStorage}
      className={classNames(sectionTableStyles.settingsTable, styles.table)}
    />
  );
};

export default inject(
  ({ webhooksStore, setup, settingsStore, userStore }: TStores) => ({
    webhooks: webhooksStore.webhooks,
    toggleEnabled: webhooksStore.toggleEnabled,
    setCurrentWebhook: webhooksStore.setCurrentWebhook,
    viewAs: setup.viewAs,
    setViewAs: setup.setViewAs,
    currentDeviceType: settingsStore.currentDeviceType,
    userId: userStore.user!.id,
    isAdmin: !!(userStore.user?.isAdmin || userStore.user?.isOwner),
  }),
)(
  observer(WebhooksTableView),
) as unknown as React.ComponentType<TWebhooksTableViewProps>;
