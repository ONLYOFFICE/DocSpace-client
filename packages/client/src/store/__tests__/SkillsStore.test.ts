import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SkillsStore from "../SkillsStore";

const text = '---\nname: "clause-check"\ndescription: "Checks clauses"\n---\n\n# Steps\n';
const file = { id: 7, version: 2, viewUrl: "/view/7" };

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true, text: async () => text });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => vi.unstubAllGlobals());

describe("SkillsStore", () => {
  it("reads a skill file once and keeps what it says", async () => {
    const store = new SkillsStore();
    expect(store.get(file)).toBeNull();
    store.fetch(file);
    store.fetch(file);
    await vi.waitFor(() => expect(store.get(file)).not.toBeNull());
    expect(store.get(file)).toEqual({ name: "clause-check", description: "Checks clauses", body: "# Steps" });
    store.fetch(file);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reads a new version of the file again", async () => {
    const store = new SkillsStore();
    store.fetch(file);
    await vi.waitFor(() => expect(store.get(file)).not.toBeNull());
    const next = { ...file, version: 3 };
    expect(store.get(next)).toBeNull();
    store.fetch(next);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reads a saved skill again, also when its version stayed the same", async () => {
    const store = new SkillsStore();
    store.fetch(file);
    await vi.waitFor(() => expect(store.get(file)).not.toBeNull());
    store.fetch({ ...file, version: 1 });
    await vi.waitFor(() => expect(store.get({ ...file, version: 1 })).not.toBeNull());
    const other = { id: 8, version: 2, viewUrl: "/view/8" };
    store.fetch(other);
    await vi.waitFor(() => expect(store.get(other)).not.toBeNull());

    store.forget(7);
    expect(store.get(file)).toBeNull();
    expect(store.get({ ...file, version: 1 })).toBeNull();
    // Another file keeps its skill.
    expect(store.get(other)).not.toBeNull();

    fetchMock.mockResolvedValue({ ok: true, text: async () => text.replace("Checks clauses", "Checks every clause") });
    store.fetch(file);
    await vi.waitFor(() => expect(store.get(file)?.description).toBe("Checks every clause"));
  });

  it("leaves a file that cannot be read without a skill and does not retry it", async () => {
    fetchMock.mockResolvedValue({ ok: false, statusText: "Forbidden" });
    const store = new SkillsStore();
    store.fetch(file);
    await Promise.resolve();
    store.fetch(file);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(store.get(file)).toBeNull();
  });
});
