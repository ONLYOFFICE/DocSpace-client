import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

const api = vi.hoisted(() => ({
  getAiThreadArtifacts: vi.fn(),
  getAiThreadAttachments: vi.fn(),
}));
const stores = vi.hoisted(() => ({
  dialogsStore: { aiChatActiveThreadId: "t-1", setCopyPanelVisible: vi.fn() },
  filesSettingsStore: { getIcon: () => "icon.svg" },
  settingsStore: { culture: "en" },
  filesActionsStore: { downloadFiles: vi.fn(), checkAndOpenLocationAction: vi.fn() },
  filesStore: { setSelected: vi.fn(), setBufferSelection: vi.fn() },
  infoPanelStore: { setIsMobileHidden: vi.fn() },
}));

vi.mock("@docspace/shared/api/ai/threadFiles", () => api);
vi.mock("SRC_DIR/store/useStore", () => ({
  useStore: (name: keyof typeof stores) => stores[name],
}));
vi.mock("mobx-react", () => ({ observer: (component: unknown) => component }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
// The row's "..." menu, drawn open: its items as buttons.
vi.mock("@onlyoffice/apps-ui-kit/components/context-menu-button", () => ({
  ContextMenuButton: ({
    getData,
    testId,
  }: {
    getData: () => { key: string; label: string; onClick: () => void }[];
    testId: string;
  }) => (
    <div data-testid={testId}>
      {getData().map((item) => (
        <button key={item.key} type="button" data-testid={item.key} onClick={item.onClick}>
          {item.label}
        </button>
      ))}
    </div>
  ),
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

  it("downloads all the artifacts as one archive, once there is more than one", async () => {
    render(<AiAgentContent projectId={7} />);
    await flush();
    // One artifact has its own button only; the attachments never get the link.
    expect(screen.queryByTestId("ai-agent-content-download-all")).toBeNull();
  });

  it("offers Download all for several artifacts", async () => {
    api.getAiThreadArtifacts.mockResolvedValue([file(1, "Chart.png"), file(5, "Proposal.docx")]);
    render(<AiAgentContent projectId={7} />);
    await flush();
    fireEvent.click(screen.getByTestId("ai-agent-content-download-all"));
    expect(stores.filesActionsStore.downloadFiles).toHaveBeenCalledWith([1, 5], [], {
      label: "Common:ArchivingData",
    });
  });

  it("gives each file a menu that downloads it or saves a copy of it to a room", async () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<AiAgentContent projectId={7} />);
    await flush();
    const [row] = screen.getByTestId("ai-agent-content-artifacts").querySelectorAll('[data-testid="ai-agent-content-file"]');
    const item = (key: string) => row.querySelector(`[data-testid="${key}"]`) as HTMLElement;
    expect(item("ai-agent-content-download").textContent).toBe("Common:Download");
    expect(item("ai-agent-content-save-to-room").textContent).toBe("Common:SaveToRoom");

    fireEvent.click(item("ai-agent-content-download"));
    expect(open).toHaveBeenCalledWith("/download/1", "_self");

    fireEvent.click(item("ai-agent-content-save-to-room"));
    // The copy panel copies this file, not what a list had selected.
    expect(stores.filesStore.setSelected).toHaveBeenCalledWith("none");
    expect(stores.filesStore.setBufferSelection).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    expect(stores.dialogsStore.setCopyPanelVisible).toHaveBeenCalledWith(true);
    expect(stores.filesStore.setBufferSelection.mock.invocationCallOrder[0]).toBeGreaterThan(
      stores.filesStore.setSelected.mock.invocationCallOrder[0],
    );
    open.mockRestore();
  });

  it("opens the room or folder a file is in from its menu", async () => {
    render(<AiAgentContent projectId={7} />);
    await flush();
    const [, row] = screen
      .getByTestId("ai-agent-content-attachments")
      .querySelectorAll('[data-testid="ai-agent-content-file"]');
    const item = row.querySelector('[data-testid="ai-agent-content-open-location"]') as HTMLElement;
    expect(item.textContent).toBe("Common:OpenLocation");
    fireEvent.click(item);
    expect(stores.filesActionsStore.checkAndOpenLocationAction).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3, title: "Notes.jpg" }),
    );
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
