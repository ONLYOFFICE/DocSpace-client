import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const api = vi.hoisted(() => ({
  getAiTemplates: vi.fn(),
  installAiTemplate: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());
const toastr = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() }));
const presetsStore = vi.hoisted(() => ({ fetchPresets: vi.fn(async () => {}) }));
const user = vi.hoisted(() => ({ id: "user", isAdmin: true }));
const stores = vi.hoisted(() => ({ templates: null as unknown }));

vi.mock("@docspace/shared/api/ai/templates", () => api);
// The built-in room covers a template names.
vi.mock("@docspace/shared/api/rooms", () => ({ getRoomCovers: vi.fn(async () => []) }));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("SRC_DIR/store/useStore", () => ({
  useStore: (name: string) =>
    name === "aiPresetsStore"
      ? presetsStore
      : name === "aiTemplatesStore"
        ? stores.templates
        : { user },
}));
vi.mock("react-router", () => ({
  useLocation: () => ({ search: "" }),
  useNavigate: () => navigate,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import AiTemplatesStore from "SRC_DIR/store/AiTemplatesStore";
import { InfoPanelView } from "SRC_DIR/helpers/info-panel";

import AiTemplate, { getTemplateSources } from "../index";

const catalog = {
  agents: [
    {
      id: "agents/document/reviewer",
      kind: "agent" as const,
      name: "Contract Reviewer",
      description: "Reviews contracts",
      category: "Document",
      instructions: "Review",
      skills: ["skill-sets/review", "skill-sets/gone"],
      knowledges: ["knowledge-bases/standards"],
    },
  ],
  skillSets: [
    {
      id: "skill-sets/review",
      kind: "skillSet" as const,
      name: "Contract review",
      description: "Review skills",
      category: "Document",
      files: ["check-clauses.md", "compare.md"],
    },
  ],
  knowledgeBases: [
    {
      id: "knowledge-bases/standards",
      kind: "knowledgeBase" as const,
      name: "Contract standards",
      description: "Standards",
      category: "Document",
      files: ["Clauses.docx"],
    },
  ],
};

const templatesStore = () => stores.templates as AiTemplatesStore;

beforeEach(async () => {
  api.getAiTemplates.mockReset().mockResolvedValue(catalog);
  api.installAiTemplate.mockReset();
  navigate.mockReset();
  toastr.success.mockReset();
  toastr.error.mockReset();
  user.isAdmin = true;
  stores.templates = new AiTemplatesStore();
  await templatesStore().fetchCatalog();
  templatesStore().select("agents/document/reviewer");
});

// Skipped while the Templates tab is hidden (AI_TEMPLATES_ENABLED in helpers/aiWorkspace.ts).
describe.skip("AiTemplate", () => {
  it("tells on Details what the template is: its description, owner, type and category", () => {
    render(<AiTemplate view={InfoPanelView.infoDetails} />);
    expect(screen.getByTestId("info_panel_ai_template_description").textContent).toBe(
      "Reviews contracts",
    );
    expect(screen.getByTestId("info_panel_ai_template_owner").textContent).toContain("ONLYOFFICE");
    expect(
      screen
        .getByTestId("info_panel_ai_template_owner")
        .querySelector("[data-testid='info_panel_ai_template_verified']"),
    ).toBeTruthy();
    expect(screen.getByTestId("info_panel_ai_template_type").textContent).toContain("Files:Template");
    expect(screen.getByTestId("info_panel_ai_template_category").textContent).toContain("Document");
  });

  it("ends Details with Add to my agents, which asks to confirm the install", () => {
    render(<AiTemplate view={InfoPanelView.infoDetails} />);
    const button = screen.getByTestId("info_panel_ai_template_install");
    expect(button.textContent).toContain("Common:AddToMyAgents");
    fireEvent.click(button);
    // The catalog's confirmation dialog installs it once the user agrees.
    expect(templatesStore().confirmingId).toBe("agents/document/reviewer");
    expect(api.installAiTemplate).not.toHaveBeenCalled();
  });

  it("offers no Add to my agents to a user who may not create agents", () => {
    user.isAdmin = false;
    render(<AiTemplate view={InfoPanelView.infoDetails} />);
    expect(screen.queryByTestId("info_panel_ai_template_install")).toBeNull();
  });

  it("lists on Context the skill sets with their skills and the knowledge bases it brings", () => {
    render(<AiTemplate view={InfoPanelView.infoContext} />);
    const skills = screen.getByTestId("info_panel_ai_template_skills");
    expect(skills.textContent).toContain("Contract review");
    expect(skills.textContent).toContain("check-clauses");
    expect(skills.textContent).toContain("compare");
    expect(screen.getByTestId("info_panel_ai_template_knowledge").textContent).toContain(
      "Contract standards",
    );
    expect(screen.queryByTestId("info_panel_ai_template_description")).toBeNull();
  });

  it("draws nothing while no template is selected", () => {
    templatesStore().select(null);
    const { container } = render(<AiTemplate view={InfoPanelView.infoDetails} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("getTemplateSources", () => {
  it("names the agent's skill sets and knowledge bases, leaving out one the catalog lacks", () => {
    const { skillSets, knowledgeBases } = getTemplateSources(catalog.agents[0], catalog);
    expect(skillSets.map(({ name }) => name)).toEqual(["Contract review"]);
    expect(knowledgeBases.map(({ name }) => name)).toEqual(["Contract standards"]);
  });

  it("names nothing for a template that is not an agent", () => {
    expect(getTemplateSources(catalog.skillSets[0], catalog)).toEqual({
      skillSets: [],
      knowledgeBases: [],
    });
  });
});
