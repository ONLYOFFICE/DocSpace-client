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

import { useMemo, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import useViewEffect from "@onlyoffice/apps-ui-kit/hooks/useViewEffect";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import type { TAuditEvent } from "SRC_DIR/store/SettingsSetupStore";
import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";
import { useStickyHeaderTop } from "SRC_DIR/components/DataTable/useStickyHeaderTop";

import { getAuditTrailColumns } from "./auditTrailColumns";
import styles from "./TableView.module.scss";

const COLUMN_WIDTHS = "auditColumnsWidths_ver-1";
// The old rows' 46px cells.
const ROW_HEIGHT = 46;

type TStores = Pick<TStore, "setup" | "settingsStore" | "userStore">;

type TAuditTrailTableProps = {
  isSettingNotPaid?: boolean;
};

type InjectedProps = TAuditTrailTableProps & {
  auditTrailUsers: TAuditEvent[];
  viewAs: string;
  setViewAs: (view: string) => void;
  currentDeviceType: TStores["settingsStore"]["currentDeviceType"];
  userId?: string;
  locale: string;
};

const getRowKey = (event: TAuditEvent) => event.id;

// Nothing happens on a click on a row, so it is not tinted under the pointer.
const ROW_PROPS: DataTableRowState = { hover: false };
const getRowProps = () => ROW_PROPS;

/** The portal's audit trail on the ui-kit DataTable. */
const AuditTrailTable = ({
  auditTrailUsers,
  viewAs,
  setViewAs,
  currentDeviceType,
  userId,
  locale,
  isSettingNotPaid,
}: InjectedProps) => {
  const { t } = useTranslation(["Settings", "Common"]);

  useViewEffect({ view: viewAs, setView: setViewAs, currentDeviceType });

  const columns = useMemo(() => getAuditTrailColumns(t, locale), [t, locale]);

  const widthStorage = useMemo(
    () => createLocalStorageWidths(`${COLUMN_WIDTHS}=${userId}`),
    [userId],
  );

  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef, { belowPinned: true });

  if (!auditTrailUsers.length) return null;

  return (
    <DataTable<TAuditEvent>
      ref={tableRef}
      ariaLabel={t("Settings:AuditTrailNav")}
      columns={columns}
      rows={auditTrailUsers}
      getRowKey={getRowKey}
      getRowProps={getRowProps}
      rowHeight={ROW_HEIGHT}
      widthStorage={widthStorage}
      className={classNames(sectionTableStyles.settingsTable, {
        [styles.unavailable]: isSettingNotPaid,
      })}
    />
  );
};

export const Table = inject(({ setup, settingsStore, userStore }: TStores) => {
  const { culture, currentDeviceType } = settingsStore;
  const { user } = userStore;

  return {
    auditTrailUsers: setup.security.auditTrail.users,
    viewAs: setup.viewAs,
    setViewAs: setup.setViewAs,
    currentDeviceType,
    userId: user?.id,
    locale: user?.cultureName || culture || "en",
  };
})(
  observer(AuditTrailTable),
) as unknown as React.ComponentType<TAuditTrailTableProps>;
