import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const api = vi.hoisted(() => ({ updateFile: vi.fn(), updateFileStream: vi.fn() }));
const toastr = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));

vi.mock("@docspace/shared/api/files", () => api);
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));
vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const Part = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const ModalDialog = ({
    children,
    onSubmit,
  }: {
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
  }) => (
    <form data-testid="form" onSubmit={onSubmit}>
      {children}
    </form>
  );
  return {
    ModalDialog: Object.assign(ModalDialog, { Header: Part, Body: Part, Footer: Part }),
    ModalDialogType: { modal: "modal" },
  };
});
vi.mock("SRC_DIR/components/CreateEditDialogParams/InputParam", () => ({
  default: ({ value, onChange, dataTestId }: { value: string; onChange: React.ChangeEventHandler; dataTestId: string }) => (
    <input data-testid={dataTestId} value={value} onChange={onChange} />
  ),
}));
vi.mock("../../GenerateSkillDialog/SkillEditor", () => ({
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea data-testid="editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

import { PureEditSkillDialog as EditSkillDialog } from "../index";

const file = { id: 7, title: "Clause check.md", viewUrl: "/view/7" } as never;
const text = '---\nname: "clause-check"\ndescription: "Checks clauses"\n---\n\n# Steps\n';

const onClose = vi.fn();
const refreshFiles = vi.fn(async () => {});

const open = async () => {
  render(<EditSkillDialog file={file} onClose={onClose} refreshFiles={refreshFiles} />);
  return screen.findByTestId("editor");
};

const sentText = () =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(api.updateFileStream.mock.calls[0][1] as File);
  });

beforeEach(() => {
  vi.clearAllMocks();
  api.updateFileStream.mockResolvedValue({});
  api.updateFile.mockResolvedValue({});
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, text: async () => text })));
});

afterEach(() => vi.unstubAllGlobals());

describe("EditSkillDialog", () => {
  it("opens on the skill's name, command, description and instructions", async () => {
    const editor = (await open()) as HTMLTextAreaElement;
    expect((screen.getByTestId("edit-skill-name") as HTMLInputElement).value).toBe("Clause check");
    expect(screen.getByTestId("edit-skill-command").textContent).toContain("/clause-check");
    expect((screen.getByTestId("edit-skill-description") as HTMLTextAreaElement).value).toBe("Checks clauses");
    expect(editor.value).toBe("# Steps");
  });

  it("rewrites the file in place and keeps its title when the name is the same", async () => {
    const editor = await open();
    fireEvent.change(editor, { target: { value: "# New steps" } });
    fireEvent.submit(screen.getByTestId("form"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(api.updateFileStream).toHaveBeenCalledWith(7, expect.any(File), false, true);
    expect(await sentText()).toBe('---\nname: "clause-check"\ndescription: "Checks clauses"\n---\n\n# New steps\n');
    expect(api.updateFile).not.toHaveBeenCalled();
    expect(refreshFiles).toHaveBeenCalled();
  });

  it("renames the file and the command with the name", async () => {
    await open();
    fireEvent.change(screen.getByTestId("edit-skill-name"), { target: { value: "Risk review" } });
    expect(screen.getByTestId("edit-skill-command").textContent).toContain("/risk-review");
    fireEvent.submit(screen.getByTestId("form"));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(await sentText()).toContain('name: "risk-review"');
    expect(api.updateFile).toHaveBeenCalledWith(7, "Risk review.md");
  });

  it("saves nothing without a name of letters or digits, or without a description", async () => {
    await open();
    fireEvent.change(screen.getByTestId("edit-skill-name"), { target: { value: "!!!" } });
    fireEvent.submit(screen.getByTestId("form"));
    fireEvent.change(screen.getByTestId("edit-skill-name"), { target: { value: "Ok" } });
    fireEvent.change(screen.getByTestId("edit-skill-description"), { target: { value: "  " } });
    fireEvent.submit(screen.getByTestId("form"));
    expect(api.updateFileStream).not.toHaveBeenCalled();
  });

  it("keeps the dialog and shows what the Files service refused", async () => {
    api.updateFileStream.mockRejectedValue(new Error("Bad frontmatter"));
    await open();
    fireEvent.submit(screen.getByTestId("form"));
    await waitFor(() => expect(toastr.error).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows only the instructions for View instructions, and edits them on Edit", async () => {
    const editable = { ...(file as object), security: { Edit: true, Rename: true } } as never;
    render(<EditSkillDialog file={editable} readOnly onClose={onClose} refreshFiles={refreshFiles} />);
    expect(((await screen.findByTestId("editor")) as HTMLTextAreaElement).value).toBe("# Steps");
    expect(screen.queryByTestId("edit-skill-name")).toBeNull();
    fireEvent.click(screen.getByTestId("view-skill-edit"));
    expect((screen.getByTestId("edit-skill-name") as HTMLInputElement).value).toBe("Clause check");
  });

  it("offers no Edit in the instructions view to those who may not edit the skill", async () => {
    render(<EditSkillDialog file={file} readOnly onClose={onClose} refreshFiles={refreshFiles} />);
    await screen.findByTestId("editor");
    expect(screen.queryByTestId("view-skill-edit")).toBeNull();
  });

  it("says so and offers no form when the skill cannot be read", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, statusText: "Forbidden" })));
    render(<EditSkillDialog file={file} onClose={onClose} refreshFiles={refreshFiles} />);
    expect(await screen.findByTestId("edit-skill-error")).toBeTruthy();
    expect(screen.queryByTestId("edit-skill-name")).toBeNull();
  });
});
