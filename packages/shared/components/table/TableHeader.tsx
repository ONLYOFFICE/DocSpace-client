// (c) Copyright Ascensio System SIA 2010-2024
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

/* eslint-disable no-restricted-syntax */
import React from "react";
import { DebouncedFunc } from "lodash";
import throttle from "lodash/throttle";
import { withTheme } from "styled-components";
import {
  StyledTableHeader,
  StyledTableRow,
  StyledEmptyTableContainer,
} from "./Table.styled";

import { TTableColumn, TableHeaderProps } from "./Table.types";
import { TableSettings } from "./sub-components/TableSettings";
import { TableHeaderCell } from "./sub-components/TableHeaderCell";
// import {
//   DEFAULT_MIN_COLUMN_SIZE,
//   MIN_SIZE_FIRST_COLUMN,
//   SETTINGS_SIZE,
// } from "./Table.constants";
import { checkingForUnfixedSize, getSubstring } from "./Table.utils";

// function TableHeader({
//   containerRef,
//   columnStorageName,
//   columnInfoPanelStorageName,
//   resetColumnsSize,

//   columns,
//   setHideColumns,

//   sortBy,
//   sorted,
//   isLengthenHeader,

//   tagRef,
//   settingsTitle,
//   sortingVisible = true,
//   infoPanelVisible = false,
//   useReactWindow = false,
//   showSettings = true,
//   ...rest
// }: TableHeaderProps) {
//   const headerRef = React.useRef<HTMLDivElement | null>(null);
//   const throttledResize = React.useRef<null | DebouncedFunc<() => void>>(null);
//   const resizeRef = React.useRef<null | (() => void)>(null);
//   const theme = useTheme();

//   const [state, setState] = React.useState<{
//     columnIndex: number;
//     hideColumns: boolean;
//   }>({ columnIndex: 0, hideColumns: false });

//   const resetColumns = React.useCallback<
//     (resetToDefault?: boolean) => void
//   >(() => {
//     let str = "";

//     const enableColumns = columns
//       .filter((x: TTableColumn) => x.enable)
//       .filter((x: TTableColumn) => !x.defaultSize)
//       .filter((x: TTableColumn) => !x.default);

//     const container = containerRef.current
//       ? containerRef.current
//       : document.getElementById("table-container");
//     const containerWidth = container ? +container.clientWidth : 0;

//     const firstColumnPercent = 40;
//     const percent = 60 / enableColumns.length;

//     const wideColumnSize = `${(containerWidth * firstColumnPercent) / 100}px`;
//     const otherColumns = `${(containerWidth * percent) / 100}px`;

//     columns.forEach((col: TTableColumn) => {
//       if (col.default) {
//         str += `${wideColumnSize} `;
//       } else
//         str += col.enable
//           ? col.defaultSize
//             ? `${col.defaultSize}px `
//             : `${otherColumns} `
//           : "0px ";
//     });

//     str += `${SETTINGS_SIZE}px`;
//     if (container) container.style.gridTemplateColumns = str;

//     if (headerRef.current) {
//       headerRef.current.style.gridTemplateColumns = str;
//       headerRef.current.style.width = `${containerWidth}px`;
//     }

//     if (str) {
//       if (!infoPanelVisible) localStorage.setItem(columnStorageName, str);
//       else localStorage.setItem(columnInfoPanelStorageName, str);
//     }

//     if (resizeRef.current) resizeRef.current();
//   }, [
//     columnInfoPanelStorageName,
//     columnStorageName,
//     columns,
//     containerRef,
//     infoPanelVisible,
//   ]);

//   const distributionOverWidth = React.useCallback(
//     (overWidth: number, gridTemplateColumns: string[]) => {
//       const newGridTemplateColumns: string[] = JSON.parse(
//         JSON.stringify(gridTemplateColumns),
//       );

//       let countColumns = 0;
//       const defaultColumnSize =
//         columns.find((col) => col.defaultSize)?.defaultSize || 0;

//       newGridTemplateColumns.forEach((item: string, index: number) => {
//         const unfixedSize = checkingForUnfixedSize(item, defaultColumnSize);
//         if (!unfixedSize) return;

//         const column = document.getElementById(`column_${index}`);
//         const minWidth = column?.dataset?.minWidth;
//         const minSize = minWidth ? +minWidth : MIN_SIZE_FIRST_COLUMN;

//         if (
//           (index === 0 ? minSize : DEFAULT_MIN_COLUMN_SIZE) !==
//           getSubstring(item)
//         )
//           countColumns += 1;
//       });

//       const addWidth = overWidth / countColumns;

//       newGridTemplateColumns.forEach((item, index) => {
//         const unfixedSize = checkingForUnfixedSize(item, defaultColumnSize);
//         if (!unfixedSize) return;

//         const column = document.getElementById(`column_${index}`);
//         const minWidth = column?.dataset?.minWidth;
//         const minSize = minWidth ? +minWidth : MIN_SIZE_FIRST_COLUMN;

//         const itemSubstring = getSubstring(item);

//         if ((index === 0 ? minSize : DEFAULT_MIN_COLUMN_SIZE) === itemSubstring)
//           return;

//         const differenceWithMinimum =
//           itemSubstring - (index === 0 ? minSize : DEFAULT_MIN_COLUMN_SIZE);

//         if (differenceWithMinimum >= addWidth) {
//           newGridTemplateColumns[index] = `${itemSubstring - addWidth}px`;
//         } else {
//           newGridTemplateColumns[index] = `${
//             index === 0 ? minSize : DEFAULT_MIN_COLUMN_SIZE
//           }px`;
//         }
//       });

//       return newGridTemplateColumns;
//     },
//     [columns],
//   );

//   const addNewColumns = React.useCallback<
//     (
//       gridTemplateColumns: string[],
//       activeColumnIndex: number,
//       containerWidth: number,
//     ) => boolean
//   >(
//     (gridTemplateColumns, activeColumnIndex, containerWidth) => {
//       const clearSize = gridTemplateColumns.map((c) => getSubstring(c));
//       const maxSize = Math.max(...clearSize);

