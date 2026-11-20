import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getEncryptionKeys: vi.fn(),
}));

vi.mock("@docspace/shared/api", () => ({
  default: { privacy: { getEncryptionKeys: mocks.getEncryptionKeys } },
}));

import {
  EncryptionIdentityStoreProvider,
  useEncryptionIdentityStore,
} from "./EncryptionIdentityStore";

type TStore = ReturnType<typeof useEncryptionIdentityStore>;

const KEY = {
  id: "11111111-1111-1111-1111-111111111111",
  publicKey: "pub",
  privateKeyEnc: "enc",
  date: "2026-10-22T00:00:00",
};

let root: Root | null = null;
let store: TStore;

const Capture = () => {
  store = useEncryptionIdentityStore();
  return null;
};

const renderStore = () => {
  root = createRoot(document.createElement("div"));
  act(() => {
    root!.render(
      <EncryptionIdentityStoreProvider>
        <Capture />
      </EncryptionIdentityStoreProvider>,
    );
  });
  return store;
};

describe("EncryptionIdentityStore", () => {
  beforeEach(() => {
    mocks.getEncryptionKeys.mockReset();
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
  });

  it("Key list failed to load", async () => {
    mocks.getEncryptionKeys.mockRejectedValue(new Error("Network Error"));
    const identity = renderStore();

    await act(() => identity.loadKeys());

    expect(identity.keys).toBeNull();
    expect(identity.hasKeys).toBe(false);
    expect(identity.loadError).toBeInstanceOf(Error);
  });

  it("Create pressed during the load", async () => {
    let finish!: (keys: unknown[]) => void;
    mocks.getEncryptionKeys.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const identity = renderStore();

    const first = identity.loadKeys();
    let answered = false;
    const second = identity.loadKeys().then(() => {
      answered = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    // The second caller waits for the load in flight instead of deciding now.
    expect(answered).toBe(false);
    finish([KEY]);
    await act(() => second);

    expect(identity.keys).toEqual([KEY]);
    expect(identity.loadError).toBeNull();
    expect(mocks.getEncryptionKeys).toHaveBeenCalledTimes(1);
    await first;
  });

  it("Refresh after key generation during a load", async () => {
    let finish!: (keys: unknown[]) => void;
    mocks.getEncryptionKeys
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finish = resolve;
        }),
      )
      .mockResolvedValueOnce([KEY]);
    const identity = renderStore();

    // The load began before the key existed; the refresh must see the key.
    void identity.loadKeys();
    const refresh = identity.reloadKeys();
    finish([]);
    await act(() => refresh);

    expect(identity.keys).toEqual([KEY]);
    expect(mocks.getEncryptionKeys).toHaveBeenCalledTimes(2);
  });

  it("keeps the keys it had when a reload fails", async () => {
    mocks.getEncryptionKeys.mockResolvedValueOnce([KEY]);
    mocks.getEncryptionKeys.mockRejectedValueOnce(new Error("Network Error"));
    const identity = renderStore();
    act(() => identity.setOwnerId("me"));

    await act(() => identity.loadKeys());
    await act(() => identity.loadKeys());

    expect(identity.keys).toEqual([KEY]);
    expect(identity.userKeys?.publicKey).toBe("pub");
    expect(identity.loadError).toBeInstanceOf(Error);
  });

  it("stores an empty list the server answered", async () => {
    mocks.getEncryptionKeys.mockResolvedValue([]);
    const identity = renderStore();

    await act(() => identity.loadKeys());

    expect(identity.keys).toEqual([]);
    expect(identity.loadError).toBeNull();
  });
});
