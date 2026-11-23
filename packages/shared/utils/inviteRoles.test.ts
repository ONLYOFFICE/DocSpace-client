import { describe, expect, it } from "vitest";

import { EmployeeType, RoomsType, ShareAccessRights } from "../enums";
import type { TTranslation } from "../types";
import { checkIfAccessPaid } from "./filterPaidRoleOptions";
import { getAccessOptions } from "./getAccessOptions";
import { getDefaultAccessUser } from "./getDefaultAccessUser";
import { getInviteeRoleOptions, isInviteeOffered } from "./inviteRoles";

const t = ((key: string) => key) as unknown as TTranslation;

type TOption = {
  key: string;
  access?: ShareAccessRights;
  disabled?: boolean;
  tooltip?: string;
};

// The agent's invite panel lists its roles with Remove, as an invitee's menu does.
const agentOptions = () =>
  getAccessOptions(t, RoomsType.AiProjectRoom, true, true) as unknown as TOption[];

const offered = (invitee: Parameters<typeof getInviteeRoleOptions>[1]) =>
  getInviteeRoleOptions(agentOptions(), invitee).filter(
    (option) => option.access !== undefined,
  );

const roleKeys = (options: TOption[]) =>
  options.map((option) => `${option.key}${option.disabled ? " (disabled)" : ""}`);

describe("the roles an agent's invite panel offers by the invitee's type", () => {
  it("offers Agent manager and Member only, no read-only role", () => {
    const accesses = agentOptions()
      .map((option) => option.access)
      .filter((access) => access !== undefined);
    expect(accesses).toEqual([
      ShareAccessRights.RoomManager,
      ShareAccessRights.Collaborator,
    ]);
    expect(accesses).not.toContain(ShareAccessRights.ReadOnly);
  });

  it.each([
    ["portal owner", EmployeeType.Owner],
    ["DocSpace admin", EmployeeType.Admin],
    ["room admin", EmployeeType.RoomAdmin],
  ])("offers a %s both roles", (_name, type) => {
    expect(roleKeys(offered({ type }))).toEqual(["projectManager", "projectMember"]);
  });

  it("preselects Agent manager for an admin, as the panel opens on it", () => {
    const preselected = getDefaultAccessUser(RoomsType.AiProjectRoom);
    const option = offered({ type: EmployeeType.RoomAdmin }).find(
      (item) => item.access === preselected,
    );
    expect(option?.key).toBe("projectManager");
    expect(option?.disabled).toBeFalsy();
  });

  it("leaves a User Member only, Agent manager disabled with the note on who may hold it", () => {
    const options = offered({ type: EmployeeType.User });
    expect(roleKeys(options)).toEqual(["projectManager (disabled)", "projectMember"]);
    expect(options[0].tooltip).toBe("Common:UserAgentMaxAvailableRoleWarning");
  });

  it("treats Agent manager as the paid role and Member as free", () => {
    expect(checkIfAccessPaid(ShareAccessRights.RoomManager)).toBe(true);
    expect(checkIfAccessPaid(ShareAccessRights.Collaborator)).toBe(false);
  });

  it("disables the paid roles for a group in any room", () => {
    const options = getInviteeRoleOptions(
      getAccessOptions(t, RoomsType.CustomRoom) as unknown as TOption[],
      { isGroup: true },
    );
    expect(options.find((option) => option.key === "roomManager")?.disabled).toBe(true);
  });
});

describe("who an agent's invite panel offers", () => {
  it("offers portal users", () => {
    expect(isInviteeOffered(RoomsType.AiProjectRoom, { type: EmployeeType.User })).toBe(true);
    expect(isInviteeOffered(RoomsType.AiProjectRoom, { type: EmployeeType.RoomAdmin })).toBe(true);
  });

  it("offers no guest and no group", () => {
    expect(isInviteeOffered(RoomsType.AiProjectRoom, { isVisitor: true })).toBe(false);
    expect(isInviteeOffered(RoomsType.AiProjectRoom, { type: EmployeeType.Guest })).toBe(false);
    expect(isInviteeOffered(RoomsType.AiProjectRoom, { isGroup: true })).toBe(false);
  });

  it("keeps guests and groups in another room", () => {
    expect(isInviteeOffered(RoomsType.CustomRoom, { isVisitor: true })).toBe(true);
    expect(isInviteeOffered(RoomsType.CustomRoom, { isGroup: true })).toBe(true);
  });
});