//       const defaultSize = columns[activeColumnIndex - 1].defaultSize || 0;
//       const indexOfMaxSize = clearSize.findLastIndex((s) => s === maxSize);

//       const addedColumn = 1;
//       const enableColumnsLength =
//         columns.filter((column) => !column.defaultSize && column.enable)
//           .length - addedColumn;
//       const allColumnsLength = columns.filter(
//         (column) => !column.defaultSize,
//       ).length;

//       const defaultSizeColumn =
//         columns.find((column) => column.defaultSize)?.defaultSize || 0;

//       const widthColumns = containerWidth - SETTINGS_SIZE - defaultSizeColumn;

//       const newColumnSize = defaultSize || widthColumns / allColumnsLength;

//       const newSizeMaxColumn = maxSize - newColumnSize;

//       if (
//         (indexOfMaxSize === 0 && newSizeMaxColumn < MIN_SIZE_FIRST_COLUMN) ||
//         (indexOfMaxSize !== 0 && newSizeMaxColumn < DEFAULT_MIN_COLUMN_SIZE) ||
//         newColumnSize < DEFAULT_MIN_COLUMN_SIZE ||
//         enableColumnsLength === 1
//       ) {
//         localStorage.removeItem(columnStorageName);
//         resetColumns();
//         return true;
//       }

//       gridTemplateColumns[indexOfMaxSize] = `${newSizeMaxColumn}px`;
//       gridTemplateColumns[activeColumnIndex] = `${newColumnSize}px`;
//       return false;
//     },
//     [columnStorageName, columns, resetColumns],
//   );

//   const updateTableRows = React.useCallback<(str: string) => void>(
//     (str: string) => {
//       if (!useReactWindow) return;

//       const rows = document.querySelectorAll(
//         ".table-row, .table-list-item",
//       ) as NodeListOf<HTMLElement>;

//       if (rows?.length) {
//         for (let i = 0; i < rows.length; i += 1) {
//           rows[i].style.gridTemplateColumns = str;
//         }
//       }
//     },
//     [useReactWindow],
//   );

//   const onResize = React.useCallback<() => void>(() => {
//     let activeColumnIndex = null;

//     const container = containerRef.current
//       ? containerRef.current
//       : document.getElementById("table-container");

//     if (!container) return;

//     const storageSize =
//       !resetColumnsSize && localStorage.getItem(columnStorageName);

//     const defaultSize =
//       columns.find((col: TTableColumn) => col.defaultSize)?.defaultSize || 0;

//     if (storageSize) {
//       const splitStorage = storageSize.split(" ");

//       const isInvalid = splitStorage.some((s) => s === "NaNpx");

//       if (
//         (defaultSize &&
//           splitStorage[splitStorage.length - 2] !== `${defaultSize}px`) ||
//         getSubstring(splitStorage[0]) <= DEFAULT_MIN_COLUMN_SIZE ||
//         isInvalid
//       ) {
//         localStorage.removeItem(columnStorageName);
//         onResize();
//         return;
//       }
//     }

//     const containerGridTemplateColumns =
//       container.style.gridTemplateColumns.split(" ");

//     const tableContainer = storageSize
//       ? storageSize.split(" ")
//       : containerGridTemplateColumns;

//     if (
//       containerGridTemplateColumns.length === 1 &&
//       !state.hideColumns &&
//       storageSize
//     ) {
//       const hasContent = !!storageSize.split(" ").find((item, index) => {
//         if (index === 0) return;
//         return checkingForUnfixedSize(item, defaultSize);
//       });

//       // If content column sizes are calculated as empty after changing view
//       if (!hasContent) {
//         resetColumns();
//         return;
//       }
//     }

//     // columns.length + 1 - its settings column
//     if (tableContainer.length !== columns.length + 1) {
//       resetColumns();
//       return;
//     }

//     if (!container) return;

//     const containerWidth = +container.clientWidth;

//     const oldWidth =
//       tableContainer
//         .map((column: string) => getSubstring(column))
//         .reduce((x: number, y: number) => x + y) -
//       defaultSize -
//       SETTINGS_SIZE;

//     let str = "";
//     let gridTemplateColumnsWithoutOverfilling: string[] = [];

//     if (tableContainer.length > 1) {
//       const gridTemplateColumns: string[] = [];
//       let hideColumns = false;

//       let contentColumnsCount = 0;
//       let contentColumnsCountInfoPanel = 0;

//       const storageInfoPanelSize = localStorage.getItem(
//         columnInfoPanelStorageName,
//       );

//       if (storageInfoPanelSize) {
//         contentColumnsCountInfoPanel = storageInfoPanelSize
//           .split(" ")
//           .filter((item) => checkingForUnfixedSize(item, defaultSize)).length;

//         contentColumnsCount = tableContainer.filter((item) =>
//           checkingForUnfixedSize(item, defaultSize),
//         ).length;
//       }

//       const incorrectNumberColumns =
//         contentColumnsCountInfoPanel < contentColumnsCount &&
//         !state.hideColumns;

//       const tableInfoPanelContainer =
//         storageInfoPanelSize && !incorrectNumberColumns
//           ? storageInfoPanelSize.split(" ")
//           : tableContainer;

//       let containerMinWidth = containerWidth - defaultSize - SETTINGS_SIZE;

//       tableInfoPanelContainer.forEach((item, index) => {
//         const column = document.getElementById(`column_${index}`);

//         const enable =
//           index === tableContainer.length - 1 ||
//           (column ? column.dataset.enable === "true" : item !== "0px");

//         if (
//           enable &&
//           (item !== `${defaultSize}px` || `${defaultSize}px` === `0px`) &&
//           item !== `${SETTINGS_SIZE}px`
//         ) {
//           if (column?.dataset?.minWidth) {
//             containerMinWidth -= +column.dataset.minWidth;
//           } else {
//             containerMinWidth -= DEFAULT_MIN_COLUMN_SIZE;
//           }
//         }
//       });

//       if (containerMinWidth < 0) {
//         hideColumns = true;
//       }

