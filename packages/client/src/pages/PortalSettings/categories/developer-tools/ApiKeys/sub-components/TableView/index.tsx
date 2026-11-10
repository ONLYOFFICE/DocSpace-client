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

import { useCallback, useMemo, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import type { TApiKey } from "@docspace/shared/api/api-keys/types";
import useViewEffect from "@onlyoffice/apps-ui-kit/hooks/useViewEffect";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";
import { useStickyHeaderTop } from "SRC_DIR/components/DataTable/useStickyHeaderTop";

import type { TableViewProps } from "../../types";
import { getContextOptions } from "../useContextOptions";
import { ApiKeysLifetimeTooltip } from "../ApiKeysLifetimeIcon";

import { getApiKeysColumns } from "./apiKeysColumns";
import styles from "./TableView.module.scss";

const COLUMN_WIDTHS = "apiKeysColumnsWidths_ver-1";

const getRowKey = (item: TApiKey) => item.id;

/** The portal's API keys on the ui-kit DataTable. */
const TableView = ({
  items,
  viewAs,
  setViewAs,
  userId,
  currentDeviceType,
  culture,
  onChangeApiKeyParams,
  onDeleteApiKey,
  onEditApiKey,
}: TableViewProps) => {
  const { t } = useTranslation(["Webhooks", "Common", "Settings"]);

  useViewEffect({
    view: viewAs!,
    setView: setViewAs!,
    currentDeviceType: currentDeviceType!,
  });

  const columns = useMemo(
    () => getApiKeysColumns(t, culture, onChangeApiKeyParams),
    [t, culture, onChangeApiKeyParams],
  );

  const widthStorage = useMemo(
    () => createLocalStorageWidths(`${COLUMN_WIDTHS}=${userId}`),
    [userId],
  );

  const getRowProps = useCallback(
    (item: TApiKey): DataTableRowState => ({
      className: styles.apiKeysRow,
      contextMenu: {
        options: getContextOptions(t, item, onEditApiKey, onDeleteApiKey),
      },
    }),
    [t, onEditApiKey, onDeleteApiKey],
  );

  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef, { belowPinned: true });

  return (
    <>
      <DataTable<TApiKey>
        ref={tableRef}
        ariaLabel={t("Settings:ApiKeys")}
        columns={columns}
        rows={items}
        getRowKey={getRowKey}
        getRowProps={getRowProps}
        virtualize
        widthStorage={widthStorage}
        className={classNames(sectionTableStyles.settingsTable, styles.table)}
      />
      <ApiKeysLifetimeTooltip />
    </>
  );
};

export default inject(({ setup, settingsStore, userStore }: TStore) => ({
  viewAs: setup.viewAs,
  setViewAs: setup.setViewAs,
  userId: userStore.user!.id,
  currentDeviceType: settingsStore.currentDeviceType,
  culture: settingsStore.culture,
}))(observer(TableView));
