import { describe, expect, it } from "vitest";

import { AiProjectAccess } from "@docspace/shared/api/ai/projects";

import { getAgentRights } from "../agentRights";

const OWNER_ID = "owner";

// The rights the server returns on an agent for each kind of user.
const ownerAgent = {
  inRoom: true,
  access: AiProjectAccess.Owner,
  createdBy: { id: OWNER_ID },
  security: {
    Read: true,
    EditRoom: true,
    EditAccess: true,
    ChangeOwner: true,
    Delete: true,
    Pin: true,
    Mute: true,
  },
  aiProject: { canEditSettings: true },
};

const managerAgent = {
  ...ownerAgent,
  access: AiProjectAccess.ProjectManager,
  security: {
    Read: true,
    EditRoom: true,
    EditAccess: true,
    Pin: true,
    Mute: true,
  },
};

const memberAgent = {
  ...ownerAgent,
  access: AiProjectAccess.Member,
  security: { Read: true, Pin: true, Mute: true },
  aiProject: { canEditSettings: false },
};

// A DocSpace admin reads every agent of the portal with the room's full rights.
const adminOutsideAgent = {
  ...ownerAgent,
  inRoom: false,
  access: AiProjectAccess.None,
};

describe("getAgentRights", () => {
  it("offers the Agent owner everything but leave", () => {
    expect(getAgentRights(ownerAgent, OWNER_ID)).toEqual({
      isMember: true,
      isOwner: true,
      chat: true,
      info: true,
      edit: true,
      share: true,
      delete: true,
      changeOwner: true,
      leave: false,
      pin: true,
      mute: true,
    });
  });

  it("offers an Agent manager edit, share and leave, without delete or change owner", () => {
    expect(getAgentRights(managerAgent, "manager")).toEqual({
      isMember: true,
      isOwner: false,
      chat: true,
      info: true,
      edit: true,
      share: true,
      delete: false,
      changeOwner: false,
      leave: true,
      pin: true,
      mute: true,
    });
  });

  it("offers a Member the chat, info, pin, notifications and leave only", () => {
    expect(getAgentRights(memberAgent, "member")).toEqual({
      isMember: true,
      isOwner: false,
      chat: true,
      info: true,
      edit: false,
      share: false,
      delete: false,
      changeOwner: false,
      leave: true,
      pin: true,
      mute: true,
    });
  });

  it("offers a DocSpace admin outside the agent info, pin, change owner and delete only", () => {
    expect(getAgentRights(adminOutsideAgent, "admin")).toEqual({
      isMember: false,
      isOwner: false,
      chat: false,
      info: true,
      edit: false,
      share: false,
      delete: true,
      changeOwner: true,
      leave: false,
      pin: true,
      mute: false,
    });
  });

  it("tells the owner by the room's access when the user is not known", () => {
    expect(getAgentRights(ownerAgent).leave).toBe(false);
    expect(getAgentRights(managerAgent).leave).toBe(true);
  });

  it("tells a room admin who is a Member by the agent's rights, not by their type", () => {
    // A room admin may create agents, yet as a Member of this one may not edit it.
    expect(getAgentRights(memberAgent, "room-admin").edit).toBe(false);
    expect(getAgentRights(memberAgent, "room-admin").share).toBe(false);
  });

  it("falls back to EditRoom when the agent comes without its settings block", () => {
    const { aiProject: _settings, ...room } = managerAgent;
    expect(getAgentRights(room, "manager").edit).toBe(true);
    expect(getAgentRights(null).chat).toBe(false);
  });
});
