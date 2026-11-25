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
  it("offers Member alone, no Agent manager and no read-only role", () => {
    const accesses = agentOptions()
      .map((option) => option.access)
      .filter((access) => access !== undefined);
    expect(accesses).toEqual([ShareAccessRights.Collaborator]);
  });

  it.each([
    ["portal owner", EmployeeType.Owner],
    ["DocSpace admin", EmployeeType.Admin],
    ["room admin", EmployeeType.RoomAdmin],
    ["User", EmployeeType.User],
  ])("offers a %s Member, preselected", (_name, type) => {
    const options = offered({ type });
    expect(roleKeys(options)).toEqual(["projectMember"]);
    expect(options[0].access).toBe(getDefaultAccessUser(RoomsType.AiProjectRoom));
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
