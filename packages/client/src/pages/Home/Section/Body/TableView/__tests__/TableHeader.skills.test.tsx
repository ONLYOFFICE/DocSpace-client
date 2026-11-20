import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));
vi.mock("react-i18next", () => ({
  withTranslation:
    () =>
    (Component: React.ComponentType<Record<string, unknown>>) =>
    (props: Record<string, unknown>) => (
      <Component t={(key: string) => key} {...props} />
    ),
}));
// The header, reduced to the columns it is given.
vi.mock("@onlyoffice/apps-ui-kit/components/table", () => ({
  TableHeader: ({
    columns,
  }: {
    columns: { key: string; title: string; enable: boolean; sortBy?: string }[];
  }) => (
    <ul>
      {columns.map((column) => (
        <li
          key={column.key}
          data-testid={`column-${column.key}`}
          data-enabled={String(column.enable)}
          data-sort={column.sortBy ?? ""}
        >
          {column.title}
        </li>
      ))}
    </ul>
  ),
}));

import { SortByFieldName } from "@docspace/shared/enums";

import TableHeader from "../TableHeader";

const Header = TableHeader as unknown as React.FC<Record<string, unknown>>;

const filter = { sortBy: SortByFieldName.Name, sortOrder: "ascending" };

const renderHeader = (props: Record<string, unknown>) =>
  render(
    <Header
      getColumns={(columns: unknown) => columns}
      tableStorageName="test-header-columns"
      columnStorageName="test-header-size"
      columnInfoPanelStorageName="test-header-size-info"
      filter={filter}
      roomsFilter={filter}
      roomColumnNameIsEnabled
      nameColumnIsEnabled
      {...props}
    />,
  );

const columns = () =>
  screen.getAllByRole("listitem").map((item) => ({
    key: item.dataset.testid?.replace("column-", ""),
    title: item.textContent,
  }));

beforeEach(() => localStorage.clear());

describe("TableHeader of the Skill sets list", () => {
  it("has Name, Skills, Used by, Owner and Last modified", () => {
    renderHeader({
      isRooms: true,
      isSkillSetsList: true,
      skillsSkillSetsColumnIsEnabled: true,
      usedBySkillSetsColumnIsEnabled: true,
      ownerSkillSetsColumnIsEnabled: true,
      activitySkillSetsColumnIsEnabled: false,
    });
    expect(columns()).toEqual([
      { key: "Name", title: "Common:Label" },
      { key: "SkillsSkillSets", title: "Common:Skills" },
      { key: "UsedBySkillSets", title: "Common:UsedBy" },
      { key: "OwnerSkillSets", title: "Common:Owner" },
      { key: "ActivitySkillSets", title: "Common:LastModified" },
    ]);
    // The numbers of skills and of agents are not sorted by; the rest are.
    expect(screen.getByTestId("column-SkillsSkillSets")).toHaveAttribute("data-sort", "");
    expect(screen.getByTestId("column-UsedBySkillSets")).toHaveAttribute("data-sort", "");
    expect(screen.getByTestId("column-OwnerSkillSets")).toHaveAttribute(
      "data-sort",
      SortByFieldName.Author,
    );
    expect(screen.getByTestId("column-ActivitySkillSets")).toHaveAttribute(
      "data-enabled",
      "false",
    );
  });

  it("keeps the columns the user keeps for a first visit", () => {
    renderHeader({
      isRooms: true,
      isSkillSetsList: true,
      skillsSkillSetsColumnIsEnabled: true,
      usedBySkillSetsColumnIsEnabled: true,
      ownerSkillSetsColumnIsEnabled: false,
      activitySkillSetsColumnIsEnabled: true,
    });
    expect(localStorage.getItem("test-header-columns")).toBe(
      "Name,SkillsSkillSets,UsedBySkillSets,false,ActivitySkillSets",
    );
  });
});

describe("TableHeader of an open skill set", () => {
  it("has Name, Description and Last modified", () => {
    renderHeader({
      isSkillSet: true,
      descriptionSkillColumnIsEnabled: true,
      modifiedSkillColumnIsEnabled: true,
    });
    expect(columns()).toEqual([
      { key: "Name", title: "Common:Label" },
      { key: "DescriptionSkill", title: "Common:DescriptionLabel" },
      { key: "ModifiedSkill", title: "Common:LastModified" },
    ]);
    expect(screen.getByTestId("column-DescriptionSkill")).toHaveAttribute("data-sort", "");
    expect(screen.getByTestId("column-ModifiedSkill")).toHaveAttribute(
      "data-sort",
      SortByFieldName.ModifiedDate,
    );
  });

  it("is not taken for the Skill sets list, which is a list of rooms", () => {
    renderHeader({ isRooms: true, isSkillSetsList: true, isSkillSet: true });
    expect(screen.queryByTestId("column-DescriptionSkill")).toBeNull();
    expect(screen.getByTestId("column-SkillsSkillSets")).toBeInTheDocument();
  });
});
