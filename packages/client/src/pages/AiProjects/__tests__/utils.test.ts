import { describe, expect, it } from "vitest";

import { AiProjectAccess, type TAiProject } from "@docspace/shared/api/ai/projects";

import { canManageProjects, isManager, isOwner, projectLink, savedProjectProfileId } from "../utils";

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
      `${window.location.origin}/ai-rooms/7/filter?folder=7`,
    );
  });

  it("saves the shown model, but keeps a stored one the list has not read yet", () => {
    // The list holds only the assigned profiles until it loads.
    expect(savedProjectProfileId("p9", ["default"], "default", false)).toBe("p9");
    // Loaded, a missing model is gone and the default shown takes its place.
    expect(savedProjectProfileId("p9", ["default"], "default", true)).toBe("default");
    expect(savedProjectProfileId("p9", ["default", "p9"], "p9", false)).toBe("p9");
    expect(savedProjectProfileId(null, ["default"], "default", false)).toBe("default");
  });
});
