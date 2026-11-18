import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoomsType, VectorizationStatus } from "@docspace/shared/enums";

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
vi.mock("../sub-components/SkillSetInfo", async () => ({
  SkillSetInfo: (await import("./detailsMocks")).Nothing,
}));

import Details from "..";
import { detailsProps, propertyValue } from "./detailsMocks";

const DetailsView = Details as unknown as React.FC<Record<string, unknown>>;

const base = {
  id: 21,
  title: "Company policies",
  isRoom: true,
  isFolder: true,
  roomType: RoomsType.KnowledgeRoom,
  filesCount: 3,
  foldersCount: 0,
  tags: [],
  security: {},
  createdBy: { displayName: "Owner", id: "u1" },
  updatedBy: { displayName: "Owner", id: "u1" },
  created: "2026-11-01T00:00:00Z",
  updated: "2026-11-18T00:00:00Z",
};

const file = {
  id: 40,
  title: "Policy.pdf",
  fileExst: ".pdf",
  isFolder: false,
  folderId: 21,
  contentLength: "12 KB",
  version: 1,
  createdBy: { displayName: "Owner", id: "u1" },
  updatedBy: { displayName: "Owner", id: "u1" },
  created: "2026-11-01T00:00:00Z",
  updated: "2026-11-18T00:00:00Z",
};

const renderDetails = (
  selection: Record<string, unknown>,
  props: Record<string, unknown> = {},
) => render(<DetailsView {...detailsProps(selection)} {...props} />);

beforeEach(() => vi.clearAllMocks());

describe("Details of a knowledge base", () => {
  it("counts its files and tells its state from them, read again on selection", async () => {
    const getKnowledgeBase = vi.fn(() => ({ total: 3, inProgress: 1, failed: 0 }));
    const fetchKnowledgeBase = vi.fn();
    const { container } = renderDetails(base, { getKnowledgeBase, fetchKnowledgeBase });

    await waitFor(() =>
      expect(propertyValue(container, "Common:Status")).toBe("Common:Indexing"),
    );
    expect(propertyValue(container, "Common:Content")).toBe("Common:Files: 3");
    expect(getKnowledgeBase).toHaveBeenCalledWith({ id: 21, filesCount: 3 });
    expect(fetchKnowledgeBase).toHaveBeenCalledWith({ id: 21, filesCount: 3 }, true);
    // A knowledge base is not told by its room type.
    expect(propertyValue(container, "Common:Type")).toBeUndefined();
  });

  it("reads \"Error\" when a file failed and \"Indexed\" when all are done", async () => {
    const failed = renderDetails(base, {
      getKnowledgeBase: () => ({ total: 3, inProgress: 0, failed: 1 }),
    });
    await waitFor(() =>
      expect(propertyValue(failed.container, "Common:Status")).toBe("Common:Error"),
    );
    failed.unmount();

    const done = renderDetails(base, {
      getKnowledgeBase: () => ({ total: 3, inProgress: 0, failed: 0 }),
    });
    await waitFor(() =>
      expect(propertyValue(done.container, "Common:Status")).toBe("Common:Indexed"),
    );
  });

  it("shows no Status until the base is read", async () => {
    const { container } = renderDetails(base, { getKnowledgeBase: () => null });
    await waitFor(() =>
      expect(propertyValue(container, "Common:Content")).toBe("Common:Files: 3"),
    );
    expect(propertyValue(container, "Common:Status")).toBeUndefined();
  });
});

describe("Details of a file of a knowledge base", () => {
  it("tells a file that failed and says why first", async () => {
    const { container } = renderDetails({
      ...file,
      vectorizationStatus: VectorizationStatus.Failed,
    });
    await waitFor(() =>
      expect(propertyValue(container, "Common:Status")).toBe("Common:Error"),
    );
    expect(screen.getByTestId("info_panel_details_indexing_error")).toHaveTextContent(
      "Common:PreparationForAIFailedInfo",
    );
  });

  it("tells a file being indexed or indexed, with no failure note", async () => {
    const indexing = renderDetails({
      ...file,
      vectorizationStatus: VectorizationStatus.InProgress,
    });
    await waitFor(() =>
      expect(propertyValue(indexing.container, "Common:Status")).toBe("Common:Indexing"),
    );
    expect(screen.queryByTestId("info_panel_details_indexing_error")).toBeNull();
    indexing.unmount();

    const indexed = renderDetails({
      ...file,
      vectorizationStatus: VectorizationStatus.Completed,
    });
    await waitFor(() =>
      expect(propertyValue(indexed.container, "Common:Status")).toBe("Common:Indexed"),
    );
    expect(screen.queryByTestId("info_panel_details_indexing_error")).toBeNull();
  });

  it("shows no Status for a file that is not indexed at all", async () => {
    const { container } = renderDetails(file);
    await waitFor(() =>
      expect(propertyValue(container, "Common:Size")).toBe("12 KB"),
    );
    expect(propertyValue(container, "Common:Status")).toBeUndefined();
    expect(screen.queryByTestId("info_panel_details_indexing_error")).toBeNull();
  });
});
