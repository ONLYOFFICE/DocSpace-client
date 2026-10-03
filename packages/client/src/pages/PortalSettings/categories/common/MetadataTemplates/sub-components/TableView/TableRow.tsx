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

import classNames from "classnames";
import { useTranslation } from "react-i18next";

import {
  TableCell,
  TableRow as TableRowComponent,
} from "@onlyoffice/apps-ui-kit/components/table";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { ToggleButton } from "@onlyoffice/apps-ui-kit/components/toggle-button";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";

import type { TTemplateItemProps } from "../../types";
import { useContextOptions } from "../useContextOptions";
import styles from "./TableView.module.scss";

type TableRowProps = TTemplateItemProps & {
  hideColumns: boolean;
};

const TableRow = ({
  item,
  author,
  hideColumns,
  onEdit,
  onDelete,
  onToggleVisible,
}: TableRowProps) => {
  const { i18n } = useTranslation();
  const contextOptions = useContextOptions({ item, onEdit, onDelete });

  return (
    <TableRowComponent
      className={classNames(styles.tableRow, {
        [styles.hideColumns]: hideColumns,
      })}
      contextOptions={contextOptions}
      hideColumns={hideColumns}
      dataTestId={`metadata_template_row_${item.id}`}
    >
      <TableCell>
        <Text fontWeight={600} truncate>
          {item.name}
        </Text>
      </TableCell>
      <TableCell>
        <Text className={styles.secondaryText} fontWeight={600}>
          {item.fields?.length ?? 0}
        </Text>
      </TableCell>
      <TableCell>
        <Text className={styles.secondaryText} fontWeight={600} truncate>
          {author}
        </Text>
      </TableCell>
      <TableCell>
        <Text className={styles.secondaryText} fontWeight={600} truncate>
          {getCorrectDate(i18n.language, item.modifiedOn)}
        </Text>
      </TableCell>
      <TableCell>
        <ToggleButton
          className={styles.toggleButton}
          isChecked={item.visible}
          onChange={() => onToggleVisible(item)}
          dataTestId={`metadata_template_visible_${item.id}`}
        />
      </TableCell>
    </TableRowComponent>
  );
};

export default TableRow;