//       if (state.hideColumns !== hideColumns) {
//         setState((s) => ({ ...s, hideColumns }));
//         setHideColumns(hideColumns);
//       }

//       if (hideColumns) {
//         tableInfoPanelContainer.forEach((item, index) => {
//           const column = document.getElementById(`column_${index}`);

//           if (column?.dataset?.minWidth) {
//             gridTemplateColumns.push(
//               `${containerWidth - defaultSize - SETTINGS_SIZE}px`,
//             );
//           } else if (
//             item === `${defaultSize}px` ||
//             item === `${SETTINGS_SIZE}px`
//           ) {
//             gridTemplateColumns.push(item);
//           } else {
//             gridTemplateColumns.push("0px");
//           }
//         });
//       }

//       let hasGridTemplateColumnsWithoutOverfilling = false;
//       if (infoPanelVisible) {
//         if (!hideColumns) {
//           const contentWidth = containerWidth - defaultSize - SETTINGS_SIZE;

//           let enabledColumnsCount = 0;

//           tableInfoPanelContainer.forEach((item: string, index: number) => {
//             if (
//               index !== 0 &&
//               item !== "0px" &&
//               item !== `${defaultSize}px` &&
//               item !== `${SETTINGS_SIZE}px`
//             ) {
//               enabledColumnsCount += 1;
//             }
//           });

//           const changedWidth =
//             tableInfoPanelContainer
//               .map((column: string) => getSubstring(column))
//               .reduce((x: number, y: number) => x + y) -
//             defaultSize -
//             SETTINGS_SIZE;

//           if (
//             contentWidth - enabledColumnsCount * DEFAULT_MIN_COLUMN_SIZE >
//             getSubstring(tableInfoPanelContainer[0])
//           ) {
//             const currentContentWidth =
//               contentWidth - +getSubstring(tableInfoPanelContainer[0]);

//             let overWidth = 0;

//             tableInfoPanelContainer.forEach((item: string, index: number) => {
//               if (index === 0) {
//                 gridTemplateColumns.push(item);
//               } else {
//                 const column = document.getElementById(`column_${index}`);

//                 const enable =
//                   index === tableInfoPanelContainer.length - 1 ||
//                   (column ? column.dataset.enable === "true" : item !== "0px");

//                 const defaultColumnSize = column && column.dataset.defaultSize;

//                 if (!enable) {
//                   gridTemplateColumns.push("0px");
//                 } else if (item !== `${SETTINGS_SIZE}px`) {
//                   const percent =
//                     (getSubstring(item) /
//                       (changedWidth -
//                         +getSubstring(tableInfoPanelContainer[0]))) *
//                     100;

//                   const newItemWidth = defaultColumnSize
//                     ? `${defaultColumnSize}px`
//                     : (currentContentWidth * percent) / 100 >
//                         DEFAULT_MIN_COLUMN_SIZE
//                       ? `${(currentContentWidth * percent) / 100}px`
//                       : `${DEFAULT_MIN_COLUMN_SIZE}px`;

//                   if (
//                     (currentContentWidth * percent) / 100 <
//                       DEFAULT_MIN_COLUMN_SIZE &&
//                     !defaultColumnSize
//                   ) {
//                     overWidth +=
//                       DEFAULT_MIN_COLUMN_SIZE -
//                       (currentContentWidth * percent) / 100;
//                   }

//                   gridTemplateColumns.push(newItemWidth);
//                 } else {
//                   gridTemplateColumns.push(item);
//                 }
//               }
//             });

//             if (overWidth > 0) {
//               gridTemplateColumns.forEach((column, index) => {
//                 const columnWidth = getSubstring(column);

//                 if (
//                   index !== 0 &&
//                   column !== "0px" &&
//                   column !== `${defaultSize}px` &&
//                   column !== `${SETTINGS_SIZE}px` &&
//                   columnWidth > DEFAULT_MIN_COLUMN_SIZE
//                 ) {
//                   const availableWidth = columnWidth - DEFAULT_MIN_COLUMN_SIZE;

//                   if (availableWidth < Math.abs(overWidth)) {
//                     overWidth = Math.abs(overWidth) - availableWidth;
//                     return (gridTemplateColumns[index] = `${
//                       columnWidth - availableWidth
//                     }px`);
//                   }
//                   const temp = overWidth;

//                   overWidth = 0;

//                   return (gridTemplateColumns[index] = `${
//                     columnWidth - Math.abs(temp)
//                   }px`);
//                 }
//               });
//             }
//           } else {
//             tableInfoPanelContainer.forEach((item: string, index: number) => {
//               const column = document.getElementById(`column_${index}`);

//               const enable =
//                 index === tableInfoPanelContainer.length - 1 ||
//                 (column ? column.dataset.enable === "true" : item !== "0px");

//               const defaultColumnSize = column && column.dataset.defaultSize;

//               if (!enable) {
//                 gridTemplateColumns.push("0px");
//               } else if (item !== `${SETTINGS_SIZE}px`) {
//                 const newItemWidth = defaultColumnSize
//                   ? `${defaultColumnSize}px`
//                   : index === 0
//                     ? `${
//                         contentWidth -
//                         enabledColumnsCount * DEFAULT_MIN_COLUMN_SIZE
//                       }px`
//                     : `${DEFAULT_MIN_COLUMN_SIZE}px`;

//                 gridTemplateColumns.push(newItemWidth);
//               } else {
//                 gridTemplateColumns.push(item);
//               }
//             });
//           }
//         }
//       } else {
//         let overWidth = 0;
//         if (!hideColumns) {
//           tableContainer.forEach((i: string, index: number) => {
//             const item = tableContainer[index];

//             const column = document.getElementById(`column_${index}`);
//             const enable =
//               index === tableContainer.length - 1 ||
//               (column ? column.dataset.enable === "true" : item !== "0px");
//             const defaultColumnSize = column && column.dataset.defaultSize;

//             const isActiveNow = item === "0px" && enable;
//             if (isActiveNow && column) activeColumnIndex = index;

