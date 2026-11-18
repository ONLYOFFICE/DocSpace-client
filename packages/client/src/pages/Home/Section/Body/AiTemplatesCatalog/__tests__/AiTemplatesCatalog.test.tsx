import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const api = vi.hoisted(() => ({
  getAiTemplates: vi.fn(),
  installAiTemplate: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());
const toastr = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() }));
const location = vi.hoisted(() => ({ search: "" }));
const presetsStore = vi.hoisted(() => ({ fetchPresets: vi.fn(async () => {}) }));
// The section's root is the open folder, unless a test opens a room of it.
const treeFoldersStore = vi.hoisted(() => ({ isAiHubFolder: true }));
const filesStore = vi.hoisted(() => ({ fetchRooms: vi.fn(async () => {}) }));
const setDocumentTitle = vi.hoisted(() => vi.fn());
const user = vi.hoisted(() => ({ id: "user", isAdmin: true }));
const stores = vi.hoisted(() => ({ templates: null as unknown }));
const showInfoPanel = vi.hoisted(() => vi.fn());

vi.mock("@docspace/shared/api/ai/templates", () => api);
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("SRC_DIR/store/useStore", () => ({
  useStore: (name: string) =>
    ({
      aiPresetsStore: presetsStore,
      aiTemplatesStore: stores.templates,
      treeFoldersStore,
      filesStore,
    })[name] ?? { user },
}));
vi.mock("SRC_DIR/helpers/info-panel", () => ({ showInfoPanel }));
// The menu's items as plain buttons, built as the menu opens.
vi.mock("@onlyoffice/apps-ui-kit/components/context-menu-button", () => ({
  ContextMenuButton: ({
    getData,
    testId,
  }: {
    getData: () => { key: string; label: string; disabled?: boolean; onClick?: () => void }[];
    testId?: string;
  }) => (
    <div data-testid={testId}>
      {getData().map((item) => (
        <button
          key={item.key}
          type="button"
          data-testid={`ai-template-menu-${item.key}`}
          disabled={item.disabled}
          onClick={() => item.onClick?.()}
        >
          {item.label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock("SRC_DIR/helpers/utils", () => ({ setDocumentTitle }));
vi.mock("react-router", () => ({
  useLocation: () => location,
  useNavigate: () => navigate,
  // The empty view's "Clear filter" is a router link.
  Link: ({ children, onClick }: { children: React.ReactNode; onClick?: React.MouseEventHandler }) => (
    <a href="#" onClick={onClick}>
      {children}
    </a>
  ),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  // The install confirmation renders its text as the key.
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

import { RoomsType } from "@docspace/shared/enums";
import AiTemplatesStore from "SRC_DIR/store/AiTemplatesStore";

import AiTemplatesCatalog, {
  filterTemplates,
  getTemplateCategories,
} from "../index";

const catalog = {
  agents: [
    {
      id: "agents/document/reviewer",
      kind: "agent",
      name: "Contract Reviewer",
      description: "Reviews contracts",
      category: "Document",
      instructions: "Review",
      skills: ["skill-sets/review"],
      knowledges: ["knowledge-bases/standards"],
    },
  ],
  skillSets: [
    {
      id: "skill-sets/review",
      kind: "skillSet",
      name: "Contract review",
      description: "Review skills",
      category: "Document",
      files: ["check.md", "compare.md"],
    },
  ],
  knowledgeBases: [
    {
      id: "knowledge-bases/standards",
      kind: "knowledgeBase",
      name: "Contract standards",
      description: "Standards",
      category: "Document",
      files: ["Clauses.docx"],
    },
  ],
};

const cards = () => screen.findAllByTestId("ai-template-card");

beforeEach(() => {
  api.getAiTemplates.mockReset().mockResolvedValue(catalog);
  api.installAiTemplate.mockReset();
  navigate.mockReset();
  toastr.success.mockReset();
  toastr.error.mockReset();
  toastr.warning.mockReset();
  presetsStore.fetchPresets.mockClear();
  filesStore.fetchRooms.mockClear();
  setDocumentTitle.mockClear();
  treeFoldersStore.isAiHubFolder = true;
  showInfoPanel.mockReset();
  location.search = "";
  user.isAdmin = true;
  stores.templates = new AiTemplatesStore();
});

const templatesStore = () => stores.templates as AiTemplatesStore;

describe("AiTemplatesCatalog", () => {
  it("shows the agents with the skill sets and knowledge bases they bring", async () => {
    render(<AiTemplatesCatalog />);
    const [card] = await cards();
    expect(card.textContent).toContain("Contract Reviewer");
    expect(card.textContent).toContain("Reviews contracts");
    expect(card.textContent).toContain("Contract review");
    expect(card.textContent).toContain("Contract standards");
  });

  it.each([
    [RoomsType.InstructionsRoom, "Contract review", "check.md, compare.md"],
    [RoomsType.KnowledgeRoom, "Contract standards", "Clauses.docx"],
  ])("shows the templates of the list of type %s with their files", async (type, name, files) => {
    location.search = `?type=${type}&tab=templates`;
    render(<AiTemplatesCatalog />);
    const [card] = await cards();
    expect(card.textContent).toContain(name);
    expect(card.textContent).toContain(files);
  });

  it("installs a template and goes back to the list", async () => {
    api.installAiTemplate.mockResolvedValue({ title: "Contract Reviewer" });
    render(<AiTemplatesCatalog />);
    await cards();
    fireEvent.click(screen.getByTestId("ai-template-install"));
    fireEvent.click(await screen.findByTestId("ai-template-install-confirm"));
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(api.installAiTemplate).toHaveBeenCalledWith("agents/document/reviewer");
    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][0]).not.toContain("tab=templates");
  });

  it("re-reads the sidebar's agents after an agent is installed, not after a skill set", async () => {
    api.installAiTemplate.mockResolvedValue({ kind: "agent", title: "Contract Reviewer" });
    const { unmount } = render(<AiTemplatesCatalog />);
    await cards();
    fireEvent.click(screen.getByTestId("ai-template-install"));
    fireEvent.click(await screen.findByTestId("ai-template-install-confirm"));
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(presetsStore.fetchPresets).toHaveBeenCalledTimes(1);
    unmount();

    presetsStore.fetchPresets.mockClear();
    navigate.mockReset();
    location.search = `?type=${RoomsType.InstructionsRoom}&tab=templates`;
    api.installAiTemplate.mockResolvedValue({ kind: "skillSet", title: "Contract review" });
    render(<AiTemplatesCatalog />);
    await cards();
    fireEvent.click(screen.getByTestId("ai-template-install"));
    fireEvent.click(await screen.findByTestId("ai-template-install-confirm"));
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(presetsStore.fetchPresets).not.toHaveBeenCalled();
  });

  it("warns after the success when the template's model could not be set, and only then", async () => {
    api.installAiTemplate.mockResolvedValue({
      kind: "agent",
      title: "Contract Reviewer",
      warnings: ["instructionsNotSaved", "modelNotSaved"],
    });
    const { unmount } = render(<AiTemplatesCatalog />);
    await cards();
    fireEvent.click(screen.getByTestId("ai-template-install"));
    fireEvent.click(await screen.findByTestId("ai-template-install-confirm"));
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(toastr.warning).toHaveBeenCalledTimes(1);
    expect(toastr.warning).toHaveBeenCalledWith("Common:AiTemplateModelNotSaved");
    expect(toastr.success.mock.invocationCallOrder[0]).toBeLessThan(
      toastr.warning.mock.invocationCallOrder[0],
    );
    unmount();

    toastr.warning.mockReset();
    navigate.mockReset();
    api.installAiTemplate.mockResolvedValue({
      kind: "agent",
      title: "Contract Reviewer",
      warnings: ["instructionsNotSaved"],
    });
    render(<AiTemplatesCatalog />);
    await cards();
    fireEvent.click(screen.getByTestId("ai-template-install"));
    fireEvent.click(await screen.findByTestId("ai-template-install-confirm"));
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(toastr.warning).not.toHaveBeenCalled();
  });

  it("stays on the catalog and reports a refused install", async () => {
    api.installAiTemplate.mockRejectedValue(new Error("Forbidden"));
    render(<AiTemplatesCatalog />);
    await cards();
    fireEvent.click(screen.getByTestId("ai-template-install"));
    fireEvent.click(await screen.findByTestId("ai-template-install-confirm"));
    await waitFor(() => expect(toastr.error).toHaveBeenCalledTimes(1));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("asks before installing and installs nothing when the user cancels", async () => {
    render(<AiTemplatesCatalog />);
    await cards();
    fireEvent.click(screen.getByTestId("ai-template-install"));
    expect(api.installAiTemplate).not.toHaveBeenCalled();
    expect(
      (await screen.findByTestId("ai-template-install-description")).textContent,
    ).toContain("Common:AiTemplateInstallAgentDescription");
    fireEvent.click(screen.getByTestId("ai-template-install-cancel"));
    await waitFor(() =>
      expect(screen.queryByTestId("ai-template-install-confirm")).toBeNull(),
    );
    expect(api.installAiTemplate).not.toHaveBeenCalled();
  });

  it("starts no second installation while one runs", async () => {
    let finish: (value: unknown) => void = () => {};
    api.installAiTemplate.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    render(<AiTemplatesCatalog />);
    await cards();
    fireEvent.click(screen.getByTestId("ai-template-install"));
    fireEvent.click(await screen.findByTestId("ai-template-install-confirm"));
    fireEvent.click(screen.getByTestId("ai-template-install-confirm"));
    fireEvent.click(screen.getByTestId("ai-template-install"));
    expect(api.installAiTemplate).toHaveBeenCalledTimes(1);
    finish({ kind: "agent", title: "Contract Reviewer" });
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
  });

  it("says so when the catalog cannot be read", async () => {
    api.getAiTemplates.mockRejectedValue(new Error("down"));
    render(<AiTemplatesCatalog />);
    expect(await screen.findByTestId("ai-templates-error")).toBeTruthy();
  });

  it("marks a template's name as verified, beside the name", async () => {
    render(<AiTemplatesCatalog />);
    const [card] = await cards();
    const name = within(card).getByTitle("Contract Reviewer");
    expect(name.parentElement?.querySelector("[data-testid='ai-template-verified']")).toBeTruthy();
  });

  it("offers neither Install nor Add to my agents to a user who may not create agents", async () => {
    user.isAdmin = false;
    render(<AiTemplatesCatalog />);
    await cards();
    expect(screen.queryByTestId("ai-template-install")).toBeNull();
    expect(screen.queryByTestId("ai-template-menu-install")).toBeNull();
    expect(screen.getByTestId("ai-template-menu-info")).toBeTruthy();
  });

  it("adds an agent template to the user's agents from the card's menu", async () => {
    api.installAiTemplate.mockResolvedValue({ kind: "agent", title: "Contract Reviewer" });
    render(<AiTemplatesCatalog />);
    await cards();
    const item = screen.getByTestId("ai-template-menu-install");
    expect(item.textContent).toBe("Common:AddToMyAgents");
    fireEvent.click(item);
    fireEvent.click(await screen.findByTestId("ai-template-install-confirm"));
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(api.installAiTemplate).toHaveBeenCalledWith("agents/document/reviewer");
  });

  it("selects a card by a click and none by a click between the cards", async () => {
    render(<AiTemplatesCatalog />);
    const [card] = await cards();
    fireEvent.click(card);
    expect(templatesStore().selected?.id).toBe("agents/document/reviewer");
    expect(card.getAttribute("data-selected")).toBe("true");

    fireEvent.click(card.parentElement as HTMLElement);
    expect(templatesStore().selected).toBeNull();
  });

  it("opens the Info panel on the template from the card's menu", async () => {
    render(<AiTemplatesCatalog />);
    await cards();
    fireEvent.click(screen.getByTestId("ai-template-menu-info"));
    expect(templatesStore().selectedId).toBe("agents/document/reviewer");
    expect(showInfoPanel).toHaveBeenCalledTimes(1);
  });

  it("shows only the templates whose name holds the typed text", async () => {
    api.getAiTemplates.mockResolvedValue({
      ...catalog,
      agents: [
        ...catalog.agents,
        {
          ...catalog.agents[0],
          id: "agents/sales/writer",
          name: "Sales Writer",
          description: "Writes offers",
          category: "Sales",
        },
      ],
    });
    render(<AiTemplatesCatalog />);
    expect(await cards()).toHaveLength(2);
    fireEvent.change(screen.getByRole("textbox") as HTMLInputElement, {
      target: { value: "sales wr" },
    });
    await waitFor(
      () => {
        const shown = screen.getAllByTestId("ai-template-card");
        expect(shown).toHaveLength(1);
        expect(shown[0].textContent).toContain("Sales Writer");
      },
      { timeout: 2500 },
    );
  });

  it("searches within the category picked before and keeps it", async () => {
    api.getAiTemplates.mockResolvedValue({
      ...catalog,
      agents: [
        ...catalog.agents,
        {
          ...catalog.agents[0],
          id: "agents/sales/writer",
          name: "Sales Writer",
          description: "Writes offers",
          category: "Sales",
        },
      ],
    });
    render(<AiTemplatesCatalog />);
    await cards();
    const sales = within(screen.getByTestId("ai-templates-categories")).getByText(
      "Sales",
    );
    fireEvent.click(sales);
    fireEvent.change(screen.getByRole("textbox") as HTMLInputElement, {
      target: { value: "contract" },
    });
    await screen.findByTestId("ai-templates-empty", {}, { timeout: 2500 });
    fireEvent.change(screen.getByRole("textbox") as HTMLInputElement, {
      target: { value: "writer" },
    });
    await waitFor(
      () => {
        const shown = screen.getAllByTestId("ai-template-card");
        expect(shown).toHaveLength(1);
        expect(shown[0].textContent).toContain("Sales Writer");
      },
      { timeout: 2500 },
    );

    // The empty view's "Clear filter" drops the search and the category.
    fireEvent.change(screen.getByRole("textbox") as HTMLInputElement, {
      target: { value: "nothing like it" },
    });
    await screen.findByTestId("ai-templates-empty", {}, { timeout: 2500 });
    fireEvent.click(screen.getByText("Common:ClearFilter"));
    expect(screen.getAllByTestId("ai-template-card")).toHaveLength(2);
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("drops the selection when the search hides the template and when the tab closes", async () => {
    const { unmount } = render(<AiTemplatesCatalog />);
    const [card] = await cards();
    fireEvent.click(card);
    fireEvent.change(screen.getByRole("textbox") as HTMLInputElement, {
      target: { value: "nothing like it" },
    });
    // The search reports its text a second after the typing stops.
    await waitFor(() => expect(templatesStore().selectedId).toBeNull(), {
      timeout: 2500,
    });

    templatesStore().select("agents/document/reviewer");
    unmount();
    expect(templatesStore().selectedId).toBeNull();
  });
});

describe("the Templates tab reached from a room of the section", () => {
  it("reads the section's root for the header and titles the browser tab", async () => {
    treeFoldersStore.isAiHubFolder = false;
    location.search = `?searchArea=AiHub&type=${RoomsType.AiProjectRoom}&tab=templates`;
    render(<AiTemplatesCatalog />);
    await cards();

    expect(setDocumentTitle).toHaveBeenCalledWith("Common:Agents");
    expect(filesStore.fetchRooms).toHaveBeenCalledTimes(1);
    const [folderId, filter] = filesStore.fetchRooms.mock.calls[0] as unknown as [
      null,
      { searchArea: string; type: string[] },
    ];
    expect(folderId).toBeNull();
    expect(filter.searchArea).toBe("AiHub");
    expect(filter.type).toEqual([String(RoomsType.AiProjectRoom)]);
  });

  it("reads nothing while the section's root is open already", async () => {
    render(<AiTemplatesCatalog />);
    await cards();
    expect(filesStore.fetchRooms).not.toHaveBeenCalled();
  });
});

describe("the catalog's categories and search", () => {
  const template = (name: string, category: string) =>
    ({ ...catalog.agents[0], id: name, name, category, description: `${name} does` }) as never;
  const list = [
    template("Reviewer", "Document"),
    template("Pitch", "Presentation"),
    template("Writer", "Document"),
  ];
  const names = (search: string, category: string | null) =>
    filterTemplates(list, search, category).map(({ name }) => name);

  it("lists the categories in the order they appear", () => {
    expect(getTemplateCategories(list)).toEqual(["Document", "Presentation"]);
  });

  it("keeps the templates of the chosen category, or all of them", () => {
    expect(names("", null)).toEqual(["Reviewer", "Pitch", "Writer"]);
    expect(names("", "Document")).toEqual(["Reviewer", "Writer"]);
  });

  it("combines the category with the search text", () => {
    expect(names(" writ ", "Document")).toEqual(["Writer"]);
    expect(names("writ", "Presentation")).toEqual([]);
    expect(names("PRESENTATION", null)).toEqual(["Pitch"]);
  });
});
