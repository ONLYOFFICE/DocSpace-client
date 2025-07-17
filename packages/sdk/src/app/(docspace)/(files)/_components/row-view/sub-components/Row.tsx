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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";
import classNames from "classnames";

import {
  FilesRow,
  FilesRowWrapper,
} from "@docspace/shared/components/files-row";
import { DragAndDrop } from "@docspace/shared/components/drag-and-drop";
import { RoomIcon } from "@docspace/shared/components/room-icon";
import Badges from "@docspace/shared/components/badges";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";

import useFilesActions from "@/app/(docspace)/_hooks/useFilesActions";
import { useActiveItemsStore } from "@/app/(docspace)/_store/ActiveItemsStore";
import useContextMenuModel from "../../../../_hooks/useContextMenuModel";
import { generateFilesItemValue } from "../../../_utils";

import { RowContent } from "./RowContent";
import { RowProps } from "../RowView.types";

import styles from "../RowView.module.scss";

const Row = observer(
  ({
    item,
    index,
    filterSortBy,
    timezone,
    displayFileExtension,
    isSSR,
  }: RowProps) => {
    const filesSelectionStore = useFilesSelectionStore();
    const { isItemActive } = useActiveItemsStore();

    const { t } = useTranslation(["Common"]);
    const theme = useTheme();
    const { openFile } = useFilesActions({ t });

    const { getContextMenuModel } = useContextMenuModel({ item });

    const element = (
      <RoomIcon logo={item.icon} title={item.title} showDefault={false} />
    );

    const badgesComponent = (
      <Badges
        className={styles.badgesComponent}
        t={t}
        theme={theme}
        item={item}
        viewAs="row"
        showNew={false}
        onFilesClick={() => {
          !item.isFolder && openFile(item);
        }}
      />
    );

    const onContextClick = (isRightMouseButtonClick?: boolean) => {
      if (isRightMouseButtonClick && filesSelectionStore.selection.length > 1) {
        return;
      }

      filesSelectionStore.setSelection([]);
      filesSelectionStore.setBufferSelection(item);
    };

    const contextMenuModel = getContextMenuModel(true);

    const isChecked = filesSelectionStore.isCheckedItem(item);
    const inProgress = isItemActive(item);

    const value = generateFilesItemValue(item, false, index);

    return (
      <FilesRowWrapper
        isActive={false}
        isFirstElem={index === 0}
        checked={isChecked}
        isDragging={false}
        isIndexEditingMode={false}
        isIndexUpdated={false}
        showHotkeyBorder={false}
        isHighlight={false}
        className={classNames(styles.rowWrapper, "row-wrapper")}
      >
        <DragAndDrop
          data-title={item.title}
          className="files-item"
          value={value}
        >
          <FilesRow
            key={item.id}
            checked={isChecked}
            mode="modern"
            isIndexEditingMode={false}
            folderCategory={false}
            isActive={false}
            isIndexUpdated={false}
            isDragging={false}
            isThirdPartyFolder={false}
            withAccess={false}
            className={classNames("files-row", {
              "row-list-item": isSSR,
            })}
            onSelect={() => filesSelectionStore.addSelection(item)}
            onContextClick={onContextClick}
            element={element}
            contextOptions={contextMenuModel}
            getContextModel={getContextMenuModel}
            badgesComponent={badgesComponent}
            inProgress={inProgress}
          >
            <RowContent
              item={item}
              filterSortBy={filterSortBy}
              timezone={timezone}
              displayFileExtension={displayFileExtension}
              badgesComponent={badgesComponent}
            />
          </FilesRow>
        </DragAndDrop>
      </FilesRowWrapper>
    );
  },
);

export { Row };
