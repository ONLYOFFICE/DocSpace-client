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

import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import throttle from "lodash/throttle";

import { TableHeaderProps, TTableColumn } from "../Table.types";
import styles from "./TableHeader.module.scss";
import { TableHeaderCell } from "../sub-components/table-header-cell";
import { TableSettings } from "../sub-components/table-settings";
import type { Nullable } from "../../../types";
import {
  DEFAULT_MIN_COLUMN_SIZE,
  HANDLE_OFFSET,
  MIN_SIZE_NAME_COLUMN,
  SETTINGS_SIZE,
} from "../Table.constants";
import { checkingForUnfixedSize, getSubstring } from "../Table.utils";
import { isDesktop } from "../../../utils";
import { useInterfaceDirection } from "../../../hooks/useInterfaceDirection";

type TPrevHeaderData = Nullable<
  Pick<TableHeaderProps, "columnStorageName" | "sortBy" | "sorted" | "columns">
>;

export const TableHeader = (props: TableHeaderProps) => {
  const {
    columns,
    sortBy,
    sorted,
    isLengthenHeader,
    sortingVisible = true,
    infoPanelVisible = false,
    showSettings = true,
    tagRef,
    settingsTitle,
    isIndexEditingMode: isIndexEditingModeProp,
    columnStorageName,
    columnInfoPanelStorageName,
    containerRef,
    useReactWindow = false,
    resetColumnsSize,
    setHideColumns: setHideColumnsProp,
    withoutWideColumn = false,
  } = props;

  const isMountedRef = useRef(false);
  const prevHeaderDataRef = useRef<TPrevHeaderData>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const lastContainerWidthRef = useRef<Nullable<number>>(null);
  const columnIndexRef = useRef<Nullable<number>>(null);

  const [hideColumns, setHideColumns] = useState(false);
  const [minWidthsIndex, setMinWidthsIndex] = useState<number[]>([]);

  const { isRTL } = useInterfaceDirection();

  const getNextColumn = (array: TTableColumn[], index: number) => {
    let i = 1;

    while (array.length !== i) {
      const item = array[index + i];

      if (!item || hideColumns) return null;
      if (!item.enable) i += 1;
      else return item;
    }
  };

  const updateTableRows = (str: string) => {
    if (!useReactWindow) return;

    const rows = document.querySelectorAll(".table-row, .table-list-item");

    if (rows?.length) {
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i] as HTMLElement;
        row.style.gridTemplateColumns = str;
      }
    }
  };

  const moveToLeft = (
    widths: string[],
    newWidth: number,
    isIndexEditingMode?: boolean,
    index?: number,
  ) => {
    const columnIndex = columnIndexRef.current;
    if (isIndexEditingMode) return;

    let leftColumn;
    let colIndex =
      index !== undefined ? index : columnIndex ? columnIndex - 1 : 0;

    if (colIndex < 0) return;

    while (colIndex >= 0) {
      leftColumn = document.getElementById(`column_${colIndex}`);
      if (leftColumn) {
        if (leftColumn.dataset.enable === "true") break;
        else colIndex -= 1;
      } else return false;
    }

    if (leftColumn) {
      const minSize = leftColumn.dataset.minWidth
        ? leftColumn.dataset.minWidth
        : DEFAULT_MIN_COLUMN_SIZE;

      if (leftColumn.getBoundingClientRect().width <= +minSize) {
        if (colIndex < 0) return false;
        moveToLeft(widths, newWidth, isIndexEditingMode, colIndex - 1);
        return;
      }
      if (columnIndex !== null) {
        const offset = getSubstring(widths[+columnIndex]) - newWidth;
        const column2Width = getSubstring(widths[colIndex]);

        const leftColumnWidth = column2Width - offset;
        const newLeftWidth =
          leftColumnWidth < +minSize ? minSize : leftColumnWidth;

        widths[colIndex] = `${newLeftWidth}px`;
        const width =
          getSubstring(widths[+columnIndex]) +
          (offset - (+newLeftWidth - leftColumnWidth));

        widths[+columnIndex] = `${width}px`;
      }
    }
  };

  const moveToRight = (
    widths: string[],
    newWidth: number,
    isIndexEditingMode?: boolean,
    index?: number,
  ) => {
    const columnIndex = columnIndexRef.current;

    if (isIndexEditingMode || columnIndex === null) return;

    let rightColumn;
    let colIndex = index || +columnIndex + 1;

    while (colIndex !== columns.length) {
      rightColumn = document.getElementById(`column_${colIndex}`);
      if (rightColumn) {
        if (rightColumn.dataset.enable === "true") break;
        else colIndex += 1;
      } else return false;
    }

    const offset = getSubstring(widths[+columnIndex]) - newWidth;
    const column2Width = getSubstring(widths[colIndex]);

    const defaultColumn = document.getElementById(`column_${colIndex}`);
    if (!defaultColumn || defaultColumn.dataset.defaultSize) return;

    const minSize = rightColumn?.dataset.minWidth
      ? +rightColumn.dataset.minWidth
      : DEFAULT_MIN_COLUMN_SIZE;

    if (column2Width + offset - HANDLE_OFFSET >= +minSize) {
      widths[+columnIndex] = `${newWidth + HANDLE_OFFSET}px`;
      widths[colIndex] = `${column2Width + offset - HANDLE_OFFSET}px`;
    } else if (column2Width !== minSize) {
      const width =
        getSubstring(widths[+columnIndex]) +
        getSubstring(widths[+colIndex]) -
        minSize;

      widths[+columnIndex] = `${width}px`;
      widths[colIndex] = `${minSize}px`;
    } else {
      if (colIndex === columns.length) return false;
      moveToRight(widths, newWidth, isIndexEditingMode, colIndex + 1);
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    const columnIndex = columnIndexRef.current;

    if (columnIndex === null) return;
    const column = document.getElementById(`column_${columnIndex}`);

    if (!column) return;

    const columnSize = column.getBoundingClientRect();
    let newWidth = isRTL
      ? columnSize.right - e.clientX
      : e.clientX - columnSize.left;

    const tableContainer = containerRef.current?.style.gridTemplateColumns;
    const widths = tableContainer?.split(" ") as string[];

    const minSize = column.dataset.minWidth
      ? column.dataset.minWidth
      : DEFAULT_MIN_COLUMN_SIZE;

    if (newWidth <= +minSize - HANDLE_OFFSET) {
      const currentWidth = getSubstring(widths[+columnIndex]);

      // Move left
      if (currentWidth !== +minSize) {
        newWidth = +minSize - HANDLE_OFFSET;
        moveToRight(widths, newWidth, isIndexEditingModeProp);
      } else moveToLeft(widths, newWidth, isIndexEditingModeProp);
    } else {
      moveToRight(widths, newWidth, isIndexEditingModeProp);
    }

    const str = widths.join(" ");
    if (containerRef.current) {
      containerRef.current.style.gridTemplateColumns = str;
    }
    if (headerRef.current) {
      headerRef.current.style.gridTemplateColumns = str;
    }

    updateTableRows(str);
  };

  const onMouseUp = () => {
    if (containerRef.current)
      if (!infoPanelVisible) {
        localStorage.setItem(
          columnStorageName,
          containerRef.current.style.gridTemplateColumns,
        );
      } else {
        localStorage.setItem(
          columnInfoPanelStorageName || "",
          containerRef.current.style.gridTemplateColumns,
        );
      }

    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const onMouseDown = (event: React.MouseEvent) => {
    if (event.target) {
      const target = event.target as HTMLDivElement;

      if (target.dataset.column) {
        columnIndexRef.current = +target.dataset.column;
      }
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  function resetColumns(isResized: boolean = false) {
    if (!infoPanelVisible) localStorage.removeItem(columnStorageName);
    else localStorage.removeItem(columnInfoPanelStorageName || "");

    let str = "";

    const enableColumns = columns
      .filter((x) => x.enable)
      .filter((x) => !x.defaultSize)
      .filter((x) => !x.default)
      .filter((x) => !x.isShort);

    const container = containerRef.current
      ? containerRef.current
      : document.getElementById("table-container");

    if (!container) return;

    const defaultColumnSize =
      columns.find((col) => col.defaultSize && col.enable)?.defaultSize || 0;

    const isShortColumnSize =
      columns.find((col) => col.isShort && col.enable)?.minWidth || 0;

    const containerWidth =
      container.clientWidth -
      defaultColumnSize -
      SETTINGS_SIZE -
      isShortColumnSize;

    let nameColumnPercent = enableColumns.length > 0 ? 40 : 100;
    let percent = enableColumns.length > 0 ? 60 / enableColumns.length : 0;

    if (withoutWideColumn) {
      nameColumnPercent = 100 / columns.length;
      percent = 100 / columns.length;
    }

    let wideColumnSize = (containerWidth * nameColumnPercent) / 100;
    let otherColumns = (containerWidth * percent) / 100;

    if (otherColumns < DEFAULT_MIN_COLUMN_SIZE) {
      wideColumnSize -=
        (DEFAULT_MIN_COLUMN_SIZE - otherColumns) * enableColumns.length;
      otherColumns = DEFAULT_MIN_COLUMN_SIZE;
    }

    columns.forEach((col) => {
      if (col.default) {
        str += `${wideColumnSize}px `;
      } else if (col.isShort) {
        str += `${col.minWidth}px `;
      } else {
        str += col.enable
          ? col.defaultSize
            ? `${col.defaultSize}px `
            : `${otherColumns}px `
          : "0px ";
      }
    });

    str += `${SETTINGS_SIZE}px`;

    if (container) container.style.gridTemplateColumns = str;
    if (headerRef.current) {
      headerRef.current.style.gridTemplateColumns = str;
      headerRef.current.style.width = `${container.clientWidth}px`;
    }

    if (str) {
      if (!infoPanelVisible) {
        localStorage.setItem(columnStorageName, str);
      } else {
        localStorage.setItem(columnInfoPanelStorageName || "", str);
      }

      updateTableRows(str);
    }

    // Only call onResize if not already resized and container width has changed
    if (!isResized && container.clientWidth !== lastContainerWidthRef.current) {
      // Cache lastContainerWidth result to prevent recursive calls
      lastContainerWidthRef.current = container.clientWidth;
      onResize(true);
    }
  }

  function distributionOverWidth(
    overWidth: number,
    gridTemplateColumns: string[],
  ) {
    const newGridTemplateColumns: string[] = JSON.parse(
      JSON.stringify(gridTemplateColumns),
    );

    let countColumns = 0;
    const defaultColumnSize =
      columns.find((col) => col.defaultSize && col.enable)?.defaultSize || 0;

    newGridTemplateColumns.forEach((item, index) => {
      const unfixedSize = checkingForUnfixedSize(item, defaultColumnSize);
      if (!unfixedSize) return;

      const column = document.getElementById(`column_${index}`);
      const minWidth = column?.dataset?.minWidth;
      const minSize = minWidth ? +minWidth : MIN_SIZE_NAME_COLUMN;

      if (
        (columns[index]?.key === "Name" || columns[index]?.key === "Index"
          ? minSize
          : DEFAULT_MIN_COLUMN_SIZE) !== getSubstring(item)
      )
        countColumns += 1;
    });

    const addWidth = overWidth / countColumns;

    newGridTemplateColumns.forEach((item, index) => {
      const unfixedSize = checkingForUnfixedSize(item, defaultColumnSize);
      if (!unfixedSize) return;

      const column = document.getElementById(`column_${index}`);
      const minWidth = column?.dataset?.minWidth;
      const minSize = minWidth ? +minWidth : MIN_SIZE_NAME_COLUMN;

      const itemSubstring = getSubstring(item);

      if (
        (columns[index]?.key === "Name" || columns[index]?.key === "Index"
          ? minSize
          : DEFAULT_MIN_COLUMN_SIZE) === itemSubstring
      )
        return;

      const differenceWithMinimum =
        itemSubstring -
        (columns[index]?.key === "Name" || columns[index]?.key === "Index"
          ? minSize
          : DEFAULT_MIN_COLUMN_SIZE);

      if (differenceWithMinimum >= addWidth) {
        newGridTemplateColumns[index] = `${itemSubstring - addWidth}px`;
      } else {
        newGridTemplateColumns[index] = `${
          columns[index]?.key === "Name" || columns[index]?.key === "Index"
            ? minSize
            : DEFAULT_MIN_COLUMN_SIZE
        }px`;
      }
    });

    return newGridTemplateColumns;
  }

  function addNewColumns(
    gridTemplateColumns: string[],
    activeColumnIndex: number,
    containerWidth: number,
  ) {
    const clearSize = gridTemplateColumns.map((c) => getSubstring(c));
    const maxSize = Math.max(...clearSize);

    const { defaultSize } = columns[activeColumnIndex - 1];

    const indexOfMaxSize = clearSize.findLastIndex((s) => s === maxSize);

    const addedColumn = 1;
    const enableColumnsLength =
      columns.filter((column) => !column.defaultSize && column.enable).length -
      addedColumn;

    const allColumnsLength = columns.filter(
      (column) => !column.defaultSize,
    ).length;

    const defaultSizeColumn = columns.find(
      (column) => column.defaultSize,
    )?.defaultSize;

    const widthColumns =
      containerWidth - SETTINGS_SIZE - (defaultSizeColumn || 0);

    const newColumnSize = defaultSize || widthColumns / allColumnsLength;

    const newSizeMaxColumn = maxSize - newColumnSize;

    const AddColumn = () => {
      gridTemplateColumns[indexOfMaxSize] = `${newSizeMaxColumn}px`;
      gridTemplateColumns[activeColumnIndex] = `${newColumnSize}px`;
      return false;
    };

    const ResetColumnsSize = () => {
      resetColumns();
      return true;
    };

    if (
      (indexOfMaxSize === 0 && newSizeMaxColumn < MIN_SIZE_NAME_COLUMN) ||
      (indexOfMaxSize !== 0 && newSizeMaxColumn < DEFAULT_MIN_COLUMN_SIZE) ||
      newColumnSize < DEFAULT_MIN_COLUMN_SIZE ||
      enableColumnsLength === 1
    ) {
      return ResetColumnsSize();
    }

    AddColumn();
  }

  function onResize(isResized: boolean = false) {
    if (!isDesktop() || !columnStorageName || !columnInfoPanelStorageName) {
      return;
    }

    let activeColumnIndex = null;

    const container = containerRef.current
      ? containerRef.current
      : document.getElementById("table-container");

    if (!container) return;

    const storageSize =
      !resetColumnsSize && localStorage.getItem(columnStorageName);

    // TODO: If defaultSize(75px) is less than defaultMinColumnSize(110px) the calculations work correctly
    const defaultSize =
      columns.find((col) => col.defaultSize && col.enable)?.defaultSize || 0;

    const shortSize =
      columns.find((col) => col.isShort && col.enable)?.minWidth || 0;

    // TODO: Fixed columns size if something went wrong
    if (storageSize) {
      const splitStorage = storageSize.split(" ");
      if (
        !shortSize &&
        getSubstring(splitStorage[0]) <= DEFAULT_MIN_COLUMN_SIZE
      ) {
        localStorage.removeItem(columnStorageName);
        onResize();
        return;
      }
    }

    const containerGridTemplateColumns =
      container.style.gridTemplateColumns.split(" ");

    const tableContainer = storageSize
      ? storageSize.split(" ")
      : containerGridTemplateColumns;

    if (
      containerGridTemplateColumns.length === 1 &&
      !hideColumns &&
      storageSize
    ) {
      const hasContent = !!storageSize.split(" ").find((item, index) => {
        if (index === 0) return;
        return checkingForUnfixedSize(item, defaultSize);
      });

      // If content column sizes are calculated as empty after changing view
      if (!hasContent) return resetColumns();
    }

    if (!container) return;

    const containerWidth = container.getBoundingClientRect().width;

    const defaultWidth = tableContainer
      .map((column) => getSubstring(column))
      .reduce((x, y) => x + y);

    let oldWidth = defaultWidth - defaultSize - SETTINGS_SIZE;

    let str = "";
    let gridTemplateColumnsWithoutOverfilling: string[] = [];

    if (tableContainer.length > 1) {
      const gridTemplateColumns: string[] = [];
      let hideColumnsConst = false;

      const storageInfoPanelSize = localStorage.getItem(
        columnInfoPanelStorageName || "",
      );

      const tableInfoPanelContainer =
        storageInfoPanelSize &&
        storageInfoPanelSize.split(" ").length === tableContainer.length
          ? storageInfoPanelSize.split(" ")
          : tableContainer;

      let containerMinWidth = containerWidth - defaultSize - SETTINGS_SIZE;

      tableInfoPanelContainer.forEach((item, index) => {
        const column = document.getElementById(`column_${index}`);

        const enable =
          index === tableContainer.length - 1 ||
          (column ? column.dataset.enable === "true" : item !== "0px");

        if (
          enable &&
          (item !== `${defaultSize}px` || `${defaultSize}px` === `0px`) &&
          item !== `${SETTINGS_SIZE}px`
        ) {
          if (column?.dataset?.minWidth) {
            containerMinWidth -= +column.dataset.minWidth;
          } else {
            containerMinWidth -= DEFAULT_MIN_COLUMN_SIZE;
          }
        }
      });

      if (containerMinWidth < 0) {
        hideColumnsConst = true;
      }

      if (hideColumns !== hideColumnsConst) {
        setHideColumns(hideColumnsConst);
        setHideColumnsProp?.(hideColumnsConst);
      }

      if (hideColumnsConst) {
        const shortColumnSize =
          columns.find((col) => col.isShort && col.enable)?.minWidth || 0;

        tableInfoPanelContainer.forEach((item, index) => {
          const column = document.getElementById(`column_${index}`);

          if (shortColumnSize && index === 0) {
            gridTemplateColumns.push(`${shortColumnSize}px`);
          } else if (column?.dataset?.minWidth && column?.dataset?.default) {
            gridTemplateColumns.push(
              `${containerWidth - defaultSize - shortColumnSize - SETTINGS_SIZE}px`,
            );
          } else if (
            item === `${defaultSize}px` ||
            item === `${SETTINGS_SIZE}px`
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
          const contentWidth = containerWidth - defaultSize - SETTINGS_SIZE;

          let enabledColumnsCount = 0;

          tableInfoPanelContainer.forEach((item, index) => {
            if (
              columns[index]?.key !== "Index" &&
              columns[index]?.key !== "Name" &&
              item !== "0px" &&
              item !== `${defaultSize}px` &&
              item !== `${SETTINGS_SIZE}px`
            ) {
              enabledColumnsCount += 1;
            }
          });

          const changedWidth =
            tableInfoPanelContainer
              .map((column) => getSubstring(column))
              .reduce((x, y) => x + y) -
            defaultSize -
            SETTINGS_SIZE;

          const indexColumnWidth =
            columns[0].key === "Index"
              ? getSubstring(tableInfoPanelContainer[0])
              : 0;
          const nameColumnWidth =
            columns[0].key === "Name"
              ? getSubstring(tableInfoPanelContainer[0])
              : getSubstring(tableInfoPanelContainer[1]);

          if (
            contentWidth - enabledColumnsCount * DEFAULT_MIN_COLUMN_SIZE >
            nameColumnWidth + indexColumnWidth
          ) {
            const currentContentWidth =
              enabledColumnsCount > 0
                ? contentWidth - nameColumnWidth - indexColumnWidth
                : contentWidth;

            let overWidth = 0;

            tableInfoPanelContainer.forEach((item, index) => {
              const column = document.getElementById(`column_${index}`);

              const shortColumSize =
                column?.dataset?.shortColum && column.dataset.minWidth;

              if (
                (columns[index]?.key === "Name" ||
                  columns[index]?.key === "Index") &&
                enabledColumnsCount > 0
              ) {
                if (
                  columns[index]?.key === "Index" &&
                  shortColumSize &&
                  !minWidthsIndex.includes(+shortColumSize)
                ) {
                  setMinWidthsIndex((prevValue) => [
                    ...prevValue,
                    +shortColumSize,
                  ]);
                }

                let newItemWidth = item;

                if (
                  columns[index]?.key === "Index" &&
                  shortColumSize &&
                  getSubstring(item) < +shortColumSize
                ) {
                  overWidth += +shortColumSize - getSubstring(item);
                  newItemWidth = `${shortColumSize}px`;
                }

                // Set the previous minimum width of the index column
                // if the user has not changed the width of this column
                if (
                  columns[index]?.key === "Index" &&
                  shortColumSize &&
                  getSubstring(item) > +shortColumSize &&
                  minWidthsIndex?.includes(getSubstring(item)) &&
                  minWidthsIndex?.includes(+shortColumSize)
                ) {
                  overWidth += getSubstring(item) - +shortColumSize;
                  newItemWidth = `${shortColumSize}px`;
                }

                gridTemplateColumns.push(newItemWidth);
              } else {
                const enable =
                  index === tableInfoPanelContainer.length - 1 ||
                  (column ? column.dataset.enable === "true" : item !== "0px");

                const defaultColumnSize = column && column.dataset.defaultSize;

                if (!enable) {
                  gridTemplateColumns.push("0px");
                } else if (item !== `${SETTINGS_SIZE}px`) {
                  const percent =
                    enabledColumnsCount === 0
                      ? 100
                      : (getSubstring(item) /
                          (changedWidth - nameColumnWidth - indexColumnWidth)) *
                        100;

                  let newItemWidth;

                  if (defaultColumnSize) {
                    newItemWidth = `${defaultColumnSize}px`;
                  } else if (
                    (currentContentWidth * percent) / 100 >
                      DEFAULT_MIN_COLUMN_SIZE &&
                    !shortColumSize
                  ) {
                    newItemWidth = `${(currentContentWidth * percent) / 100}px`;
                  } else if (shortColumSize) {
                    newItemWidth = item;
                  } else {
                    newItemWidth = `${DEFAULT_MIN_COLUMN_SIZE}px`;
                  }

                  if (
                    (currentContentWidth * percent) / 100 <
                      DEFAULT_MIN_COLUMN_SIZE &&
                    !defaultColumnSize
                  ) {
                    overWidth +=
                      DEFAULT_MIN_COLUMN_SIZE -
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
                const columnWidth = getSubstring(column);

                if (
                  columns[index]?.key !== "Name" &&
                  columns[index]?.key !== "Index" &&
                  column !== "0px" &&
                  column !== `${defaultSize}px` &&
                  column !== `${SETTINGS_SIZE}px` &&
                  columnWidth > DEFAULT_MIN_COLUMN_SIZE
                ) {
                  const availableWidth = columnWidth - DEFAULT_MIN_COLUMN_SIZE;

                  if (availableWidth < Math.abs(overWidth)) {
                    overWidth = Math.abs(overWidth) - availableWidth;
                    return (gridTemplateColumns[index] = `${
                      columnWidth - availableWidth
                    }px`);
                  }
                  const temp = overWidth;

                  overWidth = 0;

                  return (gridTemplateColumns[index] = `${
                    columnWidth - Math.abs(temp)
                  }px`);
                }
              });
            }
          } else {
            let overWidth = 0;

            const oldWidthIndexAndName = indexColumnWidth + nameColumnWidth;

            tableInfoPanelContainer.forEach((item, index) => {
              const column = document.getElementById(`column_${index}`);

              const enable =
                index === tableInfoPanelContainer.length - 1 ||
                (column ? column.dataset.enable === "true" : item !== "0px");

              const defaultColumnSize = column && column.dataset.defaultSize;
              const shortColumSize =
                column?.dataset?.shortColum && column.dataset.minWidth;

              const percent = (getSubstring(item) / oldWidthIndexAndName) * 100;

              if (!enable) {
                gridTemplateColumns.push("0px");
              } else if (item !== `${SETTINGS_SIZE}px`) {
                let newItemWidth;

                if (defaultColumnSize) {
                  newItemWidth = `${defaultColumnSize}px`;
                } else if (columns[index]?.key === "Index") {
                  if (
                    shortColumSize &&
                    !minWidthsIndex.includes(+shortColumSize)
                  ) {
                    setMinWidthsIndex((prevValue) => [
                      ...prevValue,
                      +shortColumSize,
                    ]);
                  }

                  if (
                    shortColumSize &&
                    getSubstring(item) === +shortColumSize
                  ) {
                    newItemWidth = item;
                  } else {
                    newItemWidth = `${Math.round(
                      ((contentWidth -
                        enabledColumnsCount * DEFAULT_MIN_COLUMN_SIZE) *
                        percent) /
                        100,
                    )}px`;
                  }
                } else if (columns[index]?.key === "Name") {
                  let diff = 0;
                  if (shortColumSize && indexColumnWidth === +shortColumSize) {
                    diff = +shortColumSize;
                  }

                  newItemWidth = `${
                    Math.round(
                      (contentWidth -
                        diff -
                        enabledColumnsCount * DEFAULT_MIN_COLUMN_SIZE) *
                        percent,
                    ) / 100
                  }px`;
                } else {
                  newItemWidth = `${DEFAULT_MIN_COLUMN_SIZE}px`;
                }

                // Checking whether the name column is less than the minimum width
                if (
                  columns[index]?.key === "Name" &&
                  getSubstring(newItemWidth) < MIN_SIZE_NAME_COLUMN
                ) {
                  overWidth +=
                    MIN_SIZE_NAME_COLUMN - getSubstring(newItemWidth);
                  newItemWidth = `${MIN_SIZE_NAME_COLUMN}px`;
                }

                // Checking whether the index column is less than the minimum width
                if (
                  columns[index]?.key === "Index" &&
                  shortColumSize &&
                  getSubstring(newItemWidth) < +shortColumSize
                ) {
                  overWidth += +shortColumSize - getSubstring(newItemWidth);
                  newItemWidth = `${shortColumSize}px`;
                }

                // Set the previous minimum width of the index column
                // if the user has not changed the width of this column
                if (
                  columns[index]?.key === "Index" &&
                  shortColumSize &&
                  getSubstring(item) > +shortColumSize &&
                  minWidthsIndex?.includes(getSubstring(item)) &&
                  minWidthsIndex?.includes(+shortColumSize)
                ) {
                  overWidth += getSubstring(item) - +shortColumSize;
                  newItemWidth = `${shortColumSize}px`;
                }

                gridTemplateColumns.push(newItemWidth);
              } else {
                gridTemplateColumns.push(item);
              }
            });

            if (overWidth > 0) {
              const shortColumnSize =
                columns.find((col) => col.isShort && col.enable)?.minWidth || 0;

              gridTemplateColumns.forEach((column, index) => {
                const columnWidth = getSubstring(column);

                if (
                  columns[index]?.key === "Index" ||
                  columns[index]?.key === "Name"
                ) {
                  if (
                    columns[index]?.key === "Index" &&
                    columnWidth === shortColumnSize
                  ) {
                    return columnWidth;
                  }

                  const availableWidth = columnWidth - MIN_SIZE_NAME_COLUMN;

                  if (availableWidth < Math.abs(overWidth)) {
                    overWidth = Math.abs(overWidth) - availableWidth;
                    return (gridTemplateColumns[index] = `${
                      columnWidth - availableWidth
                    }px`);
                  }
                  const temp = overWidth;

                  overWidth = 0;

                  return (gridTemplateColumns[index] = `${
                    columnWidth - Math.abs(temp)
                  }px`);
                }
              });
            }
          }
        }
      } else {
        let overWidth = 0;

        if (!hideColumns && !hideColumnsConst) {
          for (const index in tableContainer) {
            const item = tableContainer[index];

            const column = document.getElementById(`column_${index}`);
            const enable =
              +index === tableContainer.length - 1 ||
              (column ? column.dataset.enable === "true" : item !== "0px");
            const defaultColumnSize = column && column.dataset.defaultSize;
            const shortColumSize =
              column?.dataset?.shortColum && column.dataset.minWidth;

            const isSettingColumn = Number(index) === tableContainer.length - 1;

            const isActiveNow = item === "0px" && enable;
            if (isActiveNow && column) activeColumnIndex = index;

            if (
              columns[index]?.key === "Index" &&
              shortColumSize &&
              !minWidthsIndex.includes(+shortColumSize)
            ) {
              setMinWidthsIndex((prevValue) => [...prevValue, +shortColumSize]);
            }

            if (
              columns[index]?.key === "Index" &&
              shortColumSize &&
              getSubstring(item) > +shortColumSize &&
              minWidthsIndex.includes(getSubstring(item)) &&
              minWidthsIndex.includes(+shortColumSize)
            ) {
              const diff = getSubstring(item) - +shortColumSize;
              oldWidth -= diff;
            }

            if (!enable) {
              gridTemplateColumns.push("0px");

              let colIndex = 1;
              let leftEnableColumn = gridTemplateColumns[+index - colIndex];
              while (leftEnableColumn === "0px") {
                colIndex += 1;
                leftEnableColumn = gridTemplateColumns[+index - colIndex];
              }

              // added the size of the disabled column to the left column
              gridTemplateColumns[+index - colIndex] = `${
                getSubstring(gridTemplateColumns[+index - colIndex]) +
                getSubstring(item)
              }px`;
            } else if (isSettingColumn) {
              const newSettingsSize = SETTINGS_SIZE;
              gridTemplateColumns.push(`${newSettingsSize}px`);
            } else if (item !== `${SETTINGS_SIZE}px`) {
              const percent = (getSubstring(item) / oldWidth) * 100;

              if (percent === 100) {
                const enableColumnsLength = columns.filter(
                  (c) => !c.defaultSize && c.enable,
                ).length;

                if (enableColumnsLength !== 1) {
                  resetColumns();
                  return;
                }
              }

              let newItemWidth;

              if (defaultColumnSize) {
                newItemWidth = `${defaultColumnSize}px`;
              } else if (percent === 0) {
                newItemWidth = `${DEFAULT_MIN_COLUMN_SIZE}px`;
              } else if (shortColumSize) {
                newItemWidth = item;
              } else {
                newItemWidth = `${
                  ((containerWidth - defaultSize - SETTINGS_SIZE) * percent) /
                  100
                }px`;
              }

              const minWidth = column?.dataset?.minWidth;
              const minSize = minWidth ? +minWidth : MIN_SIZE_NAME_COLUMN;

              // Checking whether the name column is less than the minimum width

              if (
                columns[index]?.key === "Name" &&
                getSubstring(newItemWidth) < minSize &&
                !shortColumSize
              ) {
                overWidth += MIN_SIZE_NAME_COLUMN - getSubstring(newItemWidth);
                newItemWidth = `${MIN_SIZE_NAME_COLUMN}px`;
              }

              // Checking whether the index column is less than the minimum width
              if (
                columns[index]?.key === "Index" &&
                shortColumSize &&
                getSubstring(newItemWidth) < +shortColumSize
              ) {
                overWidth += +shortColumSize - getSubstring(newItemWidth);
                newItemWidth = `${shortColumSize}px`;
              }

              // Set the previous minimum width of the index column
              // if the user has not changed the width of this column
              if (
                columns[index]?.key === "Index" &&
                shortColumSize &&
                getSubstring(newItemWidth) > +shortColumSize &&
                minWidthsIndex.includes(getSubstring(newItemWidth)) &&
                minWidthsIndex.includes(+shortColumSize)
              ) {
                newItemWidth = `${shortColumSize}px`;
              }

              // Checking whether columns are smaller than the minimum width
              if (
                columns[index]?.key !== "Index" &&
                columns[index]?.key !== "Name" &&
                !defaultColumnSize &&
                getSubstring(newItemWidth) < DEFAULT_MIN_COLUMN_SIZE
              ) {
                overWidth +=
                  DEFAULT_MIN_COLUMN_SIZE - getSubstring(newItemWidth);
                newItemWidth = `${DEFAULT_MIN_COLUMN_SIZE}px`;
              }

              gridTemplateColumns.push(newItemWidth);
            } else {
              gridTemplateColumns.push(item);
            }
          }

          if (overWidth > 0) {
            gridTemplateColumnsWithoutOverfilling = distributionOverWidth(
              overWidth,
              gridTemplateColumns,
            );
          }

          hasGridTemplateColumnsWithoutOverfilling =
            gridTemplateColumnsWithoutOverfilling &&
            gridTemplateColumnsWithoutOverfilling.length > 0;

          if (activeColumnIndex) {
            const gridColumns = hasGridTemplateColumnsWithoutOverfilling
              ? gridTemplateColumnsWithoutOverfilling
              : gridTemplateColumns;

            const needReset = addNewColumns(
              gridColumns,
              +activeColumnIndex,
              containerWidth,
            );
            if (needReset) return;
          }
        }
      }

      str = hasGridTemplateColumnsWithoutOverfilling
        ? gridTemplateColumnsWithoutOverfilling.join(" ")
        : gridTemplateColumns.join(" ");

      const strWidth = str
        .split(" ")
        .map((s) => getSubstring(s))
        .reduce((x, y) => x + y);

      if (
        Math.abs(+strWidth - containerWidth) >= 50 &&
        !isResized &&
        strWidth !== 0
      ) {
        resetColumns(true);
        return;
      }
    } else if (!isResized) {
      resetColumns();
      return;
    }

    if (str) {
      container.style.gridTemplateColumns = str;
      updateTableRows(str);

      if (headerRef.current) {
        headerRef.current.style.gridTemplateColumns = str;
        headerRef.current.style.width = `${containerWidth}px`;
      }

      if (infoPanelVisible) {
        localStorage.setItem(columnInfoPanelStorageName || "", str);
      } else {
        localStorage.setItem(columnStorageName, str);
      }

      if (!infoPanelVisible) {
        localStorage.removeItem(columnInfoPanelStorageName || "");
      }
    }
  }

  useEffect(() => {
    if (!isMountedRef.current) {
      onResize();
    }

    const throttledResize = throttle(() => onResize(true), 300);

    window.addEventListener("resize", throttledResize);

    return () => {
      window.removeEventListener("resize", throttledResize);
    };
  });

  useEffect(() => {
    const prevHeaderData = prevHeaderDataRef.current;
    const updatePrevHeaderData = () => {
      prevHeaderDataRef.current = {
        columns,
        columnStorageName,
        sortBy,
        sorted,
      };
    };

    if (!prevHeaderData) {
      updatePrevHeaderData();
      return;
    }

    let shouldReset = false;

    if (columnStorageName === prevHeaderData.columnStorageName) {
      const storageSize = infoPanelVisible
        ? localStorage.getItem(columnInfoPanelStorageName || "")
        : localStorage.getItem(columnStorageName);

      if (
        sortBy !== prevHeaderData.sortBy ||
        sorted !== prevHeaderData.sorted
      ) {
        const sortedColumnIndex = columns.findIndex(
          (c) => c?.sortBy === sortBy,
        );

        if (sortedColumnIndex > -1 && !columns[sortedColumnIndex].enable) {
          columns[sortedColumnIndex].onChange?.(columns[sortedColumnIndex].key);
        }
      }

      // columns.length + 1 - its settings column
      const isColumnsCountMismatch =
        storageSize && storageSize.split(" ").length !== columns.length + 1;

      const isColumnsEnableMismatch = columns.some((_, index) => {
        return columns[index]?.enable !== prevHeaderData.columns[index]?.enable;
      });

      if (isColumnsCountMismatch || isColumnsEnableMismatch) {
        shouldReset = true;
      }
    }

    const storageSize =
      !resetColumnsSize && localStorage.getItem(columnStorageName);

    if (columns.length !== prevHeaderData.columns.length && !storageSize) {
      shouldReset = true;
    }

    updatePrevHeaderData();

    if (shouldReset) {
      resetColumns();
    } else {
      onResize();
    }
  });

  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  return (
    <div
      id="table-container_caption-header"
      className={classNames(styles.tableHeader, "table-container_header", {
        "lengthen-header": isLengthenHeader,
      })}
      ref={headerRef}
      data-testid="table-header"
    >
      <div className={styles.tableHeaderRow}>
        {columns.map((column, index) => {
          const nextColumn = getNextColumn(columns, index);
          const resizable = nextColumn ? nextColumn.resizable : false;

          return (
            <TableHeaderCell
              key={column.key ?? "empty-cell"}
              index={index}
              column={column}
              sorted={sorted || false}
              sortBy={sortBy || ""}
              resizable={resizable}
              defaultSize={column.defaultSize}
              onMouseDown={onMouseDown}
              sortingVisible={sortingVisible || false}
              tagRef={tagRef}
              testId={`column-${column.key}`}
            />
          );
        })}

        {showSettings ? (
          <div
            data-testid="settings-block"
            className={styles.tableHeaderSettings}
            title={settingsTitle}
          >
            <TableSettings
              columns={columns}
              disableSettings={
                (infoPanelVisible || hideColumns || isIndexEditingModeProp) ??
                false
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
