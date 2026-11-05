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

import type React from "react";
import { useCallback, useMemo, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import {
  DataTable,
  createLocalStorageWidths,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import type { TActiveSession } from "SRC_DIR/store/SettingsSetupStore";
import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";
import { useStickyHeaderTop } from "SRC_DIR/components/DataTable/useStickyHeaderTop";

import styles from "../../active-sessions.module.scss";

import { getSessionsColumns } from "./sessionsColumns";

const COLUMN_WIDTHS = "sessionsColumnsWidths_ver-1";

type TStores = Pick<TStore, "setup" | "settingsStore" | "userStore">;

type TTableViewProps = {
  sessionsData: TActiveSession[];
};

type InjectedProps = TTableViewProps & {
  userId: string;
  locale: string;
  currentSession: TStores["setup"]["currentSession"];
  setLogoutDialogVisible: TStores["setup"]["setLogoutDialogVisible"];
  setPlatformModalData: TStores["setup"]["setPlatformModalData"];
};

const getRowKey = (session: TActiveSession) => session.id;

const getRowProps = (session: TActiveSession): DataTableRowState => ({
  testId: `session_row_${session.id}`,
});

/** The user's active sessions on the ui-kit DataTable. */
const TableView = ({
  sessionsData,
  userId,
  locale,
  currentSession,
  setLogoutDialogVisible,
  setPlatformModalData,
}: InjectedProps) => {
  const { t } = useTranslation(["Profile", "Common"]);

  const onRemove = useCallback(
    (session: TActiveSession) => {
      setLogoutDialogVisible(true);
      setPlatformModalData({
        id: session.id,
        platform: session.platform,
        browser: session.browser,
      });
    },
    [setLogoutDialogVisible, setPlatformModalData],
  );

  const currentSessionId =
    typeof currentSession === "number" ? currentSession : undefined;

  const columns = useMemo(
    () => getSessionsColumns(t, { locale, currentSessionId, onRemove }),
    [t, locale, currentSessionId, onRemove],
  );

  const widthStorage = useMemo(
    () => createLocalStorageWidths(`${COLUMN_WIDTHS}=${userId}`),
    [userId],
  );

  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef, { belowPinned: true });

  return (
    <DataTable<TActiveSession>
      ref={tableRef}
      ariaLabel={t("Profile:ActiveSessions")}
      columns={columns}
      rows={sessionsData}
      getRowKey={getRowKey}
      getRowProps={getRowProps}
      widthStorage={widthStorage}
      className={classNames(sectionTableStyles.settingsTable, styles.table)}
    />
  );
};

export default inject(({ setup, settingsStore, userStore }: TStores) => {
  const { user } = userStore;

  return {
    userId: user!.id,
    locale: user?.cultureName || settingsStore.culture || "en",
    currentSession: setup.currentSession,
    setLogoutDialogVisible: setup.setLogoutDialogVisible,
    setPlatformModalData: setup.setPlatformModalData,
  };
})(observer(TableView)) as unknown as React.ComponentType<TTableViewProps>;
