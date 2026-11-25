import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

const api = vi.hoisted(() => ({
  getAiThreadArtifacts: vi.fn(),
  getAiThreadAttachments: vi.fn(),
}));
// The copy panel's flag and the buffered item are observable, as in the
// stores: the view waits for the panel to close.
const stores = await vi.hoisted(async () => {
  const { observable, runInAction } = await import("mobx");
  const copyPanel = observable({ visible: false });
  const filesStore = {
    bufferSelection: null as { id: number } | null,
    setSelected: vi.fn(),
    setBufferSelection: vi.fn(),
  };
  return {
    dialogsStore: {
      aiChatActiveThreadId: "t-1",
      aiChatThreadFilesChange: { threadId: "", seq: 0 },
      get copyPanelVisible() {
        return copyPanel.visible;
      },
      setCopyPanelVisible: vi.fn((visible: boolean) =>
        runInAction(() => {
          copyPanel.visible = visible;
        }),
      ),
    },
    filesSettingsStore: { getIcon: () => "icon.svg" },
    settingsStore: { culture: "en" },
    filesActionsStore: { downloadFiles: vi.fn() },
    filesStore,
    infoPanelStore: { setIsMobileHidden: vi.fn() },
    mediaViewerDataStore: {
      setCurrentItem: vi.fn(),
      setMediaViewerData: vi.fn(),
    },
  };
});

// The socket, as a plain emitter: what the server sends is handed to the
// listeners of that event.
const socket = vi.hoisted(() => {
  const listeners = new Map<string, Set<(data?: unknown) => void>>();
  return {
    listeners,
    on: (event: string, listener: (data?: unknown) => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)?.add(listener);
    },
    off: (event: string, listener: (data?: unknown) => void) => {
      listeners.get(event)?.delete(listener);
    },
    send: (event: string, data?: unknown) => {
      listeners.get(event)?.forEach((listener) => listener(data));
    },
  };
});

