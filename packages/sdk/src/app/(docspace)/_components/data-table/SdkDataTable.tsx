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

"use client";

import { useRef } from "react";
import classNames from "classnames";

import {
  DataTable,
  type DataTableProps,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import { SDK_TABLE_IDS, SDK_TABLE_TEST_IDS } from "./constants";
import { useStickyHeaderTop } from "./useStickyHeaderTop";
import styles from "./SdkDataTable.module.scss";

type SdkDataTableProps<T> = Omit<DataTableProps<T>, "ref">;

/**
 * A section list of the SDK on the ui-kit DataTable, with the old table's ids
 * and test ids, the section's gutters and a header that stops below what the
 * Section pins above the list.
 */
export const SdkDataTable = <T,>({
  className,
  headerClassName,
  ...props
}: SdkDataTableProps<T>) => {
  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef);

  return (
    <DataTable<T>
      id={SDK_TABLE_IDS.table}
      headerId={SDK_TABLE_IDS.header}
      testId={SDK_TABLE_TEST_IDS.table}
      headerTestId={SDK_TABLE_TEST_IDS.header}
      bodyTestId={SDK_TABLE_TEST_IDS.body}
      {...props}
      ref={tableRef}
      className={classNames(styles.sectionTable, className)}
      headerClassName={classNames(styles.header, headerClassName)}
    />
  );
};
