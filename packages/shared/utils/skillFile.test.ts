import { describe, expect, it } from "vitest";

import { FolderType, RoomsType } from "../enums";
import {
  buildSkillFile,
  getSkillNameByTitle,
  isSkillFile,
  parseSkillFile,
  toSkillCommand,
  toSkillName,
} from "./skillFile";

describe("skill files", () => {
  it("folds a title into a skill name as the AI service does", () => {
    expect(toSkillName("Sales report: Q3 <draft>")).toBe("sales-report-q3-draft");
    expect(toSkillName("  --Translate--  ")).toBe("translate");
    expect(toSkillName("a".repeat(80))).toHaveLength(64);
    expect(getSkillNameByTitle("Document summary.md")).toBe("document-summary");
    expect(toSkillCommand("document-summary")).toBe("/document-summary");
  });

  it("knows a skill by its extension and its room", () => {
    const skill = { fileExst: ".md", parentRoomType: FolderType.InstructionsRoom };
    expect(isSkillFile(skill)).toBe(true);
    expect(isSkillFile({ ...skill, fileExst: ".docx" })).toBe(false);
    expect(isSkillFile({ ...skill, parentRoomType: FolderType.KnowledgeRoom })).toBe(false);
  });

  it("knows a skill listed in the open skill set when the file names no room", () => {
    const file = { fileExst: ".md", folderId: 12 };
    const skillSet = { id: 12, roomType: RoomsType.InstructionsRoom };
    expect(isSkillFile(file)).toBe(false);
    expect(isSkillFile(file, skillSet)).toBe(true);
    expect(isSkillFile(file, { id: "12", parentRoomType: FolderType.InstructionsRoom })).toBe(true);
    expect(isSkillFile({ ...file, folderId: 13 }, skillSet)).toBe(false);
    expect(isSkillFile(file, { id: 12, roomType: RoomsType.CustomRoom })).toBe(false);
    expect(isSkillFile({ ...file, fileExst: ".docx" }, skillSet)).toBe(false);
  });

  it("reads the name, the description and the instructions", () => {
    expect(
      parseSkillFile('---\nname: "clause-check"\ndescription: "Checks \\"risky\\" clauses"\n---\n\n# Steps\n1. Read\n'),
    ).toEqual({ name: "clause-check", description: 'Checks "risky" clauses', body: "# Steps\n1. Read" });
  });

  it("reads plain, single-quoted and Windows-ended frontmatter", () => {
    expect(parseSkillFile("---\r\nname: translate\r\ndescription: 'To German'\r\n---\r\nDo it")).toEqual({
      name: "translate",
      description: "To German",
      body: "Do it",
    });
  });

  it("keeps the indentation a line of a literal description adds to the block's", () => {
    expect(
      parseSkillFile("---\nname: review\ndescription: |\n  Reviews:\n    - clauses\n\n  Done.\n---\nDo it").description,
    ).toBe("Reviews:\n  - clauses\n\nDone.");
  });

  it("reads a description written over several lines", () => {
    expect(
      parseSkillFile("---\nname: review\ndescription: >\n  Reviews a contract\n  for risky clauses.\n---\nDo it").description,
    ).toBe("Reviews a contract for risky clauses.");
    expect(
      parseSkillFile("---\nname: review\ndescription: |-\n  Reviews a contract\n  for risky clauses.\n---\nDo it").description,
    ).toBe("Reviews a contract\nfor risky clauses.");
    expect(
      parseSkillFile("---\nname: review\ndescription: Reviews a contract\n  for risky clauses.\n---\nDo it").description,
    ).toBe("Reviews a contract for risky clauses.");
  });

  it("keeps the frontmatter it does not edit when a file is read and written again", () => {
    const source =
      "---\nname: review\n# who may run it\nallowed-tools:\n  - Read\n  - Grep\ndescription: >\n  Reviews a contract\n  for risky clauses.\nlicense: MIT\nmetadata:\n  author: legal\n\n---\n\n# Steps\n";
    const skill = parseSkillFile(source);
    expect(skill).toEqual({
      name: "review",
      description: "Reviews a contract for risky clauses.",
      body: "# Steps",
      extra: "# who may run it\nallowed-tools:\n  - Read\n  - Grep\nlicense: MIT\nmetadata:\n  author: legal",
    });

    const written = buildSkillFile({ ...skill, description: "Reviews an NDA" });
    expect(written).toBe(
      '---\nname: "review"\ndescription: "Reviews an NDA"\n# who may run it\nallowed-tools:\n  - Read\n  - Grep\nlicense: MIT\nmetadata:\n  author: legal\n---\n\n# Steps\n',
    );
    expect(parseSkillFile(written)).toEqual({ ...skill, description: "Reviews an NDA" });
  });

  it("takes a file without a frontmatter as instructions only", () => {
    expect(parseSkillFile("Just text")).toEqual({ name: "", description: "", body: "Just text" });
  });

  it("writes a file that reads back the same, with a one-line description", () => {
    const skill = { name: "clause-check", description: "Checks\nclauses: all", body: "# Steps" };
    const text = buildSkillFile(skill);
    expect(text).toBe('---\nname: "clause-check"\ndescription: "Checks clauses: all"\n---\n\n# Steps\n');
    expect(parseSkillFile(text)).toEqual({ ...skill, description: "Checks clauses: all" });
  });
});
