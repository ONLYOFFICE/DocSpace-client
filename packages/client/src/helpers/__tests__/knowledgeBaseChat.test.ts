import { describe, expect, it } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import { getUseInChatKnowledgeBase } from "../knowledgeBaseChat";

const knowledgeBase = {
  id: 21,
  title: "Company policies",
  isRoom: true,
  roomType: RoomsType.KnowledgeRoom,
};

describe("getUseInChatKnowledgeBase", () => {
  it("connects a knowledge base of the list", () => {
    expect(getUseInChatKnowledgeBase(knowledgeBase, true)).toEqual({
      id: 21,
      title: "Company policies",
      knowledge: true,
    });
  });

  it("offers nothing while vectorization is off", () => {
    expect(getUseInChatKnowledgeBase(knowledgeBase, false)).toBeNull();
  });

  it("offers nothing for another room or a file of a base", () => {
    expect(
      getUseInChatKnowledgeBase(
        { ...knowledgeBase, roomType: RoomsType.InstructionsRoom },
        true,
      ),
    ).toBeNull();
    expect(
      getUseInChatKnowledgeBase({ id: 40, title: "Policy.pdf" }, true),
    ).toBeNull();
  });
});
