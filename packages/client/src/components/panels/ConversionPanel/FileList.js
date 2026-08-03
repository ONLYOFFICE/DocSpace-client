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

import React, { useState, useCallback, useRef } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList as List } from "react-window";
import { inject, observer } from "mobx-react";

import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";
import { ASIDE_PADDING_AFTER_LAST_ITEM } from "@docspace/shared/constants";

import FileRow from "./FileRow";

const rowHeight = 52;
const rowIncreasedHeight = 88;

const VirtualScroll = (props) => (
  <Scrollbar
    {...props}
    paddingAfterLastItem={ASIDE_PADDING_AFTER_LAST_ITEM}
    autoFocus
  />
);

const FileList = ({ convertedFilesHistory }) => {
  const [rowSizes, setRowSizes] = useState({});
  const listRef = useRef(null);

  const onUpdateHeight = useCallback((i, showInput) => {
    const updatedHeight = showInput ? rowIncreasedHeight : rowHeight;

    if (listRef.current) {
      listRef.current.resetAfterIndex(i, false);
    }

    setRowSizes((prevState) => ({
      ...prevState,
      [i]: updatedHeight,
    }));
  }, []);

  const getSize = useCallback(
    (i) => {
      return rowSizes[i] ? rowSizes[i] : rowHeight;
    },
    [rowSizes],
  );

  const renderRow = useCallback(
    ({ data, index, style }) => {
      const item = data[index];

      return (
        <div style={style}>
          <FileRow
            key={`conversion-${index}`}
            item={item}
            updateRowsHeight={onUpdateHeight}
            index={index}
          />
        </div>
      );
    },
    [onUpdateHeight, convertedFilesHistory],
  );

  const renderList = useCallback(
    ({ height, width }) => {
      return (
        <List
          ref={listRef}
          className="List"
          height={height}
          width={width}
          itemSize={getSize}
          itemCount={convertedFilesHistory.length}
          itemData={convertedFilesHistory}
          outerElementType={VirtualScroll}
        >
          {renderRow}
        </List>
      );
    },
    [convertedFilesHistory, getSize, renderRow],
  );

  return <AutoSizer>{renderList}</AutoSizer>;
};

export default inject(({ uploadDataStore }) => {
  const { displayedConversionFiles } = uploadDataStore;

  return { convertedFilesHistory: displayedConversionFiles };
})(observer(FileList));
