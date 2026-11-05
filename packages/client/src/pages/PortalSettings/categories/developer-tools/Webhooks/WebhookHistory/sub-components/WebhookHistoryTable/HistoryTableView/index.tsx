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

import RetryIcon from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";

import { useCallback, useMemo, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";

import { retryWebhook } from "@docspace/shared/api/settings";
import useViewEffect from "@onlyoffice/apps-ui-kit/hooks/useViewEffect";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { formatFilters } from "SRC_DIR/helpers/webhooks";
import type { TWebhookHistoryItem } from "SRC_DIR/store/WebhooksStore";
import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";
import { useStickyHeaderTop } from "SRC_DIR/components/DataTable/useStickyHeaderTop";

import styles from "../../../WebhookHistory.styled.module.scss";

import { getHistoryColumns } from "./historyColumns";

const COLUMN_WIDTHS = "webhooksHistoryColumnsWidths_ver-1";

// What a click on these leaves to them instead of opening the details.
const NOT_OPENING = [
  ".checkbox",
  ".table-container_row-context-menu-wrapper",
].join(",");

type TStores = Pick<
  TStore,
  "webhooksStore" | "setup" | "settingsStore" | "userStore"
>;
type TWebhooksStore = TStores["webhooksStore"];

type InjectedProps = {
  historyItems: TWebhookHistoryItem[];
  checkedEventIds: number[];
  viewAs: string;
  setViewAs: (view: string) => void;
  currentDeviceType: TStores["settingsStore"]["currentDeviceType"];
  userId: string;
  hasMoreItems: boolean;
  fetchMoreItems: TWebhooksStore["fetchMoreItems"];
  fetchHistoryItems: TWebhooksStore["fetchHistoryItems"];
  historyFilters: TWebhooksStore["historyFilters"];
  isRetryPending: boolean;
};

const getRowKey = (item: TWebhookHistoryItem) => item.id;

/** The deliveries of one webhook on the ui-kit DataTable. */
const HistoryTableView = ({
  historyItems,
  checkedEventIds,
  viewAs,
  setViewAs,
  currentDeviceType,
  userId,
  hasMoreItems,
  fetchMoreItems,
  fetchHistoryItems,
  historyFilters,
  isRetryPending,
}: InjectedProps) => {
  const { t, i18n } = useTranslation(["Webhooks", "People", "Common"]);
  const navigate = useNavigate();
  const { id } = useParams();

  useViewEffect({ view: viewAs, setView: setViewAs, currentDeviceType });

  const columns = useMemo(
    () => getHistoryColumns(t, i18n.language),
    [t, i18n.language],
  );

  const widthStorage = useMemo(
    () => createLocalStorageWidths(`${COLUMN_WIDTHS}=${userId}`),
    [userId],
  );

  const loadMore = useMemo(
    () => ({
      hasMore: hasMoreItems,
      onLoadMore: () =>
        fetchMoreItems({
          ...(historyFilters ? formatFilters(historyFilters) : {}),
          configId: Number(id),
        }),
    }),
    [hasMoreItems, fetchMoreItems, historyFilters, id],
  );

  const getRowProps = useCallback(
    (item: TWebhookHistoryItem): DataTableRowState => {
      const openDetails = () =>
        navigate(`${window.location.pathname}/${item.id}`);

      const retry = async () => {
        if (isRetryPending) return;
        try {
          await retryWebhook(item.id);
          await fetchHistoryItems({
            ...(historyFilters ? formatFilters(historyFilters) : {}),
            configId: Number(id),
          });
          toastr.success(t("WebhookRedilivered"), t("Common:Done"));
        } catch (error) {
          console.error(error);
          toastr.error(error as Error);
        }
      };

      const options: ContextMenuModel[] = [
        {
          id: "webhook-details",
          key: "Webhook details dropdownItem",
          label: t("WebhookDetails"),
          icon: InfoIcon,
          onClick: openDetails,
        },
        {
          id: "retry",
          key: "Retry dropdownItem",
          label: t("Retry"),
          icon: RetryIcon,
          onClick: retry,
          disabled: isRetryPending,
        },
      ];

      return {
        checked: checkedEventIds.includes(item.id),
        className: styles.historyTableRow,
        contextMenu: { options },
        onClick: (e) => {
          const target = e.target as Element;
          if (target.closest(NOT_OPENING) || e.detail === 0) return;
          openDetails();
        },
      };
    },
    [
      t,
      navigate,
      id,
      checkedEventIds,
      isRetryPending,
      fetchHistoryItems,
      historyFilters,
    ],
  );

  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef, { belowPinned: true });

  return (
    <DataTable<TWebhookHistoryItem>
      ref={tableRef}
      ariaLabel={t("Common:SubmenuHistory")}
      columns={columns}
      rows={historyItems}
      getRowKey={getRowKey}
      getRowProps={getRowProps}
      widthStorage={widthStorage}
      virtualize
      loadMore={loadMore}
      className={sectionTableStyles.settingsTable}
    />
  );
};

export default inject(
  ({ setup, webhooksStore, settingsStore, userStore }: TStores) => ({
    viewAs: setup.viewAs,
    setViewAs: setup.setViewAs,
    historyItems: webhooksStore.historyItems,
    checkedEventIds: webhooksStore.checkedEventIds,
    fetchMoreItems: webhooksStore.fetchMoreItems,
    fetchHistoryItems: webhooksStore.fetchHistoryItems,
    hasMoreItems: webhooksStore.hasMoreItems,
    historyFilters: webhooksStore.historyFilters,
    isRetryPending: webhooksStore.isRetryPending,
    userId: userStore.user!.id,
    currentDeviceType: settingsStore.currentDeviceType,
  }),
)(observer(HistoryTableView)) as unknown as React.ComponentType;
