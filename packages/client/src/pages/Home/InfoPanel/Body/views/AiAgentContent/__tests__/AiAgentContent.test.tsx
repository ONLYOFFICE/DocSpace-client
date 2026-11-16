import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

const api = vi.hoisted(() => ({
  getAiThreadArtifacts: vi.fn(),
  getAiThreadAttachments: vi.fn(),
}));
const stores = vi.hoisted(() => ({
  dialogsStore: { aiChatActiveThreadId: "t-1" },
  filesSettingsStore: { getIcon: () => "icon.svg" },
  settingsStore: { culture: "en" },
}));

vi.mock("@docspace/shared/api/ai/threadFiles", () => api);
vi.mock("SRC_DIR/store/useStore", () => ({
  useStore: (name: keyof typeof stores) => stores[name],
}));
vi.mock("mobx-react", () => ({ observer: (component: unknown) => component }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import AiAgentContent, { REFRESH_MS } from "../index";

const file = (id: number, title: string) => ({
  id,
  title,
  fileExst: ".png",
  contentLength: "12 KB",
  created: "2026-11-13T10:00:00Z",
  webUrl: `/doceditor?fileId=${id}`,
  viewUrl: `/download/${id}`,
});

const titles = (testId: string) =>
  Array.from(screen.getByTestId(testId).querySelectorAll('[data-testid="ai-agent-content-file"]')).map(
    (node) => node.querySelector("a")?.textContent,
  );

const flush = () => act(async () => {});

beforeEach(() => {
  vi.clearAllMocks();
  stores.dialogsStore.aiChatActiveThreadId = "t-1";
  api.getAiThreadArtifacts.mockResolvedValue([file(1, "Chart.png")]);
  api.getAiThreadAttachments.mockResolvedValue([file(2, "Agreement.docx"), file(3, "Notes.jpg")]);
});

afterEach(() => vi.useRealTimers());

describe("AiAgentContent", () => {
  it("lists the artifacts and the attachments of the conversation on screen", async () => {
    render(<AiAgentContent projectId={7} />);
    await flush();
    expect(api.getAiThreadArtifacts).toHaveBeenCalledWith(7, "t-1");
    expect(api.getAiThreadAttachments).toHaveBeenCalledWith(7, "t-1");
    expect(titles("ai-agent-content-artifacts")).toEqual(["Chart.png"]);
    expect(titles("ai-agent-content-attachments")).toEqual(["Agreement.docx", "Notes.jpg"]);
  });

  it("shows both sections empty for a new chat, without a request", async () => {
    stores.dialogsStore.aiChatActiveThreadId = "";
    render(<AiAgentContent projectId={7} />);
    await flush();
    expect(api.getAiThreadArtifacts).not.toHaveBeenCalled();
    expect(screen.getAllByText("Common:AiContentEmpty")).toHaveLength(2);
  });

  it("follows the conversation", async () => {
    const { rerender } = render(<AiAgentContent projectId={7} />);
    await flush();
    stores.dialogsStore.aiChatActiveThreadId = "t-2";
    api.getAiThreadArtifacts.mockResolvedValue([]);
    api.getAiThreadAttachments.mockResolvedValue([file(4, "Other.pdf")]);
    rerender(<AiAgentContent projectId={7} />);
    await flush();
    expect(api.getAiThreadArtifacts).toHaveBeenLastCalledWith(7, "t-2");
    expect(titles("ai-agent-content-attachments")).toEqual(["Other.pdf"]);
  });

  it("keeps the list that could be read when the other could not", async () => {
    api.getAiThreadArtifacts.mockRejectedValue(new Error("404"));
    render(<AiAgentContent projectId={7} />);
    await flush();
    expect(titles("ai-agent-content-artifacts")).toEqual([]);
    expect(titles("ai-agent-content-attachments")).toHaveLength(2);
  });

  it("says so when neither list can be read", async () => {
    api.getAiThreadArtifacts.mockRejectedValue(new Error("down"));
    api.getAiThreadAttachments.mockRejectedValue(new Error("down"));
    render(<AiAgentContent projectId={7} />);
    await flush();
    expect(screen.getByTestId("ai-agent-content-error")).toBeTruthy();
  });

  it("reads the lists again while it is shown, and keeps them when a refresh fails", async () => {
    vi.useFakeTimers();
    render(<AiAgentContent projectId={7} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    api.getAiThreadArtifacts.mockRejectedValue(new Error("down"));
    api.getAiThreadAttachments.mockRejectedValue(new Error("down"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(REFRESH_MS);
    });
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(2);
    expect(titles("ai-agent-content-artifacts")).toEqual(["Chart.png"]);
  });
});
