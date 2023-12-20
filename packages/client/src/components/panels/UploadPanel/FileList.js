import React, { useState, useCallback, useRef } from "react";
import CustomScrollbars from "@docspace/components/scrollbar/custom-scrollbars-virtual-list";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList as List } from "react-window";
import { inject, observer } from "mobx-react";
import FileRow from "./FileRow";
import { isDesktop } from "@docspace/components/utils/device";

const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => (
  <CustomScrollbars {...props} forwardedRef={ref} />
));

const mobileRowHeight = 48;
const desktopRowHeight = 48;
const mobileRowIncreasedHeight = 92;
const desktopRowIncreasedHeight = 88;

const FileList = ({ uploadDataFiles }) => {
  const [rowSizes, setRowSizes] = useState({});
  const listRef = useRef(null);

  const onUpdateHeight = (i, showInput) => {
    const mobileHeight = showInput ? mobileRowIncreasedHeight : mobileRowHeight;
    const desktopHeight = showInput
      ? desktopRowIncreasedHeight
      : desktopRowHeight;

    if (listRef.current) {
      listRef.current.resetAfterIndex(i, false);
    }

    const updatedValues = {
      [i]: !isDesktop() ? mobileHeight : desktopHeight,
    };

    setRowSizes((prevState) => ({
      ...prevState,
      ...updatedValues,
    }));
  };

  const getSize = (i) => {
    const standardHeight = !isDesktop() ? mobileRowHeight : desktopRowHeight;

    return rowSizes[i] ? rowSizes[i] : standardHeight;
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
      <>
        <List
          ref={listRef}
          className="List"
          height={height}
          width={width}
          itemSize={getSize}
          itemCount={uploadDataFiles.length}
          itemData={uploadDataFiles}
          outerElementType={CustomScrollbarsVirtualList}
        >
          {renderRow}
        </List>
      </>
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
