import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

const api = vi.hoisted(() => ({ getFolder: vi.fn() }));

vi.mock("@docspace/shared/api/files", () => api);
vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (key: string) => key, exists: () => true, language: "en" },
}));
vi.mock("mobx-react", () => ({
  inject: () => (component: unknown) => component,
  observer: (component: unknown) => component,
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@onlyoffice/apps-ui-kit/components/room-icon", async () => ({
  RoomIcon: (await import("./detailsMocks")).RoomIconMock,
}));
vi.mock("SRC_DIR/components/SkillIcon", async () => ({
  default: (await import("./detailsMocks")).SkillIconMock,
  getAiRoomIconKind: () => null,
}));
vi.mock("SRC_DIR/components/TagManagement", async () => ({
  TagManagement: (await import("./detailsMocks")).Nothing,
  getTagManagementAccess: () => false,
}));
vi.mock("SRC_DIR/components/SpaceQuota", async () => ({
  default: (await import("./detailsMocks")).Nothing,
}));
vi.mock("../sub-components/FormInfo", async () => ({
  FormInfo: (await import("./detailsMocks")).Nothing,
}));
// The agents that use a room have their own test.
vi.mock("../sub-components/UsedByAgents", async () => ({
  UsedByAgents: (await import("./detailsMocks")).Nothing,
}));

import Details from "..";
import { SkillSetInfo } from "../sub-components/SkillSetInfo";
import { detailsProps, propertyValue } from "./detailsMocks";

const DetailsView = Details as unknown as React.FC<Record<string, unknown>>;

const skillSet = {
  id: 12,
  title: "Sales assistant",
  isRoom: true,
  isFolder: true,
  roomType: RoomsType.InstructionsRoom,
  filesCount: 3,
  foldersCount: 0,
  tags: [],
  security: {},
  createdBy: { displayName: "Owner", id: "u1" },
  updatedBy: { displayName: "Owner", id: "u1" },
  created: "2026-11-01T00:00:00Z",
  updated: "2026-11-18T00:00:00Z",
};

const skillFile = {
  id: 40,
  title: "Document summary.md",
  fileExst: ".md",
  isFolder: false,
  folderId: 12,
  contentLength: "1 KB",
  version: 2,
  createdBy: { displayName: "Owner", id: "u1" },
  updatedBy: { displayName: "Owner", id: "u1" },
  created: "2026-11-01T00:00:00Z",
  updated: "2026-11-18T00:00:00Z",
};

const openSet = {
  id: 12,
  title: "Sales assistant",
  roomType: RoomsType.InstructionsRoom,
};

beforeEach(() => {
  vi.clearAllMocks();
  api.getFolder.mockResolvedValue({ files: [] });
});

describe("Details of a skill", () => {
  const renderSkill = (props: Record<string, unknown> = {}) => {
    const setEditSkillFile = vi.fn();
    const fetchSkill = vi.fn();
    const view = render(
      <DetailsView
        {...detailsProps(skillFile)}
        openFolder={openSet}
        getSkill={() => ({ name: "doc-summary", description: "Summarizes a document" })}
        fetchSkill={fetchSkill}
        setEditSkillFile={setEditSkillFile}
        {...props}
      />,
    );
    return { ...view, setEditSkillFile, fetchSkill };
  };

  it("shows its description, its set and the command its file names", async () => {
    const { container, fetchSkill } = renderSkill();
    await waitFor(() =>
      expect(propertyValue(container, "Common:SkillSet")).toBe("Sales assistant"),
    );
    expect(propertyValue(container, "Common:SkillCommand")).toBe("/doc-summary");
    expect(screen.getByTestId("info_panel_details_skill_description")).toHaveTextContent(
      "Summarizes a document",
    );
    // A skill is not a file here: no type, size or versions.
    expect(propertyValue(container, "Common:Type")).toBeUndefined();
    expect(propertyValue(container, "Common:Size")).toBeUndefined();
    expect(screen.getByTestId("skill-icon-skill")).toBeInTheDocument();
    expect(fetchSkill).not.toHaveBeenCalled();
  });

  it("reads a skill not read yet and names its command after the title meanwhile", async () => {
    const { container, fetchSkill } = renderSkill({ getSkill: () => null });
    await waitFor(() =>
      expect(propertyValue(container, "Common:SkillCommand")).toBe("/document-summary"),
    );
    expect(fetchSkill).toHaveBeenCalledWith(skillFile);
    expect(screen.queryByTestId("info_panel_details_skill_description")).toBeNull();
  });

  it("ends with View instructions, which opens the skill to read", async () => {
    const { setEditSkillFile } = renderSkill();
    fireEvent.click(await screen.findByTestId("info_panel_details_view_instructions_button"));
    expect(setEditSkillFile).toHaveBeenCalledWith(skillFile, true);
  });

  it("shows the same Markdown file outside a skill set as a file", async () => {
    const { container } = renderSkill({
      openFolder: { ...openSet, roomType: RoomsType.CustomRoom },
    });
    await waitFor(() => expect(propertyValue(container, "Common:Size")).toBe("1 KB"));
    expect(propertyValue(container, "Common:SkillCommand")).toBeUndefined();
    expect(screen.queryByTestId("info_panel_details_view_instructions_button")).toBeNull();
  });
});

describe("Details of a skill set", () => {
  it("counts its skills and lists each with its command", async () => {
    api.getFolder.mockResolvedValue({
      files: [
        { id: 40, title: "Document summary.md" },
        { id: 41, title: "Clause check.MD" },
        { id: 42, title: "notes.txt" },
      ],
    });
    const { container } = render(<DetailsView {...detailsProps(skillSet)} />);

    await waitFor(() =>
      expect(propertyValue(container, "Common:Content")).toBe("Common:Skills: 3"),
    );
    // A skill set is not told by its room type.
    expect(propertyValue(container, "Common:Type")).toBeUndefined();
    const list = await screen.findByTestId("skill-set-info-skills");
    const items = Array.from(list.querySelectorAll("li")).map((item) => item.textContent);
    expect(items).toEqual(["Document summary/document-summary", "Clause check/clause-check"]);
    expect(api.getFolder).toHaveBeenCalledWith(12, expect.anything());
  });
});

describe("SkillSetInfo", () => {
  it("lists nothing for another room, or a set it cannot read", async () => {
    const { container, rerender } = render(
      <SkillSetInfo selection={{ ...skillSet, roomType: RoomsType.CustomRoom }} />,
    );
    expect(api.getFolder).not.toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();

    api.getFolder.mockRejectedValue(new Error("403"));
    rerender(<SkillSetInfo selection={skillSet} />);
    await waitFor(() => expect(api.getFolder).toHaveBeenCalledTimes(1));
    expect(container).toBeEmptyDOMElement();
  });

  it("reads the set again when its number of skills changes", async () => {
    const { rerender } = render(<SkillSetInfo selection={skillSet} />);
    await waitFor(() => expect(api.getFolder).toHaveBeenCalledTimes(1));
    rerender(<SkillSetInfo selection={{ ...skillSet, filesCount: 4 }} />);
    await waitFor(() => expect(api.getFolder).toHaveBeenCalledTimes(2));
  });
});
