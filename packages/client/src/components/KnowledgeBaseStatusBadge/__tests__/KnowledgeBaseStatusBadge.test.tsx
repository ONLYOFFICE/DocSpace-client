import React from "react";
import { act, render, renderHook, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VectorizationStatus } from "@docspace/shared/enums";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import KnowledgeBasesStore, {
  KNOWLEDGE_BASE_REREAD_MS,
} from "SRC_DIR/store/KnowledgeBasesStore";

import KnowledgeBaseStatusBadge from "..";
import { useKnowledgeBaseStatus } from "../useKnowledgeBaseStatus";

describe("KnowledgeBaseStatusBadge", () => {
  it("reads \"Indexing\" while the base's files are being indexed", () => {
    render(<KnowledgeBaseStatusBadge status={VectorizationStatus.InProgress} />);
    expect(screen.getByTestId("knowledge-base-indexing-badge")).toHaveTextContent(
      "Common:Indexing",
    );
    expect(screen.queryByTestId("knowledge-base-error-badge")).toBeNull();
  });

  it("draws an \"Error\" pill when some files could not be indexed", () => {
    render(<KnowledgeBaseStatusBadge status={VectorizationStatus.Failed} />);
    const pill = screen.getByTestId("knowledge-base-error-badge");
    expect(pill).toHaveTextContent("Common:Error");
    expect(screen.queryByTestId("knowledge-base-indexing-badge")).toBeNull();
  });

  it("draws nothing for an indexed base, or one not read yet", () => {
    const { container, rerender } = render(
      <KnowledgeBaseStatusBadge status={VectorizationStatus.Completed} />,
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<KnowledgeBaseStatusBadge status={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("useKnowledgeBaseStatus", () => {
  afterEach(() => vi.useRealTimers());

  const withStore =
    (store: KnowledgeBasesStore) =>
    ({ children }: { children: React.ReactNode }) => (
      <Provider knowledgeBasesStore={store}>{children}</Provider>
    );

  const storeWith = (state: KnowledgeBasesStore["states"][string] | null) => {
    const store = new KnowledgeBasesStore();
    if (state) store.states = { "21:3": state };
    // MobX wraps an assigned method as an action: the spy is kept apart.
    const fetch = vi.fn();
    store.fetch = fetch;
    return { store, fetch };
  };

  it("reads the base once and tells its state", () => {
    const { store, fetch } = storeWith({ total: 3, inProgress: 0, failed: 1 });
    const { result } = renderHook(
      () => useKnowledgeBaseStatus({ id: 21, filesCount: 3 }),
      { wrapper: withStore(store) },
    );
    expect(result.current).toBe(VectorizationStatus.Failed);
    expect(fetch).toHaveBeenCalledWith({ id: 21, filesCount: 3 });
  });

  it("reads a base being indexed again every little while", () => {
    vi.useFakeTimers();
    const { store, fetch } = storeWith({ total: 3, inProgress: 2, failed: 0 });
    const { result } = renderHook(
      () => useKnowledgeBaseStatus({ id: 21, filesCount: 3 }),
      { wrapper: withStore(store) },
    );
    expect(result.current).toBe(VectorizationStatus.InProgress);
    act(() => {
      vi.advanceTimersByTime(KNOWLEDGE_BASE_REREAD_MS);
    });
    expect(fetch).toHaveBeenLastCalledWith({ id: 21, filesCount: 3 }, true);
  });

  it("tells nothing and reads nothing without a base", () => {
    const { store, fetch } = storeWith(null);
    const { result } = renderHook(() => useKnowledgeBaseStatus(null), {
      wrapper: withStore(store),
    });
    expect(result.current).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
