import { describe, expect, it } from "vitest";

import { getMarkdownEdit, type TMarkdownAction } from "../markdown";

const apply = (text: string, from: number, to: number, action: TMarkdownAction) => {
  const edit = getMarkdownEdit(text, from, to, action);
  const result = text.slice(0, edit.from) + edit.insert + text.slice(edit.to);
  return { result, selected: result.slice(edit.anchor, edit.head) };
};

describe("getMarkdownEdit", () => {
  it("wraps the selection in the mark and keeps it selected", () => {
    expect(apply("read the file", 5, 8, "bold")).toEqual({ result: "read **the** file", selected: "the" });
    expect(apply("read the file", 5, 8, "italic").result).toBe("read _the_ file");
    expect(apply("read the file", 5, 8, "code").result).toBe("read `the` file");
  });

  it("takes the mark off a selection that has it", () => {
    expect(apply("read **the** file", 7, 10, "bold")).toEqual({ result: "read the file", selected: "the" });
  });

  it("keeps the line break of a triple-clicked line outside the marks", () => {
    const text = "1. The first thing to do.\n2. The next thing to do.";
    const first = apply(text, 0, 26, "bold");
    expect(first).toEqual({
      result: "**1. The first thing to do.**\n2. The next thing to do.",
      selected: "1. The first thing to do.",
    });
    expect(apply("  read it \nnext", 0, 11, "italic").result).toBe("  _read it_ \nnext");
    expect(apply("see docs\nnext", 0, 9, "link").result).toBe("[see docs](https://)\nnext");
  });

  it("takes the marks off a triple-clicked marked line", () => {
    const text = "**1. The first thing to do.**\n2. The next thing to do.";
    expect(apply(text, 0, 30, "bold")).toEqual({
      result: "1. The first thing to do.\n2. The next thing to do.",
      selected: "1. The first thing to do.",
    });
  });

  it("marks only the triple-clicked line, not the next one", () => {
    expect(apply("one\ntwo", 0, 4, "heading").result).toBe("## one\ntwo");
  });

  it("puts an empty pair at the caret", () => {
    expect(apply("ab", 1, 1, "bold")).toEqual({ result: "a****b", selected: "" });
  });

  it("makes a link of the selection and selects its address", () => {
    expect(apply("see docs here", 4, 8, "link")).toEqual({ result: "see [docs](https://) here", selected: "https://" });
    expect(apply("see ", 4, 4, "link").result).toBe("see [](https://)");
  });

  it("marks every selected line and numbers a list", () => {
    const text = "one\ntwo\nthree";
    expect(apply(text, 1, 6, "bulleted").result).toBe("- one\n- two\nthree");
    expect(apply(text, 0, text.length, "numbered").result).toBe("1. one\n2. two\n3. three");
    expect(apply(text, 5, 5, "heading").result).toBe("one\n## two\nthree");
  });

  it("marks an empty first line that a line break follows", () => {
    expect(apply("\nfoo", 0, 0, "heading").result).toBe("## \nfoo");
    expect(apply("\nfoo", 0, 0, "bulleted").result).toBe("- \nfoo");
    expect(apply("\nfoo", 0, 0, "numbered").result).toBe("1. \nfoo");
  });

  it("swaps one line mark for another and takes its own off", () => {
    expect(apply("- one\n- two", 0, 11, "numbered").result).toBe("1. one\n2. two");
    expect(apply("- one\n- two", 0, 11, "bulleted").result).toBe("one\ntwo");
    expect(apply("# Title", 3, 3, "heading").result).toBe("Title");
  });
});
