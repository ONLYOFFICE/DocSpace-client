import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const api = vi.hoisted(() => ({
  getAiTemplates: vi.fn(),
  installAiTemplate: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());
const toastr = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const location = vi.hoisted(() => ({ search: "" }));

vi.mock("@docspace/shared/api/ai/templates", () => api);
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("SRC_DIR/store/useStore", () => ({
  useStore: () => ({ user: { id: "user" } }),
}));
vi.mock("react-router", () => ({
  useLocation: () => location,
  useNavigate: () => navigate,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { RoomsType } from "@docspace/shared/enums";

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
  location.search = "";
});

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
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(api.installAiTemplate).toHaveBeenCalledWith("agents/document/reviewer");
    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][0]).not.toContain("tab=templates");
  });

  it("stays on the catalog and reports a refused install", async () => {
    api.installAiTemplate.mockRejectedValue(new Error("Forbidden"));
    render(<AiTemplatesCatalog />);
    await cards();
    fireEvent.click(screen.getByTestId("ai-template-install"));
    await waitFor(() => expect(toastr.error).toHaveBeenCalledTimes(1));
    expect(navigate).not.toHaveBeenCalled();
  });

  it("says so when the catalog cannot be read", async () => {
    api.getAiTemplates.mockRejectedValue(new Error("down"));
    render(<AiTemplatesCatalog />);
    expect(await screen.findByTestId("ai-templates-error")).toBeTruthy();
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
