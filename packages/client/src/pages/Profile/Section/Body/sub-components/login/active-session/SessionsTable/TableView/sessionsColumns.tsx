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

import type { TFunction } from "i18next";

import type { DataTableColumn } from "@onlyoffice/apps-ui-kit/components/data-table";

import type { TActiveSession } from "SRC_DIR/store/SettingsSetupStore";

import {
  DateCell,
  LocationCell,
  RemoveCell,
  SessionCell,
} from "./SessionsCells";

import styles from "../../active-sessions.module.scss";

/** Width of the remove button's column, the old table's last 24px track. */
export const REMOVE_COLUMN_WIDTH = 24;

type TSessionsColumnsOptions = {
  locale: string;
  /** Id of the session this browser is in: a tick and no remove button. */
  currentSessionId?: number;
  onRemove: (session: TActiveSession) => void;
};

/** The old header's columns, then the remove button of every other session. */
export const getSessionsColumns = (
  t: TFunction,
  { locale, currentSessionId, onRemove }: TSessionsColumnsOptions,
): DataTableColumn<TActiveSession>[] => [
  {
    id: "Sessions",
    title: t("Common:Sessions"),
    width: { type: "fill", min: 180 },
    cell: (session) => (
      <SessionCell
        session={session}
        isCurrent={session.id === currentSessionId}
      />
    ),
  },
  {
    id: "Date",
    title: t("Common:Date"),
    width: { type: "flex" },
    cell: (session) => <DateCell session={session} locale={locale} />,
  },
  {
    id: "Location",
    title: t("Common:Location"),
    width: { type: "flex" },
    cell: (session) => <LocationCell session={session} />,
  },
  {
    id: "Remove",
    title: "",
    width: { type: "fixed", size: REMOVE_COLUMN_WIDTH },
    cellClassName: styles.removeCell,
    cell: (session) =>
      session.id === currentSessionId ? null : (
        <RemoveCell session={session} onRemove={onRemove} />
      ),
  },
];
