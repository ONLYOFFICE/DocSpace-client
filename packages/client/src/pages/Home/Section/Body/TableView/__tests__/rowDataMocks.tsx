import React from "react";
import { vi } from "vitest";

/**
 * The cells a row of the AI lists is built of, reduced to markers that tell
 * which cell drew what, and the theme and props every row is given.
 */
type TCellProps = {
  children?: React.ReactNode;
  dataTestId?: string;
  className?: string;
};

export const TableCellMock = ({ children, dataTestId, className }: TCellProps) => (
  <div data-testid={dataTestId} className={className}>
    {children}
  </div>
);

export const marker =
  (name: string) =>
  ({ item, create }: { item?: { title?: string }; create?: boolean }) => (
    <span data-testid={`${name}${create ? "-created" : ""}`}>{item?.title ?? name}</span>
  );

export const StyledTableMock = {
  StyledBadgesContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="row-badges">{children}</div>
  ),
  StyledQuickButtonsContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="row-quick-buttons">{children}</div>
  ),
};

export const TABLE_STORAGE = "test-table-columns";

/** The order of the columns the user keeps: the last one holds the quick buttons. */
export const setStoredColumns = (columns: string[]) =>
  localStorage.setItem(TABLE_STORAGE, columns.join(","));

export const rowProps = (item: Record<string, unknown>) => ({
  t: (key: string) => key,
  item,
  index: 0,
  theme: {
    isBase: true,
    filesSection: { tableView: { row: { sideColor: "#a3a9ae" } } },
  },
  dragStyles: { style: {} },
  selectionProp: { className: "" },
  tableStorageName: TABLE_STORAGE,
  badgesComponent: <span data-testid="item-badges" />,
  quickButtonsComponent: <button type="button">Use in chat</button>,
  fileOwner: "Owner",
  updatedDate: "2026-11-18",
  createdDate: "2026-11-01",
  onContentFileSelect: vi.fn(),
});
