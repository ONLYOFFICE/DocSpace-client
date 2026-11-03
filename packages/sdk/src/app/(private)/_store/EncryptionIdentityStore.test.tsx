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
