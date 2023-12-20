import React from "react";
import PropTypes from "prop-types";
import throttle from "lodash.throttle";
import {
  StyledTableHeader,
  StyledTableRow,
  StyledEmptyTableContainer,
} from "./StyledTableContainer";
import TableSettings from "./TableSettings";
import TableHeaderCell from "./TableHeaderCell";
import { size } from "../utils/device";
import { withTheme } from "styled-components";

const defaultMinColumnSize = 110;
const settingsSize = 24;
const containerMargin = 25;
const minSizeFirstColumn = 210;

class TableHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = { columnIndex: null, hideColumns: false };

    this.headerRef = React.createRef();
    this.throttledResize = throttle(this.onResize, 300);
  }

  componentDidMount() {
    this.onResize();
    window.addEventListener("resize", this.throttledResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.throttledResize);
  }

  componentDidUpdate() {
    this.onResize();
  }

  getSubstring = (str) => +str.substring(0, str.length - 2);

  getNextColumn = (array, index) => {
    let i = 1;

    while (array.length !== i) {
      const item = array[index + i];

      if (!item || this.state.hideColumns) return null;
      else if (!item.enable) i++;
      else return item;
    }
  };

  getColumn = (array, index) => {
    let i = 1;
    while (array.length !== i) {
      const item = array[index + i];
      if (!item) return [0, i];
      else if (item === "0px") i++;
      else return [this.getSubstring(item), i];
    }
  };

  moveToLeft = (widths, newWidth, index) => {
    const { columnIndex } = this.state;

    let leftColumn;
    let colIndex = index !== undefined ? index : columnIndex - 1;

    if (colIndex < 0) return;

    while (colIndex >= 0) {
      leftColumn = document.getElementById("column_" + colIndex);
      if (leftColumn) {
        if (leftColumn.dataset.enable === "true") break;
        else colIndex--;
      } else return false;
    }

    const minSize = leftColumn.dataset.minWidth
      ? leftColumn.dataset.minWidth
      : defaultMinColumnSize;

    if (leftColumn.clientWidth <= minSize) {
      if (colIndex < 0) return false;
      return this.moveToLeft(widths, newWidth, colIndex - 1);
    }

    const offset = this.getSubstring(widths[+columnIndex]) - newWidth;
    const column2Width = this.getSubstring(widths[colIndex]);

    const leftColumnWidth = column2Width - offset;
    const newLeftWidth = leftColumnWidth < minSize ? minSize : leftColumnWidth;

    widths[colIndex] = newLeftWidth + "px";
    widths[+columnIndex] =
      this.getSubstring(widths[+columnIndex]) +
      (offset - (newLeftWidth - leftColumnWidth)) +
      "px";
  };

  moveToRight = (widths, newWidth, index) => {
    const { columnIndex } = this.state;

    let rightColumn;
    let colIndex = index ? index : +columnIndex + 1;

    while (colIndex !== this.props.columns.length) {
      rightColumn = document.getElementById("column_" + colIndex);
      if (rightColumn) {
        if (rightColumn.dataset.enable === "true") break;
        else colIndex++;
      } else return false;
    }

    const offset = this.getSubstring(widths[+columnIndex]) - newWidth;
    const column2Width = this.getSubstring(widths[colIndex]);

    const defaultColumn = document.getElementById("column_" + colIndex);
    if (!defaultColumn || defaultColumn.dataset.defaultSize) return;

    const handleOffset = 8;

    if (column2Width + offset - handleOffset >= defaultMinColumnSize) {
      widths[+columnIndex] = newWidth + handleOffset + "px";
      widths[colIndex] = column2Width + offset - handleOffset + "px";
    } else {
      if (colIndex === this.props.columns.length) return false;
      return this.moveToRight(widths, newWidth, colIndex + 1);
    }
  };

  addNewColumns = (gridTemplateColumns, activeColumnIndex, containerWidth) => {
    const { columns, columnStorageName } = this.props;
    const filterColumns = columns.filter((x) => !x.defaultSize);

    const clearSize = gridTemplateColumns.map((c) => this.getSubstring(c));
    const maxSize = Math.max.apply(Math, clearSize);

    const defaultSize = columns[activeColumnIndex - 1].defaultSize;

    const defaultColSize = defaultSize
      ? defaultSize
      : containerWidth / filterColumns.length;
    const indexOfMaxSize = clearSize.findIndex((s) => s === maxSize);

    const newSize = maxSize - defaultColSize;

    const AddColumn = () => {
      gridTemplateColumns[indexOfMaxSize] = newSize + "px";
      gridTemplateColumns[activeColumnIndex] = defaultColSize + "px";
      return false;
    };

    const ResetColumnsSize = () => {
      localStorage.removeItem(columnStorageName);
      this.resetColumns();
      return true;
    };

    if (
      (indexOfMaxSize === 0 && newSize < minSizeFirstColumn) ||
      newSize <= defaultColSize
    )
      return ResetColumnsSize();
    else return AddColumn();
  };

  onMouseMove = (e) => {
    const { columnIndex } = this.state;
    const { containerRef, theme } = this.props;
    const isRtl = theme.interfaceDirection === "rtl";

    if (!columnIndex) return;
    const column = document.getElementById("column_" + columnIndex);
    const columnSize = column.getBoundingClientRect();
    const newWidth = isRtl
      ? columnSize.right - e.clientX
      : e.clientX - columnSize.left;

    const tableContainer = containerRef.current.style.gridTemplateColumns;
    const widths = tableContainer.split(" ");

    const minSize = column.dataset.minWidth
      ? column.dataset.minWidth
      : defaultMinColumnSize;

    if (newWidth <= minSize) {
      const columnChanged = this.moveToLeft(widths, newWidth);

      if (!columnChanged) {
        widths[+columnIndex] = widths[+columnIndex];
      }
    } else {
      this.moveToRight(widths, newWidth);
    }

    const str = widths.join(" ");

    containerRef.current.style.gridTemplateColumns = str;
    this.headerRef.current.style.gridTemplateColumns = str;

    this.updateTableRows(str);
  };

  onMouseUp = () => {
    !this.props.infoPanelVisible
      ? localStorage.setItem(
          this.props.columnStorageName,
          this.props.containerRef.current.style.gridTemplateColumns
        )
      : localStorage.setItem(
          this.props.columnInfoPanelStorageName,
          this.props.containerRef.current.style.gridTemplateColumns
        );

    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
  };

  onMouseDown = (event) => {
    this.setState({ columnIndex: event.target.dataset.column });

    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
  };

  checkingForUnfixedSize = (item, defaultColumnSize) => {
    return (
      item !== `${settingsSize}px` &&
      item !== `${defaultColumnSize}px` &&
      item !== "0px"
    );
  };

  onResize = () => {
    const {
      containerRef,
      columnStorageName,
      columnInfoPanelStorageName,
      resetColumnsSize,
      sectionWidth,
      infoPanelVisible,
      columns,
      setHideColumns,
    } = this.props;

    let activeColumnIndex = null;

    const container = containerRef.current
      ? containerRef.current
      : document.getElementById("table-container");

    if (!container) return;

    const storageSize =
      !resetColumnsSize && localStorage.getItem(columnStorageName);

    //TODO: If defaultSize(75px) is less than defaultMinColumnSize(110px) the calculations work correctly
    const defaultSize =
      this.props.columns.find((col) => col.defaultSize)?.defaultSize || 0;

    //TODO: Fixed columns size if something went wrong
    if (storageSize) {
      const splitStorage = storageSize.split(" ");

      const isInvalid = splitStorage.some((s) => s === "NaNpx");

      if (
        (defaultSize &&
          splitStorage[splitStorage.length - 2] !== `${defaultSize}px`) ||
        this.getSubstring(splitStorage[0]) <= defaultMinColumnSize ||
        isInvalid
      ) {
        localStorage.removeItem(columnStorageName);
        return this.onResize();
      }
    }

    const containerGridTemplateColumns =
      container.style.gridTemplateColumns.split(" ");

    const tableContainer = storageSize
      ? storageSize.split(" ")
      : containerGridTemplateColumns;

    if (
      containerGridTemplateColumns.length === 1 &&
      !this.state.hideColumns &&
      storageSize
    ) {
      const hasContent = !!storageSize.split(" ").find((item, index) => {
        if (index === 0) return;
        return this.checkingForUnfixedSize(item, defaultSize);
      });

      //If content column sizes are calculated as empty after changing view
      if (!hasContent) return this.resetColumns(true);
    }

    // columns.length + 1 - its settings column
    console.log(tableContainer.length, columns.length);
    if (tableContainer.length !== columns.length + 1) {
      return this.resetColumns(true);
    }

    if (!container) return;

    const containerWidth = +container.clientWidth;

    const oldWidth =
      tableContainer
        .map((column) => this.getSubstring(column))
        .reduce((x, y) => x + y) -
      defaultSize -
      settingsSize;

    let str = "";
    let gridTemplateColumnsWithoutOverfilling = [];

    if (tableContainer.length > 1) {
      const gridTemplateColumns = [];
      let hideColumns = false;

      let contentColumnsCount = 0;
      let contentColumnsCountInfoPanel = 0;

      const storageInfoPanelSize = localStorage.getItem(
        columnInfoPanelStorageName
      );

      if (storageInfoPanelSize) {
        contentColumnsCountInfoPanel = storageInfoPanelSize
          .split(" ")
          .filter((item) =>
            this.checkingForUnfixedSize(item, defaultSize)
          ).length;

        contentColumnsCount = tableContainer.filter((item) =>
          this.checkingForUnfixedSize(item, defaultSize)
        ).length;
      }

      const incorrectNumberColumns =
        contentColumnsCountInfoPanel < contentColumnsCount &&
        !this.state.hideColumns;

      const tableInfoPanelContainer =
        storageInfoPanelSize && !incorrectNumberColumns
          ? storageInfoPanelSize.split(" ")
          : tableContainer;

      let containerMinWidth = containerWidth - defaultSize - settingsSize;

      tableInfoPanelContainer.forEach((item, index) => {
        const column = document.getElementById("column_" + index);

        const enable =
          index == tableContainer.length - 1 ||
          (column ? column.dataset.enable === "true" : item !== "0px");

        if (
          enable &&
          (item !== `${defaultSize}px` || `${defaultSize}px` === `0px`) &&
          item !== `${settingsSize}px`
        ) {
          if (column?.dataset?.minWidth) {
            containerMinWidth = containerMinWidth - column.dataset.minWidth;
          } else {
            containerMinWidth = containerMinWidth - defaultMinColumnSize;
          }
        }
      });

      if (containerMinWidth < 0) {
        hideColumns = true;
      }

      if (this.state.hideColumns !== hideColumns) {
        this.setState({ hideColumns: hideColumns });
        setHideColumns(hideColumns);
      }

      if (hideColumns) {
        tableInfoPanelContainer.forEach((item, index) => {
          const column = document.getElementById("column_" + index);

          if (column?.dataset?.minWidth) {
            gridTemplateColumns.push(
              `${containerWidth - defaultSize - settingsSize}px`
            );
          } else if (
            item === `${defaultSize}px` ||
            item === `${settingsSize}px`
          ) {
            gridTemplateColumns.push(item);
          } else {
            gridTemplateColumns.push("0px");
          }
        });
      }

      let hasGridTemplateColumnsWithoutOverfilling = false;
      if (infoPanelVisible) {
        if (!hideColumns) {
          let contentWidth = containerWidth - defaultSize - settingsSize;

          let enabledColumnsCount = 0;

          tableInfoPanelContainer.forEach((item, index) => {
            if (
              index != 0 &&
              item !== "0px" &&
              item !== `${defaultSize}px` &&
              item !== `${settingsSize}px`
            ) {
              enabledColumnsCount++;
            }
          });

          const changedWidth =
            tableInfoPanelContainer
              .map((column) => this.getSubstring(column))
              .reduce((x, y) => x + y) -
            defaultSize -
            settingsSize;

          if (
            contentWidth - enabledColumnsCount * defaultMinColumnSize >
            this.getSubstring(tableInfoPanelContainer[0])
          ) {
            const currentContentWidth =
              contentWidth - +this.getSubstring(tableInfoPanelContainer[0]);

            let overWidth = 0;

            tableInfoPanelContainer.forEach((item, index) => {
              if (index == 0) {
                gridTemplateColumns.push(item);
              } else {
                const column = document.getElementById("column_" + index);

                const enable =
                  index == tableInfoPanelContainer.length - 1 ||
                  (column ? column.dataset.enable === "true" : item !== "0px");

                const defaultColumnSize = column && column.dataset.defaultSize;

                if (!enable) {
                  gridTemplateColumns.push("0px");
                } else if (item !== `${settingsSize}px`) {
                  const percent =
                    (this.getSubstring(item) /
                      (changedWidth -
                        +this.getSubstring(tableInfoPanelContainer[0]))) *
                    100;

                  const newItemWidth = defaultColumnSize
                    ? `${defaultColumnSize}px`
                    : (currentContentWidth * percent) / 100 >
                      defaultMinColumnSize
                    ? (currentContentWidth * percent) / 100 + "px"
                    : defaultMinColumnSize + "px";

                  if (
                    (currentContentWidth * percent) / 100 <
                      defaultMinColumnSize &&
                    !defaultColumnSize
                  ) {
                    overWidth +=
                      defaultMinColumnSize -
                      (currentContentWidth * percent) / 100;
                  }

                  gridTemplateColumns.push(newItemWidth);
                } else {
                  gridTemplateColumns.push(item);
                }
              }
            });

            if (overWidth > 0) {
              gridTemplateColumns.forEach((column, index) => {
                const columnWidth = this.getSubstring(column);

                if (
                  index !== 0 &&
                  column !== "0px" &&
                  column !== `${defaultSize}px` &&
                  column !== `${settingsSize}px` &&
                  columnWidth > defaultMinColumnSize
                ) {
                  const availableWidth = columnWidth - defaultMinColumnSize;

                  if (availableWidth < Math.abs(overWidth)) {
                    overWidth = Math.abs(overWidth) - availableWidth;
                    return (gridTemplateColumns[index] =
                      columnWidth - availableWidth + "px");
                  } else {
                    const temp = overWidth;

                    overWidth = 0;

                    return (gridTemplateColumns[index] =
                      columnWidth - Math.abs(temp) + "px");
                  }
                }
              });
            }
          } else {
            tableInfoPanelContainer.forEach((item, index) => {
              const column = document.getElementById("column_" + index);

              const enable =
                index == tableInfoPanelContainer.length - 1 ||
                (column ? column.dataset.enable === "true" : item !== "0px");

              const defaultColumnSize = column && column.dataset.defaultSize;

              if (!enable) {
                gridTemplateColumns.push("0px");
              } else if (item !== `${settingsSize}px`) {
                const newItemWidth = defaultColumnSize
                  ? `${defaultColumnSize}px`
                  : index == 0
                  ? `${
                      contentWidth - enabledColumnsCount * defaultMinColumnSize
                    }px`
                  : `${defaultMinColumnSize}px`;

                gridTemplateColumns.push(newItemWidth);
              } else {
                gridTemplateColumns.push(item);
              }
            });
          }
        }
      } else {
        let overWidth = 0;
        if (!hideColumns) {
          for (let index in tableContainer) {
            const item = tableContainer[index];

            const column = document.getElementById("column_" + index);
            const enable =
              index == tableContainer.length - 1 ||
              (column ? column.dataset.enable === "true" : item !== "0px");
            const defaultColumnSize = column && column.dataset.defaultSize;

            const isActiveNow = item === "0px" && enable;
            if (isActiveNow && column) activeColumnIndex = index;

            if (!enable) {
              gridTemplateColumns.push("0px");

              let colIndex = 1;
              let leftEnableColumn = gridTemplateColumns[index - colIndex];
              while (leftEnableColumn === "0px") {
                colIndex++;
                leftEnableColumn = gridTemplateColumns[index - colIndex];
              }

              //added the size of the disabled column to the left column
              gridTemplateColumns[index - colIndex] =
                this.getSubstring(gridTemplateColumns[index - colIndex]) +
                this.getSubstring(item) +
                "px";
            } else if (item !== `${settingsSize}px`) {
              const percent = (this.getSubstring(item) / oldWidth) * 100;

              let newItemWidth = defaultColumnSize
                ? `${defaultColumnSize}px`
                : percent === 0
                ? `${defaultMinColumnSize}px`
                : ((containerWidth - defaultSize - settingsSize) * percent) /
                    100 +
                  "px";

              const minWidth = column?.dataset?.minWidth;
              const minSize = +minWidth || minSizeFirstColumn;

              //Checking whether the first column is less than the minimum width
              if (+index === 0 && this.getSubstring(newItemWidth) < minSize) {
                overWidth =
                  overWidth +
                  (minSizeFirstColumn - this.getSubstring(newItemWidth));
                newItemWidth = minSizeFirstColumn + "px";
              }

              //Checking whether columns are smaller than the minimum width
              if (
                +index !== 0 &&
                !defaultColumnSize &&
                this.getSubstring(newItemWidth) < defaultMinColumnSize
              ) {
                overWidth =
                  overWidth +
                  (defaultMinColumnSize - this.getSubstring(newItemWidth));
                newItemWidth = defaultMinColumnSize + "px";
              }

              gridTemplateColumns.push(newItemWidth);
            } else {
              gridTemplateColumns.push(item);
            }
          }

          if (overWidth > 0) {
            gridTemplateColumnsWithoutOverfilling = this.distributionOverWidth(
              overWidth,
              gridTemplateColumns
            );
          }

          hasGridTemplateColumnsWithoutOverfilling =
            gridTemplateColumnsWithoutOverfilling &&
            gridTemplateColumnsWithoutOverfilling.length > 0;

          if (activeColumnIndex) {
            const gridColumns = hasGridTemplateColumnsWithoutOverfilling
              ? gridTemplateColumnsWithoutOverfilling
              : gridTemplateColumns;

            const needReset = this.addNewColumns(
              gridColumns,
              activeColumnIndex,
              containerWidth
            );
            if (needReset) return;
          }
        }
      }

      str = hasGridTemplateColumnsWithoutOverfilling
        ? gridTemplateColumnsWithoutOverfilling.join(" ")
        : gridTemplateColumns.join(" ");
    } else {
      this.resetColumns(true);
    }

    if (str) {
      container.style.gridTemplateColumns = str;

      this.updateTableRows(str);

      if (this.headerRef.current) {
        this.headerRef.current.style.gridTemplateColumns = str;
        this.headerRef.current.style.width = containerWidth + "px";
      }

      infoPanelVisible
        ? localStorage.setItem(columnInfoPanelStorageName, str)
        : localStorage.setItem(columnStorageName, str);

      if (!infoPanelVisible) {
        localStorage.removeItem(columnInfoPanelStorageName);
      }
    }
  };

  distributionOverWidth = (overWidth, gridTemplateColumns) => {
    const newGridTemplateColumns = JSON.parse(
      JSON.stringify(gridTemplateColumns)
    );

    let countColumns = 0;
    const defaultColumnSize =
      this.props.columns.find((col) => col.defaultSize)?.defaultSize || 0;

    newGridTemplateColumns.forEach((item, index) => {
      const unfixedSize = this.checkingForUnfixedSize(item, defaultColumnSize);
      if (!unfixedSize) return;

      const column = document.getElementById("column_" + index);
      const minWidth = column?.dataset?.minWidth;
      const minSize = +minWidth || minSizeFirstColumn;

      if (
        (index === 0 ? minSize : defaultMinColumnSize) !==
        this.getSubstring(item)
      )
        countColumns++;
    });

    const addWidth = overWidth / countColumns;

    newGridTemplateColumns.forEach((item, index) => {
      const unfixedSize = this.checkingForUnfixedSize(item, defaultColumnSize);
      if (!unfixedSize) return;

      const column = document.getElementById("column_" + index);
      const minWidth = column?.dataset?.minWidth;
      const minSize = +minWidth || minSizeFirstColumn;

      const itemSubstring = this.getSubstring(item);

      if ((index === 0 ? minSize : defaultMinColumnSize) === itemSubstring)
        return;

      const differenceWithMinimum =
        itemSubstring - (index === 0 ? minSize : defaultMinColumnSize);

      if (differenceWithMinimum >= addWidth) {
        newGridTemplateColumns[index] = itemSubstring - addWidth + "px";
      } else {
        newGridTemplateColumns[index] =
          (index === 0 ? minSize : defaultMinColumnSize) + "px";
      }
    });

    return newGridTemplateColumns;
  };

  updateTableRows = (str) => {
    if (!this.props.useReactWindow) return;

    const rows = document.querySelectorAll(".table-row, .table-list-item");

    if (rows?.length) {
      for (let i = 0; i < rows.length; i++) {
        rows[i].style.gridTemplateColumns = str;
      }
    }
  };

  resetColumns = (resetToDefault = false) => {
    const {
      containerRef,
      columnStorageName,
      columnInfoPanelStorageName,
      columns,
      infoPanelVisible,
    } = this.props;
    console.log("resetColumns");
    const defaultSize = this.props.columns.find(
      (col) => col.defaultSize
    )?.defaultSize;

    let str = "";

    const enableColumns = this.props.columns
      .filter((x) => x.enable)
      .filter((x) => !x.defaultSize)
      .filter((x) => !x.default);

    const container = containerRef.current
      ? containerRef.current
      : document.getElementById("table-container");
    const containerWidth = +container.clientWidth;

    if (resetToDefault) {
      const firstColumnPercent = 40;
      const percent = 60 / enableColumns.length;

      const wideColumnSize = (containerWidth * firstColumnPercent) / 100 + "px";
      const otherColumns = (containerWidth * percent) / 100 + "px";

      for (let col of columns) {
        if (col.default) {
          str += `${wideColumnSize} `;
        } else
          str += col.enable
            ? col.defaultSize
              ? `${col.defaultSize}px `
              : `${otherColumns} `
            : "0px ";
      }
    } else {
      const percent = 100 / enableColumns.length;
      const newContainerWidth =
        containerWidth - containerMargin - (defaultSize || 0);
      const otherColumns = (newContainerWidth * percent) / 100 + "px";

      str = "";
      for (let col of this.props.columns) {
        str += col.enable
          ? /*  col.minWidth
            ? `${col.minWidth}px `
            :  */ col.defaultSize
            ? `${col.defaultSize}px `
            : `${otherColumns} `
          : "0px ";
      }
    }

    str += `${settingsSize}px`;

    container.style.gridTemplateColumns = str;
    if (this.headerRef.current) {
      this.headerRef.current.style.gridTemplateColumns = str;
      this.headerRef.current.style.width = containerWidth + "px";
    }

    str
      ? !infoPanelVisible
        ? localStorage.setItem(columnStorageName, str)
        : localStorage.setItem(columnInfoPanelStorageName, str)
      : null;

    this.onResize();
  };

  render() {
    const {
      columns,
      sortBy,
      sorted,
      isLengthenHeader,
      sortingVisible,
      infoPanelVisible,
      showSettings,
      tagRef,
      settingsTitle,
      ...rest
    } = this.props;

    //console.log("TABLE HEADER RENDER", columns);

    return (
      <>
        <StyledTableHeader
          id="table-container_caption-header"
          className={`${
            isLengthenHeader ? "lengthen-header" : ""
          } table-container_header`}
          ref={this.headerRef}
          {...rest}
        >
          <StyledTableRow>
            {columns.map((column, index) => {
              const nextColumn = this.getNextColumn(columns, index);
              const resizable = nextColumn ? nextColumn.resizable : false;

              return (
                <TableHeaderCell
                  key={column.key ?? "empty-cell"}
                  index={index}
                  column={column}
                  sorted={sorted}
                  sortBy={sortBy}
                  resizable={resizable}
                  defaultSize={column.defaultSize}
                  onMouseDown={this.onMouseDown}
                  sortingVisible={sortingVisible}
                  tagRef={tagRef}
                />
              );
            })}

            {showSettings && (
              <div
                className="table-container_header-settings"
                title={settingsTitle}
              >
                <TableSettings
                  columns={columns}
                  disableSettings={infoPanelVisible || this.state.hideColumns}
                />
              </div>
            )}
          </StyledTableRow>
        </StyledTableHeader>

        <StyledEmptyTableContainer />
      </>
    );
  }
}

TableHeader.defaultProps = {
  sortingVisible: true,
  infoPanelVisible: false,
  useReactWindow: false,
  showSettings: true,
};

TableHeader.propTypes = {
  containerRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  columns: PropTypes.array.isRequired,
  sortBy: PropTypes.string,
  sorted: PropTypes.bool,
  columnStorageName: PropTypes.string,
  sectionWidth: PropTypes.number,
  onClick: PropTypes.func,
  resetColumnsSize: PropTypes.bool,
  isLengthenHeader: PropTypes.bool,
  sortingVisible: PropTypes.bool,
  infoPanelVisible: PropTypes.bool,
  useReactWindow: PropTypes.bool,
  showSettings: PropTypes.bool,
};

export default withTheme(TableHeader);
