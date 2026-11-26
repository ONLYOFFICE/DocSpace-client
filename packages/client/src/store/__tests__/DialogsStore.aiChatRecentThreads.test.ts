import { describe, expect, it } from "vitest";

import DialogsStore from "../DialogsStore";

const createStore = () =>
  new DialogsStore(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

const threads = () => [
  { id: "t-1", title: "First" },
  { id: "t-2", title: "Second" },
];

describe("DialogsStore: AI chat recent threads", () => {
  it("keeps the list it holds when the same conversations are read again", () => {
    const store = createStore();
    store.setAiChatRecentThreads(threads(), true);
    const shown = store.aiChatRecentThreads;

    store.setAiChatRecentThreads(threads(), false);
    expect(store.aiChatRecentThreads).toBe(shown);
    expect(store.aiChatHasMoreThreads).toBe(false);
  });

  it("takes a list that differs by a conversation, its title or the order", () => {
    const store = createStore();
    store.setAiChatRecentThreads(threads());
    let shown = store.aiChatRecentThreads;

    store.setAiChatRecentThreads([{ id: "t-1", title: "Renamed" }, threads()[1]]);
    expect(store.aiChatRecentThreads).not.toBe(shown);
    shown = store.aiChatRecentThreads;

    store.setAiChatRecentThreads(threads().reverse());
    expect(store.aiChatRecentThreads).not.toBe(shown);

    store.setAiChatRecentThreads([]);
    expect(store.aiChatRecentThreads).toEqual([]);
  });
});
