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

import React, { useCallback } from "react";
import {
  FixedSizeList as List,
  type ListChildComponentProps,
} from "react-window";
import { ReactSVG } from "react-svg";
import AutoSizer from "react-virtualized-auto-sizer";
import classNames from "classnames";

import TrashIcon from "PUBLIC_DIR/images/delete.react.svg";
import FileArchive32SvgUrl from "PUBLIC_DIR/images/icons/32/archive.svg?url";

import { Text } from "@docspace/ui-kit/components/text";
import {
  type ScrollbarProps,
  Scrollbar,
} from "@docspace/ui-kit/components/scrollbar";
import { RadioButton } from "@docspace/ui-kit/components/radio-button";
import { ASIDE_PADDING_AFTER_LAST_ITEM } from "../../../../../constants";

import type { BackupListBodyProps } from "./BackupList.types";
import styles from "../../RestoreBackup.module.scss";

const VirtualScroll = (props: ScrollbarProps) => (
  <Scrollbar {...props} paddingAfterLastItem={ASIDE_PADDING_AFTER_LAST_ITEM} />
);

VirtualScroll.displayName = "VirtualScroll";

const BackupListBody = ({
  filesList,
  onDeleteBackup,
  onSelectFile,
  selectedFileIndex,
}: BackupListBodyProps) => {
  const isFileChecked = useCallback(
    (index: number) => {
      return index === selectedFileIndex;
    },
    [selectedFileIndex],
  );

  const onTrashClick = useCallback(
    (id: string) => {
      onDeleteBackup(id);
    },
    [onDeleteBackup],
  );

  const Item = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const file = filesList[index];
      const fileId = file.id;
      const fileName = file.fileName;
      const isChecked = isFileChecked(index);

      return (
        <div style={style} data-testid={`backup_list_item_${index}`}>
          <div
            className={classNames(styles.backupList, {
              [styles.isChecked]: isChecked,
            })}
          >
            <div
              className={classNames(styles.backupListItem, "backup-list_item")}
            >
              <ReactSVG
                src={FileArchive32SvgUrl}
                className={classNames(
                  styles.backupListIcon,
                  "backup-list_icon",
                )}
              />

              <Text
                className={classNames(
                  styles.backupListFullName,
                  "backup-list_full-name",
                )}
                dataTestId="backup_list_full_name"
              >
                {fileName}
              </Text>

              <RadioButton
                fontSize="13px"
                fontWeight={400}
                value=""
                isChecked={isChecked}
                onClick={onSelectFile}
                name={`${index}_${fileId}`}
                className={classNames(
                  styles.backupListDialogChecked,
                  "backup-list-dialog_checked",
                )}
                testId="select_file_radio_button"
              />

              <TrashIcon
                className={classNames(
                  styles.backupListTrashIcon,
                  "backup-list_trash-icon",
                )}
                onClick={() => onTrashClick(fileId)}
                dataTestId="select_file_trash_icon"
              />
            </div>
          </div>
        </div>
      );
    },
    [filesList, isFileChecked, onSelectFile, onTrashClick],
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width + 8}
          itemSize={48}
          itemCount={filesList.length}
          itemData={filesList}
          outerElementType={VirtualScroll}
        >
          {Item}
        </List>
      )}
    </AutoSizer>
  );
};

export default BackupListBody;
