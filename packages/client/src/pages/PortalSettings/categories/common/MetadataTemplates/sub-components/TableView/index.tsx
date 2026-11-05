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
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import type { TMetadataTemplate } from "@docspace/shared/api/metadata/types";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableRenderRowProps,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import { useStore } from "SRC_DIR/store/useStore";
import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";
import { useStickyHeaderTop } from "SRC_DIR/components/DataTable/useStickyHeaderTop";

import type { TTemplatesListProps } from "../../types";
import { getMetadataTemplatesColumns } from "./metadataTemplatesColumns";
import MetadataTemplateRow from "./MetadataTemplateRow";
import styles from "./TableView.module.scss";

const COLUMN_WIDTHS = "metadataTemplatesColumnsWidths_ver-1";

const getRowKey = (item: TMetadataTemplate) => item.id;

/** The portal's metadata templates on the ui-kit DataTable. */
const TableView = ({
  items,
  onEdit,
  onDelete,
  onToggleVisible,
}: TTemplatesListProps) => {
  const { t, i18n } = useTranslation(["Metadata", "Settings", "Common"]);
  const { user } = useStore("userStore");

  const columns = useMemo(
    () => getMetadataTemplatesColumns(t, i18n.language, onToggleVisible),
    [t, i18n.language, onToggleVisible],
  );

  const widthStorage = useMemo(
    () => createLocalStorageWidths(`${COLUMN_WIDTHS}=${user?.id}`),
    [user?.id],
  );

  const renderRow = useCallback(
    ({ row, index, rowProps }: DataTableRenderRowProps<TMetadataTemplate>) => (
      <MetadataTemplateRow
        item={row}
        index={index}
        rowProps={rowProps}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    [onEdit, onDelete],
  );

  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef, { belowPinned: true });

  return (
    <DataTable<TMetadataTemplate>
      ref={tableRef}
      ariaLabel={t("Settings:MetadataTemplates")}
      columns={columns}
      rows={items}
      getRowKey={getRowKey}
      renderRow={renderRow}
      widthStorage={widthStorage}
      className={classNames(sectionTableStyles.settingsTable, styles.table)}
    />
  );
};

export default observer(TableView);
