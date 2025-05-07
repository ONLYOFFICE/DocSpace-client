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

import React, { useState, useCallback, useRef } from "react";
import { CustomScrollbarsVirtualListWithAutoFocus } from "@docspace/shared/components/scrollbar";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList as List } from "react-window";
import { inject, observer } from "mobx-react";
import { ASIDE_PADDING_AFTER_LAST_ITEM } from "@docspace/shared/constants";
import FileRow from "./FileRow";

const rowHeight = 52;
const rowIncreasedHeight = 88;

const VirtualScroll = (props) => (
  <CustomScrollbarsVirtualListWithAutoFocus
    {...props}
    paddingAfterLastItem={ASIDE_PADDING_AFTER_LAST_ITEM}
  />
);

const FileList = ({ uploadDataFiles }) => {
  const [rowSizes, setRowSizes] = useState({});
  const listRef = useRef(null);

  const onUpdateHeight = (i, showInput) => {
    const updatedHiaght = showInput ? rowIncreasedHeight : rowHeight;

    if (listRef.current) {
      listRef.current.resetAfterIndex(i, false);
    }

    const updatedValues = {
      [i]: updatedHiaght,
    };

    setRowSizes((prevState) => ({
      ...prevState,
      ...updatedValues,
    }));
  };

  const getSize = (i) => {
    return rowSizes[i] ? rowSizes[i] : rowHeight;
  };

  const renderRow = useCallback(({ data, index, style }) => {
    const item = data[index];

    return (
      <div style={style}>
        <FileRow item={item} updateRowsHeight={onUpdateHeight} index={index} />
      </div>
    );
  }, []);

  const renderList = ({ height, width }) => {
    return (
      <List
        ref={listRef}
        className="List"
        height={height}
        width={width}
        itemSize={getSize}
        itemCount={uploadDataFiles.length}
        itemData={uploadDataFiles}
        outerElementType={VirtualScroll}
      >
        {renderRow}
      </List>
    );
  };

  return <AutoSizer>{renderList}</AutoSizer>;
};

export default inject(({ uploadDataStore }) => {
  const { uploadedFilesHistory } = uploadDataStore;

  return {
    uploadDataFiles: uploadedFilesHistory,
  };
})(observer(FileList));
