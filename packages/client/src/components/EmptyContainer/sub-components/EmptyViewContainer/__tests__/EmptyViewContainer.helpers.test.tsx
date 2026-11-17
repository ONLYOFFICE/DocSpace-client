import { describe, expect, it, vi } from "vitest";

import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";

import { getOptions } from "../EmptyViewContainer.helpers";

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
