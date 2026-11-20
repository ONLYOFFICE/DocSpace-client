import React from "react";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
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
vi.mock("../StyledTable", async () => (await import("./rowDataMocks")).StyledTableMock);

import SkillSetsRowData from "../sub-components/SkillSetsRowData";
import SkillsRowData from "../sub-components/SkillsRowData";
import { rowProps, setStoredColumns } from "./rowDataMocks";

const SetRow = SkillSetsRowData as unknown as React.FC<Record<string, unknown>>;
const SkillRow = SkillsRowData as unknown as React.FC<Record<string, unknown>>;

beforeEach(() => localStorage.clear());

const skillSet = {
  id: 12,
  title: "Sales assistant",
  isRoom: true,
  filesCount: 4,
  linkedProjectsCount: 2,
};

const renderSet = (props: Record<string, unknown> = {}) =>
  render(
    <SetRow
      {...rowProps(skillSet)}
      skillsSkillSetsColumnIsEnabled
      usedBySkillSetsColumnIsEnabled
      ownerSkillSetsColumnIsEnabled
      activitySkillSetsColumnIsEnabled
      {...props}
    />,
  );

describe("SkillSetsRowData", () => {
  it("shows a set's name, how many skills it has, how many agents use it, its owner and last change", () => {
    renderSet();
    expect(screen.getByTestId("skill-sets-cell-name-0")).toHaveTextContent("Sales assistant");
    expect(screen.getByTestId("skill-sets-cell-skills-0")).toHaveTextContent("4");
    expect(screen.getByTestId("skill-sets-cell-used-by-0")).toHaveTextContent("2");
    expect(
      within(screen.getByTestId("skill-sets-cell-owner-0")).getByTestId("author"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("skill-sets-cell-activity-0")).getByTestId("date"),
    ).toBeInTheDocument();
  });

  it("counts no skills for a set the list gives no count", () => {
    renderSet({ item: { ...skillSet, filesCount: undefined, linkedProjectsCount: undefined } });
    expect(screen.getByTestId("skill-sets-cell-skills-0")).toHaveTextContent("0");
    expect(screen.getByTestId("skill-sets-cell-used-by-0")).toHaveTextContent("0");
  });

  it("leaves out the columns that are switched off", () => {
    renderSet({
      skillsSkillSetsColumnIsEnabled: false,
      usedBySkillSetsColumnIsEnabled: false,
      ownerSkillSetsColumnIsEnabled: false,
      activitySkillSetsColumnIsEnabled: false,
    });
    expect(screen.queryByTestId("skill-sets-cell-skills-0")).toBeNull();
    expect(screen.queryByTestId("skill-sets-cell-used-by-0")).toBeNull();
    expect(screen.queryByTestId("skill-sets-cell-owner-0")).toBeNull();
    expect(screen.queryByTestId("skill-sets-cell-activity-0")).toBeNull();
  });

  it("puts the quick buttons in the last column switched on before any are stored", () => {
    renderSet({ activitySkillSetsColumnIsEnabled: false });
    const owner = screen.getByTestId("skill-sets-cell-owner-0");
    expect(within(owner).getByRole("button", { name: "Use in chat" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Use in chat" })).toHaveLength(1);
  });

  it("puts the quick buttons in the last column the user keeps", () => {
    setStoredColumns(["Name", "SkillsSkillSets", "false", "false"]);
    renderSet();
    const skills = screen.getByTestId("skill-sets-cell-skills-0");
    expect(within(skills).getByRole("button", { name: "Use in chat" })).toBeInTheDocument();
    expect(skills).toHaveClass("no-extra-space");
    expect(screen.getAllByRole("button", { name: "Use in chat" })).toHaveLength(1);
  });
});

const skillFile = {
  id: 40,
  title: "Document summary.md",
  fileExst: ".md",
  version: 2,
  viewUrl: "/view/40",
};

const renderSkill = (props: Record<string, unknown> = {}) => {
  const fetchSkill = vi.fn();
  const view = render(
    <SkillRow
      {...rowProps(skillFile)}
      descriptionSkillColumnIsEnabled
      modifiedSkillColumnIsEnabled
      skill={null}
      fetchSkill={fetchSkill}
      {...props}
    />,
  );
  return { ...view, fetchSkill };
};

describe("SkillsRowData", () => {
  it("reads a skill's file once for its description", () => {
    const { fetchSkill } = renderSkill();
    expect(fetchSkill).toHaveBeenCalledTimes(1);
    expect(fetchSkill).toHaveBeenCalledWith({ id: 40, version: 2, viewUrl: "/view/40" });
    expect(screen.getByTestId("skills-cell-description-0")).toHaveTextContent("");
  });

  it("shows the description of a skill read, without reading it again", () => {
    const { fetchSkill } = renderSkill({
      skill: { name: "document-summary", description: "Summarizes a document" },
    });
    expect(fetchSkill).not.toHaveBeenCalled();
    const description = screen.getByTestId("skills-cell-description-0");
    expect(description).toHaveTextContent("Summarizes a document");
    expect(description.querySelector("[title]")).toHaveAttribute(
      "title",
      "Summarizes a document",
    );
    expect(
      within(screen.getByTestId("skills-cell-modified-0")).getByTestId("date"),
    ).toBeInTheDocument();
  });

  it("names the skill without its file's extension", () => {
    renderSkill({ displayFileExtension: true });
    expect(screen.getByTestId("name")).toHaveAttribute("data-extension", "false");
  });

  it("leaves out the columns that are switched off", () => {
    renderSkill({
      descriptionSkillColumnIsEnabled: false,
      modifiedSkillColumnIsEnabled: false,
    });
    expect(screen.queryByTestId("skills-cell-description-0")).toBeNull();
    expect(screen.queryByTestId("skills-cell-modified-0")).toBeNull();
  });

  it("puts the quick buttons in the last column the user keeps", () => {
    setStoredColumns(["Name", "DescriptionSkill", "ModifiedSkill"]);
    renderSkill();
    expect(
      within(screen.getByTestId("skills-cell-modified-0")).getByRole("button", {
        name: "Use in chat",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Use in chat" })).toHaveLength(1);
  });
});
