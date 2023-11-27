import React from "react";
import PropTypes from "prop-types";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'loda... Remove this comment to see the full error message
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

const minColumnSize = 150;
const defaultMinColumnSize = 110;
const settingsSize = 24;
const containerMargin = 25;

class TableHeader extends React.Component {
  headerRef: any;
  throttledResize: any;
  constructor(props: any) {
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

  getSubstring = (str: any) => +str.substring(0, str.length - 2);

  getNextColumn = (array: any, index: any) => {
    let i = 1;

    while (array.length !== i) {
      const item = array[index + i];

      // @ts-expect-error TS(2339): Property 'hideColumns' does not exist on type 'Rea... Remove this comment to see the full error message
      if (!item || this.state.hideColumns) return null;
      else if (!item.enable) i++;
      else return item;
    }
  };

  getColumn = (array: any, index: any) => {
    let i = 1;
    while (array.length !== i) {
      const item = array[index + i];
      if (!item) return [0, i];
      else if (item === "0px") i++;
      else return [this.getSubstring(item), i];
    }
  };

  // @ts-expect-error TS(7024): Function implicitly has return type 'any' because ... Remove this comment to see the full error message
  moveToLeft = (widths: any, newWidth: any, index: any) => {
    // @ts-expect-error TS(2339): Property 'columnIndex' does not exist on type 'Rea... Remove this comment to see the full error message
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

    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    const minSize = leftColumn.dataset.minWidth
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      ? leftColumn.dataset.minWidth
      : defaultMinColumnSize;

    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
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
      // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      (offset - (newLeftWidth - leftColumnWidth)) +
      "px";
  };

  // @ts-expect-error TS(7024): Function implicitly has return type 'any' because ... Remove this comment to see the full error message
  moveToRight = (widths: any, newWidth: any, index: any) => {
    // @ts-expect-error TS(2339): Property 'columnIndex' does not exist on type 'Rea... Remove this comment to see the full error message
    const { columnIndex } = this.state;

    let rightColumn;
    let colIndex = index ? index : +columnIndex + 1;

    // @ts-expect-error TS(2339): Property 'columns' does not exist on type 'Readonl... Remove this comment to see the full error message
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

    if (column2Width + offset >= defaultMinColumnSize) {
      widths[+columnIndex] = newWidth + handleOffset + "px";
      widths[colIndex] = column2Width + offset - handleOffset + "px";
    } else {
      // @ts-expect-error TS(2339): Property 'columns' does not exist on type 'Readonl... Remove this comment to see the full error message
      if (colIndex === this.props.columns.length) return false;
      return this.moveToRight(widths, newWidth, colIndex + 1);
    }
  };

  addNewColumns = (gridTemplateColumns: any, activeColumnIndex: any, containerWidth: any) => {
    // @ts-expect-error TS(2339): Property 'columns' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { columns, columnStorageName } = this.props;
    const filterColumns = columns.filter((x: any) => !x.defaultSize);

    const clearSize = gridTemplateColumns.map((c: any) => this.getSubstring(c));
    const maxSize = Math.max.apply(Math, clearSize);

    const defaultSize = columns[activeColumnIndex - 1].defaultSize;

    const defaultColSize = defaultSize
      ? defaultSize
      : containerWidth / filterColumns.length;
    const indexOfMaxSize = clearSize.findIndex((s: any) => s === maxSize);

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

    if (indexOfMaxSize === 1) {
      if (newSize <= 180 || newSize <= defaultColSize)
        return ResetColumnsSize();
      else return AddColumn();
    } else if (newSize <= defaultColSize) return ResetColumnsSize();
    else return AddColumn();
  };

  onMouseMove = (e: any) => {
    // @ts-expect-error TS(2339): Property 'columnIndex' does not exist on type 'Rea... Remove this comment to see the full error message
    const { columnIndex } = this.state;
    // @ts-expect-error TS(2339): Property 'containerRef' does not exist on type 'Re... Remove this comment to see the full error message
    const { containerRef, theme } = this.props;
    const isRtl = theme.interfaceDirection === "rtl";

    if (!columnIndex) return;
    const column = document.getElementById("column_" + columnIndex);
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    const columnSize = column.getBoundingClientRect();
    const newWidth = isRtl
      ? columnSize.right - e.clientX
      : e.clientX - columnSize.left;

    const tableContainer = containerRef.current.style.gridTemplateColumns;
    const widths = tableContainer.split(" ");

    // @ts-expect-error TS(2531): Object is possibly 'null'.
    const minSize = column.dataset.minWidth
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      ? column.dataset.minWidth
      : defaultMinColumnSize;

    if (newWidth <= minSize) {
      // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
      const columnChanged = this.moveToLeft(widths, newWidth);

      if (!columnChanged) {
        widths[+columnIndex] = widths[+columnIndex];
      }
    } else {
      // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
      this.moveToRight(widths, newWidth);
    }

    const str = widths.join(" ");

    containerRef.current.style.gridTemplateColumns = str;
    this.headerRef.current.style.gridTemplateColumns = str;

    this.updateTableRows(str);
  };

  onMouseUp = () => {
    // @ts-expect-error TS(2339): Property 'infoPanelVisible' does not exist on type... Remove this comment to see the full error message
    !this.props.infoPanelVisible
      ? localStorage.setItem(
          // @ts-expect-error TS(2339): Property 'columnStorageName' does not exist on typ... Remove this comment to see the full error message
          this.props.columnStorageName,
          // @ts-expect-error TS(2339): Property 'containerRef' does not exist on type 'Re... Remove this comment to see the full error message
          this.props.containerRef.current.style.gridTemplateColumns
        )
      : localStorage.setItem(
          // @ts-expect-error TS(2339): Property 'columnInfoPanelStorageName' does not exi... Remove this comment to see the full error message
          this.props.columnInfoPanelStorageName,
          // @ts-expect-error TS(2339): Property 'containerRef' does not exist on type 'Re... Remove this comment to see the full error message
          this.props.containerRef.current.style.gridTemplateColumns
        );

    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
  };

  onMouseDown = (event: any) => {
    this.setState({ columnIndex: event.target.dataset.column });

    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
  };

  checkingForUnfixedSize = (item: any, defaultColumnSize: any) => {
    return (
      item !== `${settingsSize}px` &&
      item !== `${defaultColumnSize}px` &&
      item !== "0px"
    );
  };

  // @ts-expect-error TS(7024): Function implicitly has return type 'any' because ... Remove this comment to see the full error message
  onResize = () => {
    const {
      // @ts-expect-error TS(2339): Property 'containerRef' does not exist on type 'Re... Remove this comment to see the full error message
      containerRef,
      // @ts-expect-error TS(2339): Property 'columnStorageName' does not exist on typ... Remove this comment to see the full error message
      columnStorageName,
      // @ts-expect-error TS(2339): Property 'columnInfoPanelStorageName' does not exi... Remove this comment to see the full error message
      columnInfoPanelStorageName,
      // @ts-expect-error TS(2339): Property 'resetColumnsSize' does not exist on type... Remove this comment to see the full error message
      resetColumnsSize,
      // @ts-expect-error TS(2339): Property 'sectionWidth' does not exist on type 'Re... Remove this comment to see the full error message
      sectionWidth,
      // @ts-expect-error TS(2339): Property 'infoPanelVisible' does not exist on type... Remove this comment to see the full error message
      infoPanelVisible,
      // @ts-expect-error TS(2339): Property 'columns' does not exist on type 'Readonl... Remove this comment to see the full error message
      columns,
      // @ts-expect-error TS(2339): Property 'setHideColumns' does not exist on type '... Remove this comment to see the full error message
      setHideColumns,
    } = this.props;

    // @ts-expect-error TS(2339): Property 'hideColumns' does not exist on type 'Rea... Remove this comment to see the full error message
    if (!infoPanelVisible && this.state.hideColumns) {
      this.setState({ hideColumns: false });
      setHideColumns && setHideColumns(false);
    }

    let activeColumnIndex = null;

    const container = containerRef.current
      ? containerRef.current
      : document.getElementById("table-container");

    if (!container) return;

    const storageSize =
      !resetColumnsSize && localStorage.getItem(columnStorageName);

    //TODO: If defaultSize(75px) is less than defaultMinColumnSize(110px) the calculations work correctly
    const defaultSize =
      // @ts-expect-error TS(2339): Property 'columns' does not exist on type 'Readonl... Remove this comment to see the full error message
      this.props.columns.find((col: any) => col.defaultSize)?.defaultSize || 0;

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

    const tableContainer = storageSize
      ? storageSize.split(" ")
      : container.style.gridTemplateColumns.split(" ");

    // columns.length + 1 - its settings column
    if (tableContainer.length !== columns.length + 1) {
      return this.resetColumns(true);
    }

    if (!container) return;

    const containerWidth = +container.clientWidth;

    const oldWidth =
      tableContainer
        .map((column: any) => this.getSubstring(column))
        .reduce((x: any, y: any) => x + y) -
      defaultSize -
      settingsSize;

    let str = "";

    if (tableContainer.length > 1) {
      const gridTemplateColumns: any = [];
      let hideColumns = false;

      if (infoPanelVisible) {
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

          contentColumnsCount = tableContainer.filter((item: any) => this.checkingForUnfixedSize(item, defaultSize)
          ).length;
        }

        let incorrectNumberColumns =
          contentColumnsCountInfoPanel < contentColumnsCount &&
          // @ts-expect-error TS(2339): Property 'hideColumns' does not exist on type 'Rea... Remove this comment to see the full error message
          !this.state.hideColumns;

        const tableInfoPanelContainer =
          storageInfoPanelSize && !incorrectNumberColumns
            ? storageInfoPanelSize.split(" ")
            : tableContainer;

        let containerMinWidth = containerWidth - defaultSize - settingsSize;

        tableInfoPanelContainer.forEach((item: any, index: any) => {
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
              // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
              containerMinWidth = containerMinWidth - column.dataset.minWidth;
            } else {
              containerMinWidth = containerMinWidth - defaultMinColumnSize;
            }
          }
        });

        if (containerMinWidth < 0) {
          hideColumns = true;
        }

        // @ts-expect-error TS(2339): Property 'hideColumns' does not exist on type 'Rea... Remove this comment to see the full error message
        if (this.state.hideColumns !== hideColumns) {
          this.setState({ hideColumns: hideColumns });
          setHideColumns(hideColumns);
        }

        if (hideColumns) {
          tableInfoPanelContainer.forEach((item: any, index: any) => {
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
        } else {
          let contentWidth = containerWidth - defaultSize - settingsSize;

          let enabledColumnsCount = 0;

          tableInfoPanelContainer.forEach((item: any, index: any) => {
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
              .map((column: any) => this.getSubstring(column))
              .reduce((x: any, y: any) => x + y) -
            defaultSize -
            settingsSize;

          if (
            contentWidth - enabledColumnsCount * defaultMinColumnSize >
            this.getSubstring(tableInfoPanelContainer[0])
          ) {
            const currentContentWidth =
              contentWidth - +this.getSubstring(tableInfoPanelContainer[0]);

            let overWidth = 0;

            tableInfoPanelContainer.forEach((item: any, index: any) => {
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
              // @ts-expect-error TS(7006): Parameter 'column' implicitly has an 'any' type.
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
            tableInfoPanelContainer.forEach((item: any, index: any) => {
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
        for (let index in tableContainer) {
          const item = tableContainer[index];

          const column = document.getElementById("column_" + index);
          const enable =
            // @ts-expect-error TS(2367): This condition will always return 'false' since th... Remove this comment to see the full error message
            index == tableContainer.length - 1 ||
            (column ? column.dataset.enable === "true" : item !== "0px");
          const defaultColumnSize = column && column.dataset.defaultSize;

          const isActiveNow = item === "0px" && enable;
          if (isActiveNow && column) activeColumnIndex = index;

          if (!enable) {
            gridTemplateColumns.push("0px");

            let colIndex = 1;
            // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
            let leftEnableColumn = gridTemplateColumns[index - colIndex];
            while (leftEnableColumn === "0px") {
              colIndex++;
              // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
              leftEnableColumn = gridTemplateColumns[index - colIndex];
            }

            //added the size of the disabled column to the left column
            // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
            gridTemplateColumns[index - colIndex] =
              // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
              this.getSubstring(gridTemplateColumns[index - colIndex]) +
              this.getSubstring(item) +
              "px";
          } else if (item !== `${settingsSize}px`) {
            const percent = (this.getSubstring(item) / oldWidth) * 100;

            const newItemWidth = defaultColumnSize
              ? `${defaultColumnSize}px`
              : percent === 0
              ? `${minColumnSize}px`
              : ((containerWidth - defaultSize - settingsSize) * percent) /
                  100 +
                "px";

            gridTemplateColumns.push(newItemWidth);
          } else {
            gridTemplateColumns.push(item);
          }
        }

        if (activeColumnIndex) {
          const needReset = this.addNewColumns(
            gridTemplateColumns,
            activeColumnIndex,
            containerWidth
          );
          if (needReset) return;
        }
      }
      str = gridTemplateColumns.join(" ");
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

  updateTableRows = (str: any) => {
    // @ts-expect-error TS(2339): Property 'useReactWindow' does not exist on type '... Remove this comment to see the full error message
    if (!this.props.useReactWindow) return;

    const rows = document.querySelectorAll(".table-row, .table-list-item");

    if (rows?.length) {
      for (let i = 0; i < rows.length; i++) {
        // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Element'.
        rows[i].style.gridTemplateColumns = str;
      }
    }
  };

  resetColumns = (resetToDefault = false) => {
    const {
      // @ts-expect-error TS(2339): Property 'containerRef' does not exist on type 'Re... Remove this comment to see the full error message
      containerRef,
      // @ts-expect-error TS(2339): Property 'columnStorageName' does not exist on typ... Remove this comment to see the full error message
      columnStorageName,
      // @ts-expect-error TS(2339): Property 'columnInfoPanelStorageName' does not exi... Remove this comment to see the full error message
      columnInfoPanelStorageName,
      // @ts-expect-error TS(2339): Property 'columns' does not exist on type 'Readonl... Remove this comment to see the full error message
      columns,
      // @ts-expect-error TS(2339): Property 'infoPanelVisible' does not exist on type... Remove this comment to see the full error message
      infoPanelVisible,
    } = this.props;
    // @ts-expect-error TS(2339): Property 'columns' does not exist on type 'Readonl... Remove this comment to see the full error message
    const defaultSize = this.props.columns.find(
      (col: any) => col.defaultSize
    )?.defaultSize;

    let str = "";

    // @ts-expect-error TS(2339): Property 'columns' does not exist on type 'Readonl... Remove this comment to see the full error message
    const enableColumns = this.props.columns
      .filter((x: any) => x.enable)
      .filter((x: any) => !x.defaultSize)
      .filter((x: any) => !x.default);

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
      // @ts-expect-error TS(2339): Property 'columns' does not exist on type 'Readonl... Remove this comment to see the full error message
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
      // @ts-expect-error TS(2339): Property 'columns' does not exist on type 'Readonl... Remove this comment to see the full error message
      columns,
      // @ts-expect-error TS(2339): Property 'sortBy' does not exist on type 'Readonly... Remove this comment to see the full error message
      sortBy,
      // @ts-expect-error TS(2339): Property 'sorted' does not exist on type 'Readonly... Remove this comment to see the full error message
      sorted,
      // @ts-expect-error TS(2339): Property 'isLengthenHeader' does not exist on type... Remove this comment to see the full error message
      isLengthenHeader,
      // @ts-expect-error TS(2339): Property 'sortingVisible' does not exist on type '... Remove this comment to see the full error message
      sortingVisible,
      // @ts-expect-error TS(2339): Property 'infoPanelVisible' does not exist on type... Remove this comment to see the full error message
      infoPanelVisible,
      // @ts-expect-error TS(2339): Property 'showSettings' does not exist on type 'Re... Remove this comment to see the full error message
      showSettings,
      // @ts-expect-error TS(2339): Property 'tagRef' does not exist on type 'Readonly... Remove this comment to see the full error message
      tagRef,
      // @ts-expect-error TS(2339): Property 'settingsTitle' does not exist on type 'R... Remove this comment to see the full error message
      settingsTitle,
      ...rest
    } = this.props;

    //console.log("TABLE HEADER RENDER", columns);

    return <>
      <StyledTableHeader
        id="table-container_caption-header"
        className={`${
          isLengthenHeader ? "lengthen-header" : ""
        } table-container_header`}
        ref={this.headerRef}
        {...rest}
      >
        <StyledTableRow>
          {columns.map((column: any, index: any) => {
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
                // @ts-expect-error TS(2322): Type '{ key: any; index: any; column: any; sorted:... Remove this comment to see the full error message
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
                // @ts-expect-error TS(2322): Type '{ columns: any; infoPanelVisible: any; }' is... Remove this comment to see the full error message
                infoPanelVisible={infoPanelVisible}
              />
            </div>
          )}
        </StyledTableRow>
      </StyledTableHeader>

      <StyledEmptyTableContainer />
    </>;
  }
}

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
TableHeader.defaultProps = {
  sortingVisible: true,
  infoPanelVisible: false,
  useReactWindow: false,
  showSettings: true,
};

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
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