//             if (!enable) {
//               gridTemplateColumns.push("0px");

//               let colIndex = 1;
//               let leftEnableColumn = gridTemplateColumns[index - colIndex];
//               while (leftEnableColumn === "0px") {
//                 colIndex += 1;
//                 leftEnableColumn = gridTemplateColumns[index - colIndex];
//               }

//               // added the size of the disabled column to the left column
//               gridTemplateColumns[index - colIndex] = `${
//                 getSubstring(gridTemplateColumns[index - colIndex]) +
//                 getSubstring(item)
//               }
//                 px`;
//             } else if (item !== `${SETTINGS_SIZE}px`) {
//               const percent = (getSubstring(item) / oldWidth) * 100;

//               let newItemWidth = defaultColumnSize
//                 ? `${defaultColumnSize}px`
//                 : percent === 0
//                   ? `${DEFAULT_MIN_COLUMN_SIZE}px`
//                   : `${
//                       ((containerWidth - defaultSize - SETTINGS_SIZE) *
//                         percent) /
//                       100
//                     }
//                     px`;

//               const minWidth = column?.dataset?.minWidth;
//               const minSize = minWidth ? +minWidth : MIN_SIZE_FIRST_COLUMN;

//               // Checking whether the first column is less than the minimum width
//               if (+index === 0 && getSubstring(newItemWidth) < minSize) {
//                 overWidth += MIN_SIZE_FIRST_COLUMN - getSubstring(newItemWidth);
//                 newItemWidth = `${MIN_SIZE_FIRST_COLUMN}px`;
//               }

//               // Checking whether columns are smaller than the minimum width
//               if (
//                 +index !== 0 &&
//                 !defaultColumnSize &&
//                 getSubstring(newItemWidth) < DEFAULT_MIN_COLUMN_SIZE
//               ) {
//                 overWidth +=
//                   DEFAULT_MIN_COLUMN_SIZE - getSubstring(newItemWidth);
//                 newItemWidth = `${DEFAULT_MIN_COLUMN_SIZE}px`;
//               }

//               gridTemplateColumns.push(newItemWidth);
//             } else {
//               gridTemplateColumns.push(item);
//             }
//           });

//           if (overWidth > 0) {
//             gridTemplateColumnsWithoutOverfilling = distributionOverWidth(
//               overWidth,
//               gridTemplateColumns,
//             );
//           }

//           hasGridTemplateColumnsWithoutOverfilling =
//             gridTemplateColumnsWithoutOverfilling &&
//             gridTemplateColumnsWithoutOverfilling.length > 0;

//           if (activeColumnIndex) {
//             const gridColumns = hasGridTemplateColumnsWithoutOverfilling
//               ? gridTemplateColumnsWithoutOverfilling
//               : gridTemplateColumns;

//             const needReset = addNewColumns(
//               gridColumns,
//               activeColumnIndex,
//               containerWidth,
//             );
//             if (needReset) return;
//           }
//         }
//       }

//       str = hasGridTemplateColumnsWithoutOverfilling
//         ? gridTemplateColumnsWithoutOverfilling.join(" ")
//         : gridTemplateColumns.join(" ");
//     } else {
//       resetColumns();
//     }

//     if (str) {
//       container.style.gridTemplateColumns = str;

//       updateTableRows(str);

//       if (headerRef.current) {
//         headerRef.current.style.gridTemplateColumns = str;
//         headerRef.current.style.width = `${containerWidth}px`;
//       }

//       if (infoPanelVisible)
//         localStorage.setItem(columnInfoPanelStorageName, str);

//       if (!infoPanelVisible) {
//         localStorage.setItem(columnStorageName, str);
//         localStorage.removeItem(columnInfoPanelStorageName);
//       }
//     }
//   }, [
//     addNewColumns,
//     columnInfoPanelStorageName,
//     columnStorageName,
//     columns,
//     containerRef,
//     distributionOverWidth,
//     infoPanelVisible,
//     resetColumns,
//     resetColumnsSize,
//     setHideColumns,
//     state.hideColumns,
//     updateTableRows,
//   ]);

//   React.useEffect(() => {
//     resizeRef.current = onResize;
//     onResize();
//     throttledResize.current = throttle(onResize, 300);
//     if (throttledResize.current) {
//       window.addEventListener("resize", throttledResize.current);
//     }

//     return () => {
//       if (throttledResize.current)
//         window.removeEventListener("resize", throttledResize.current);
//     };
//   }, [onResize]);

//   const getNextColumn = React.useCallback(
//     (array: TTableColumn[], index: number) => {
//       let i = 1;

//       while (array.length !== i) {
//         const item = array[index + i];

//         if (!item || state.hideColumns) return null;

//         if (!item.enable) i += 1;
//         else return item;
//       }
//     },
//     [state.hideColumns],
//   );

//   // const getColumn = React.useCallback((array: string[], index: number) => {
//   //   let i = 1;
//   //   while (array.length !== i) {
//   //     const item = array[index + i];
//   //     if (!item) return [0, i];
//   //     if (item === "0px") i += 1;
//   //     else return [getSubstring(item), i];
//   //   }
//   // }, []);

//   const moveToLeft = (widths: string[], newWidth: number, index?: number) => {
//     let leftColumn;
//     let colIndex = index !== undefined ? index : state.columnIndex - 1;

//     if (colIndex < 0) return;

//     while (colIndex >= 0) {
//       leftColumn = document.getElementById(`column_${colIndex}`);
//       if (leftColumn) {
//         if (leftColumn.dataset.enable === "true") break;
//         else colIndex -= 1;
//       } else return false;
//     }

//     const minSize =
//       leftColumn && leftColumn.dataset.minWidth
//         ? +leftColumn.dataset.minWidth
//         : DEFAULT_MIN_COLUMN_SIZE;

//     if (leftColumn && leftColumn.clientWidth <= minSize) {
//       if (colIndex < 0) return false;
//       moveToLeft(widths, newWidth, colIndex - 1);

//       return;
//     }

//     const offset = getSubstring(widths[+state.columnIndex]) - newWidth;

