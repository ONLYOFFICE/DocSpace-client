import { describe, expect, it } from "vitest";

import { AiProjectAccess, type TAiProject } from "@docspace/shared/api/ai/projects";

import {
  canManageProjects,
  hasPortalChatModel,
  isAgentModelUnavailable,
  isManager,
  isTagBeingTyped,
  isOwner,
  projectLink,
  roomLinkRefusal,
  savedProjectProfileId,
} from "../utils";

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

  it("leaves an edited agent without a model of its own on the portal model", () => {
    // Nothing stored and nothing picked: no model is sent.
    expect(savedProjectProfileId(null, ["default"], "default", true, true)).toBeUndefined();
    // A model picked in the form, the default included, is the agent's own.
    expect(savedProjectProfileId("default", ["default"], "default", true, true)).toBe("default");
    expect(savedProjectProfileId("p9", ["default", "p9"], "p9", true, true)).toBe("p9");
    // A stored model that is gone is still replaced by the one shown.
    expect(savedProjectProfileId("p9", ["default"], "default", true, true)).toBe("default");
  });

  it("offers only rooms the user may manage, and no Knowledge room while vectorization is off", () => {
    const managed = { security: { EditRoom: true } };
    expect(roomLinkRefusal(managed, false, true)).toBeNull();
    expect(roomLinkRefusal(managed, true, true)).toBeNull();
    expect(roomLinkRefusal({ security: { EditRoom: false } }, false, true)).toBe("noManageRights");
    expect(roomLinkRefusal({}, true, true)).toBe("noManageRights");
    expect(roomLinkRefusal(managed, true, false)).toBe("vectorizationOff");
    // Vectorization does not concern skill sets.
    expect(roomLinkRefusal(managed, false, false)).toBeNull();
  });

  it("tells an agent that cannot chat: its own model unusable, or none on a portal without a chat model", () => {
    const agent = (aiProject: Record<string, unknown>) => ({ id: 7, aiProject }) as unknown as TAiProject;
    const own = (available: boolean) => agent({ profile: { id: "p1", name: "Claude", available } });
    const none = agent({ profile: null });

    expect(isAgentModelUnavailable(own(false), true)).toBe(true);
    // Its own model is what it runs on, whatever the portal has.
    expect(isAgentModelUnavailable(own(true), false)).toBe(false);
    expect(isAgentModelUnavailable(none, true)).toBe(false);
    expect(isAgentModelUnavailable(none, false)).toBe(true);
    // Not known yet: the chat is not blocked.
    expect(isAgentModelUnavailable(none, null)).toBe(false);
    // A project read without its settings, or whose model could not be read, is not judged.
    expect(isAgentModelUnavailable(agent({ profile: null, partial: true }), false)).toBe(false);
    expect(isAgentModelUnavailable(agent({ profile: null, modelUnread: true }), false)).toBe(false);
  });

  it("takes the portal's Chat model, else the Default slot, as its chat model when it can chat", () => {
    const chat = { capabilities: 1 };
    const image = { capabilities: 2 };
    expect(hasPortalChatModel(chat, null)).toBe(true);
    expect(hasPortalChatModel(null, chat)).toBe(true);
    // A profile reporting no capabilities is taken as one that chats.
    expect(hasPortalChatModel(null, {})).toBe(true);
    expect(hasPortalChatModel(image, chat)).toBe(false);
    expect(hasPortalChatModel(null, image)).toBe(false);
    expect(hasPortalChatModel(null, null)).toBe(false);
  });

  it("holds the form's submit back while a tag is typed in the focused Tags field", () => {
    const form = document.createElement("form");
    const tagInput = document.createElement("input");
    tagInput.name = "tagInput";
    const title = document.createElement("input");
    form.append(title, tagInput);
    document.body.append(form);

    tagInput.value = "QA";
    tagInput.focus();
    expect(isTagBeingTyped(form)).toBe(true);
    // Only spaces: Enter adds no tag, so it saves the form.
    tagInput.value = "  ";
    expect(isTagBeingTyped(form)).toBe(false);
    // A tag left typed while another field has the focus does not hold it back.
    tagInput.value = "QA";
    title.focus();
    expect(isTagBeingTyped(form)).toBe(false);
    // A form without the field, or none, is submitted.
    expect(isTagBeingTyped(document.createElement("form"))).toBe(false);
    expect(isTagBeingTyped(null)).toBe(false);

    form.remove();
  });
});
