import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { VectorizationStatus } from "@docspace/shared/enums";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@onlyoffice/apps-ui-kit/components/table", async () => ({
  TableCell: (await import("./rowDataMocks")).TableCellMock,
}));
vi.mock("../sub-components/FileNameCell", async () => ({
  default: (await import("./rowDataMocks")).marker("name"),
}));
vi.mock("../sub-components/AuthorCell", async () => ({
  default: (await import("./rowDataMocks")).marker("author"),
}));
vi.mock("../sub-components/DateCell", async () => ({
  default: (await import("./rowDataMocks")).marker("date"),
}));
vi.mock("../sub-components/SizeCell", async () => ({
  default: (await import("./rowDataMocks")).marker("size"),
}));
vi.mock("../StyledTable", async () => (await import("./rowDataMocks")).StyledTableMock);

import { KNOWLEDGE_BASE_REREAD_MS } from "SRC_DIR/store/KnowledgeBasesStore";

import KnowledgeBasesRowData from "../sub-components/KnowledgeBasesRowData";
import KnowledgeFilesRowData from "../sub-components/KnowledgeFilesRowData";
import { rowProps, setStoredColumns } from "./rowDataMocks";

const Row = KnowledgeBasesRowData as unknown as React.FC<Record<string, unknown>>;
const FileRow = KnowledgeFilesRowData as unknown as React.FC<Record<string, unknown>>;

const base = { id: 21, title: "Company policies", isRoom: true, filesCount: 3 };

const renderBase = (props: Record<string, unknown> = {}) => {
  const fetchState = vi.fn();
  render(
    <Row
      {...rowProps(base)}
      ownerKnowledgeBasesColumnIsEnabled
      activityKnowledgeBasesColumnIsEnabled
      state={null}
      fetchState={fetchState}
      {...props}
    />,
  );
  return fetchState;
};

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe("KnowledgeBasesRowData", () => {
  it("shows a base's name, owner and last change, and reads its files once", () => {
    const fetchState = renderBase();
    expect(screen.getByTestId("knowledge-bases-cell-name-0")).toHaveTextContent(
      "Company policies",
    );
    expect(
      within(screen.getByTestId("knowledge-bases-cell-owner-0")).getByTestId("author"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("knowledge-bases-cell-activity-0")).getByTestId("date"),
    ).toBeInTheDocument();
    expect(fetchState).toHaveBeenCalledTimes(1);
    expect(fetchState).toHaveBeenCalledWith({ id: 21, filesCount: 3 });
  });

  it("leaves out the columns that are switched off", () => {
    renderBase({
      ownerKnowledgeBasesColumnIsEnabled: false,
      activityKnowledgeBasesColumnIsEnabled: false,
    });
    expect(screen.queryByTestId("knowledge-bases-cell-owner-0")).toBeNull();
    expect(screen.queryByTestId("knowledge-bases-cell-activity-0")).toBeNull();
  });

  it("marks a base being indexed and reads it again every little while", () => {
    vi.useFakeTimers();
    const fetchState = renderBase({ state: { total: 3, inProgress: 1, failed: 0 } });
    const name = screen.getByTestId("knowledge-bases-cell-name-0");
    expect(within(name).getByTestId("knowledge-base-indexing-badge")).toHaveTextContent(
      "Common:Indexing",
    );
    act(() => {
      vi.advanceTimersByTime(KNOWLEDGE_BASE_REREAD_MS);
    });
    expect(fetchState).toHaveBeenLastCalledWith({ id: 21, filesCount: 3 }, true);
  });

  it("marks a base whose files could not all be indexed with \"Error\", and does not re-read it", () => {
    vi.useFakeTimers();
    const fetchState = renderBase({ state: { total: 3, inProgress: 1, failed: 1 } });
    expect(screen.getByTestId("knowledge-base-error-badge")).toHaveTextContent("Common:Error");
    expect(screen.queryByTestId("knowledge-base-indexing-badge")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(KNOWLEDGE_BASE_REREAD_MS * 2);
    });
    expect(fetchState).toHaveBeenCalledTimes(1);
  });

  it("marks nothing on an indexed base", () => {
    renderBase({ state: { total: 3, inProgress: 0, failed: 0 } });
    expect(screen.queryByTestId("knowledge-base-indexing-badge")).toBeNull();
    expect(screen.queryByTestId("knowledge-base-error-badge")).toBeNull();
  });

  it("puts the quick buttons in the last column the user keeps", () => {
    setStoredColumns(["Name", "OwnerKnowledgeBases", "ActivityKnowledgeBases"]);
    renderBase();
    expect(
      within(screen.getByTestId("knowledge-bases-cell-activity-0")).getByRole("button", {
        name: "Use in chat",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Use in chat" })).toHaveLength(1);
  });

  it("puts them beside the name when only the name is kept", () => {
    setStoredColumns(["Name", "false", "false"]);
    renderBase();
    expect(
      within(screen.getByTestId("knowledge-bases-cell-name-0")).getByRole("button", {
        name: "Use in chat",
      }),
    ).toBeInTheDocument();
  });
});

const file = {
  id: 40,
  title: "Policy.pdf",
  vectorizationStatus: VectorizationStatus.Failed,
};

const renderFile = (props: Record<string, unknown> = {}) =>
  render(
    <FileRow
      {...rowProps(file)}
      sizeKnowledgeFileColumnIsEnabled
      authorKnowledgeFileColumnIsEnabled
      createdKnowledgeFileColumnIsEnabled
      {...props}
    />,
  );

describe("KnowledgeFilesRowData", () => {
  it("shows a file's name with its badges, its size, who added it and when", () => {
    renderFile();
    const name = screen.getByTestId("knowledge-files-cell-name-0");
    expect(name).toHaveTextContent("Policy.pdf");
    // The file's own badges carry its indexing state.
    expect(within(name).getByTestId("item-badges")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("knowledge-files-cell-size-0")).getByTestId("size"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("knowledge-files-cell-author-0")).getByTestId("author"),
    ).toBeInTheDocument();
    // "Added" is the date the file was created.
    expect(
      within(screen.getByTestId("knowledge-files-cell-created-0")).getByTestId(
        "date-created",
      ),
    ).toBeInTheDocument();
  });

  it("leaves out the columns that are switched off", () => {
    renderFile({
      sizeKnowledgeFileColumnIsEnabled: false,
      authorKnowledgeFileColumnIsEnabled: false,
      createdKnowledgeFileColumnIsEnabled: false,
    });
    expect(screen.queryByTestId("knowledge-files-cell-size-0")).toBeNull();
    expect(screen.queryByTestId("knowledge-files-cell-author-0")).toBeNull();
    expect(screen.queryByTestId("knowledge-files-cell-created-0")).toBeNull();
  });

  it("puts the quick buttons in the last column the user keeps", () => {
    setStoredColumns(["Name", "SizeKnowledgeFile", "AuthorKnowledgeFile", "false"]);
    renderFile();
    const author = screen.getByTestId("knowledge-files-cell-author-0");
    expect(within(author).getByRole("button", { name: "Use in chat" })).toBeInTheDocument();
    expect(author).toHaveClass("no-extra-space");
    expect(screen.getAllByRole("button", { name: "Use in chat" })).toHaveLength(1);
  });
});
