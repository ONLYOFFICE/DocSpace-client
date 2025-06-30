// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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

import { Text } from "../../../../../components/text";
import {
  CustomScrollbarsVirtualList,
  type CustomScrollbarsVirtualListProps,
} from "../../../../../components/scrollbar";
import { RadioButton } from "../../../../../components/radio-button";
import { ASIDE_PADDING_AFTER_LAST_ITEM } from "../../../../../constants";

import type { BackupListBodyProps } from "./BackupList.types";
import styles from "../../RestoreBackup.module.scss";

const VirtualScroll = (props: CustomScrollbarsVirtualListProps) => (
  <CustomScrollbarsVirtualList
    {...props}
    paddingAfterLastItem={ASIDE_PADDING_AFTER_LAST_ITEM}
  />
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
        <div style={style}>
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
              />

              <TrashIcon
                className={classNames(
                  styles.backupListTrashIcon,
                  "backup-list_trash-icon",
                )}
                onClick={() => onTrashClick(fileId)}
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
