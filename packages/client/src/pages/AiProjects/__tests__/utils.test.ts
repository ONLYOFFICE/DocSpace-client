import { describe, expect, it } from "vitest";

import type { TAiPreset } from "SRC_DIR/store/AiPresetsStore";

import {
  DEFAULT_PROJECTS_QUERY,
  isProjectsQueryFiltered,
  queryProjects,
} from "../utils";

const room = (id: string) => ({ cloud: "docspace", id, name: `Room ${id}` });

const project = (
  id: string,
  name: string,
  createdAt: string,
  sources: { skills?: boolean; knowledge?: boolean } = {},
): TAiPreset => ({
  id,
  name,
  createdAt,
  profileId: null,
  profileName: null,
  contextRoom: sources.skills ? room(`s${id}`) : null,
  knowledgeRoom: sources.knowledge ? room(`k${id}`) : null,
});

const projects = [
  project("1", "Contract review", "2026-10-01T00:00:00.000Z", {
    skills: true,
    knowledge: true,
  }),
  project("2", "Weekly report", "2026-10-03T00:00:00.000Z", { skills: true }),
  project("3", "Support answers", "2026-10-02T00:00:00.000Z", {
    knowledge: true,
  }),
];

const names = (list: TAiPreset[]) => list.map((p) => p.name);

describe("queryProjects", () => {
  it("lists the newest project first by default", () => {
    expect(names(queryProjects(projects, DEFAULT_PROJECTS_QUERY))).toEqual([
      "Weekly report",
      "Support answers",
      "Contract review",
    ]);
  });

  it("sorts by name in either direction", () => {
    const query = { ...DEFAULT_PROJECTS_QUERY, sortId: "AZ" as const };
    expect(names(queryProjects(projects, { ...query, sortDirection: "asc" }))).toEqual([
      "Contract review",
      "Support answers",
      "Weekly report",
    ]);
    expect(names(queryProjects(projects, { ...query, sortDirection: "desc" }))).toEqual([
      "Weekly report",
      "Support answers",
      "Contract review",
    ]);
  });

  it("searches the name case-insensitively", () => {
    const query = { ...DEFAULT_PROJECTS_QUERY, search: "  REPORT " };
    expect(names(queryProjects(projects, query))).toEqual(["Weekly report"]);
  });

  it("keeps only the projects with the sources asked for", () => {
    expect(
      names(queryProjects(projects, { ...DEFAULT_PROJECTS_QUERY, withSkills: true })),
    ).toEqual(["Weekly report", "Contract review"]);
    expect(
      names(
        queryProjects(projects, {
          ...DEFAULT_PROJECTS_QUERY,
          withSkills: true,
          withKnowledge: true,
        }),
      ),
    ).toEqual(["Contract review"]);
  });

  it("does not change the saved list", () => {
    const before = names(projects);
    queryProjects(projects, { ...DEFAULT_PROJECTS_QUERY, sortId: "AZ" });
    expect(names(projects)).toEqual(before);
  });
});

describe("isProjectsQueryFiltered", () => {
  it("is set by a search or a source filter, not by the sort", () => {
    expect(isProjectsQueryFiltered(DEFAULT_PROJECTS_QUERY)).toBe(false);
    expect(
      isProjectsQueryFiltered({ ...DEFAULT_PROJECTS_QUERY, sortId: "AZ" }),
    ).toBe(false);
    expect(
      isProjectsQueryFiltered({ ...DEFAULT_PROJECTS_QUERY, search: "x" }),
    ).toBe(true);
    expect(
      isProjectsQueryFiltered({ ...DEFAULT_PROJECTS_QUERY, withKnowledge: true }),
    ).toBe(true);
  });
});
