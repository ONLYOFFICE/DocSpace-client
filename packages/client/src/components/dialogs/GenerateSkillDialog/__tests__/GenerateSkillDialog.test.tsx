import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const ai = vi.hoisted(() => ({ generateSkillWithAI: vi.fn() }));
const files = vi.hoisted(() => ({ insertFile: vi.fn(), getFileInfo: vi.fn() }));
const toastr = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), clear: vi.fn() }));
const dialog = vi.hoisted(() => ({ onBackClick: undefined as undefined | (() => void) }));

vi.mock("@docspace/shared/api/ai", () => ai);
vi.mock("@docspace/shared/api/files", () => files);
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: () => null,
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
    onBackClick,
  }: {
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    onBackClick?: () => void;
  }) => {
    dialog.onBackClick = onBackClick;
    return (
      <form data-testid="form" onSubmit={onSubmit}>
        {children}
      </form>
    );
  };
  return {
    ModalDialog: Object.assign(ModalDialog, { Header: Part, Body: Part, Footer: Part }),
    ModalDialogType: { aside: "aside", modal: "modal" },
  };
});
vi.mock("SRC_DIR/components/CreateEditDialogParams/InputParam", () => ({
  default: ({ value, onChange, dataTestId }: { value: string; onChange: React.ChangeEventHandler; dataTestId: string }) => (
    <input data-testid={dataTestId} value={value} onChange={onChange} />
  ),
}));
vi.mock("../SkillEditor", () => ({
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea data-testid="editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

import GenerateSkillDialog from "../index";

const generated = {
  name: "qa-haiku",
  content: '---\nname: "qa-haiku"\ndescription: "Writes a haiku"\n---\n\n# Steps\n',
};

const readText = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });

const generate = async () => {
  render(<GenerateSkillDialog roomId={5} setGenerateSkillDialogVisible={vi.fn()} />);
  fireEvent.change(screen.getByTestId("generate-skill-title"), { target: { value: "QA Haiku" } });
  fireEvent.change(screen.getByTestId("generate-skill-description"), { target: { value: "A haiku about QA" } });
  fireEvent.click(screen.getByTestId("generate-skill-run-button"));
  return screen.findByTestId("editor");
};

beforeEach(() => {
  vi.clearAllMocks();
  ai.generateSkillWithAI.mockResolvedValue(generated);
  files.insertFile.mockResolvedValue({ id: 9, title: "QA Haiku.md" });
});

describe("GenerateSkillDialog", () => {
  it("shows the generated skill in the Edit skill fields, named as typed", async () => {
    const editor = (await generate()) as HTMLTextAreaElement;
    expect(editor.value).toBe("# Steps");
    expect((screen.getByTestId("edit-skill-name") as HTMLInputElement).value).toBe("QA Haiku");
    expect(screen.getByTestId("edit-skill-command").textContent).toContain("/qa-haiku");
    expect((screen.getByTestId("edit-skill-description") as HTMLTextAreaElement).value).toBe("Writes a haiku");
  });

  it("saves the skill as edited into a file named after the typed title", async () => {
    const editor = await generate();
    fireEvent.change(editor, { target: { value: "# Other steps" } });
    fireEvent.submit(screen.getByTestId("form"));
    await waitFor(() => expect(files.insertFile).toHaveBeenCalled());
    const [roomId, title, blob] = files.insertFile.mock.calls[0];
    expect(roomId).toBe(5);
    expect(title).toBe("QA Haiku.md");
    expect(await readText(blob as Blob)).toBe(
      '---\nname: "qa-haiku"\ndescription: "Writes a haiku"\n---\n\n# Other steps\n',
    );
  });

  it("opens named New skill and leaves the name to the AI while it stays so", async () => {
    ai.generateSkillWithAI.mockResolvedValue({ ...generated, title: "QA Haiku Writer" });
    render(<GenerateSkillDialog roomId={5} setGenerateSkillDialogVisible={vi.fn()} />);
    expect((screen.getByTestId("generate-skill-title") as HTMLInputElement).value).toBe("Common:NewSkill");
    fireEvent.change(screen.getByTestId("generate-skill-description"), { target: { value: "A haiku about QA" } });
    fireEvent.click(screen.getByTestId("generate-skill-run-button"));
    await screen.findByTestId("editor");
    expect(ai.generateSkillWithAI.mock.calls[0][0]).toEqual({ destId: 5, description: "A haiku about QA" });
    expect((screen.getByTestId("edit-skill-name") as HTMLInputElement).value).toBe("QA Haiku Writer");
  });

  it("asks the AI for the name of a skill whose name was emptied", async () => {
    render(<GenerateSkillDialog roomId={5} setGenerateSkillDialogVisible={vi.fn()} />);
    fireEvent.change(screen.getByTestId("generate-skill-title"), { target: { value: "  " } });
    fireEvent.change(screen.getByTestId("generate-skill-description"), { target: { value: "A haiku about QA" } });
    fireEvent.click(screen.getByTestId("generate-skill-run-button"));
    await screen.findByTestId("editor");
    expect(ai.generateSkillWithAI.mock.calls[0][0]).not.toHaveProperty("title");
  });

  it("saves nothing without a description", async () => {
    await generate();
    fireEvent.change(screen.getByTestId("edit-skill-description"), { target: { value: " " } });
    fireEvent.submit(screen.getByTestId("form"));
    expect(files.insertFile).not.toHaveBeenCalled();
  });

  it("goes back to the request with what was typed", async () => {
    await generate();
    React.act(() => dialog.onBackClick?.());
    expect(screen.queryByTestId("editor")).toBeNull();
    expect((screen.getByTestId("generate-skill-title") as HTMLInputElement).value).toBe("QA Haiku");
  });
});