//     const column2Width = getSubstring(widths[colIndex]);

//     const leftColumnWidth = column2Width - offset;
//     const newLeftWidth = leftColumnWidth < minSize ? minSize : leftColumnWidth;

//     widths[colIndex] = `${newLeftWidth}px`;

//     widths[+state.columnIndex] = `${
//       getSubstring(widths[+state.columnIndex]) +
//       (offset - (newLeftWidth - leftColumnWidth))
//     }px`;
//   };

//   const moveToRight = (widths: string[], newWidth: number, index?: number) => {
//     let rightColumn;
//     let colIndex = index || +state.columnIndex + 1;

//     while (colIndex !== columns.length) {
//       rightColumn = document.getElementById(`column_${colIndex}`);
//       if (rightColumn) {
//         if (rightColumn.dataset.enable === "true") break;
//         else colIndex += 1;
//       } else return false;
//     }

//     const offset = getSubstring(widths[+state.columnIndex]) - newWidth;
//     const column2Width = getSubstring(widths[colIndex]);

//     const defaultColumn = document.getElementById(`column_${colIndex}`);
//     if (!defaultColumn || defaultColumn.dataset.defaultSize) return;

//     const handleOffset = 8;

//     if (column2Width + offset - handleOffset >= DEFAULT_MIN_COLUMN_SIZE) {
//       widths[+state.columnIndex] = `${newWidth + handleOffset}px`;
//       widths[colIndex] = `${column2Width + offset - handleOffset}px`;
//     } else {
//       if (colIndex === columns.length) return false;
//       moveToRight(widths, newWidth, colIndex + 1);
//     }
//   };

//   const onMouseMove = (e: MouseEvent) => {
//     const isRtl = theme?.interfaceDirection === "rtl";

//     // if (!state.columnIndex) return;
//     const column = document.getElementById(
//       `column_${state.columnIndex}`,
//     ) as HTMLElement;

//     const columnSize = column?.getBoundingClientRect();
//     const newWidth = isRtl
//       ? columnSize.right - e.clientX
//       : e.clientX - columnSize.left;

//     const tableContainer = containerRef.current.style.gridTemplateColumns;
//     const widths = tableContainer.split(" ");

//     const minSize = column.dataset.minWidth
//       ? +column.dataset.minWidth
//       : DEFAULT_MIN_COLUMN_SIZE;

//     if (newWidth <= minSize) {
//       const columnChanged = moveToLeft(widths, newWidth);

//       if (!columnChanged) {
//         widths[+state.columnIndex] = widths[+state.columnIndex];
//       }
//     } else {
//       moveToRight(widths, newWidth);
//     }

//     const str = widths.join(" ");

//     containerRef.current.style.gridTemplateColumns = str;
//     if (headerRef.current) headerRef.current.style.gridTemplateColumns = str;

//     updateTableRows(str);
//   };

//   const onMouseUp = () => {
//     if (!infoPanelVisible) {
//       localStorage.setItem(
//         columnStorageName,
//         containerRef.current.style.gridTemplateColumns,
//       );
//     } else {
//       localStorage.setItem(
//         columnInfoPanelStorageName,
//         containerRef.current.style.gridTemplateColumns,
//       );
//     }

//     window.removeEventListener("mousemove", onMouseMove);
//     window.removeEventListener("mouseup", onMouseUp);
//   };

//   const onMouseDown = (event: React.MouseEvent) => {
//     const target = event.target as HTMLDivElement;
//     const column = target?.dataset?.column ? +target.dataset.column : 0;

//     setState((s) => ({ ...s, columnIndex: column }));

//     window.addEventListener("mousemove", onMouseMove);
//     window.addEventListener("mouseup", onMouseUp);
//   };

//   return (
//     <>
//       <StyledTableHeader
//         id="table-container_caption-header"
//         className={`${
//           isLengthenHeader ? "lengthen-header" : ""
//         } table-container_header`}
//         ref={headerRef}
//         {...rest}
//       >
//         <StyledTableRow>
//           {columns.map((column, index) => {
//             const nextColumn = getNextColumn(columns, index);
//             const resizable = nextColumn ? nextColumn.resizable : false;

//             return (
//               <TableHeaderCell
//                 key={column.key ?? "empty-cell"}
//                 index={index}
//                 column={column}
//                 sorted={sorted}
//                 sortBy={sortBy}
//                 resizable={resizable}
//                 defaultSize={column.defaultSize}
//                 onMouseDown={onMouseDown}
//                 sortingVisible={sortingVisible}
//                 tagRef={tagRef}
//               />
//             );
//           })}

//           {showSettings && (
//             <div
//               className="table-container_header-settings"
//               title={settingsTitle}
//             >
//               <TableSettings
//                 columns={columns}
//                 disableSettings={infoPanelVisible || state.hideColumns}
//               />
//             </div>
//           )}
//         </StyledTableRow>
//       </StyledTableHeader>

//       <StyledEmptyTableContainer />
//     </>
//   );
// }

const defaultMinColumnSize = 110;
const settingsSize = 24;

const minSizeFirstColumn = 210;

class TableHeader extends React.Component<
  TableHeaderProps,
  { hideColumns: boolean; columnIndex: null | number }
