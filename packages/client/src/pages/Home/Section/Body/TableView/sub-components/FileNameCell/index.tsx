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

import React, { ChangeEvent, memo, useCallback, useMemo } from "react";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { classNames } from "@docspace/shared/utils";
import { TableCell } from "@docspace/ui-kit/components/table";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { createPluginFileHandlers } from "@docspace/shared/utils/plugin-file-utils";

import { FileName } from "./FileNameCell.helpers";
import { tableCellStyle } from "./FileNameCell.constants";
import type {
  FileNameCellComponent,
  FileNameCellItem,
  FileNameCellProps,
} from "./FileNameCell.types";

const FileNameCell = <T extends FileNameCellItem = FileNameCellItem>({
  item,
  titleWithoutExt,
  linkStyles,
  element,
  onContentSelect,
  checked,
  theme,
  t,
  inProgress,
  isIndexEditingMode,
  displayFileExtension,
}: FileNameCellProps<T>) => {
  const { title } = item;

  const fileExst =
    item !== null && "fileExst" in item && item.fileExst ? item.fileExst : "";

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onContentSelect && onContentSelect(e.target.checked, item);
    },
    [onContentSelect, item],
  );

  const indexingClass = isIndexEditingMode ? "item-file-name-index" : "";

  const linkProps = useMemo(() => {
    const baseProps = isIndexEditingMode ? undefined : { ...linkStyles };

    return createPluginFileHandlers(item, baseProps);
  }, [item, isIndexEditingMode, linkStyles]);

  return (
    <>
      {inProgress ? (
        <Loader
          className="table-container_row-loader"
          color=""
          size="20px"
          type={LoaderTypes.track}
        />
      ) : (
        <TableCell
          className={classNames("table-container_element-wrapper", {
            "table-container-index": isIndexEditingMode,
          })}
          style={tableCellStyle}
          hasAccess
          checked={checked}
        >
          <div className="table-container_element-container">
            <div className="table-container_element">{element}</div>
            {!isIndexEditingMode ? (
              <Checkbox
                className="table-container_row-checkbox"
                onChange={onChange}
                isChecked={checked}
                title={t("Common:TitleSelectFile")}
              />
            ) : null}
          </div>
        </TableCell>
      )}
      <FileName
        title={title}
        color={theme.filesSection.tableView.fileName.linkColor}
        linkProps={linkProps}
        indexingClass={indexingClass}
        titleWithoutExt={titleWithoutExt}
        displayFileExtension={displayFileExtension}
        fileExst={fileExst}
      />
    </>
  );
};

export default memo(FileNameCell) as FileNameCellComponent;
