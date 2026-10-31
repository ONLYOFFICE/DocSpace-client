import { describe, expect, it } from "vitest";

import { AiProjectAccess, type TAiProject } from "@docspace/shared/api/ai/projects";

import { canManageProjects, isManager, isOwner, projectLink } from "../utils";

const withAccess = (access: number) => ({ id: 7, access }) as unknown as TAiProject;

describe("AiProjects utils", () => {
  it("tells the owner and the managers apart from the members", () => {
    expect(isOwner(withAccess(AiProjectAccess.Owner))).toBe(true);
    expect(isOwner(withAccess(AiProjectAccess.ProjectManager))).toBe(false);
    expect(isManager(withAccess(AiProjectAccess.Owner))).toBe(true);
    expect(isManager(withAccess(AiProjectAccess.ProjectManager))).toBe(true);
    expect(isManager(withAccess(AiProjectAccess.Member))).toBe(false);
  });

  it("lets the owner, admins and room admins manage projects, nobody else", () => {
    expect(canManageProjects({ isOwner: true })).toBe(true);
    expect(canManageProjects({ isAdmin: true })).toBe(true);
    expect(canManageProjects({ isRoomAdmin: true })).toBe(true);
    expect(canManageProjects({ isOwner: false, isAdmin: false, isRoomAdmin: false })).toBe(false);
    expect(canManageProjects({})).toBe(false);
    expect(canManageProjects(null)).toBe(false);
    expect(canManageProjects(undefined)).toBe(false);
  });

  it("links a project by its id on the portal origin", () => {
    expect(projectLink(withAccess(AiProjectAccess.Owner))).toBe(
      `${window.location.origin}/ai-projects/7/filter?folder=7`,
    );
  });
});