vi.mock("@docspace/shared/api/ai/threadFiles", () => api);
vi.mock("@onlyoffice/apps-ui-kit/utils/socket", () => ({
  default: socket,
  SocketEvents: { ModifyThreadFiles: "s:modify-thread-files" },
}));
vi.mock("SRC_DIR/store/useStore", () => ({
  useStore: (name: keyof typeof stores) => stores[name],
}));
vi.mock("@onlyoffice/apps-ui-kit/context/ThemeContext", () => ({
  useTheme: () => ({ isBase: true }),
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

import AiAgentContent, { REFRESH_DELAY_MS } from "../index";

const MODIFY_THREAD_FILES_EVENT = "s:modify-thread-files";

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

/** The chat reports that a conversation may have new files. */
const signal = (threadId: string) => {
  const { seq } = stores.dialogsStore.aiChatThreadFilesChange;
  stores.dialogsStore.aiChatThreadFilesChange = { threadId, seq: seq + 1 };
};

/** The server announces a file saved to a conversation. */
const announce = (threadId: string, kind = "artifacts", cmd = "create") =>
  socket.send(MODIFY_THREAD_FILES_EVENT, { cmd, id: 9, threadId, kind });

const wait = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

beforeEach(() => {
  vi.clearAllMocks();
  socket.listeners.clear();
  stores.dialogsStore.aiChatActiveThreadId = "t-1";
  stores.dialogsStore.aiChatThreadFilesChange = { threadId: "", seq: 0 };
  stores.dialogsStore.setCopyPanelVisible(false);
  vi.clearAllMocks();
  stores.filesStore.bufferSelection = null;
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

  it("opens an image in the viewer of the same tab, and any other file by its link", async () => {
    const image = {
      ...file(1, "Chart.png"),
      viewAccessibility: { ImageView: true, MediaView: false },
    };
    api.getAiThreadArtifacts.mockResolvedValue([image, file(5, "Proposal.docx")]);
    render(<AiAgentContent projectId={7} />);
    await flush();
    const links = screen.getAllByTestId("ai-agent-content-open");

    // fireEvent returns false when the default action was prevented.
    expect(fireEvent.click(links[0])).toBe(false);
    expect(stores.mediaViewerDataStore.setCurrentItem).toHaveBeenCalledWith({
      fileId: 1,
      fileInfo: image,
    });
    expect(stores.mediaViewerDataStore.setMediaViewerData).toHaveBeenCalledWith({
      visible: true,
      id: 1,
    });

    // A click that asks for a new tab keeps the link's own way.
    expect(fireEvent.click(links[0], { ctrlKey: true })).toBe(true);
    expect(fireEvent.click(links[1])).toBe(true);
    expect(stores.mediaViewerDataStore.setMediaViewerData).toHaveBeenCalledTimes(1);
  });

  // The agent's page has no list whose click would take the buffer away.
  it("gives the Info panel back to the agent once the copy panel closes", async () => {
    render(<AiAgentContent projectId={7} />);
    await flush();
    const [row] = screen.getByTestId("ai-agent-content-artifacts").querySelectorAll('[data-testid="ai-agent-content-file"]');
    fireEvent.click(row.querySelector('[data-testid="ai-agent-content-save-to-room"]') as HTMLElement);
    expect(stores.filesStore.setBufferSelection).toHaveBeenCalledTimes(1);

    stores.filesStore.bufferSelection = { id: 1 };
    act(() => stores.dialogsStore.setCopyPanelVisible(false));
    expect(stores.filesStore.setBufferSelection).toHaveBeenLastCalledWith(null);
  });

  it("leaves alone a buffer that holds something else by the time the copy panel closes", async () => {
    render(<AiAgentContent projectId={7} />);
    await flush();
    const [row] = screen.getByTestId("ai-agent-content-artifacts").querySelectorAll('[data-testid="ai-agent-content-file"]');
    fireEvent.click(row.querySelector('[data-testid="ai-agent-content-save-to-room"]') as HTMLElement);

    stores.filesStore.bufferSelection = { id: 99 };
    act(() => stores.dialogsStore.setCopyPanelVisible(false));
    expect(stores.filesStore.setBufferSelection).toHaveBeenCalledTimes(1);
  });

  // Spec: ai-agent-info-panel, "Actions of a Content row"
  it("offers no Open location, as the conversation's folders are internal", async () => {
    render(<AiAgentContent projectId={7} />);
    await flush();
    const rows = screen.getByTestId("ai-agent-content").querySelectorAll('[data-testid="ai-agent-content-file"]');
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row.querySelector('[data-testid="ai-agent-content-open-location"]')).toBeNull();
      expect(row.querySelector('[data-testid="ai-agent-content-download"]')).not.toBeNull();
    });
  });

  it("shows the empty screen for a new chat, without a request", async () => {
    stores.dialogsStore.aiChatActiveThreadId = "";
    render(<AiAgentContent projectId={7} />);
    await flush();
    expect(api.getAiThreadArtifacts).not.toHaveBeenCalled();
    const empty = screen.getByTestId("ai-agent-content-empty");
    expect(empty.querySelector("img")).not.toBeNull();
    expect(empty.textContent).toContain("Common:AiContentEmpty");
    expect(empty.textContent).toContain("Common:AiContentEmptyDescription");
    // The screen stands in place of the two sections.
    expect(screen.queryByTestId("ai-agent-content-artifacts")).toBeNull();
    expect(screen.queryByTestId("ai-agent-content-attachments")).toBeNull();
  });

  it("shows the empty screen for a conversation without a file", async () => {
    api.getAiThreadArtifacts.mockResolvedValue([]);
    api.getAiThreadAttachments.mockResolvedValue([]);
    render(<AiAgentContent projectId={7} />);
    await flush();
    expect(screen.getByTestId("ai-agent-content-empty")).not.toBeNull();
  });

  it("keeps both sections, one saying it has no files, when only the other has", async () => {
    api.getAiThreadArtifacts.mockResolvedValue([]);
    render(<AiAgentContent projectId={7} />);
    await flush();
    expect(screen.queryByTestId("ai-agent-content-empty")).toBeNull();
    expect(screen.getByTestId("ai-agent-content-artifacts").textContent).toContain("Common:AiContentEmpty");
    expect(titles("ai-agent-content-attachments")).toHaveLength(2);
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

  it("reads the lists again when the chat reports new files in its conversation, keeping the rows meanwhile", async () => {
    vi.useFakeTimers();
    const { rerender } = render(<AiAgentContent projectId={7} />);
    await wait(0);
    const panel = screen.getByTestId("ai-agent-content");
    const next = deferred<unknown[]>();
    api.getAiThreadArtifacts.mockReturnValueOnce(next.promise);
    signal("t-1");
    rerender(<AiAgentContent projectId={7} />);
    await wait(REFRESH_DELAY_MS);
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(2);
    expect(api.getAiThreadAttachments).toHaveBeenCalledTimes(2);
    // Nothing goes blank while the new lists are on their way.
    expect(titles("ai-agent-content-artifacts")).toEqual(["Chart.png"]);
    next.resolve([file(1, "Chart.png"), file(6, "Report.docx")]);
    await wait(0);
    expect(screen.getByTestId("ai-agent-content")).toBe(panel);
    expect(titles("ai-agent-content-artifacts")).toEqual(["Chart.png", "Report.docx"]);
  });

  it("ignores a change in another conversation", async () => {
    vi.useFakeTimers();
    const { rerender } = render(<AiAgentContent projectId={7} />);
    await wait(0);
    signal("t-other");
    rerender(<AiAgentContent projectId={7} />);
    await wait(REFRESH_DELAY_MS * 2);
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(1);
  });

  it("reads once for a burst of changes", async () => {
    vi.useFakeTimers();
    const { rerender } = render(<AiAgentContent projectId={7} />);
    await wait(0);
    for (let i = 0; i < 3; i += 1) {
      signal("t-1");
      rerender(<AiAgentContent projectId={7} />);
      await wait(REFRESH_DELAY_MS / 4);
    }
    await wait(REFRESH_DELAY_MS);
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(2);
    expect(api.getAiThreadAttachments).toHaveBeenCalledTimes(2);
  });

  it("shows the newer lists when two reads come back in reverse order", async () => {
    vi.useFakeTimers();
    const { rerender } = render(<AiAgentContent projectId={7} />);
    await wait(0);
    const older = deferred<unknown[]>();
    const newer = deferred<unknown[]>();
    api.getAiThreadArtifacts.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    signal("t-1");
    rerender(<AiAgentContent projectId={7} />);
    await wait(REFRESH_DELAY_MS);
    signal("t-1");
    rerender(<AiAgentContent projectId={7} />);
    await wait(REFRESH_DELAY_MS);
    newer.resolve([file(8, "Newer.docx")]);
    await wait(0);
    older.resolve([file(9, "Older.docx")]);
    await wait(0);
    expect(titles("ai-agent-content-artifacts")).toEqual(["Newer.docx"]);
  });

  it("drops a read of the last conversation that comes back after a switch", async () => {
    vi.useFakeTimers();
    const { rerender } = render(<AiAgentContent projectId={7} />);
    await wait(0);
    const late = deferred<unknown[]>();
    api.getAiThreadArtifacts.mockReturnValueOnce(late.promise);
    signal("t-1");
    rerender(<AiAgentContent projectId={7} />);
    await wait(REFRESH_DELAY_MS);
    stores.dialogsStore.aiChatActiveThreadId = "t-2";
    api.getAiThreadArtifacts.mockResolvedValue([file(4, "Other.pdf")]);
    rerender(<AiAgentContent projectId={7} />);
    await wait(0);
    late.resolve([file(9, "Late.docx")]);
    await wait(0);
    expect(titles("ai-agent-content-artifacts")).toEqual(["Other.pdf"]);
  });

  it("shows the lists when a read again succeeds after the first one failed", async () => {
    vi.useFakeTimers();
    api.getAiThreadArtifacts.mockRejectedValueOnce(new Error("down"));
    api.getAiThreadAttachments.mockRejectedValueOnce(new Error("down"));
    const { rerender } = render(<AiAgentContent projectId={7} />);
    await wait(0);
    expect(screen.getByTestId("ai-agent-content-error")).toBeTruthy();
    signal("t-1");
    rerender(<AiAgentContent projectId={7} />);
    await wait(REFRESH_DELAY_MS);
    expect(screen.queryByTestId("ai-agent-content-error")).toBeNull();
    expect(titles("ai-agent-content-artifacts")).toEqual(["Chart.png"]);
  });

  it("keeps the lists when a read again fails", async () => {
    vi.useFakeTimers();
    const { rerender } = render(<AiAgentContent projectId={7} />);
    await wait(0);
    api.getAiThreadArtifacts.mockRejectedValue(new Error("down"));
    api.getAiThreadAttachments.mockRejectedValue(new Error("down"));
    signal("t-1");
    rerender(<AiAgentContent projectId={7} />);
    await wait(REFRESH_DELAY_MS);
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId("ai-agent-content-error")).toBeNull();
    expect(titles("ai-agent-content-artifacts")).toEqual(["Chart.png"]);
  });

  it("shows a list as soon as it comes, without waiting for the other", async () => {
    const artifacts = deferred<unknown[]>();
    api.getAiThreadArtifacts.mockReturnValueOnce(artifacts.promise);
    render(<AiAgentContent projectId={7} />);
    await flush();
    // The attachments are here, the artifacts still on their way.
    expect(titles("ai-agent-content-attachments")).toEqual(["Agreement.docx", "Notes.jpg"]);
    expect(screen.queryByTestId("ai-agent-content-artifacts")).toBeNull();
    artifacts.resolve([file(1, "Chart.png")]);
    await flush();
    expect(titles("ai-agent-content-artifacts")).toEqual(["Chart.png"]);
  });

  it("holds a list that came empty until the other tells a section from the empty screen", async () => {
    const attachments = deferred<unknown[]>();
    api.getAiThreadArtifacts.mockResolvedValue([]);
    api.getAiThreadAttachments.mockReturnValueOnce(attachments.promise);
    render(<AiAgentContent projectId={7} />);
    await flush();
    expect(screen.queryByTestId("ai-agent-content-artifacts")).toBeNull();
    expect(screen.queryByTestId("ai-agent-content-empty")).toBeNull();
    attachments.resolve([]);
    await flush();
    expect(screen.getByTestId("ai-agent-content-empty")).not.toBeNull();
  });

  it("goes from the empty screen of a new chat to its files without going blank", async () => {
    stores.dialogsStore.aiChatActiveThreadId = "";
    const { rerender } = render(<AiAgentContent projectId={7} />);
    await flush();
    const answer = deferred<unknown[]>();
    api.getAiThreadArtifacts.mockReturnValueOnce(answer.promise);
    stores.dialogsStore.aiChatActiveThreadId = "t-new";
    rerender(<AiAgentContent projectId={7} />);
    await flush();
    // The attachments that came are shown, the artifacts still as they were.
    expect(titles("ai-agent-content-attachments")).toHaveLength(2);
    expect(titles("ai-agent-content-artifacts")).toEqual([]);
    answer.resolve([file(1, "Chart.png")]);
    await flush();
    expect(api.getAiThreadArtifacts).toHaveBeenCalledWith(7, "t-new");
    expect(titles("ai-agent-content-artifacts")).toEqual(["Chart.png"]);
    expect(titles("ai-agent-content-attachments")).toHaveLength(2);
  });

  it("does not read again on coming back to a conversation whose change it has seen", async () => {
    vi.useFakeTimers();
    const { rerender } = render(<AiAgentContent projectId={7} />);
    await wait(0);
    signal("t-1");
    rerender(<AiAgentContent projectId={7} />);
    await wait(REFRESH_DELAY_MS);
    stores.dialogsStore.aiChatActiveThreadId = "t-2";
    rerender(<AiAgentContent projectId={7} />);
    await wait(0);
    stores.dialogsStore.aiChatActiveThreadId = "t-1";
    rerender(<AiAgentContent projectId={7} />);
    await wait(REFRESH_DELAY_MS * 2);
    // The first read, the change, t-2, and coming back: no second read for the change.
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(4);
  });

  it("reads the lists again when the browser tab is shown again", async () => {
    render(<AiAgentContent projectId={7} />);
    await flush();
    api.getAiThreadArtifacts.mockResolvedValue([file(1, "Chart.png"), file(6, "Report.docx")]);
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await flush();
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(2);
    expect(titles("ai-agent-content-artifacts")).toEqual(["Chart.png", "Report.docx"]);
  });

  it("reads a list again when the server announces a new file of its kind, leaving the other alone", async () => {
    vi.useFakeTimers();
    render(<AiAgentContent projectId={7} />);
    await flush();
    api.getAiThreadArtifacts.mockResolvedValue([file(9, "Report.docx"), file(1, "Chart.png")]);
    // The server writes the id in its own case.
    announce("T-1");
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(1);
    await wait(REFRESH_DELAY_MS);
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(2);
    expect(api.getAiThreadAttachments).toHaveBeenCalledTimes(1);
    expect(titles("ai-agent-content-artifacts")).toEqual(["Report.docx", "Chart.png"]);
  });

  it("reads both lists once when files of both kinds are announced together", async () => {
    vi.useFakeTimers();
    render(<AiAgentContent projectId={7} />);
    await flush();
    announce("t-1", "artifacts");
    announce("t-1", "attachments");
    await wait(REFRESH_DELAY_MS);
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(2);
    expect(api.getAiThreadAttachments).toHaveBeenCalledTimes(2);
  });

  it("reads once for the files announced together", async () => {
    vi.useFakeTimers();
    render(<AiAgentContent projectId={7} />);
    await flush();
    announce("t-1", "attachments");
    await wait(REFRESH_DELAY_MS / 2);
    announce("t-1", "attachments");
    await wait(REFRESH_DELAY_MS);
    expect(api.getAiThreadAttachments).toHaveBeenCalledTimes(2);
  });

  it("ignores a file announced for another conversation, or another command", async () => {
    vi.useFakeTimers();
    render(<AiAgentContent projectId={7} />);
    await flush();
    announce("t-other");
    announce("t-1", "artifacts", "delete");
    await wait(REFRESH_DELAY_MS * 2);
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(1);
  });

  it("stops listening once it is put away", async () => {
    vi.useFakeTimers();
    const { unmount } = render(<AiAgentContent projectId={7} />);
    await flush();
    announce("t-1");
    unmount();
    expect(socket.listeners.get(MODIFY_THREAD_FILES_EVENT)?.size).toBe(0);
    await wait(REFRESH_DELAY_MS * 2);
    expect(api.getAiThreadArtifacts).toHaveBeenCalledTimes(1);
  });
});
