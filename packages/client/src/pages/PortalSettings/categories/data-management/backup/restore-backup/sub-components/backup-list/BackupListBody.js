// (c) Copyright Ascensio System SIA 2009-2024
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
import { FixedSizeList as List } from "react-window";
import { ReactSVG } from "react-svg";
import AutoSizer from "react-virtualized-auto-sizer";
import { CustomScrollbarsVirtualList } from "@docspace/shared/components/scrollbar";
import { Text } from "@docspace/shared/components/text";
import { RadioButton } from "@docspace/shared/components/radio-button";
import TrashIcon from "PUBLIC_DIR/images/delete.react.svg";
import { StyledBackupList } from "../../../StyledBackup";
import FileArchive24SvgUrl from "PUBLIC_DIR/images/icons/24/file_archive.svg?url";

const BackupListBody = ({
  filesList,
  onDeleteBackup,
  onSelectFile,
  selectedFileIndex,
}) => {
  const isFileChecked = useCallback(
    (index) => {
      return index === selectedFileIndex;
    },
    [selectedFileIndex],
  );

  const onTrashClick = (id) => {
    onDeleteBackup(id);
  };

  const Item = useCallback(
    ({ index, style }) => {
      const file = filesList[index];
      const fileId = file.id;
      const fileName = file.fileName;
      const isChecked = isFileChecked(index);

      return (
        <div style={style}>
          <StyledBackupList isChecked={isChecked}>
            <div className="backup-list_item">
              <ReactSVG
                src={FileArchive24SvgUrl}
                className="backup-list_icon"
              />

              <Text className="backup-list_full-name">{fileName}</Text>

              <RadioButton
                fontSize="13px"
                fontWeight="400"
                value=""
                isChecked={isChecked}
                onClick={onSelectFile}
                name={`${index}_${fileId}`}
                className="backup-list-dialog_checked"
              />

              <TrashIcon
                className="backup-list_trash-icon"
                onClick={() => onTrashClick(fileId)}
              />
            </div>
          </StyledBackupList>
        </div>
      );
    },
    [filesList, isFileChecked],
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
          outerElementType={CustomScrollbarsVirtualList}
        >
          {Item}
        </List>
      )}
    </AutoSizer>
  );
};

export default BackupListBody;
