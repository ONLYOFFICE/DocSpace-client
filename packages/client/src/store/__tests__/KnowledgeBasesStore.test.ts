import { beforeEach, describe, expect, it, vi } from "vitest";

import { VectorizationStatus } from "@docspace/shared/enums";

import KnowledgeBasesStore, {
  getKnowledgeBaseStatus,
} from "../KnowledgeBasesStore";

const getAiProjectKnowledgeFiles = vi.hoisted(() => vi.fn());

vi.mock("@docspace/shared/api/ai/projects", () => ({
  getAiProjectKnowledgeFiles,
}));

const file = (vectorizationStatus: VectorizationStatus | null) => ({
  vectorizationStatus,
});

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe("KnowledgeBasesStore", () => {
  beforeEach(() => {
    getAiProjectKnowledgeFiles.mockReset();
  });

  it("tells a base by the worst state of its files", () => {
    expect(getKnowledgeBaseStatus(null)).toBeNull();
    expect(
      getKnowledgeBaseStatus({ total: 0, inProgress: 0, failed: 0 }),
    ).toBeNull();
    expect(getKnowledgeBaseStatus({ total: 3, inProgress: 0, failed: 0 })).toBe(
      VectorizationStatus.Completed,
    );
    expect(getKnowledgeBaseStatus({ total: 3, inProgress: 1, failed: 0 })).toBe(
      VectorizationStatus.InProgress,
    );
    expect(getKnowledgeBaseStatus({ total: 3, inProgress: 1, failed: 1 })).toBe(
      VectorizationStatus.Failed,
    );
  });

  it("reads the files of a base once per number of its files", async () => {
    getAiProjectKnowledgeFiles.mockResolvedValue([
      file(VectorizationStatus.Completed),
      file(VectorizationStatus.InProgress),
      file(VectorizationStatus.Failed),
    ]);
    const store = new KnowledgeBasesStore();
    const room = { id: 7, filesCount: 3 };

    expect(store.get(room)).toBeNull();
    store.fetch(room);
    store.fetch(room);
    await flush();

    expect(getAiProjectKnowledgeFiles).toHaveBeenCalledTimes(1);
    expect(getAiProjectKnowledgeFiles).toHaveBeenCalledWith(7);
    expect(store.get(room)).toEqual({ total: 3, inProgress: 1, failed: 1 });

    store.fetch(room);
    await flush();
    expect(getAiProjectKnowledgeFiles).toHaveBeenCalledTimes(1);

    store.fetch({ id: 7, filesCount: 4 });
    await flush();
    expect(getAiProjectKnowledgeFiles).toHaveBeenCalledTimes(2);
  });

  it("reads a base again when forced, and after a failed read", async () => {
    getAiProjectKnowledgeFiles.mockResolvedValueOnce([
      file(VectorizationStatus.InProgress),
    ]);
    const store = new KnowledgeBasesStore();
    const room = { id: 7, filesCount: 1 };
    store.fetch(room);
    await flush();

    getAiProjectKnowledgeFiles.mockResolvedValueOnce([
      file(VectorizationStatus.Completed),
    ]);
    store.fetch(room, true);
    await flush();
    expect(store.get(room)).toEqual({ total: 1, inProgress: 0, failed: 0 });

    getAiProjectKnowledgeFiles.mockRejectedValueOnce(new Error("down"));
    const closed = { id: 8, filesCount: 1 };
    store.fetch(closed);
    await flush();
    expect(store.get(closed)).toBeNull();

    // A failed read is not remembered: the next ask reads the base again.
    getAiProjectKnowledgeFiles.mockResolvedValueOnce([
      file(VectorizationStatus.Completed),
    ]);
    store.fetch(closed);
    await flush();
    expect(getAiProjectKnowledgeFiles).toHaveBeenCalledTimes(4);
    expect(store.get(closed)).toEqual({ total: 1, inProgress: 0, failed: 0 });
  });
});
