import React from "react";
import { Provider } from "mobx-react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@docspace/shared/api/ai/projects", () => ({
  getAiProjects: vi.fn(),
  getAiProject: vi.fn(),
  createAiProject: vi.fn(),
  deleteAiProject: vi.fn(),
}));

const chat = vi.hoisted(() => ({
  store: { openPreset: vi.fn() },
  setCurrentPage: vi.fn(),
}));
vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers", () => ({
  useAiChatStore: () => chat.store,
  useStores: () => ({
    useRouter: (select: (s: { setCurrentPage: typeof chat.setCurrentPage }) => unknown) =>
      select({ setCurrentPage: chat.setCurrentPage }),
  }),
}));

import AiPresetsStore, { toAiPreset } from "SRC_DIR/store/AiPresetsStore";
import type { TAiProject } from "@docspace/shared/api/ai/projects";

import { SkillSetChatBridge } from "../index";

const agent = {
  id: 1,
  title: "Sales",
  created: "2026-10-01T00:00:00.000Z",
  aiProject: { profile: { id: "p1", name: "Claude" }, instructionsRooms: [], knowledgeRooms: [] },
} as unknown as TAiProject;

const renderBridge = (aiPresetsStore: AiPresetsStore) =>
  render(
    <Provider aiPresetsStore={aiPresetsStore}>
      <SkillSetChatBridge />
    </Provider>,
  );

describe("SkillSetChatBridge", () => {
  beforeEach(() => vi.clearAllMocks());

  it("opens a new chat on the default agent with the skill set connected", () => {
    const store = new AiPresetsStore();
    store.setActivePreset(toAiPreset(agent));
    renderBridge(store);
    expect(chat.store.openPreset).not.toHaveBeenCalled();

    act(() => store.requestUseInChat({ id: 12, title: "Sales assistant" }));

    const room = { cloud: "docspace", id: "12", name: "Sales assistant" };
    expect(chat.store.openPreset).toHaveBeenCalledTimes(1);
    expect(chat.store.openPreset).toHaveBeenCalledWith({
      profileId: null,
      profileName: null,
      contextRooms: [room],
      knowledgeRooms: [],
    });
    expect(chat.setCurrentPage).toHaveBeenCalledWith("chat");
    // The chat is off the agent, and keeps the set connected when it mounts.
    expect(store.activePreset).toBeNull();
    expect(store.chatContextRooms).toEqual([{ id: "12", name: "Sales assistant" }]);
    expect(store.pendingUseInChat).toBeNull();
  });

  it("starts the composer with the skill's call for a skill's row", () => {
    const store = new AiPresetsStore();
    renderBridge(store);
    act(() =>
      store.requestUseInChat({ id: 12, title: "Sales assistant", skill: "document-summary" }),
    );
    expect(chat.store.openPreset).toHaveBeenCalledWith(
      expect.objectContaining({ draft: "/document-summary " }),
    );
  });

  it("opens the chat once per request", () => {
    const store = new AiPresetsStore();
    const { rerender } = renderBridge(store);
    act(() => store.requestUseInChat({ id: 12, title: "Sales assistant" }));
    rerender(
      <Provider aiPresetsStore={store}>
        <SkillSetChatBridge />
      </Provider>,
    );
    expect(chat.store.openPreset).toHaveBeenCalledTimes(1);
  });
});
