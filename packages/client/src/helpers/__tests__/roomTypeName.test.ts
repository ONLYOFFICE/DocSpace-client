import { describe, expect, it, vi } from "vitest";

vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (key: string) => key, exists: () => true, language: "en" },
}));

import { RoomsType } from "@docspace/shared/enums";

import { getRoomTypeName } from "../filesUtils";

const t = (key: string) => key;

describe("getRoomTypeName for the AI section", () => {
  it("names an agent's room type AI agent", () => {
    expect(getRoomTypeName(RoomsType.AiProjectRoom, t)).toBe("Common:AIAgent");
  });

  it("keeps the names of the Instructions and Knowledge room types", () => {
    expect(getRoomTypeName(RoomsType.InstructionsRoom, t)).toBe("Common:InstructionsRooms");
    expect(getRoomTypeName(RoomsType.KnowledgeRoom, t)).toBe("Common:KnowledgeRooms");
  });
});
