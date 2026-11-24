import { describe, expect, it } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import { getAiRowInfo, getAiRowKind } from "../aiRowInfo";

const t = ((key: string) => key) as never;

describe("getAiRowKind", () => {
  const root = { isAiSectionFolder: true };

  it("tells the agents, skill sets and knowledge bases of the AI section's lists", () => {
    expect(getAiRowKind({ isRoom: true, roomType: RoomsType.AiProjectRoom }, root)).toBe("agent");
    expect(getAiRowKind({ isRoom: true, roomType: RoomsType.InstructionsRoom }, root)).toBe(
      "skillSet",
    );
    expect(getAiRowKind({ isRoom: true, roomType: RoomsType.KnowledgeRoom }, root)).toBe(
      "knowledgeBase",
    );
  });

  it("tells the skills of an open skill set and the files of an open knowledge base", () => {
    expect(getAiRowKind({}, { isSkillSet: true })).toBe("skill");
    expect(getAiRowKind({}, { isKnowledgeBase: true })).toBe("knowledgeFile");
    expect(getAiRowKind({ isFolder: true }, { isKnowledgeBase: true })).toBeNull();
  });

  it("leaves any other row as it is", () => {
    expect(getAiRowKind({ isRoom: true, roomType: RoomsType.CustomRoom }, {})).toBeNull();
    expect(getAiRowKind({}, {})).toBeNull();
  });
});

describe("getAiRowInfo", () => {
  const dates = { fileOwner: "Me", updatedDate: "11/17/2026", createdDate: "11/16/2026" };

  it("gives a skill set its skills count, how many agents use it, owner and last modification", () => {
    expect(
      getAiRowInfo("skillSet", { t, item: { filesCount: 4, linkedProjectsCount: 2 }, ...dates }),
    ).toEqual([
      "Common:Skills: 4",
      "Common:UsedBy: Common:AgentsNumber",
      "Me",
      "11/17/2026",
    ]);
  });

  it("gives an agent its owner and last modification, and a knowledge base how many agents use it too", () => {
    expect(getAiRowInfo("agent", { t, item: {}, ...dates })).toEqual(["Me", "11/17/2026"]);
    expect(
      getAiRowInfo("knowledgeBase", { t, item: { linkedProjectsCount: 1 }, ...dates }),
    ).toEqual(["Common:UsedBy: Common:OneAgent", "Me", "11/17/2026"]);
    // A room no agent uses says nothing about it.
    expect(getAiRowInfo("skillSet", { t, item: { filesCount: 1 }, ...dates })).toEqual([
      "Common:Skills: 1",
      "Me",
      "11/17/2026",
    ]);
    expect(getAiRowInfo("knowledgeBase", { t, item: {}, ...dates })).toEqual([
      "Me",
      "11/17/2026",
    ]);
  });

  it("gives a skill its description, once read, and its last modification", () => {
    expect(getAiRowInfo("skill", { t, item: {}, ...dates })).toEqual(["11/17/2026"]);
    expect(
      getAiRowInfo("skill", { t, item: {}, ...dates, skillDescription: "Finds clauses" }),
    ).toEqual(["Finds clauses", "11/17/2026"]);
  });

  it("gives a file of a knowledge base its size, who added it and when", () => {
    expect(
      getAiRowInfo("knowledgeFile", { t, item: { contentLength: "12 KB" }, ...dates }),
    ).toEqual(["12 KB", "Me", "11/16/2026"]);
  });
});
