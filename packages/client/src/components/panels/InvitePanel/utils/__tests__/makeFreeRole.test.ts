import { describe, expect, it } from "vitest";

import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";

import { fixAccess, makeFreeRole } from "../index";

const t = (key: string) => key;

describe("makeFreeRole", () => {
  const freeRole = { access: ShareAccessRights.Collaborator, label: "Common:Member" };

  it("tells a user in an agent that only admins can be Agent managers", () => {
    const item = makeFreeRole({ access: ShareAccessRights.RoomManager }, t, freeRole, RoomsType.AiProjectRoom);
    expect(item.access).toBe(ShareAccessRights.Collaborator);
    expect(item.warning).toBe("Common:UserAgentMaxAvailableRoleWarning");
  });

  it("keeps the Room manager warning in any other room", () => {
    const item = makeFreeRole({ access: ShareAccessRights.RoomManager }, t, freeRole, RoomsType.CustomRoom);
    expect(item.warning).toBe("Common:UserMaxAvailableRoleWarning");
  });

  it("gives a user in an agent the Member role through fixAccess", () => {
    const item = fixAccess({ access: ShareAccessRights.RoomManager }, t, RoomsType.AiProjectRoom);
    expect(item.access).toBe(ShareAccessRights.Collaborator);
    expect(item.warning).toBe("Common:UserAgentMaxAvailableRoleWarning");
  });
});