> {
  headerRef: null | React.RefObject<HTMLDivElement> = null;

  throttledResize: null | DebouncedFunc<() => void> = null;

  constructor(props: TableHeaderProps) {
    super(props);

    this.state = { columnIndex: null, hideColumns: false };

    this.headerRef = React.createRef();
    this.throttledResize = throttle(this.onResize, 300);
  }

  componentDidMount() {
    this.onResize();
    if (this.throttledResize)
      window.addEventListener("resize", this.throttledResize);
  }

  componentDidUpdate() {
    this.onResize();
  }

  componentWillUnmount() {
    if (this.throttledResize)
      window.removeEventListener("resize", this.throttledResize);
  }

  getNextColumn = (array: TTableColumn[], index: number) => {
    let i = 1;

    const { hideColumns } = this.state;

    while (array.length !== i) {
      const item = array[index + i];

      if (!item || hideColumns) return null;
      if (!item.enable) i += 1;
      else return item;
    }
  };

  // getColumn = (array: string[], index: number) => {
  //   let i = 1;
  //   while (array.length !== i) {
  //     const item = array[index + i];
  //     if (!item) return [0, i];
  //     if (item === "0px") i += 1;
  //     else return [getSubstring(item), i];
  //   }
  // };

  moveToLeft = (widths: string[], newWidth: number, index?: number) => {
    const { columnIndex } = this.state;

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
        : defaultMinColumnSize;

      if (leftColumn.clientWidth <= +minSize) {
        if (colIndex < 0) return false;
        this.moveToLeft(widths, newWidth, colIndex - 1);
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

  moveToRight = (widths: string[], newWidth: number, index?: number) => {
    const { columnIndex } = this.state;
    const { columns } = this.props;

    if (columnIndex === null) return;

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

    const handleOffset = 8;

    if (column2Width + offset - handleOffset >= defaultMinColumnSize) {
      widths[+columnIndex] = `${newWidth + handleOffset}px`;
      widths[colIndex] = `${column2Width + offset - handleOffset}px`;
    } else {
      if (colIndex === columns.length) return false;
      this.moveToRight(widths, newWidth, colIndex + 1);
    }
  };

  addNewColumns = (
    gridTemplateColumns: string[],
    activeColumnIndex: number,
    containerWidth: number,
  ) => {
    const { columns, columnStorageName } = this.props;
    const clearSize = gridTemplateColumns.map((c) => getSubstring(c));
    // eslint-disable-next-line prefer-spread
    const maxSize = Math.max.apply(Math, clearSize);

    const defaultSize = columns[activeColumnIndex - 1].defaultSize;
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
      containerWidth - settingsSize - (defaultSizeColumn || 0);

    const newColumnSize = defaultSize || widthColumns / allColumnsLength;

    const newSizeMaxColumn = maxSize - newColumnSize;

    const AddColumn = () => {
      gridTemplateColumns[indexOfMaxSize] = `${newSizeMaxColumn}px`;
      gridTemplateColumns[activeColumnIndex] = `${newColumnSize}px`;
      return false;
    };

    const ResetColumnsSize = () => {
      localStorage.removeItem(columnStorageName);
      this.resetColumns();
      return true;
    };

    if (
      (indexOfMaxSize === 0 && newSizeMaxColumn < minSizeFirstColumn) ||
      (indexOfMaxSize !== 0 && newSizeMaxColumn < defaultMinColumnSize) ||
      newColumnSize < defaultMinColumnSize ||
      enableColumnsLength === 1
    )
      return ResetColumnsSize();

    AddColumn();
  };

  onMouseMove = (e: MouseEvent) => {
    const { columnIndex } = this.state;
    const { containerRef, theme } = this.props;
    const isRtl = theme.interfaceDirection === "rtl";

    if (columnIndex === null) return;
    const column = document.getElementById(`column_${columnIndex}`);

    if (!column) return;

    const columnSize = column.getBoundingClientRect();
    const newWidth = isRtl
      ? columnSize.right - e.clientX
      : e.clientX - columnSize.left;

    const tableContainer = containerRef.current.style.gridTemplateColumns;
    const widths = tableContainer.split(" ");

    const minSize = column.dataset.minWidth
      ? column.dataset.minWidth
      : defaultMinColumnSize;

    if (newWidth <= +minSize) {
      const columnChanged = this.moveToLeft(widths, newWidth);

      if (!columnChanged) {
        widths[+columnIndex] = widths[+columnIndex];
      }
    } else {
      this.moveToRight(widths, newWidth);
    }

    const str = widths.join(" ");

    containerRef.current.style.gridTemplateColumns = str;
    if (this.headerRef?.current)
      this.headerRef.current.style.gridTemplateColumns = str;

    this.updateTableRows(str);
  };

  onMouseUp = () => {
    const {
      infoPanelVisible = false,
      columnStorageName,
      columnInfoPanelStorageName,
      containerRef,
    } = this.props;

    if (!infoPanelVisible) {
      localStorage.setItem(
        columnStorageName,
        containerRef.current.style.gridTemplateColumns,
      );
    } else {
      localStorage.setItem(
        columnInfoPanelStorageName,
        containerRef.current.style.gridTemplateColumns,
      );
    }

    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
  };

  onMouseDown = (event: React.MouseEvent) => {
    if (event.target) {
      const target = event.target as HTMLDivElement;

      if (target.dataset.column)
        this.setState({ columnIndex: +target.dataset.column });
    }
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
  };

  onResize = () => {
    const {
      containerRef,
      columnStorageName,
      columnInfoPanelStorageName,
      resetColumnsSize,

      infoPanelVisible = false,
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

    // TODO: If defaultSize(75px) is less than defaultMinColumnSize(110px) the calculations work correctly
    const defaultSize =
      columns.find((col) => col.defaultSize)?.defaultSize || 0;

    // TODO: Fixed columns size if something went wrong
    if (storageSize) {
      const splitStorage = storageSize.split(" ");

      const isInvalid = splitStorage.some((s) => s === "NaNpx");

      if (
        (defaultSize &&
          splitStorage[splitStorage.length - 2] !== `${defaultSize}px`) ||
        getSubstring(splitStorage[0]) <= defaultMinColumnSize ||
        isInvalid
      ) {
        localStorage.removeItem(columnStorageName);
        this.onResize();
        return;
      }
    }

    const containerGridTemplateColumns =
      container.style.gridTemplateColumns.split(" ");

    const tableContainer = storageSize
      ? storageSize.split(" ")
      : containerGridTemplateColumns;

    const { hideColumns } = this.state;

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
      if (!hasContent) return this.resetColumns();
    }

    // columns.length + 1 - its settings column
    if (tableContainer.length !== columns.length + 1) {
      return this.resetColumns();
    }

    if (!container) return;

    const containerWidth = +container.clientWidth;

    const oldWidth =
      tableContainer
        .map((column) => getSubstring(column))
        .reduce((x, y) => x + y) -
      defaultSize -
      settingsSize;

    let str = "";
    let gridTemplateColumnsWithoutOverfilling: string[] = [];

    if (tableContainer.length > 1) {
      const gridTemplateColumns: string[] = [];
      let hideColumnsConst = false;

      let contentColumnsCount = 0;
      let contentColumnsCountInfoPanel = 0;

      const storageInfoPanelSize = localStorage.getItem(
        columnInfoPanelStorageName,
      );

      if (storageInfoPanelSize) {
        contentColumnsCountInfoPanel = storageInfoPanelSize
          .split(" ")
          .filter((item) => checkingForUnfixedSize(item, defaultSize)).length;

        contentColumnsCount = tableContainer.filter((item) =>
          checkingForUnfixedSize(item, defaultSize),
        ).length;
      }

      const incorrectNumberColumns =
        contentColumnsCountInfoPanel < contentColumnsCount && !hideColumns;

      const tableInfoPanelContainer =
        storageInfoPanelSize && !incorrectNumberColumns
          ? storageInfoPanelSize.split(" ")
          : tableContainer;

      let containerMinWidth = containerWidth - defaultSize - settingsSize;

      tableInfoPanelContainer.forEach((item, index) => {
        const column = document.getElementById(`column_${index}`);

        const enable =
          index === tableContainer.length - 1 ||
          (column ? column.dataset.enable === "true" : item !== "0px");

        if (
          enable &&
          (item !== `${defaultSize}px` || `${defaultSize}px` === `0px`) &&
          item !== `${settingsSize}px`
        ) {
          if (column?.dataset?.minWidth) {
            containerMinWidth -= +column.dataset.minWidth;
          } else {
            containerMinWidth -= defaultMinColumnSize;
          }
        }
      });

      if (containerMinWidth < 0) {
        hideColumnsConst = true;
      }

      if (hideColumns !== hideColumnsConst) {
        this.setState({ hideColumns: hideColumnsConst });
        setHideColumns(hideColumnsConst);
      }

      if (hideColumnsConst) {
        tableInfoPanelContainer.forEach((item, index) => {
          const column = document.getElementById(`column_${index}`);

          if (column?.dataset?.minWidth && column?.dataset?.default) {
            gridTemplateColumns.push(
              `${containerWidth - defaultSize - settingsSize}px`,
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
          const contentWidth = containerWidth - defaultSize - settingsSize;

          let enabledColumnsCount = 0;

          tableInfoPanelContainer.forEach((item, index) => {
            if (
              index !== 0 &&
              item !== "0px" &&
              item !== `${defaultSize}px` &&
              item !== `${settingsSize}px`
            ) {
              enabledColumnsCount += 1;
            }
          });

          const changedWidth =
            tableInfoPanelContainer
              .map((column) => getSubstring(column))
              .reduce((x, y) => x + y) -
            defaultSize -
            settingsSize;

          if (
            contentWidth - enabledColumnsCount * defaultMinColumnSize >
            getSubstring(tableInfoPanelContainer[0])
          ) {
            const currentContentWidth =
              enabledColumnsCount > 0
                ? contentWidth - +getSubstring(tableInfoPanelContainer[0])
                : contentWidth;

            let overWidth = 0;

            tableInfoPanelContainer.forEach((item, index) => {
              if (index === 0 && enabledColumnsCount > 0) {
                gridTemplateColumns.push(item);
              } else {
                const column = document.getElementById(`column_${index}`);

                const enable =
                  index === tableInfoPanelContainer.length - 1 ||
                  (column ? column.dataset.enable === "true" : item !== "0px");

                const defaultColumnSize = column && column.dataset.defaultSize;

                if (!enable) {
                  gridTemplateColumns.push("0px");
                } else if (item !== `${settingsSize}px`) {
                  const percent =
                    enabledColumnsCount === 0
                      ? 100
                      : (getSubstring(item) /
                          (changedWidth -
                            +getSubstring(tableInfoPanelContainer[0]))) *
                        100;

                  const newItemWidth = defaultColumnSize
                    ? `${defaultColumnSize}px`
                    : (currentContentWidth * percent) / 100 >
                        defaultMinColumnSize
                      ? `${(currentContentWidth * percent) / 100}px`
                      : `${defaultMinColumnSize}px`;

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
                const columnWidth = getSubstring(column);

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
            tableInfoPanelContainer.forEach((item, index) => {
              const column = document.getElementById(`column_${index}`);

              const enable =
                index === tableInfoPanelContainer.length - 1 ||
                (column ? column.dataset.enable === "true" : item !== "0px");

              const defaultColumnSize = column && column.dataset.defaultSize;

              if (!enable) {
                gridTemplateColumns.push("0px");
              } else if (item !== `${settingsSize}px`) {
                const newItemWidth = defaultColumnSize
                  ? `${defaultColumnSize}px`
                  : index === 0
                    ? `${
                        contentWidth -
                        enabledColumnsCount * defaultMinColumnSize
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
          // eslint-disable-next-line guard-for-in, no-restricted-syntax
          for (const index in tableContainer) {
            const item = tableContainer[index];

            const column = document.getElementById(`column_${index}`);
            const enable =
              +index === tableContainer.length - 1 ||
              (column ? column.dataset.enable === "true" : item !== "0px");
            const defaultColumnSize = column && column.dataset.defaultSize;

            const isActiveNow = item === "0px" && enable;
            if (isActiveNow && column) activeColumnIndex = index;

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
            } else if (item !== `${settingsSize}px`) {
              const percent = (getSubstring(item) / oldWidth) * 100;

              let newItemWidth = defaultColumnSize
                ? `${defaultColumnSize}px`
                : percent === 0
                  ? `${defaultMinColumnSize}px`
                  : `${
                      ((containerWidth - defaultSize - settingsSize) *
                        percent) /
                      100
                    }px`;

              const minWidth = column?.dataset?.minWidth;
              const minSize = minWidth ? +minWidth : minSizeFirstColumn;

              // Checking whether the first column is less than the minimum width
              if (+index === 0 && getSubstring(newItemWidth) < minSize) {
                overWidth += minSizeFirstColumn - getSubstring(newItemWidth);
                newItemWidth = `${minSizeFirstColumn}px`;
              }

              // Checking whether columns are smaller than the minimum width
              if (
                +index !== 0 &&
                !defaultColumnSize &&
                getSubstring(newItemWidth) < defaultMinColumnSize
              ) {
                overWidth += defaultMinColumnSize - getSubstring(newItemWidth);
                newItemWidth = `${defaultMinColumnSize}px`;
              }

              gridTemplateColumns.push(newItemWidth);
            } else {
              gridTemplateColumns.push(item);
            }
          }

          if (overWidth > 0) {
            gridTemplateColumnsWithoutOverfilling = this.distributionOverWidth(
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

            const needReset = this.addNewColumns(
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
    } else {
      this.resetColumns();
    }

    if (str) {
      container.style.gridTemplateColumns = str;

      this.updateTableRows(str);

      if (this.headerRef && this.headerRef.current) {
        this.headerRef.current.style.gridTemplateColumns = str;
        this.headerRef.current.style.width = `${containerWidth}px`;
      }

      if (infoPanelVisible)
        localStorage.setItem(columnInfoPanelStorageName, str);
      else localStorage.setItem(columnStorageName, str);

      if (!infoPanelVisible) {
        localStorage.removeItem(columnInfoPanelStorageName);
      }
    }
  };

  distributionOverWidth = (
    overWidth: number,
    gridTemplateColumns: string[],
  ) => {
    const newGridTemplateColumns: string[] = JSON.parse(
      JSON.stringify(gridTemplateColumns),
    );

    const { columns } = this.props;

    let countColumns = 0;
    const defaultColumnSize =
      columns.find((col) => col.defaultSize)?.defaultSize || 0;

    newGridTemplateColumns.forEach((item, index) => {
      const unfixedSize = checkingForUnfixedSize(item, defaultColumnSize);
      if (!unfixedSize) return;

      const column = document.getElementById(`column_${index}`);
      const minWidth = column?.dataset?.minWidth;
      const minSize = minWidth ? +minWidth : minSizeFirstColumn;

      if ((index === 0 ? minSize : defaultMinColumnSize) !== getSubstring(item))
        countColumns += 1;
    });

    const addWidth = overWidth / countColumns;

    newGridTemplateColumns.forEach((item, index) => {
      const unfixedSize = checkingForUnfixedSize(item, defaultColumnSize);
      if (!unfixedSize) return;

      const column = document.getElementById(`column_${index}`);
      const minWidth = column?.dataset?.minWidth;
      const minSize = minWidth ? +minWidth : minSizeFirstColumn;

      const itemSubstring = getSubstring(item);

      if ((index === 0 ? minSize : defaultMinColumnSize) === itemSubstring)
        return;

      const differenceWithMinimum =
        itemSubstring - (index === 0 ? minSize : defaultMinColumnSize);

      if (differenceWithMinimum >= addWidth) {
        newGridTemplateColumns[index] = `${itemSubstring - addWidth}px`;
      } else {
        newGridTemplateColumns[index] = `${
          index === 0 ? minSize : defaultMinColumnSize
        }px`;
      }
    });

    return newGridTemplateColumns;
  };

  updateTableRows = (str: string) => {
    const { useReactWindow = false } = this.props;
    if (!useReactWindow) return;

    const rows = document.querySelectorAll(".table-row, .table-list-item");

    if (rows?.length) {
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i] as HTMLElement;
        row.style.gridTemplateColumns = str;
      }
    }
  };

  resetColumns = () => {
    const {
      containerRef,
      columnStorageName,
      columnInfoPanelStorageName,
      columns,
      infoPanelVisible,
    } = this.props;

    localStorage.removeItem(columnStorageName);
    localStorage.removeItem(columnInfoPanelStorageName);

    let str = "";

    const enableColumns = columns
      .filter((x) => x.enable)
      .filter((x) => !x.defaultSize)
      .filter((x) => !x.default);

    const container = containerRef.current
      ? containerRef.current
      : document.getElementById("table-container");
    const containerWidth = container ? container.clientWidth : 0;

    const firstColumnPercent = 40;
    const percent = 60 / enableColumns.length;

    const wideColumnSize = `${(containerWidth * firstColumnPercent) / 100}px`;
    const otherColumns = `${(containerWidth * percent) / 100}px`;

    for (const col of columns) {
      if (col.default) {
        str += `${wideColumnSize} `;
      } else
        str += col.enable
          ? col.defaultSize
            ? `${col.defaultSize}px `
            : `${otherColumns} `
          : "0px ";
    }

    str += `${settingsSize}px`;

    if (container) container.style.gridTemplateColumns = str;
    if (this.headerRef && this.headerRef.current) {
      this.headerRef.current.style.gridTemplateColumns = str;
      this.headerRef.current.style.width = `${containerWidth}px`;
    }

    if (str) {
      if (!infoPanelVisible) {
        localStorage.setItem(columnStorageName, str);
      } else {
        localStorage.setItem(columnInfoPanelStorageName, str);
      }
    }

    this.onResize();
  };

  render() {
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
      ...rest
    } = this.props;

    const { hideColumns } = this.state;

    // console.log("TABLE HEADER RENDER", columns);

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
                  disableSettings={infoPanelVisible || hideColumns}
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

// TableHeader.propTypes = {
//   containerRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
//   columns: PropTypes.array.isRequired,
//   sortBy: PropTypes.string,
//   sorted: PropTypes.bool,
//   columnStorageName: PropTypes.string,
//   sectionWidth: PropTypes.number,
//   onClick: PropTypes.func,
//   resetColumnsSize: PropTypes.bool,
//   isLengthenHeader: PropTypes.bool,
//   sortingVisible: PropTypes.bool,
//   infoPanelVisible: PropTypes.bool,
//   useReactWindow: PropTypes.bool,
//   showSettings: PropTypes.bool,
// };

export default withTheme(TableHeader);
