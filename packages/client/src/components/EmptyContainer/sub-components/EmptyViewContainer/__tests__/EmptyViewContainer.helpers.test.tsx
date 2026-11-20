import { describe, expect, it, vi } from "vitest";

import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";

import {
  getDescription,
  getIcon,
  getOptions,
  getTitle,
} from "../EmptyViewContainer.helpers";

const t = ((key: string) => key) as never;

describe("getOptions of an empty skill set", () => {
  it("names its first quick action New skill, the form it opens", () => {
    const options = getOptions(
      RoomsType.InstructionsRoom,
      { Create: true },
      t,
      ShareAccessRights.Collaborator,
      false,
      null,
      null,
      false,
      false,
      null,
      new Proxy({}, { get: () => vi.fn() }) as never,
      "",
      false,
      false,
      "personal",
      false,
      false,
      true,
      false,
      false,
      false,
      true,
    );

    expect(Array.isArray(options)).toBe(true);
    const [first] = options as { key: string; title: string }[];
    expect(first.key).toBe("create-markdown");
    expect(first.title).toBe("Common:NewSkill");
  });
});

const optionsOf = (type: RoomsType, access: ShareAccessRights) =>
  getOptions(
    type,
    { Create: true, EditAccess: true },
    t,
    access,
    false,
    null,
    null,
    false,
    false,
    null,
    new Proxy({}, { get: () => vi.fn() }) as never,
    "",
    false,
    false,
    "personal",
    false,
    false,
    true,
    false,
    false,
    false,
    true,
  ) as { key: string; description: string }[];

describe("an empty skill set and an empty knowledge base", () => {
  const view = (type: RoomsType, access: ShareAccessRights) => ({
    title: getTitle(type, t, access, false, null, null, false, false, null),
    description: getDescription(
      type,
      t,
      access,
      false,
      null,
      null,
      false,
      false,
      null,
      false,
      null,
    ),
    icon: getIcon(type, true, access, false, null, null, false, null),
  });

  it.each([
    [RoomsType.InstructionsRoom, "SkillSet"],
    [RoomsType.KnowledgeRoom, "KnowledgeBase"],
  ])("room %s has its own title, description and picture", (type, prefix) => {
    const admin = view(type, ShareAccessRights.None);
    expect(admin.title).toBe(`EmptyView:${prefix}EmptyTitle`);
    expect(admin.description).toBe(`EmptyView:${prefix}EmptyDescription`);
    expect(admin.icon).toBeTruthy();

    // A member who cannot add anything is told who does.
    const user = view(type, ShareAccessRights.ReadOnly);
    expect(user.title).toBe(`EmptyView:${prefix}EmptyTitle`);
    expect(user.description).toBe(`EmptyView:${prefix}EmptyUserDescription`);
    expect(user.icon).toBeTruthy();
  });

  it("words the quick actions of a skill set for a skill set", () => {
    const byKey = Object.fromEntries(
      optionsOf(RoomsType.InstructionsRoom, ShareAccessRights.None).map(
        (option) => [option.key, option.description],
      ),
    );
    expect(byKey["invite-users"]).toBe("EmptyView:SkillSetInviteDescription");
    expect(byKey["create-markdown"]).toBe(
      "EmptyView:SkillSetMarkdownOnlyDescription",
    );
    expect(byKey["upload-markdown-from-storage"]).toBe(
      "EmptyView:SkillSetUploadStorageDescription",
    );
  });

  it("words the quick actions of a knowledge base for a knowledge base", () => {
    const options = optionsOf(RoomsType.KnowledgeRoom, ShareAccessRights.None);
    expect(options.map((option) => option.description)).toEqual([
      "EmptyView:KnowledgeBaseInviteDescription",
      "EmptyView:KnowledgeBaseUploadStorageDescription",
      "EmptyView:KnowledgeBaseUploadDeviceDescription",
    ]);
  });
});
