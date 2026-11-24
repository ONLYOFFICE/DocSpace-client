import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditorSelection } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("SRC_DIR/components/CreateEditDialogParams/InputParam", () => ({
  default: ({ value }: { value: string }) => <input readOnly value={value} />,
}));
// The instructions editor, a plain CodeMirror view the toolbar acts on.
vi.mock("../../GenerateSkillDialog/SkillEditor", async () => {
  const { EditorState } = await import("@codemirror/state");
  const { EditorView: View } = await import("@codemirror/view");
  const SkillEditor = ({
    value,
    onCreateEditor,
  }: {
    value: string;
    onCreateEditor: (view: EditorView) => void;
  }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      const view = new View({
        state: EditorState.create({ doc: value }),
        parent: ref.current!,
      });
      onCreateEditor(view);
      return () => view.destroy();
      // The view is made once, as CodeMirror's own component does.
    }, []);
    return <div ref={ref} data-testid="editor" />;
  };
  return { default: SkillEditor };
});

import SkillForm from "../SkillForm";

const renderForm = async (body: string, props: Record<string, unknown> = {}) => {
  let view: EditorView | null = null;
  const { EditorView: View } = await import("@codemirror/view");
  render(
    <SkillForm
      name="Clause check"
      onNameChange={vi.fn()}
      description="Checks clauses"
      onDescriptionChange={vi.fn()}
      body={body}
      onBodyChange={vi.fn()}
      {...props}
    />,
  );
  await screen.findByTestId("editor");
  const element = screen.getByTestId("editor").querySelector(".cm-editor");
  if (element) view = View.findFromDOM(element as HTMLElement);
  return view!;
};

const select = (view: EditorView, from: number, to: number) =>
  act(() => {
    view.dispatch({ selection: EditorSelection.single(from, to) });
  });

const click = (action: string) =>
  act(() => {
    fireEvent.click(screen.getByTestId(`edit-skill-toolbar-${action}`));
  });

describe("Markdown toolbar of the Edit skill form", () => {
  it("has a button for each mark, named for it, and says the text is Markdown", async () => {
    await renderForm("");
    const toolbar = screen.getByRole("toolbar");
    const names = Array.from(toolbar.querySelectorAll("button")).map((button) =>
      button.getAttribute("aria-label"),
    );
    expect(names).toEqual([
      "Common:MarkdownBold",
      "Common:MarkdownItalic",
      "Common:MarkdownHeading",
      "Common:MarkdownBulletedList",
      "Common:MarkdownNumberedList",
      "Common:MarkdownCode",
      "Common:Link",
    ]);
    expect(toolbar).toHaveTextContent("Common:MarkdownSupported");
  });

  it("marks the selected text bold in the editor, and takes the mark off again", async () => {
    const view = await renderForm("Check the clauses");
    select(view, 10, 17);
    click("bold");
    expect(view.state.doc.toString()).toBe("Check the **clauses**");
    // The same text stays selected, inside its marks.
    expect(view.state.selection.main.from).toBe(12);
    expect(view.state.selection.main.to).toBe(19);
    click("bold");
    expect(view.state.doc.toString()).toBe("Check the clauses");
  });

  it("marks italic and code around the selection", async () => {
    const view = await renderForm("one two");
    select(view, 0, 3);
    click("italic");
    expect(view.state.doc.toString()).toBe("_one_ two");
    select(view, 6, 9);
    click("code");
    expect(view.state.doc.toString()).toBe("_one_ `two`");
  });

  it("numbers each selected line", async () => {
    const view = await renderForm("first\nsecond");
    select(view, 0, 12);
    click("numbered");
    expect(view.state.doc.toString()).toBe("1. first\n2. second");
  });

  it("starts each selected line with a bullet", async () => {
    const view = await renderForm("first\nsecond");
    select(view, 0, 12);
    click("bulleted");
    expect(view.state.doc.toString()).toBe("- first\n- second");
  });

  it("makes the selected line a heading", async () => {
    const view = await renderForm("Steps");
    select(view, 0, 5);
    click("heading");
    expect(view.state.doc.toString()).toBe("## Steps");
  });

  it("turns the selection into a link with the address left to type", async () => {
    const view = await renderForm("docs");
    select(view, 0, 4);
    click("link");
    expect(view.state.doc.toString()).toBe("[docs](https://)");
  });

  it("keeps the editor's selection: a button never takes the focus", async () => {
    await renderForm("text");
    const notPrevented = fireEvent.mouseDown(screen.getByTestId("edit-skill-toolbar-bold"));
    expect(notPrevented).toBe(false);
  });

  it("is off while the skill is read or saved", async () => {
    render(
      <SkillForm
        name="Clause check"
        onNameChange={vi.fn()}
        description=""
        onDescriptionChange={vi.fn()}
        body=""
        onBodyChange={vi.fn()}
        isLoading
      />,
    );
    for (const button of screen.getByRole("toolbar").querySelectorAll("button"))
      expect(button).toBeDisabled();
    expect(screen.queryByTestId("editor")).toBeNull();
  });
});
