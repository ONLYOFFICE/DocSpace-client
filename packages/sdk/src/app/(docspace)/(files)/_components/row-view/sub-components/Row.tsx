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

import {
  StyledWrapper,
  StyledSimpleFilesRow,
} from "@docspace/shared/styles/FilesRow.styled";
import { DragAndDrop } from "@docspace/shared/components/drag-and-drop";
import { RoomIcon } from "@docspace/shared/components/room-icon";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";

import useContextMenuModel from "../../../_hooks/useContextMenuModel";

import { RowContent } from "./RowContent";
import { RowProps } from "../RowView.types";

const Row = observer(
  ({ item, index, filterSortBy, timezone, displayFileExtension }: RowProps) => {
    const filesSelectionStore = useFilesSelectionStore();

    const [isInit, setisInit] = React.useState(false);

    const { getContextMenuModel } = useContextMenuModel({ item });

    React.useEffect(() => {
      setisInit(true);
    }, []);

    const element = (
      <RoomIcon logo={item.icon} title={item.title} showDefault={false} />
    );

    const contextMenuModel = getContextMenuModel(true);

    const isChecked = filesSelectionStore.isCheckedItem(item);

    return (
      <StyledWrapper
        isActive={false}
        isFirstElem={index === 0}
        checked={isChecked}
        isDragging={false}
        isIndexEditingMode={false}
        isIndexUpdated={false}
        showHotkeyBorder={false}
        isHighlight={false}
        className="row-wrapper"
      >
        <DragAndDrop data-title={item.title} className="files-item">
          <StyledSimpleFilesRow
            key={item.id}
            isEdit={"isEditing" in item && item.isEditing}
            checked={isChecked}
            mode="modern"
            isIndexEditingMode={false}
            onChangeIndex={() => {}}
            sectionWidth={0}
            folderCategory={null}
            isActive={false}
            isIndexUpdated={false}
            isDragging={false}
            isThirdPartyFolder={false}
            withAccess={false}
            className={`${!isInit ? "row-list-item " : ""} files-row`}
            onSelect={() => filesSelectionStore.addSelection(item)}
            element={element}
            contextOptions={contextMenuModel}
            getContextModel={getContextMenuModel}
          >
            <RowContent
              item={item}
              filterSortBy={filterSortBy}
              timezone={timezone}
              displayFileExtension={displayFileExtension}
            />
          </StyledSimpleFilesRow>
        </DragAndDrop>
      </StyledWrapper>
    );
  },
);

export { Row };
